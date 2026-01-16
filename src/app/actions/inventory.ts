'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/email"

const COOKIE_NAME = "admin-portal-session"

export async function getConsumables(query: string = "", category: string = "ALL", page: number = 1) {
    const pageSize = 10
    const skip = (page - 1) * pageSize

    const where: any = {}

    if (query) {
        where.name = { contains: query }
    }

    if (category && category !== "ALL") {
        where.category = {
            name: category
        }
    }

    try {
        const [items, total] = await prisma.$transaction([
            prisma.consumable.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { updatedAt: 'desc' },
                include: { category: true }
            }),
            prisma.consumable.count({ where })
        ])

        return {
            success: true,
            items,
            total,
            totalPages: Math.ceil(total / pageSize)
        }
    } catch (error) {
        console.error("Failed to fetch consumables:", error)
        return { success: false, error: "Failed to fetch inventory" }
    }
}

export async function createConsumable(data: {
    name: string
    category: string
    minStock: number
    unit: string
    description?: string
}) {
    try {
        // Find or create category
        let cat = await prisma.consumableCategory.findUnique({ where: { name: data.category } })
        if (!cat) {
            cat = await prisma.consumableCategory.create({ data: { name: data.category } })
        }

        const item = await prisma.consumable.create({
            data: {
                name: data.name,
                categoryId: cat.id,
                minQuantity: data.minStock,
                description: data.description || "",
                quantity: 0
            }
        })

        revalidatePath("/admin/inventory")
        return { success: true, item }
    } catch (error) {
        console.error("Failed to create consumable:", error)
        return { success: false, error: "Failed to create item" }
    }
}

export async function updateStock(
    id: string,
    quantity: number,
    type: 'IN' | 'OUT',
    notes: string
) {
    try {
        const item = await prisma.consumable.findUnique({ where: { id } })
        if (!item) return { success: false, error: "Item not found" }

        // Calculate new stock
        const stockChange = type === 'IN' ? quantity : -quantity
        const newStock = item.quantity + stockChange

        if (newStock < 0) {
            return { success: false, error: "Insufficient stock" }
        }

        await prisma.$transaction([
            prisma.consumable.update({
                where: { id },
                data: { quantity: newStock }
            }),
            prisma.consumableTransaction.create({
                data: {
                    type,
                    quantity,
                    consumableId: id,
                    notes,
                }
            })
        ])

        revalidatePath("/admin/inventory")
        return { success: true }
    } catch (error) {
        console.error("Failed to update stock:", error)
        return { success: false, error: "Failed to update stock" }
    }
}

export async function getConsumableTransactions(id: string) {
    try {
        const transactions = await prisma.consumableTransaction.findMany({
            where: { consumableId: id },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
        return { success: true, transactions }
    } catch (error) {
        return { success: false, error: "Failed to fetch inventory item" }
    }
}

export async function createInventoryItem(formData: FormData) {
    try {
        const item = await prisma.inventoryItem.create({
            data: {
                name: formData.get("name") as string,
                category: formData.get("category") as string,
                sku: formData.get("sku") as string,
                manufacturer: formData.get("manufacturer") as string,
                model: formData.get("model") as string,
                serialNumber: formData.get("serialNumber") as string,
                barcode: formData.get("barcode") as string,
                quantity: parseInt(formData.get("quantity") as string) || 0,
                minQuantity: parseInt(formData.get("minQuantity") as string) || 5,
                unitPrice: parseFloat(formData.get("unitPrice") as string) || 0,
            }
        })
        revalidatePath("/admin/inventory")
        revalidatePath("/inventory")
        return { success: true, data: item }
    } catch (error) {
        console.error("Error creating inventory item:", error)
        return { success: false, error: "Failed to create inventory item" }
    }
}

export async function deleteConsumable(id: string) {
    try {
        await prisma.consumableTransaction.deleteMany({
            where: { consumableId: id }
        })

        await prisma.consumable.delete({
            where: { id }
        })

        revalidatePath("/admin/inventory")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete consumable:", error)
        return { success: false, error: "فشل حذف الصنف" }
    }
}

// ========== تنبيهات المخزون المنخفض ==========

export async function getLowStockItems() {
    try {
        const items = await prisma.consumable.findMany({
            where: {
                quantity: {
                    lte: prisma.consumable.fields.minQuantity
                }
            },
            orderBy: { quantity: 'asc' }
        })

        // Re-filter manually just in case
        const filtered = items.filter(item => item.quantity <= item.minQuantity)

        return { success: true, data: filtered }
    } catch (error) {
        console.error("Failed to fetch low stock items:", error)
        return { success: false, error: "فشل جلب الأصناف منخفضة المخزون", data: [] }
    }
}

export async function checkAndNotifyLowStock() {
    try {
        // جلب الأصناف منخفضة المخزون
        const allItems = await prisma.consumable.findMany()
        const lowStockItems = allItems.filter(item => item.quantity <= item.minQuantity)

        if (lowStockItems.length === 0) {
            return { success: true, notified: 0 }
        }

        // جلب جميع المسؤولين
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, name: true, email: true }
        })

        let notificationsCreated = 0

        for (const item of lowStockItems) {
            // التحقق من عدم وجود إشعار مكرر خلال آخر 24 ساعة
            const recentNotification = await prisma.notification.findFirst({
                where: {
                    type: 'LOW_STOCK',
                    entityId: item.id,
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
                    }
                }
            })

            if (recentNotification) continue // تخطي إذا تم الإشعار مؤخراً

            // إرسال إشعار لكل مسؤول
            for (const admin of admins) {
                // 1. System Notification
                await prisma.notification.create({
                    data: {
                        userId: admin.id,
                        type: 'LOW_STOCK',
                        title: '⚠️ تنبيه: مخزون منخفض',
                        message: `الصنف "${item.name}" وصل للحد الأدنى (المتبقي: ${item.quantity} من ${item.minQuantity})`,
                        entityType: 'CONSUMABLE',
                        entityId: item.id,
                        read: false
                    }
                })

                // 2. Email Notification (New)
                if (admin.email) {
                    await sendEmail({
                        to: admin.email,
                        subject: `⚠️ تنبيه مخزون: ${item.name}`,
                        html: `
                        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                            <h2 style="color: #d97706;">تنبيه انخفاض مخزون</h2>
                            <p>مرحباً <strong>${admin.name || 'المسؤول'}</strong>،</p>
                            <p>هذا تنبيه آلي يفيد بأن الصنف التالي قد وصل للحد الأدنى:</p>
                            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                                <tr style="background-color: #f3f4f6;">
                                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>الصنف</strong></td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>الكمية الحالية</strong></td>
                                    <td style="padding: 10px; border: 1px solid #ddd; color: #dc2626; font-weight: bold;">${item.quantity}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;"><strong>الحد الأدنى</strong></td>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${item.minQuantity}</td>
                                </tr>
                            </table>
                            <p>يرجى اتخاذ الإجراء اللازم.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                            <p style="font-size: 12px; color: #666;">نظام إدارة الأصول التقنية</p>
                        </div>
                    `
                    })
                }

                notificationsCreated++
            }
        }

        return { success: true, notified: notificationsCreated, lowStockCount: lowStockItems.length }
    } catch (error) {
        console.error("Failed to check low stock:", error)
        return { success: false, error: "فشل التحقق من المخزون المنخفض" }
    }
}

export async function updateInventoryItem(id: string, formData: FormData) {
    try {
        const name = formData.get("name") as string
        const quantity = parseInt(formData.get("quantity") as string) || 0
        const minQuantity = parseInt(formData.get("minQuantity") as string) || 0
        const unitPrice = parseFloat(formData.get("unitPrice") as string) || 0
        const sku = formData.get("sku") as string
        const manufacturer = formData.get("manufacturer") as string
        const model = formData.get("model") as string
        const serialNumber = formData.get("serialNumber") as string
        const barcode = formData.get("barcode") as string

        await prisma.inventoryItem.update({
            where: { id },
            data: {
                name,
                quantity,
                minQuantity,
                unitPrice,
                sku,
                manufacturer,
                model,
                serialNumber,
                barcode,
            }
        })

        revalidatePath("/admin/inventory")
        return { success: true }
    } catch (error) {
        console.error("Failed to update inventory item:", error)
        return { success: false, error: "فشل تحديث العنصر" }
    }
}

export async function getInventoryItemById(id: string) {
    try {
        const item = await prisma.inventoryItem.findUnique({
            where: { id }
        })
        return { success: true, data: item }
    } catch (error) {
        return { success: false, error: "فشل جلب بيانات العنصر" }
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        await prisma.inventoryItem.delete({
            where: { id }
        })
        revalidatePath("/admin/inventory")
        revalidatePath("/inventory")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete inventory item:", error)
        return { success: false, error: "فشل حذف العنصر" }
    }
}

export async function bulkCreateInventoryItems(items: any[]) {
    try {
        const results = await prisma.$transaction(
            items.map(item => prisma.inventoryItem.create({
                data: {
                    name: item.name,
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 0,
                    category: 'GENERAL', // Default category for scanned items
                    // description: 'Imported via Invoice Scanner' - Field not in schema
                }
            }))
        )

        revalidatePath("/admin/inventory")
        return { success: true, count: results.length }
    } catch (error) {
        console.error("Failed to bulk create items:", error)
        return { success: false, error: "فشل إضافة العناصر للمخزون" }
    }
}
