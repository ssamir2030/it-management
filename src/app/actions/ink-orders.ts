'use server'

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { notifyNewRequest } from "./employee-notifications"
import { calculateDueDate } from "./sla"

const COOKIE_NAME = "employee_portal_session"

export async function submitInkRequest(params: {
    items: Array<{
        itemName: string
        quantity: number
        details: string
    }>,
    notes: string
}) {
    const employeeId = cookies().get(COOKIE_NAME)?.value


    if (!employeeId) {
        console.error('❌ [InkRequest] No employee ID found in cookie')
        return { success: false, error: "غير مصرح لك - يجب تسجيل الدخول" }
    }

    try {

        // 1. Prepare Data
        let fullDetails = "طلب أحبار متعددة:\n\n"
        fullDetails += params.items.map((item, i) =>
            `${i + 1}. ${item.itemName} (الكمية: ${item.quantity})\n   - ${item.details}`
        ).join('\n\n')

        if (params.notes) {
            fullDetails += `\n\n----------------\nملاحظات عامة: ${params.notes}`
        }

        // Embed structured data for automated processing (Hidden from UI but parsable)
        const structuredData = JSON.stringify(params.items)
        fullDetails += `\n\n<!-- DATA: ${structuredData} -->`



        const subject = params.items.length === 1
            ? `طلب حبر: ${params.items[0].itemName}`
            : `طلب أحبار (${params.items.length} أصناف)`


        // Calculate Due Date (Fail Safe)
        let expectedCompletionDate = new Date()
        expectedCompletionDate.setDate(expectedCompletionDate.getDate() + 2) // Default 48h
        try {
            expectedCompletionDate = await calculateDueDate('NORMAL')

        } catch (e) {
            console.error("SLA calculation failed, using default", e)

        }

        // 2. Create Request

        const request = await prisma.employeeRequest.create({
            data: {
                type: 'CONSUMABLE',
                details: fullDetails,
                subject: subject,
                priority: 'NORMAL',
                employeeId,
                status: 'PENDING',
                expectedCompletionDate,
                timeline: {
                    create: {
                        status: 'PENDING',
                        title: 'تم إنشاء الطلب',
                        description: 'تم إرسال الطلب للمديـر للمراجعة والتوجيه (صرف من المخزون أو شراء)',
                        actorName: 'النظام'
                    }
                }
            }
        })


        // 3. Notifications (Fail Safe)
        try {

            await notifyNewRequest(employeeId, 'CONSUMABLE', request.id)
            revalidatePath("/portal/dashboard")
            revalidatePath("/portal/requests")

        } catch (notifyError) {
            console.error("Notification failed (non-critical):", notifyError)
        }

        return { success: true, data: request }

    } catch (error) {
        console.error('Submit Order Critical Error:', error)
        return { success: false, error: `Critical Error: ${(error as Error).message}` }
    }
}

export async function checkInkStock(inkName: string) {
    try {
        if (!inkName) return { found: false, stock: 0 }

        const consumable = await prisma.consumable.findFirst({
            where: {
                OR: [
                    { name: { contains: inkName } },
                    // Try to match partials if full match fails
                    // This is a simple fuzzy match strategy
                ]
            }
        })

        if (!consumable) {
            return { found: false, stock: 0 }
        }

        return { found: true, stock: consumable.quantity, id: consumable.id }

    } catch (error) {
        console.error("Error checking ink stock:", error)
        return { found: false, stock: 0, error: "فشل التحقق من المخزون" }
    }
}
