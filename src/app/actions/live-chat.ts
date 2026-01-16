'use server'

import prisma from '@/lib/prisma'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { revalidatePath } from 'next/cache'

const SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || 'your-secret-key-here'
)

// Helper to get admin session from auth-token or NextAuth
async function getAdminSession() {
    try {
        // Try simple-auth first
        const token = cookies().get('auth-token')?.value
        if (token) {
            try {
                const verified = await jwtVerify(token, SECRET)
                return verified.payload as { id: string; name: string; email: string; role: string }
            } catch {
                // Token invalid, try NextAuth
            }
        }

        // Fallback to NextAuth
        const { auth } = await import('@/auth')
        const session = await auth()

        if (session?.user) {
            return {
                id: session.user.id!,
                name: session.user.name || 'Admin',
                email: session.user.email || '',
                role: session.user.role || 'ADMIN'
            }
        }

        return null
    } catch {
        return null
    }
}

interface SenderInfo {
    id: string
    name: string
    email?: string
}

/**
 * إرسال رسالة دردشة جديدة
 * يدعم إرسال الرسائل من User (ADMIN) أو Employee
 */
/**
 * إرسال رسالة دردشة جديدة
 * يدعم إرسال الرسائل من User (ADMIN) أو Employee
 */
import { generateAIResponse } from './ai-support'

// ... existing imports

// ... existing code

export async function sendChatMessage(
    content: string,
    recipientId?: string,
    attachmentUrl?: string,
    preferredRole?: 'ADMIN' | 'EMPLOYEE',
    senderInfo?: SenderInfo
) {
    try {
        let senderId: string
        let senderName: string
        let senderType: 'USER' | 'EMPLOYEE'

        // ALWAYS verify session on server side
        if (preferredRole === 'EMPLOYEE') {
            const employee = await getCurrentEmployee()
            if (!employee) {
                return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            }
            senderId = employee.id
            senderName = employee.name
            senderType = 'EMPLOYEE'

            // Check Chat Status for AI INTERCEPTION
            const empRecord = await prisma.employee.findUnique({
                where: { id: senderId },
                select: { chatStatus: true }
            })

            // Default to BOT if not set (or if schema default applies)
            const isBotMode = empRecord?.chatStatus === 'BOT'

            const message = await prisma.chatMessage.create({
                data: {
                    content,
                    senderId,
                    senderType,
                    employeeId: senderId,
                    isRead: false,
                    attachmentUrl
                },
                include: { employee: { select: { id: true, name: true, email: true } } }
            })

            // IF BOT MODE: Generate Response
            if (isBotMode) {
                try {
                    // Determine if we should escalate based on keywords before asking AI
                    // (Optional: You can move this logic inside generateAIResponse)

                    const aiRes = await generateAIResponse(content)

                    // Save AI Message
                    await prisma.chatMessage.create({
                        data: {
                            content: aiRes.text,
                            senderId: 'AI_SUPPORT', // Special ID for Bot
                            senderType: 'USER',     // Treated as Admin/System
                            userId: undefined,      // No specific admin user
                            employeeId: senderId,   // Reply to this employee
                            isRead: true,           // Employee sees it immediately
                            isBotMessage: true
                        }
                    })
                } catch (aiError) {
                    console.error('❌ AI Bot Error (Non-fatal):', aiError)
                    // Continue execution - do not fail the user's message
                }
            } else {
                // HUMAN MODE: Notify Admins (Normal Logic)
                // Logic to find admin recipient is handled by normal flow or just creating the message is enough
                // The existing code for finding admin recipient was inside the 'USER' block, 
                // but for EMPLOYEE sender, we might want to notify specific admin? 
                // For now, just creating the message makes it visible to all admins.
            }

            revalidatePath('/messages')
            // revalidatePath('/portal') // Causing full layout reload/flicker? Removed.
            return { success: true, data: message }

        } else {
            // ADMIN SENDING MESSAGE
            const admin = await getAdminSession()
            if (!admin) {
                return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            }
            senderId = admin.id
            senderName = admin.name || 'Admin'
            senderType = 'USER'

            // ... (Rest of Admin logic same as before)
            const messageData: any = {
                content,
                senderId,
                senderType,
                userId: senderId,
                isRead: false,
                attachmentUrl
            }

            // Target Employee Logic
            let targetEmployeeId = recipientId
            if (!targetEmployeeId) {
                const lastMessage = await prisma.chatMessage.findFirst({
                    where: {
                        OR: [
                            { userId: senderId, employeeId: { not: null } }, // Messages sent by me
                            { senderType: 'EMPLOYEE' }, // Messages from employees
                            { recipientUserId: senderId, employeeId: { not: null } }, // System/Bot messages sent TO me
                            { employeeId: { not: null } } // Fallback: Any active chat context (risky but handles single-stream well)
                        ]
                    },
                    orderBy: { createdAt: 'desc' },
                    select: { employeeId: true }
                })
                if (lastMessage?.employeeId) {
                    targetEmployeeId = lastMessage.employeeId
                    // Ensure we have a valid ID before using it
                    console.log('🎯 Admin replying to inferred employee:', targetEmployeeId)
                } else {
                    console.warn('⚠️ Admin sending message but no target employee found.')
                }
            }

            // Verify Admin User Exists (Fix for Stale Sessions causing FK Error)
            const adminUserExists = await prisma.user.findUnique({ where: { id: senderId } })
            if (!adminUserExists) {
                // Auto-fix: Clear the stale cookie
                cookies().delete('auth-token')
                return { success: false, error: 'جلسة المستخدم منتهية. يرجى تسجيل الدخول مجدداً.' }
            }

            if (targetEmployeeId) {
                // Verify Target Employee Exists (Fix for Bad Inferred ID causing FK Error)
                const employeeExists = await prisma.employee.findUnique({ where: { id: targetEmployeeId } })

                if (employeeExists) {
                    messageData.employeeId = targetEmployeeId
                    // If Admin replies, switch employee back to HUMAN mode if needed
                    await prisma.employee.update({
                        where: { id: targetEmployeeId },
                        data: { chatStatus: 'HUMAN' }
                    })
                } else {
                    console.warn(`⚠️ Target employee ${targetEmployeeId} not found. Sending message without employee context.`)
                    // Optionally: Don't set employeeId, effectively broadcasting or just storing as general message
                    // OR return error if addressing specific employee is required
                    // For now, let's proceed without linking to deleted employee to avoid FK crash, 
                    // but this might mean the message doesn't go to the intended specific chat window effectively.
                    // Better to fail/warn or just nullify it. 
                    // Given the goal is to chat with A employee, if they don't exist, we can't chat.

                    // Let's try to find another recent employee
                    const fallbackMsg = await prisma.chatMessage.findFirst({
                        where: { senderType: 'EMPLOYEE', employeeId: { not: targetEmployeeId } },
                        orderBy: { createdAt: 'desc' },
                        select: { employeeId: true }
                    })
                    if (fallbackMsg?.employeeId) {
                        messageData.employeeId = fallbackMsg.employeeId
                        await prisma.employee.update({
                            where: { id: fallbackMsg.employeeId },
                            data: { chatStatus: 'HUMAN' }
                        })
                    } else {
                        // No valid employee found at all. Send as general system note? or Fail?
                        // Failing is safer to alert admin.
                        return { success: false, error: 'الموظف المستهدف غير موجود (قد يكون تم حذفه)' }
                    }
                }
            } else {
                return { success: false, error: 'لا يمكن تحديد الموظف المستلم' }
            }

            const message = await prisma.chatMessage.create({
                data: messageData,
                include: { user: { select: { id: true, name: true } } }
            })

            revalidatePath('/messages')
            return { success: true, data: message }
        }
    } catch (error: any) {
        console.error('❌ Error sending chat message:', error)
        return { success: false, error: `فشل إرسال الرسالة: ${error.message}` }
    }
}

export async function switchChatMode(mode: 'BOT' | 'HUMAN') {
    try {
        const employee = await getCurrentEmployee()
        if (!employee) return { success: false, error: 'Unauthorized' }

        console.log(`🔄 Switching chat mode for ${employee.name} to ${mode}`)

        await prisma.employee.update({
            where: { id: employee.id },
            data: { chatStatus: mode }
        })

        // If switching to HUMAN, notify internal admins via a System Message
        if (mode === 'HUMAN') {
            const admin = await prisma.user.findFirst({
                where: { OR: [{ role: 'SUPER_ADMIN' }, { role: 'ADMIN' }] }
            })

            if (admin) {
                await prisma.chatMessage.create({
                    data: {
                        content: '⚠️ تنبيه: الموظف طلب التحدث إلى موظف دعم بشري مباشر.',
                        senderId: 'SYSTEM',
                        senderType: 'USER', // System treated as User
                        employeeId: employee.id,
                        userId: admin.id,
                        recipientUserId: admin.id, // Trigger notification for Admin
                        isRead: false
                    }
                })
            }
        }

        revalidatePath('/portal')
        revalidatePath('/messages')
        return { success: true }
    } catch (error) {
        console.error('❌ Error switching chat mode:', error)
        return { success: false, error: 'Failed to switch mode' }
    }
}

/**
 * جلب رسائل الدردشة للمستخدم الحالي
 */
export async function getChatMessages(
    limit: number = 100,
    preferredRole?: 'ADMIN' | 'EMPLOYEE',
    userInfo?: SenderInfo // Kept for compatibility but ignored for Auth
) {
    try {
        let currentUserId: string
        let currentUserName: string
        let currentUserEmail: string
        let currentUserRole: string
        let isAdmin: boolean

        if (preferredRole === 'EMPLOYEE') {
            const employee = await getCurrentEmployee()
            if (!employee) {
                console.error('❌ No employee session for chat')
                return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            }
            currentUserId = employee.id
            currentUserName = employee.name
            currentUserEmail = employee.email
            currentUserRole = 'EMPLOYEE'
            isAdmin = false
            console.log('✅ Employee viewing chat (Session Verified):', currentUserName)
        } else {
            // Default to Admin
            const admin = await getAdminSession()
            if (!admin) {
                console.error('❌ No admin session for chat')
                return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            }
            currentUserId = admin.id
            currentUserName = admin.name || 'Admin'
            currentUserEmail = admin.email || ''
            currentUserRole = admin.role || 'ADMIN'
            isAdmin = true
            console.log('✅ Admin viewing chat (Session Verified):', currentUserName)
        }

        // بناء الاستعلام بناءً على نوع المستخدم
        const baseWhere = isAdmin
            ? {} // Admin يرى جميع الرسائل
            : {
                // Employee يرى:
                // 1. الرسائل التي أرسلها (senderId = employeeId)
                // 2. الرسائل المرسلة إليه (employeeId = currentUserId)
                // 3. الرسائل في محادثته (نفس employeeId)
                OR: [
                    { senderId: currentUserId },
                    { employeeId: currentUserId },
                    // Include messages from admin to this employee
                    {
                        AND: [
                            { senderType: 'USER' },
                            { employeeId: currentUserId }
                        ]
                    }
                ]
            }

        // Get last clear time
        let lastChatClear: Date | null = null
        try {
            if (isAdmin) {
                // @ts-ignore - Field might not exist in client yet
                const adminUser = await prisma.user.findUnique({ where: { id: currentUserId }, select: { lastChatClear: true } })
                // @ts-ignore
                lastChatClear = adminUser?.lastChatClear || null
            } else {
                // @ts-ignore - Field might not exist in client yet
                const empUser = await prisma.employee.findUnique({ where: { id: currentUserId }, select: { lastChatClear: true } })
                // @ts-ignore
                lastChatClear = empUser?.lastChatClear || null
            }
        } catch (e) {
            console.warn('⚠️ Could not fetch lastChatClear (Schema might be outdated):', e)
        }

        const whereClause = {
            AND: [
                baseWhere,
                lastChatClear ? { createdAt: { gt: lastChatClear } } : {}
            ]
        }

        const messages = await prisma.chatMessage.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                },
                employee: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            },
            take: limit
        })

        console.log(`📨 Fetched ${messages.length} messages for ${currentUserName}`)

        const currentUserData = {
            id: currentUserId,
            role: currentUserRole,
            name: currentUserName,
            email: currentUserEmail,
            chatStatus: !isAdmin ? (await prisma.employee.findUnique({ where: { id: currentUserId }, select: { chatStatus: true } }))?.chatStatus : undefined
        }

        console.log(`👤 Returning Chat User Data for ${currentUserName}:`, { status: currentUserData.chatStatus, role: currentUserData.role })

        return {
            success: true,
            data: messages,
            currentUser: currentUserData
        }
    } catch (error) {
        console.error('❌ Error fetching chat messages:', error)
        return { success: false, error: 'فشل جلب الرسائل' }
    }
}

/**
 * تحديد جميع الرسائل كمقروءة
 */
export async function markChatMessagesAsRead(preferredRole?: 'ADMIN' | 'EMPLOYEE', userInfo?: SenderInfo) {
    try {
        let currentUserId: string
        let isAdmin: boolean

        if (userInfo && preferredRole === 'EMPLOYEE') {
            currentUserId = userInfo.id
            isAdmin = false
        } else if (userInfo && preferredRole === 'ADMIN') {
            currentUserId = userInfo.id
            isAdmin = true
        } else if (preferredRole === 'EMPLOYEE') {
            const employee = await getCurrentEmployee()
            if (!employee) {
                return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            }
            currentUserId = employee.id
            isAdmin = false
        } else {
            const admin = await getAdminSession()
            if (!admin) {
                return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            }
            currentUserId = admin.id
            isAdmin = true
        }

        // تحديث الرسائل غير المقروءة الموجهة للمستخدم الحالي
        const whereClause = isAdmin
            ? {
                recipientUserId: currentUserId,
                isRead: false
            }
            : {
                employeeId: currentUserId,
                senderType: 'USER', // الرسائل القادمة من Admin
                isRead: false
            }

        const updated = await prisma.chatMessage.updateMany({
            where: whereClause,
            data: {
                isRead: true
            }
        })

        console.log(`✅ Marked ${updated.count} messages as read`)

        revalidatePath('/messages')
        return { success: true, count: updated.count }
    } catch (error) {
        console.error('❌ Error marking messages as read:', error)
        return { success: false, error: 'فشل تحديث الرسائل' }
    }
}

/**
 * حساب عدد الرسائل غير المقروءة
 */
export async function getUnreadChatCount(preferredRole?: 'ADMIN' | 'EMPLOYEE', userInfo?: SenderInfo) {
    try {
        let currentUserId: string
        let isAdmin: boolean

        if (userInfo && preferredRole === 'EMPLOYEE') {
            currentUserId = userInfo.id
            isAdmin = false
        } else if (userInfo && preferredRole === 'ADMIN') {
            currentUserId = userInfo.id
            isAdmin = true
        } else if (preferredRole === 'EMPLOYEE') {
            const employee = await getCurrentEmployee()
            if (!employee) {
                return { success: false, error: 'يجب تسجيل الدخول أولاً', count: 0 }
            }
            currentUserId = employee.id
            isAdmin = false
        } else {
            const admin = await getAdminSession()
            if (!admin) {
                return { success: false, error: 'يجب تسجيل الدخول أولاً', count: 0 }
            }
            currentUserId = admin.id
            isAdmin = true
        }

        const whereClause = isAdmin
            ? {
                recipientUserId: currentUserId,
                isRead: false
            }
            : {
                employeeId: currentUserId,
                senderType: 'USER',
                isRead: false
            }

        const count = await prisma.chatMessage.count({
            where: whereClause
        })

        return { success: true, count }
    } catch (error) {
        console.error('❌ Error counting unread messages:', error)
        return { success: false, error: 'فشل حساب الرسائل', count: 0 }
    }
}

/**
 * مسح سجل الدردشة (تحديث وقت آخر مسح فقط)
 */
export async function clearChatHistory(preferredRole?: 'ADMIN' | 'EMPLOYEE', userInfo?: SenderInfo) {
    try {
        let currentUserId: string
        let isAdmin: boolean

        if (userInfo && preferredRole === 'EMPLOYEE') {
            currentUserId = userInfo.id
            isAdmin = false
        } else if (userInfo && preferredRole === 'ADMIN') {
            currentUserId = userInfo.id
            isAdmin = true
        } else if (preferredRole === 'EMPLOYEE') {
            const employee = await getCurrentEmployee()
            if (!employee) return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            currentUserId = employee.id
            isAdmin = false
        } else {
            const admin = await getAdminSession()
            if (!admin) return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            currentUserId = admin.id
            isAdmin = true
        }

        if (isAdmin) {
            // @ts-ignore
            await prisma.user.update({
                where: { id: currentUserId },
                data: { lastChatClear: new Date() }
            })
        } else {
            // @ts-ignore
            await prisma.employee.update({
                where: { id: currentUserId },
                data: { lastChatClear: new Date() }
            })
        }

        revalidatePath('/messages')
        return { success: true }
    } catch (error) {
        console.error('❌ Error clearing chat history:', error)
        return { success: false, error: 'فشل مسح السجل' }
    }
}

// New action to end a specific chat session (Admin only)
export async function endChatSession(employeeId: string) {
    try {
        console.log('🔄 Attempting to end chat for employee:', employeeId)

        const admin = await getAdminSession()
        if (!admin) {
            console.error('❌ Unauthorized attempt to end chat')
            return { success: false, error: 'Unauthorized' }
        }

        console.log('✅ Admin authorized:', admin.name)

        // @ts-ignore - Field might not exist in client types yet
        await prisma.employee.update({
            where: { id: employeeId },
            data: { lastChatClear: new Date() }
        })

        console.log('✅ Chat session ended successfully for:', employeeId)

        revalidatePath('/messages')
        return { success: true }
    } catch (error) {
        console.error('❌ Error ending chat session:', error)
        return { success: false, error: 'فشل إنهاء المحادثة' }
    }
}
