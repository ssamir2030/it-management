'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPendingRequests() {
    try {
        console.log("🔍 Fetching pending requests for Purchasing...")
        const requests = await prisma.employeeRequest.findMany({
            where: {
                status: 'NEEDS_PURCHASE',
                type: 'CONSUMABLE'
            },
            include: {
                employee: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        console.log(`✅ Found ${requests.length} pending requests`)
        return { success: true, data: requests }
    } catch (error) {
        console.error("Error fetching pending requests:", error)
        return { success: false, error: "فشل جلب الطلبات المعلقة" }
    }
}

export async function createPurchaseOrder(data: {
    supplierId?: string
    notes?: string
    items: {
        description: string
        quantity: number
        unitPrice: number
        inventoryItemId?: string
    }[]
}) {
    try {
        const totalCost = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

        const po = await prisma.purchaseOrder.create({
            data: {
                supplierId: data.supplierId,
                notes: data.notes,
                status: 'ORDERED', // Default to ordered immediately for simplicity? Or DRAFT. Let's say ORDERED.
                totalCost,
                items: {
                    create: data.items.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice,
                        inventoryItemId: item.inventoryItemId
                    }))
                }
            }
        })

        revalidatePath('/admin/purchasing')
        return { success: true, data: po }
    } catch (error) {
        console.error("Error creating PO:", error)
        return { success: false, error: `فشل إنشاء أمر الشراء: ${(error as Error).message}` }
    }
}

export async function getPurchaseOrders() {
    try {
        const pos = await prisma.purchaseOrder.findMany({
            include: {
                supplier: true,
                items: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: pos }
    } catch (error) {
        console.error("Error fetching POs:", error)
        return { success: false, error: "فشل جلب أوامر الشراء" }
    }
}

export async function receivePurchaseOrder(id: string) {
    try {
        const po = await prisma.purchaseOrder.findUnique({
            where: { id },
            include: { items: true }
        })

        if (!po) return { success: false, error: "أمر الشراء غير موجود" }
        if (po.status === 'RECEIVED') return { success: false, error: "تم استلام هذا الأمر مسبقاً" }

        // Collect item names for matching with employee requests
        const itemNames = po.items.map(item => item.description.split(' - ')[0].trim().toLowerCase())

        // Transaction: Update PO Status + Update Inventory stock
        await prisma.$transaction(async (tx) => {
            // 1. Update PO Status
            await tx.purchaseOrder.update({
                where: { id },
                data: { status: 'RECEIVED' }
            })

            // 2. Process Items - Add to Inventory (Consumable)
            for (const item of po.items) {
                // Extract the main name (before the dash if any)
                const itemName = item.description.split(' - ')[0].trim()

                // Try to find existing Consumable by name
                let consumable = await tx.consumable.findFirst({
                    where: {
                        name: { contains: itemName }
                    }
                })

                if (consumable) {
                    // Update existing Consumable stock
                    await tx.consumable.update({
                        where: { id: consumable.id },
                        data: {
                            quantity: { increment: item.quantity }
                        }
                    })
                } else {
                    // Create category if needed (default to 'INK' for auto-adds, or General)
                    const categoryName = 'INK'
                    let cat = await tx.consumableCategory.findUnique({ where: { name: categoryName } })
                    if (!cat) {
                        cat = await tx.consumableCategory.create({ data: { name: categoryName } })
                    }

                    // Create new Consumable in inventory
                    consumable = await tx.consumable.create({
                        data: {
                            name: item.description,
                            quantity: item.quantity,
                            minQuantity: 2,
                            categoryId: cat.id,
                            description: `تم إضافته من أمر شراء #${po.id.slice(-6)}`
                        }
                    })
                }

                // Log IN Transaction for tracking
                await tx.consumableTransaction.create({
                    data: {
                        consumableId: consumable.id,
                        type: 'IN',
                        quantity: item.quantity,
                        notes: `استلام طلب شراء #${po.id.slice(-6)} - ${item.description}`,
                        // createdBy: 'System (PO)', // Removed from schema
                        // department: 'المستودع' // Removed from schema
                    }
                })

                // Also update InventoryItem if linked
                if (item.inventoryItemId) {
                    await tx.inventoryItem.update({
                        where: { id: item.inventoryItemId },
                        data: {
                            quantity: { increment: item.quantity },
                            unitPrice: item.unitPrice
                        }
                    })
                }
            }

            // 3. Find and update matching employee requests
            const matchingRequests = await tx.employeeRequest.findMany({
                where: {
                    status: { in: ['PENDING', 'APPROVED', 'IN_PROGRESS', 'NEEDS_PURCHASE'] },
                    type: 'CONSUMABLE'
                },
                include: {
                    employee: { select: { id: true, name: true } }
                }
            })

            for (const request of matchingRequests) {
                // Check if request matches any of the received items
                const requestDetails = (request.details || '').toLowerCase()
                const matches = itemNames.some(name => requestDetails.includes(name))

                if (matches) {
                    // تحويل الطلب إلى PENDING ليتمكن فريق IT من صرفه
                    await tx.employeeRequest.update({
                        where: { id: request.id },
                        data: {
                            status: 'PENDING',
                            adminNotes: `تم توفير الطلب من أمر الشراء #${po.id.slice(-6)}`
                        }
                    })

                    // إضافة سجل في التايم لاين
                    await tx.requestTimeline.create({
                        data: {
                            requestId: request.id,
                            status: 'PENDING',
                            title: 'الأصناف متوفرة بالمستودع',
                            description: `تم استلام الصنف المطلوب من أمر الشراء #${po.id.slice(-6)} وجاهز للصرف الآن`,
                            actorName: 'النظام'
                        }
                    })

                    // إرسال إشعار للموظف ليعلم أن طلبه أصبح متاحاً
                    await tx.employeeNotification.create({
                        data: {
                            employeeId: request.employeeId,
                            type: 'REQUEST_UPDATED',
                            title: '📦 صنفك متوفر الآن',
                            message: `تم توفير الطلب (${request.type}) في المستودع وجار مراجعة الصرف من قبل الـ IT`,
                            isRead: false
                        }
                    })

                    console.log(`✅ Updated employee request ${request.id} status to PENDING`)
                }
            }
        })

        revalidatePath('/admin/purchasing')
        revalidatePath('/admin/consumables')
        revalidatePath('/admin/inventory')
        revalidatePath('/requests')
        revalidatePath('/portal/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Error receiving PO:", error)
        return { success: false, error: `فشل استلام الطلب: ${(error as Error).message}` }
    }
}

export async function deletePurchaseOrder(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } })
            await tx.purchaseOrder.delete({ where: { id } })
        })
        revalidatePath('/admin/purchasing')
        return { success: true }
    } catch (error) {
        console.error("Error deleting PO:", error)
        return { success: false, error: "فشل حذف أمر الشراء" }
    }
}

export async function updatePurchaseOrder(id: string, data: {
    supplierId?: string
    notes?: string
    items: {
        description: string
        quantity: number
        unitPrice: number
        inventoryItemId?: string
    }[]
}) {
    try {
        const totalCost = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

        // Transaction to update PO and replace items
        await prisma.$transaction(async (tx) => {
            // 1. Update PO details
            await tx.purchaseOrder.update({
                where: { id },
                data: {
                    supplierId: data.supplierId,
                    notes: data.notes,
                    totalCost
                }
            })

            // 2. Delete old items
            await tx.purchaseOrderItem.deleteMany({
                where: { purchaseOrderId: id }
            })

            // 3. Create new items
            if (data.items.length > 0) {
                await tx.purchaseOrderItem.createMany({
                    data: data.items.map(item => ({
                        purchaseOrderId: id,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice,
                        inventoryItemId: item.inventoryItemId
                    }))
                })
            }
        })

        revalidatePath('/admin/purchasing')
        return { success: true }
    } catch (error) {
        console.error("Error updating PO:", error)
        return { success: false, error: "فشل تعديل أمر الشراء" }
    }
}

export async function rejectRequests(ids: string[]) {
    try {
        await prisma.employeeRequest.updateMany({
            where: { id: { in: ids } },
            data: { status: 'REJECTED' }
        })
        revalidatePath('/admin/purchasing')
        return { success: true }
    } catch (error) {
        console.error("Error rejecting requests:", error)
        return { success: false, error: "فشل رفض الطلبات" }
    }
}
