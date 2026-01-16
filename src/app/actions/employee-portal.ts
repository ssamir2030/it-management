"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cookies, headers } from "next/headers"
import { notifyRequestStatusChange, notifyNewRequest } from "./employee-notifications"
import { verifyPassword } from "@/lib/password"
import { logAction } from "@/lib/logger"
import { calculateDueDate } from "./sla"

// Simple session management for this demo using cookies
// In a production app, use a proper auth library like NextAuth or similar
const COOKIE_NAME = "employee_portal_session"

export async function employeeLogin(identityNumber: string, password: string) {
    try {
        // Trim inputs to remove any whitespace
        const cleanIdentity = identityNumber.trim()

        const employee = await prisma.employee.findFirst({
            where: {
                identityNumber: cleanIdentity
            }
        })

        if (!employee) {
            return { success: false, error: "بيانات الدخول غير صحيحة. تأكد من رقم الهوية وكلمة المرور." }
        }

        // Verify password
        if (!employee.password) {
            // Backward compatibility: if no password set, fallback to phone verification
            // This is temporary and should be removed after all employees have passwords
            return { success: false, error: "الرجاء التواصل مع الإدارة لإعداد كلمة المرور الخاصة بك." }
        }

        const isPasswordValid = await verifyPassword(password, employee.password)

        if (!isPasswordValid) {
            return { success: false, error: "كلمة المرور غير صحيحة." }
        }

        // Detect if running on HTTPS (ngrok) or localhost
        const host = headers().get('host') || ''
        const isSecure = host.includes('ngrok') || host.includes('https') || process.env.NODE_ENV === 'production'

        // Set a simple session cookie (works on both localhost and ngrok)
        const isProduction = process.env.NODE_ENV === 'production'

        cookies().set(COOKIE_NAME, employee.id, {
            httpOnly: true,
            secure: false, // Force false for debugging/local network issues
            sameSite: 'lax', // Relaxed for localhost
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        })

        await logAction({
            userId: employee.id,
            userName: employee.name,
            action: 'LOGIN',
            entityType: 'EMPLOYEE',
            entityId: employee.id,
            entityName: employee.name
        })

        revalidatePath('/portal', 'layout')
        return { success: true }
    } catch (error) {
        console.error("Employee login error:", error)
        return { success: false, error: `حدث خطأ: ${(error as Error).message}` }
    }
}

export async function employeeLogout() {
    cookies().delete(COOKIE_NAME)
    return { success: true }
}

export async function getCurrentEmployee() {
    const cookieStore = cookies()
    const employeeId = cookieStore.get(COOKIE_NAME)?.value

    if (!employeeId) {
        return null
    }

    try {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                assets: true,
                custodyItems: {
                    include: {
                        asset: true
                    }
                },
                requests: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 5, // Limit to last 5 requests for dashboard summary
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        subject: true,
                        details: true,
                        createdAt: true
                    }
                },
                department: {
                    select: {
                        name: true
                    }
                }
            }
        })
        return employee
    } catch (error) {
        console.error('❌ getCurrentEmployee ERROR:', error)
        return null
    }
}

export async function createEmployeeRequest(
    type: string,
    details: string,
    subject?: string,
    priority: string = 'NORMAL',
    attachments: any[] = [],
    serviceItemId?: string
) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: "غير مصرح لك" }
    }

    try {
        const expectedCompletionDate = await calculateDueDate(priority)

        const request = await prisma.employeeRequest.create({
            data: {
                type,
                details,
                subject: subject || `${type} Request`,
                priority,
                employeeId,
                expectedCompletionDate,
                status: 'PENDING',
                serviceItemId, // Link to Service Catalog
                attachments: {
                    create: attachments.map(att => ({
                        fileName: att.fileName,
                        fileUrl: att.fileUrl,
                        fileType: att.fileType,
                        fileSize: att.fileSize
                    }))
                },
                timeline: {
                    create: {
                        status: 'PENDING',
                        title: 'تم إنشاء الطلب',
                        description: 'تم استلام طلبك وهو قيد المراجعة من قبل فريق تقنية المعلومات',
                        actorName: 'النظام'
                    }
                },
                sla: {
                    create: {
                        breachTime: expectedCompletionDate
                    }
                }
            }
        })

        // Notify Admins
        await notifyNewRequest(employeeId, type, request.id)

        revalidatePath("/portal/dashboard")
        revalidatePath("/portal/requests")
        return { success: true, data: request }
    } catch (error) {
        console.error("Create request error:", error)
        return { success: false, error: "فشل في إنشاء الطلب" }
    }
}

// Create Support Ticket (for technical issues)
export async function createSupportTicket(title: string, description: string, priority: string = 'NORMAL', attachments: any[] = []) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: "غير مصرح لك" }
    }

    try {
        // Create EmployeeRequest with type 'SUPPORT'
        const request = await prisma.employeeRequest.create({
            data: {
                type: 'SUPPORT',
                subject: title,
                details: description,
                priority,
                status: 'PENDING',
                employeeId,
                attachments: {
                    create: attachments.map(att => ({
                        fileName: att.fileName,
                        fileUrl: att.fileUrl,
                        fileType: att.fileType,
                        fileSize: att.fileSize
                    }))
                },
                timeline: {
                    create: {
                        status: 'PENDING',
                        title: 'تم إنشاء تذكرة الدعم',
                        description: 'تم استلام تذكرتك وهي قيد المراجعة من قبل فريق الدعم الفني',
                        actorName: 'النظام'
                    }
                },
                sla: {
                    create: {
                        breachTime: await calculateDueDate(priority)
                    }
                }
            }
        })

        // Notify Admins
        await notifyNewRequest(employeeId, 'SUPPORT', request.id)

        revalidatePath("/portal/dashboard")
        revalidatePath("/portal/support")
        return { success: true, data: request }
    } catch (error) {
        console.error("Create ticket error:", error)
        return { success: false, error: "فشل في إنشاء التذكرة" }
    }
}

// دالة جديدة لجلب تفاصيل الطلب الكاملة
export async function getRequestDetails(requestId: string) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: "غير مصرح لك" }
    }

    try {
        const request = await prisma.employeeRequest.findUnique({
            where: { id: requestId },
            include: {
                timeline: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                attachments: true
            }
        })

        if (!request) {
            return { success: false, error: "الطلب غير موجود" }
        }

        if (request.employeeId !== employeeId) {
            return { success: false, error: "غير مصرح لك بعرض هذا الطلب" }
        }

        return { success: true, data: request }
    } catch (error) {
        console.error("Get request details error:", error)
        return { success: false, error: "فشل في جلب تفاصيل الطلب" }
    }
}

// دالة لإلغاء الطلب من قبل الموظف
export async function cancelRequest(requestId: string, reason?: string) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: "غير مصرح لك" }
    }

    try {
        const request = await prisma.employeeRequest.findUnique({
            where: { id: requestId }
        })

        if (!request) {
            return { success: false, error: "الطلب غير موجود" }
        }

        if (request.employeeId !== employeeId) {
            return { success: false, error: "غير مصرح لك" }
        }

        if (request.status !== 'PENDING') {
            return { success: false, error: "لا يمكن إلغاء الطلب في حالته الحالية" }
        }

        await prisma.employeeRequest.update({
            where: { id: requestId },
            data: {
                status: 'CANCELLED',
                timeline: {
                    create: {
                        status: 'CANCELLED',
                        title: 'تم إلغاء الطلب',
                        description: reason || 'قام الموظف بإلغاء الطلب',
                        actorName: 'الموظف'
                    }
                }
            }
        })

        // إرسال إشعار (اختياري، لنفس الموظف للتأكيد)
        await notifyRequestStatusChange(employeeId, request.type, 'CANCELLED')

        revalidatePath(`/portal/requests/${requestId}`)
        revalidatePath("/portal/dashboard")

        return { success: true }
    } catch (error) {
        console.error("Cancel request error:", error)
        return { success: false, error: "فشل في إلغاء الطلب" }
    }
}

// دالة لجلب جميع طلبات الموظف مع الفلترة (بدون طلبات الدعم الفني)
export async function getMyRequests() {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: "غير مصرح لك" }
    }

    try {
        const requests = await prisma.employeeRequest.findMany({
            where: {
                employeeId,
                type: { not: 'SUPPORT' } // استبعاد طلبات الدعم الفني
            },
            orderBy: { createdAt: 'desc' },
            include: {
                timeline: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        return { success: true, data: requests }
    } catch (error) {
        console.error("Get my requests error:", error)
        return { success: false, error: "فشل في جلب الطلبات" }
    }
}

// دالة لجلب تذاكر الدعم الفني للموظف
export async function getMySupportTickets() {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: "غير مصرح لك" }
    }

    try {
        const tickets = await prisma.employeeRequest.findMany({
            where: {
                employeeId,
                type: 'SUPPORT'
            },
            orderBy: { createdAt: 'desc' },
            include: {
                timeline: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        return { success: true, data: tickets }
    } catch (error) {
        console.error("Get my support tickets error:", error)
        return { success: false, error: "فشل في جلب التذاكر" }
    }
}


// دالة لإرسال تقييم الخدمة
export async function submitRequestFeedback(requestId: string, rating: number, feedback: string) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: "غير مصرح لك" }
    }

    try {
        const request = await prisma.employeeRequest.findUnique({
            where: { id: requestId }
        })

        if (!request) {
            return { success: false, error: "الطلب غير موجود" }
        }

        if (request.employeeId !== employeeId) {
            return { success: false, error: "غير مصرح لك" }
        }

        if (request.status !== 'COMPLETED') {
            return { success: false, error: "لا يمكن تقييم طلب غير مكتمل" }
        }

        await prisma.employeeRequest.update({
            where: { id: requestId },
            data: {
                rating,
                feedback
            }
        })

        revalidatePath(`/portal/requests/${requestId}`)
        return { success: true }
    } catch (error) {
        console.error("Submit feedback error:", error)
        return { success: false, error: "فشل في إرسال التقييم" }
    }
}

// دالة لتغيير كلمة المرور
export async function changePassword(currentPassword: string, newPassword: string) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: "غير مصرح لك" }
    }

    try {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId }
        })

        if (!employee || !employee.password) {
            return { success: false, error: "حدث خطأ في استرجاع بيانات الموظف" }
        }

        // التحقق من كلمة المرور الحالية
        const { verifyPassword } = await import("@/lib/password")
        const isCurrentPasswordValid = await verifyPassword(currentPassword, employee.password)

        if (!isCurrentPasswordValid) {
            return { success: false, error: "كلمة المرور الحالية غير صحيحة" }
        }

        // التحقق من قوة كلمة المرور الجديدة
        if (newPassword.length < 8) {
            return { success: false, error: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" }
        }

        // تشفير كلمة المرور الجديدة
        const { hashPassword } = await import("@/lib/password")
        const hashedNewPassword = await hashPassword(newPassword)

        // تحديث كلمة المرور
        await prisma.employee.update({
            where: { id: employeeId },
            data: { password: hashedNewPassword }
        })

        return { success: true }
    } catch (error) {
        console.error("Change password error:", error)
        return { success: false, error: "فشل في تغيير كلمة المرور" }
    }
}

export async function submitFeedback(requestId: string, rating: number, feedback?: string) {
    try {
        const employee = await getCurrentEmployee()
        if (!employee) {
            return { success: false, error: "يجب تسجيل الدخول أولاً" }
        }

        // Verify that the request belongs to this employee and is completed
        const request = await prisma.employeeRequest.findFirst({
            where: {
                id: requestId,
                employeeId: employee.id,
                status: 'COMPLETED'
            }
        })

        if (!request) {
            return { success: false, error: "الطلب غير موجود أو لا يمكن تقييمه" }
        }

        // Check if already rated
        if (request.rating) {
            return { success: false, error: "تم تقييم هذا الطلب من قبل" }
        }

        // Update the request with rating and feedback
        await prisma.employeeRequest.update({
            where: { id: requestId },
            data: {
                rating,
                feedback: feedback || null
            }
        })

        revalidatePath(`/portal/requests/${requestId}`)
        revalidatePath('/portal/requests')

        return { success: true }
    } catch (error) {
        console.error("Submit feedback error:", error)
        return { success: false, error: "فشل إرسال التقييم" }
    }
}

// دالة لجلب التقرير الشخصي للموظف
export async function getMyReport() {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: "غير مصرح لك" }
    }

    try {
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // جلب بيانات الموظف مع العلاقات
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                department: { select: { name: true } },
                custodyItems: {
                    where: { returnDate: null },
                    include: {
                        asset: {
                            select: { name: true, tag: true, type: true }
                        }
                    }
                },
                assets: {
                    select: { id: true, name: true, tag: true, type: true, status: true }
                },
                requests: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        type: true,
                        subject: true,
                        status: true,
                        priority: true,
                        createdAt: true,
                        rating: true,
                        completedAt: true,
                        expectedCompletionDate: true
                    }
                },
                roomBookings: {
                    where: { startTime: { gte: startOfMonth } },
                    select: { id: true }
                }
            }
        })

        if (!employee) {
            return { success: false, error: "الموظف غير موجود" }
        }

        // حساب الإحصائيات
        const allRequests = await prisma.employeeRequest.findMany({
            where: { employeeId },
            select: { status: true, rating: true, createdAt: true }
        })

        const thisMonthRequests = allRequests.filter(r => r.createdAt >= startOfMonth)
        const completedRequests = allRequests.filter(r => r.status === 'COMPLETED')
        const ratingsGiven = completedRequests.filter(r => r.rating !== null)
        const avgRating = ratingsGiven.length > 0
            ? ratingsGiven.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingsGiven.length
            : 0

        const stats = {
            totalRequests: allRequests.length,
            thisMonthRequests: thisMonthRequests.length,
            pendingRequests: allRequests.filter(r => r.status === 'PENDING').length,
            inProgressRequests: allRequests.filter(r => r.status === 'IN_PROGRESS').length,
            completedRequests: completedRequests.length,
            rejectedRequests: allRequests.filter(r => r.status === 'REJECTED').length,
            totalCustodyItems: employee.custodyItems.length,
            totalAssets: employee.assets.length,
            thisMonthBookings: employee.roomBookings.length,
            ratingsGiven: ratingsGiven.length,
            averageRating: Math.round(avgRating * 10) / 10
        }

        return {
            success: true,
            data: {
                employee: {
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                    jobTitle: employee.jobTitle,
                    department: employee.department?.name
                },
                stats,
                recentRequests: employee.requests,
                custodyItems: employee.custodyItems,
                assets: employee.assets
            }
        }
    } catch (error) {
        console.error("Get my report error:", error)
        return { success: false, error: "فشل في جلب التقرير" }
    }
}

// دالة لحفظ الصورة الشخصية للموظف
export async function saveProfilePicture(imageBase64: string) {
    const employeeId = cookies().get(COOKIE_NAME)?.value

    if (!employeeId) {
        return { success: false, error: "غير مصرح لك" }
    }

    try {
        await prisma.employee.update({
            where: { id: employeeId },
            data: { image: imageBase64 }
        })

        revalidatePath('/portal/profile')
        revalidatePath('/portal/dashboard')

        return { success: true }
    } catch (error) {
        console.error("Save profile picture error:", error)
        return { success: false, error: "فشل حفظ الصورة الشخصية" }
    }
}
