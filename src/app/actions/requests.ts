"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { notifyRequestStatusChange } from "./employee-notifications"
import { getSession } from "@/lib/simple-auth"
import { logAction } from "@/lib/logger"

export async function getEmployeeRequests() {
    try {
        const requests = await prisma.employeeRequest.findMany({
            include: {
                employee: {
                    select: {
                        name: true,
                        department: {
                            select: { name: true }
                        },
                        identityNumber: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, data: requests }
    } catch (error) {
        console.error("Error fetching requests:", error)
        return { success: false, error: "فشل جلب الطلبات" }
    }
}

export async function getRequestById(id: string) {
    try {
        const request = await prisma.employeeRequest.findUnique({
            where: { id },
            include: {
                employee: {
                    include: {
                        department: true
                    }
                },
                timeline: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                attachments: true,
                sla: true
            }
        })
        return { success: true, data: request }
    } catch (error) {
        console.error("Error fetching request:", error)
        return { success: false, error: "فشل جلب تفاصيل الطلب" }
    }
}

export async function updateRequestStatus(
    requestId: string,
    status: string,
    adminName: string = "المسؤول",
    note?: string,
    assetId?: string
) {
    try {
        const session = await getSession()
        const request = await prisma.employeeRequest.findUnique({
            where: { id: requestId },
            select: { type: true, employeeId: true, details: true }
        })

        if (!request) return { success: false, error: "الطلب غير موجود" }

        // تحديد عنوان ووصف للـ Timeline بناءً على الحالة
        let title = "تحديث الحالة"
        let description = `تم تغيير حالة الطلب إلى ${getStatusLabel(status)}`

        if (note) {
            description += `. ملاحظات: ${note}`
        }

        if (status === 'IN_PROGRESS') {
            title = "بدء التنفيذ"
            description = "جاري العمل على طلبك من قبل الفريق المختص"
        } else if (status === 'COMPLETED') {
            title = "اكتمل الطلب"
            description = "تم إنجاز طلبك بنجاح"
        } else if (status === 'REJECTED') {
            title = "تم رفض الطلب"
            description = note || "نعتذر، تم رفض طلبك"
        }

        await prisma.$transaction([
            // تحديث حالة الطلب
            prisma.employeeRequest.update({
                where: { id: requestId },
                data: {
                    status,
                    ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
                    ...(status === 'REJECTED' ? { rejectionReason: note } : {}),
                    ...(note && status !== 'REJECTED' ? { adminNotes: note } : {})
                }
            }),
            // إضافة سجل في الـ Timeline
            prisma.requestTimeline.create({
                data: {
                    requestId,
                    status,
                    title,
                    description,
                    actorName: adminName
                }
            })
        ])

        // إرسال إشعار للموظف
        try {
            await notifyRequestStatusChange(request.employeeId, request.type, status, requestId)
        } catch (notifyError) {
            console.error("Non-critical notification error:", notifyError)
        }

        // تسجيل العملية في سجل النظام
        if (session?.id) {
            await logAction({
                userId: session.id as string,
                userName: adminName,
                action: 'UPDATE_STATUS',
                entityType: 'REQUEST',
                entityId: requestId,
                entityName: `Request #${requestId.slice(-6)}`,
                changes: { oldStatus: 'UNKNOWN', newStatus: status, note }
            })
        }

        revalidatePath("/requests")
        revalidatePath(`/requests/${requestId}`)
        revalidatePath(`/requests/${requestId}`)
        revalidatePath("/portal/dashboard")

        // معالجة تعيين الأصول (لطلبات الأجهزة)
        if (status === 'COMPLETED' && assetId) {
            try {
                // 1. Check if asset exists and is available
                const asset = await prisma.asset.findUnique({
                    where: { id: assetId }
                })

                if (asset && (asset.status === 'AVAILABLE' || asset.status === 'IN_STORE')) {
                    // 2. Assign Asset to Employee
                    await prisma.asset.update({
                        where: { id: assetId },
                        data: {
                            status: 'ASSIGNED',
                            employeeId: request.employeeId
                        }
                    })

                    // 3. Create Custody Record
                    await prisma.custodyItem.create({
                        data: {
                            name: asset.name,
                            description: `Assigned via Request #${requestId.slice(-6)} - Tag: ${asset.tag}`,
                            employeeId: request.employeeId,
                            assetId: asset.id,
                            categoryId: asset.categoryId,
                            assignedDate: new Date()
                        }
                    })

                    // 4. Log Action
                    await logAction({
                        userId: session?.id || 'system',
                        userName: adminName,
                        action: 'ASSIGN',
                        entityType: 'ASSET',
                        entityId: asset.id,
                        entityName: asset.name,
                        changes: {
                            newStatus: 'ASSIGNED',
                            employeeId: request.employeeId,
                            requestId
                        }
                    })

                    console.log(`✅ Asset ${asset.tag} assigned to employee ${request.employeeId}`)
                } else {
                    console.warn(`⚠️ Asset ${assetId} not found or not available`)
                }
            } catch (assetError) {
                console.error("Asset assignment process failed:", assetError)
            }
        }

        // معالجة صرف المخزون (لطلبات الأحبار والمستهلكات)
        if (status === 'COMPLETED' && request.type === 'CONSUMABLE' && request.details?.includes('<!-- DATA:')) {
            try {
                const jsonMatch = request.details.match(/<!-- DATA: (.*?) -->/)
                if (jsonMatch && jsonMatch[1]) {
                    const items = JSON.parse(jsonMatch[1])
                    for (const item of items) {
                        try {
                            // البحث عن الصنف في المستودع بالاسم
                            // نحاول البحث عن جزء من الاسم لضمان التطابق
                            const consumable = await prisma.consumable.findFirst({
                                where: {
                                    OR: [
                                        { name: { contains: item.itemName } },
                                        { name: { contains: item.modelName } }
                                    ]
                                }
                            })

                            if (consumable) {
                                // خصم الكمية
                                await prisma.consumable.update({
                                    where: { id: consumable.id },
                                    data: {
                                        quantity: { decrement: item.quantity || 1 },
                                        transactions: {
                                            create: {
                                                type: 'OUT',
                                                quantity: item.quantity || 1,
                                                notes: `صرف مخزون للطلب #${requestId.slice(-6)} - ${item.itemName}`,
                                                // department: 'IT', // Removed
                                                // createdBy: adminName, // Removed
                                                employeeId: request.employeeId // Link to employee for reporting
                                            }
                                        }
                                    }
                                })
                                console.log(`✅ Stock deducted for item: ${item.itemName}`)
                            } else {
                                console.warn(`⚠️ Consumable item not found in inventory: ${item.itemName}`)
                            }
                        } catch (itemError) {
                            console.error(`Failed to deduct stock for item ${item.itemName}:`, itemError)
                        }
                    }
                }
            } catch (stockError) {
                console.error("Stock deduction process failed:", stockError)
            }
        }

        return { success: true }
    } catch (error) {
        console.error("Error updating request status:", error)
        return { success: false, error: `فشل تحديث حالة الطلب: ${error instanceof Error ? error.message : String(error)}` }
    }
}

export async function assignRequest(requestId: string, assigneeName: string, adminName: string = "المسؤول") {
    try {
        await prisma.$transaction([
            prisma.employeeRequest.update({
                where: { id: requestId },
                data: { assignedTo: assigneeName }
            }),
            prisma.requestTimeline.create({
                data: {
                    requestId,
                    status: 'IN_PROGRESS',
                    title: 'تم تعيين مسؤول',
                    description: `تم إسناد الطلب إلى: ${assigneeName}`,
                    actorName: adminName
                }
            })
        ])

        revalidatePath(`/requests/${requestId}`)
        return { success: true }
    } catch (error) {
        console.error("Error assigning request:", error)
        return { success: false, error: "فشل تعيين الطلب" }
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'PENDING': return 'قيد الانتظار'
        case 'IN_PROGRESS': return 'قيد التنفيذ'
        case 'COMPLETED': return 'مكتمل'
        case 'REJECTED': return 'مرفوض'
        case 'CANCELLED': return 'ملغي'
        default: return status
    }
}

export async function deleteRequest(requestId: string) {
    const session = await getSession()

    // التحقق من أن المستخدم مدير
    if (!session || session.role !== 'ADMIN') {
        return { success: false, error: "غير مصرح لك بحذف الطلبات" }
    }

    try {
        // حذف التايم لاين المرتبط
        await prisma.requestTimeline.deleteMany({
            where: { requestId }
        })

        // حذف الطلب
        await prisma.employeeRequest.delete({
            where: { id: requestId }
        })

        revalidatePath("/requests")
        revalidatePath("/admin/support")
        revalidatePath("/portal/dashboard")

        return { success: true }
    } catch (error) {
        console.error("Error deleting request:", error)
        return { success: false, error: "فشل حذف الطلب" }
    }
}

