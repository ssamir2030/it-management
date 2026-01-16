'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/simple-auth'
import { revalidatePath } from 'next/cache'
import { hasPermission } from '@/lib/rbac'

export async function getSuppliers() {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'غير مصرح' }
        }

        const suppliers = await prisma.supplier.findMany({
            orderBy: {
                name: 'asc'
            }
        })

        return { success: true, data: suppliers }
    } catch (error) {
        console.error('Error fetching suppliers:', error)
        return { success: false, error: 'فشل في جلب البيانات' }
    }
}

export async function getSupplierById(id: string) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'غير مصرح' }
        }

        const supplier = await prisma.supplier.findUnique({
            where: { id }
        })

        if (!supplier) {
            return { success: false, error: 'المورد غير موجود' }
        }

        return { success: true, data: supplier }
    } catch (error) {
        console.error('Error fetching supplier:', error)
        return { success: false, error: 'فشل في جلب البيانات' }
    }
}

export async function createSupplier(data: {
    name: string
    contactPerson?: string
    phone?: string
    email?: string
    address?: string
    category?: string
    taxNumber?: string
    website?: string
    notes?: string
    isActive: boolean
}) {
    try {
        const session = await getSession()
        if (!session?.role || !hasPermission(session.role as string, 'manage_inventory')) {
            return { success: false, error: `غير مصرح - دورك الحالي: ${session?.role || 'غير مسجل'}` }
        }

        if (!data.name || !data.name.trim()) {
            return { success: false, error: 'اسم المورد مطلوب' }
        }

        const supplier = await prisma.supplier.create({
            data: {
                name: data.name.trim(),
                contactPerson: data.contactPerson?.trim() || null,
                phone: data.phone?.trim() || null,
                email: data.email?.trim() || null,
                address: data.address?.trim() || null,
                category: data.category || null,
                taxNumber: data.taxNumber?.trim() || null,
                website: data.website?.trim() || null,
                notes: data.notes?.trim() || null,
                isActive: data.isActive
            }
        })

        revalidatePath('/suppliers')
        return { success: true, data: supplier }
    } catch (error) {
        console.error('Error creating supplier:', error)
        return { success: false, error: 'فشل في إضافة المورد' }
    }
}

export async function updateSupplier(id: string, data: {
    name?: string
    contactPerson?: string
    phone?: string
    email?: string
    address?: string
    category?: string
    taxNumber?: string
    website?: string
    notes?: string
    isActive?: boolean
}) {
    try {
        const session = await getSession()
        if (!session?.role || !hasPermission(session.role as string, 'manage_inventory')) {
            return { success: false, error: 'غير مصرح' }
        }

        const updateData: any = {}

        if (data.name !== undefined) updateData.name = data.name.trim()
        if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson?.trim() || null
        if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null
        if (data.email !== undefined) updateData.email = data.email?.trim() || null
        if (data.address !== undefined) updateData.address = data.address?.trim() || null
        if (data.category !== undefined) updateData.category = data.category || null
        if (data.taxNumber !== undefined) updateData.taxNumber = data.taxNumber?.trim() || null
        if (data.website !== undefined) updateData.website = data.website?.trim() || null
        if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null
        if (data.isActive !== undefined) updateData.isActive = data.isActive

        const supplier = await prisma.supplier.update({
            where: { id },
            data: updateData
        })

        revalidatePath('/suppliers')
        revalidatePath(`/suppliers/${id}`)
        return { success: true, data: supplier }
    } catch (error) {
        console.error('Error updating supplier:', error)
        return { success: false, error: 'فشل في تحديث المورد' }
    }
}

export async function deleteSupplier(id: string) {
    try {
        const session = await getSession()
        if (!session?.role || !hasPermission(session.role as string, 'manage_inventory')) {
            return { success: false, error: 'غير مصرح' }
        }

        await prisma.supplier.delete({
            where: { id }
        })

        revalidatePath('/suppliers')
        return { success: true }
    } catch (error) {
        console.error('Error deleting supplier:', error)
        return { success: false, error: 'فشل في حذف المورد' }
    }
}

// ========== Enhanced Supplier Functions ==========

/**
 * جلب المورد مع إحصائياته وأوامر الشراء
 */
export async function getSupplierWithStats(id: string) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'غير مصرح' }
        }

        const supplier = await prisma.supplier.findUnique({
            where: { id },
            include: {
                purchaseOrders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        items: true
                    }
                },
                contracts: {
                    orderBy: { endDate: 'desc' }
                }
            }
        })

        if (!supplier) {
            return { success: false, error: 'المورد غير موجود' }
        }

        // Calculate stats from purchase orders
        const allOrders = await prisma.purchaseOrder.findMany({
            where: { supplierId: id }
        })

        const stats = {
            totalOrders: allOrders.length,
            totalSpent: allOrders.reduce((sum: number, po: any) => sum + (po.totalCost || 0), 0),
            receivedOrders: allOrders.filter(po => po.status === 'RECEIVED').length,
            pendingOrders: allOrders.filter(po => po.status === 'ORDERED').length
        }

        return { success: true, data: { ...supplier, calculatedStats: stats } }
    } catch (error) {
        console.error('Error fetching supplier with stats:', error)
        return { success: false, error: 'فشل في جلب بيانات المورد' }
    }
}

/**
 * تحديث تقييم المورد
 */
export async function rateSupplier(id: string, rating: number) {
    try {
        const session = await getSession()
        if (!session?.role || !hasPermission(session.role as string, 'manage_inventory')) {
            return { success: false, error: 'غير مصرح' }
        }

        if (rating < 1 || rating > 5) {
            return { success: false, error: 'التقييم يجب أن يكون بين 1 و 5' }
        }

        const supplier = await prisma.supplier.update({
            where: { id },
            data: { rating }
        })

        revalidatePath('/suppliers')
        revalidatePath(`/suppliers/${id}`)
        return { success: true, data: supplier }
    } catch (error) {
        console.error('Error rating supplier:', error)
        return { success: false, error: 'فشل في تقييم المورد' }
    }
}

/**
 * جلب سجل أوامر الشراء للمورد
 */
export async function getSupplierOrders(id: string) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'غير مصرح' }
        }

        const orders = await prisma.purchaseOrder.findMany({
            where: { supplierId: id },
            include: {
                items: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return { success: true, data: orders }
    } catch (error) {
        console.error('Error fetching supplier orders:', error)
        return { success: false, error: 'فشل في جلب الطلبات' }
    }
}

/**
 * تحديث إحصائيات المورد بعد استلام طلب
 * يُستدعى من receivePurchaseOrder
 */
export async function updateSupplierStats(supplierId: string, orderTotal: number) {
    try {
        const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } })
        if (!supplier) return { success: false }

        await prisma.supplier.update({
            where: { id: supplierId },
            data: {
                totalOrders: { increment: 1 },
                totalSpent: { increment: orderTotal },
                lastOrderDate: new Date()
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error updating supplier stats:', error)
        return { success: false }
    }
}

// ========== Supplier Contracts (VRM) ==========

export async function getSupplierContracts(supplierId: string) {
    try {
        const contracts = await prisma.supplierContract.findMany({
            where: { supplierId },
            orderBy: { endDate: 'desc' }
        })
        return { success: true, data: contracts }
    } catch (error) {
        console.error('Error fetching contracts:', error)
        return { success: false, error: 'فشل في جلب العقود' }
    }
}

export async function addSupplierContract(data: {
    supplierId: string
    title: string
    startDate: Date
    endDate: Date
    status?: string
    contractNumber?: string
    description?: string
    slaResponseTime?: number
    slaResolutionTime?: number
    documentUrl?: string
}) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'ADMIN') return { success: false, error: 'غير مصرح' }

        const contract = await prisma.supplierContract.create({
            data: {
                supplierId: data.supplierId,
                title: data.title,
                startDate: data.startDate,
                endDate: data.endDate,
                status: data.status || 'ACTIVE',
                contractNumber: data.contractNumber,
                description: data.description,
                slaResponseTime: data.slaResponseTime,
                slaResolutionTime: data.slaResolutionTime,
                documentUrl: data.documentUrl
            }
        })

        revalidatePath(`/suppliers/${data.supplierId}`)
        return { success: true, data: contract }
    } catch (error) {
        console.error('Error adding contract:', error)
        return { success: false, error: 'فشل في إنشاء العقد' }
    }
}

export async function deleteSupplierContract(id: string) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'ADMIN') return { success: false, error: 'غير مصرح' }

        await prisma.supplierContract.delete({ where: { id } })
        revalidatePath('/suppliers')
        return { success: true }
    } catch (error) {
        console.error('Error deleting contract:', error)
        return { success: false, error: 'فشل في حذف العقد' }
    }
}
