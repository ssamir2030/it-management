'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

// Bulk update asset status
export async function bulkUpdateAssetStatus(assetIds: string[], status: string) {
    try {
        const result = await prisma.asset.updateMany({
            where: {
                id: { in: assetIds },
                deletedAt: null
            },
            data: { status }
        })

        // Log each update
        for (const assetId of assetIds) {
            await logAction({
                action: 'UPDATE',
                entityType: 'ASSET',
                entityId: assetId,
                entityName: 'Bulk Update',
                changes: { status }
            })
        }

        revalidatePath('/assets')
        return { success: true, count: result.count }
    } catch (error) {
        console.error('Bulk update error:', error)
        return { success: false, error: 'Failed to update assets' }
    }
}

// Bulk assign assets to employee
export async function bulkAssignAssets(assetIds: string[], employeeId: string) {
    try {
        const result = await prisma.asset.updateMany({
            where: {
                id: { in: assetIds },
                deletedAt: null
            },
            data: {
                employeeId,
                status: 'ASSIGNED'
            }
        })

        // Create custody records
        const assets = await prisma.asset.findMany({
            where: { id: { in: assetIds } },
            select: { id: true, name: true, tag: true }
        })

        for (const asset of assets) {
            await prisma.custodyItem.create({
                data: {
                    name: asset.name,
                    description: `Asset Tag: ${asset.tag}`,
                    employeeId,
                    assetId: asset.id,
                    assignedDate: new Date()
                }
            })

            await logAction({
                action: 'ASSIGN',
                entityType: 'ASSET',
                entityId: asset.id,
                entityName: asset.name,
                changes: { employeeId, status: 'ASSIGNED' }
            })
        }

        revalidatePath('/assets')
        revalidatePath('/custody')
        return { success: true, count: result.count }
    } catch (error) {
        console.error('Bulk assign error:', error)
        return { success: false, error: 'Failed to assign assets' }
    }
}

// Bulk delete assets (soft delete)
export async function bulkDeleteAssets(assetIds: string[]) {
    try {
        const result = await prisma.asset.updateMany({
            where: {
                id: { in: assetIds }
            },
            data: {
                deletedAt: new Date()
            }
        })

        for (const assetId of assetIds) {
            await logAction({
                action: 'DELETE',
                entityType: 'ASSET',
                entityId: assetId,
                entityName: 'Bulk Delete'
            })
        }

        revalidatePath('/assets')
        return { success: true, count: result.count }
    } catch (error) {
        console.error('Bulk delete error:', error)
        return { success: false, error: 'Failed to delete assets' }
    }
}

// Bulk update ticket status
export async function bulkUpdateTicketStatus(ticketIds: string[], status: string) {
    try {
        const result = await prisma.ticket.updateMany({
            where: {
                id: { in: ticketIds }
            },
            data: { status }
        })

        for (const ticketId of ticketIds) {
            await logAction({
                action: 'UPDATE',
                entityType: 'TICKET',
                entityId: ticketId,
                entityName: 'Bulk Update',
                changes: { status }
            })
        }

        revalidatePath('/support')
        return { success: true, count: result.count }
    } catch (error) {
        console.error('Bulk update tickets error:', error)
        return { success: false, error: 'Failed to update tickets' }
    }
}

// Bulk assign tickets
export async function bulkAssignTickets(ticketIds: string[], assignedToId: string) {
    try {
        const result = await prisma.ticket.updateMany({
            where: {
                id: { in: ticketIds }
            },
            data: {
                assignedToId,
                status: 'IN_PROGRESS'
            }
        })

        for (const ticketId of ticketIds) {
            await logAction({
                action: 'ASSIGN',
                entityType: 'TICKET',
                entityId: ticketId,
                entityName: 'Bulk Assign',
                changes: { assignedToId, status: 'IN_PROGRESS' }
            })
        }

        revalidatePath('/support')
        return { success: true, count: result.count }
    } catch (error) {
        console.error('Bulk assign tickets error:', error)
        return { success: false, error: 'Failed to assign tickets' }
    }
}

// Export selected items
export async function exportSelected(ids: string[], type: 'assets' | 'employees' | 'tickets') {
    try {
        let data: any[] = []

        if (type === 'assets') {
            const assets = await prisma.asset.findMany({
                where: { id: { in: ids }, deletedAt: null },
                include: {
                    employee: { select: { name: true } },
                    location: { select: { name: true } }
                }
            })
            data = assets.map(a => ({
                'Tag': a.tag,
                'Name': a.name,
                'Type': a.type,
                'Status': a.status,
                'Employee': a.employee?.name || '-',
                'Location': a.location?.name || '-'
            }))
        } else if (type === 'employees') {
            const employees = await prisma.employee.findMany({
                where: { id: { in: ids }, deletedAt: null },
                include: {
                    department: { select: { name: true } }
                }
            })
            data = employees.map(e => ({
                'Name': e.name,
                'Email': e.email,
                'ID Number': e.identityNumber,
                'Department': e.department?.name || '-'
            }))
        } else if (type === 'tickets') {
            const tickets = await prisma.ticket.findMany({
                where: { id: { in: ids } },
                include: {
                    createdBy: { select: { name: true } },
                    assignedTo: { select: { name: true } }
                }
            })
            data = tickets.map(t => ({
                'Title': t.title,
                'Status': t.status,
                'Priority': t.priority,
                'Created By': t.createdBy?.name || '-',
                'Assigned To': t.assignedTo?.name || '-'
            }))
        }

        return { success: true, data }
    } catch (error) {
        console.error('Export selected error:', error)
        return { success: false, error: 'Failed to export' }
    }
}
