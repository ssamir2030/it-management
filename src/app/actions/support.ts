'use server'

import { getSession } from '@/lib/simple-auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { logAction } from '@/lib/audit'
import { createTicketSLA } from '@/app/actions/sla'

// ==================== CREATE TICKET ====================
export async function createTicket(data: {
    title: string
    description: string
    category: string
    priority: string
    contactPhone?: string
}) {
    try {
        // Check if employee is logged in via portal
        const employeeId = cookies().get('employee_portal_session')?.value

        let createdByUserId: string
        let createdByUser: any

        if (employeeId) {
            // Employee creating ticket - find or create corresponding User
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    identityNumber: true
                }
            })

            if (!employee) {
                return { success: false, error: 'موظف غير موجود' }
            }

            // Find or create User for this employee
            let user = await prisma.user.findUnique({
                where: { email: employee.email }
            })

            if (!user) {
                // Create User from Employee data
                user = await prisma.user.create({
                    data: {
                        email: employee.email,
                        name: employee.name,
                        role: 'USER',
                        emailVerified: new Date()
                    }
                })
            }

            createdByUserId = user.id
            createdByUser = user
        } else {
            // Admin/Technician creating ticket via normal auth
            const session = await getSession()
            if (!session?.id) {
                return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            }
            createdByUserId = session.id as string
        }

        const ticket = await prisma.ticket.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority,
                contactPhone: data.contactPhone,
                createdById: createdByUserId,
                status: 'OPEN'
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        })

        // Initialize SLA for the new ticket
        await createTicketSLA(ticket.id)

        await logAction({
            action: 'CREATE',
            entityType: 'TICKET',
            entityId: ticket.id,
            entityName: data.title,
            changes: { category: data.category, priority: data.priority, status: 'OPEN' }
        })

        revalidatePath('/portal/support')
        revalidatePath('/support')

        return { success: true, data: ticket }
    } catch (error) {
        console.error('Error creating ticket:', error)
        return { success: false, error: 'فشل في إنشاء التذكرة' }
    }
}

// ==================== GET ALL TICKETS (للإدارة/الفنيين) ====================
export async function getTickets(filters?: {
    status?: string
    priority?: string
    category?: string
    assignedToId?: string
}) {
    try {
        const session = await getSession('ADMIN')
        if (!session?.id) {
            return { success: false, error: 'يجب تسجيل الدخول أولاً' }
        }

        // التحقق من أن المستخدم إدارة أو فني
        const user = await prisma.user.findUnique({
            where: { id: session.id as string },
            select: { role: true }
        })

        if (user?.role !== 'ADMIN' && user?.role !== 'TECHNICIAN') {
            return { success: false, error: 'غير مصرح لك بعرض جميع التذاكر' }
        }

        // 1. Fetch Real Tickets
        const where: any = {}
        if (filters?.status) where.status = filters.status
        if (filters?.priority) where.priority = filters.priority
        if (filters?.category) where.category = filters.category
        if (filters?.assignedToId) where.assignedToId = filters.assignedToId

        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        content: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // 2. Fetch Chat Conversations (Virtual Tickets) - Only if no specific filters that exclude chats (like category)
        let chatTickets: any[] = []
        if (!filters?.category && !filters?.priority && !filters?.assignedToId && (!filters?.status || filters.status === 'OPEN')) {

            // Get Admin's lastChatClear to filter out old chats
            let lastChatClear: Date | null = null
            try {
                // @ts-ignore
                const adminUser = await prisma.user.findUnique({ where: { id: session.id }, select: { lastChatClear: true } })
                // @ts-ignore
                lastChatClear = adminUser?.lastChatClear || null
            } catch (e) { }

            const employeesWithChats = await prisma.employee.findMany({
                where: {
                    messages: {
                        some: lastChatClear ? { createdAt: { gt: lastChatClear } } : {}
                    }
                },
                include: {
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            })

            chatTickets = employeesWithChats.map(emp => {
                const lastMsg = emp.messages[0]

                // 1. Filter by Admin's Global Clear
                if (lastChatClear && lastMsg && new Date(lastMsg.createdAt) <= lastChatClear) {
                    return null
                }

                // 2. Filter by Employee's Specific Session Clear
                // @ts-ignore
                const empClearTime = emp.lastChatClear ? new Date(emp.lastChatClear) : null
                if (empClearTime && lastMsg && new Date(lastMsg.createdAt) <= empClearTime) {
                    return null
                }

                return {
                    id: `chat_${emp.id}`, // Virtual ID
                    title: `محادثة فورية - ${emp.name}`,
                    description: 'محادثة من نظام الدردشة المباشرة',
                    category: 'CHAT',
                    status: 'OPEN', // Treats all active chats as OPEN
                    priority: 'MEDIUM',
                    createdAt: lastMsg?.createdAt || new Date(),
                    updatedAt: lastMsg?.createdAt || new Date(),
                    createdBy: {
                        id: emp.id,
                        name: emp.name,
                        email: emp.email,
                        image: null,
                        role: 'EMPLOYEE'
                    },
                    messages: lastMsg ? [{
                        content: lastMsg.content,
                        createdAt: lastMsg.createdAt
                    }] : [],
                    _count: {
                        messages: 1 // Just indicator
                    },
                    isVirtual: true
                }
            }).filter(Boolean)
        }

        // 3. Merge and Sort
        const allTickets = [...tickets, ...chatTickets].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        return { success: true, data: allTickets }
    } catch (error) {
        console.error('Error fetching tickets:', error)
        return { success: false, error: 'فشل في تحميل التذاكر' }
    }
}

// ==================== GET MY TICKETS (للموظفين) ====================
export async function getMyTickets() {
    try {
        // Check if employee is logged in via portal
        const employeeId = cookies().get('employee_portal_session')?.value

        let currentUserId: string

        if (employeeId) {
            // Employee viewing their tickets
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: { email: true }
            })

            if (!employee) {
                return { success: false, error: 'موظف غير موجود' }
            }

            const user = await prisma.user.findUnique({
                where: { email: employee.email }
            })

            if (!user) {
                return { success: true, data: [] } // No user account yet, no tickets
            }

            currentUserId = user.id
        } else {
            // Regular user viewing their tickets
            const session = await getSession()
            if (!session?.id) {
                return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            }
            currentUserId = session.id as string
        }

        const tickets = await prisma.ticket.findMany({
            where: {
                createdById: currentUserId
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        content: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        messages: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return { success: true, data: tickets }
    } catch (error) {
        console.error('Error fetching my tickets:', error)
        return { success: false, error: 'فشل في تحميل تذاكرك' }
    }
}

// ==================== GET TICKET BY ID ====================
export async function getTicketById(ticketId: string) {
    try {
        // ... Auth Logic (Keep existing) ...
        // Check if employee is logged in via portal
        const employeeId = cookies().get('employee_portal_session')?.value
        let currentUserId: string
        let userRole = 'USER' // Default

        if (employeeId) {
            // Employee viewing ticket
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: { email: true }
            })
            if (!employee) return { success: false, error: 'موظف غير موجود' }
            const user = await prisma.user.findUnique({ where: { email: employee.email } })
            if (!user) return { success: false, error: 'حساب المستخدم غير موجود' }
            currentUserId = user.id
        } else {
            // Admin/Technician
            const session = await getSession()
            if (!session?.id) return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            currentUserId = session.id as string
            // Get Role
            const user = await prisma.user.findUnique({
                where: { id: session.id as string },
                select: { role: true }
            })
            if (user) userRole = user.role
        }

        // === HANDLE VIRTUAL CHAT TICKET ===
        if (ticketId.startsWith('chat_')) {
            const targetEmployeeId = ticketId.replace('chat_', '')

            // Fetch Employee & Messages
            const employee = await prisma.employee.findUnique({
                where: { id: targetEmployeeId },
                include: {
                    messages: {
                        include: {
                            user: { select: { id: true, name: true, image: true, role: true } },
                            employee: { select: { id: true, name: true } }
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            })

            if (!employee) return { success: false, error: 'الموظف غير موجود' }

            // Filter messages based on lastChatClear
            let messages = employee.messages
            // @ts-ignore
            if (employee.lastChatClear) {
                // @ts-ignore
                const clearDate = new Date(employee.lastChatClear)
                messages = messages.filter(msg => new Date(msg.createdAt) > clearDate)
            }

            // Construct Virtual Ticket
            const virtualTicket = {
                id: ticketId,
                title: `محادثة فورية - ${employee.name}`,
                description: 'سجل المحادثة الفورية',
                category: 'CHAT',
                priority: 'MEDIUM',
                status: 'OPEN',
                createdById: employee.id, // Using Employee ID effectively
                createdBy: {
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                    role: 'EMPLOYEE',
                    image: null
                },
                assignedTo: null,
                createdAt: messages.length > 0 ? messages[0].createdAt : new Date(),
                messages: messages.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    createdAt: msg.createdAt,
                    sender: {
                        id: msg.senderType === 'USER' ? msg.user?.id : msg.employee?.id,
                        name: msg.senderType === 'USER' ? msg.user?.name : msg.employee?.name,
                        role: msg.senderType === 'USER' ? (msg.user?.role || 'ADMIN') : 'EMPLOYEE',
                        image: msg.senderType === 'USER' ? msg.user?.image : null
                    },
                    attachments: msg.attachmentUrl ? [{
                        id: 'att_' + msg.id,
                        fileName: 'مرفق',
                        fileUrl: msg.attachmentUrl,
                        fileType: 'image'
                    }] : []
                }))
            }

            return { success: true, data: virtualTicket }
        }

        // === HANDLE REGULAR TICKET ===
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                                role: true
                            }
                        },
                        attachments: true
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        })

        if (!ticket) {
            return { success: false, error: 'التذكرة غير موجودة' }
        }

        // Verify Permissions
        const isAdmin = userRole === 'ADMIN' || userRole === 'TECHNICIAN'
        const isOwner = ticket.createdById === currentUserId

        if (!isAdmin && !isOwner) {
            return { success: false, error: 'غير مصرح لك بعرض هذه التذكرة' }
        }

        return { success: true, data: ticket }

    } catch (error) {
        console.error('Error fetching ticket:', error)
        return { success: false, error: 'فشل في تحميل التذكرة' }
    }
}

// ==================== ADD MESSAGE ====================
export async function addMessage(ticketId: string, content: string, attachments: any[] = []) {
    try {
        // ... Auth Logic (Keep existing) ...
        const employeeId = cookies().get('employee_portal_session')?.value
        let senderUserId: string

        if (employeeId) {
            const employee = await prisma.employee.findUnique({ where: { id: employeeId }, select: { email: true } })
            if (!employee) return { success: false, error: 'موظف غير موجود' }
            const user = await prisma.user.findUnique({ where: { email: employee.email } })
            if (!user) return { success: false, error: 'حساب المستخدم غير موجود' }
            senderUserId = user.id
        } else {
            const session = await getSession()
            if (!session?.id) return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            senderUserId = session.id as string
        }

        // === HANDLE VIRTUAL CHAT REPLY ===
        if (ticketId.startsWith('chat_')) {
            const targetEmployeeId = ticketId.replace('chat_', '')

            // Create ChatMessage
            const attachmentUrl = attachments.length > 0 ? attachments[0].url : null

            const chatMessage = await prisma.chatMessage.create({
                data: {
                    content,
                    senderId: senderUserId,
                    senderType: 'USER', // Admin/Tech are Users
                    userId: senderUserId,
                    employeeId: targetEmployeeId,
                    attachmentUrl,
                    isRead: false
                },
                include: {
                    user: { select: { id: true, name: true, image: true, role: true } }
                }
            })

            // Construct Response matching TicketMessage structure
            return {
                success: true,
                data: {
                    id: chatMessage.id,
                    content: chatMessage.content,
                    createdAt: chatMessage.createdAt,
                    sender: chatMessage.user,
                    attachments: chatMessage.attachmentUrl ? [{
                        id: 'att_' + chatMessage.id,
                        fileUrl: chatMessage.attachmentUrl,
                        fileName: 'مرفق'
                    }] : []
                }
            }
        }

        // === HANDLE REGULAR TICKET MESSAGE ===
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            select: {
                id: true,
                createdById: true,
                status: true
            }
        })

        if (!ticket) {
            return { success: false, error: 'التذكرة غير موجودة' }
        }

        const user = await prisma.user.findUnique({
            where: { id: senderUserId },
            select: { role: true }
        })

        const isAdmin = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN'
        const isOwner = ticket.createdById === senderUserId

        if (!isAdmin && !isOwner) {
            return { success: false, error: 'غير مصرح لك بالرد على هذه التذكرة' }
        }

        const message = await prisma.ticketMessage.create({
            data: {
                content,
                ticketId,
                senderId: senderUserId,
                attachments: {
                    create: attachments.map(att => ({
                        fileName: att.name,
                        fileUrl: att.url,
                        fileSize: att.size,
                        fileType: att.type
                    }))
                }
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true
                    }
                },
                attachments: true
            }
        })

        // تحديث وقت آخر تعديل للتذكرة
        await prisma.ticket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
        })

        revalidatePath(`/portal/support/${ticketId}`)
        revalidatePath(`/support/${ticketId}`)
        revalidatePath('/portal/support')
        revalidatePath('/support')

        return { success: true, data: message }
    } catch (error) {
        console.error('Error adding message:', error)
        return { success: false, error: 'فشل في إرسال الرسالة' }
    }
}

// ==================== UPDATE TICKET STATUS ====================
export async function updateTicketStatus(ticketId: string, status: string) {
    try {
        // Check if employee is logged in via portal
        const employeeId = cookies().get('employee_portal_session')?.value

        let currentUserId: string

        if (employeeId) {
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: { email: true }
            })

            if (!employee) {
                return { success: false, error: 'موظف غير موجود' }
            }

            const user = await prisma.user.findUnique({
                where: { email: employee.email }
            })

            if (!user) {
                return { success: false, error: 'حساب المستخدم غير موجود' }
            }

            currentUserId = user.id
        } else {
            const session = await getSession()
            if (!session?.id) {
                return { success: false, error: 'يجب تسجيل الدخول أولاً' }
            }
            currentUserId = session.id as string
        }

        // Get ticket to check ownership
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            select: { createdById: true }
        })

        if (!ticket) {
            return { success: false, error: 'التذكرة غير موجودة' }
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: { role: true }
        })

        const isAdmin = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN'
        const isOwner = ticket.createdById === currentUserId

        // Only admins can change to any status, owners can only close
        if (!isAdmin && (!isOwner || status !== 'CLOSED')) {
            return { success: false, error: 'غير مصرح لك بتحديث حالة التذكرة' }
        }

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticketId },
            data: { status }
        })

        revalidatePath(`/portal/support/${ticketId}`)
        revalidatePath(`/support/${ticketId}`)
        revalidatePath('/portal/support')
        revalidatePath('/support')

        return { success: true, data: updatedTicket }
    } catch (error) {
        console.error('Error updating ticket status:', error)
        return { success: false, error: 'فشل في تحديث حالة التذكرة' }
    }
}


// ==================== ASSIGN TICKET ====================
export async function assignTicket(ticketId: string, technicianId: string | null) {
    try {
        const session = await getSession('ADMIN')
        if (!session?.id) {
            return { success: false, error: 'يجب تسجيل الدخول أولاً' }
        }

        // التحقق من أن المستخدم إدارة
        const user = await prisma.user.findUnique({
            where: { id: session.id as string },
            select: { role: true }
        })

        if (user?.role !== 'ADMIN') {
            return { success: false, error: 'غير مصرح لك بتعيين التذاكر' }
        }

        const ticket = await prisma.ticket.update({
            where: { id: ticketId },
            data: {
                assignedToId: technicianId,
                status: technicianId ? 'IN_PROGRESS' : 'OPEN'
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        })

        revalidatePath(`/support/${ticketId}`)
        revalidatePath('/support')

        return { success: true, data: ticket }
    } catch (error) {
        console.error('Error assigning ticket:', error)
        return { success: false, error: 'فشل في تعيين التذكرة' }
    }
}

// ==================== GET TICKET STATS ====================
export async function getTicketStats() {
    try {
        const session = await getSession('ADMIN')
        if (!session?.id) {
            return { success: false, error: 'يجب تسجيل الدخول أولاً' }
        }

        const user = await prisma.user.findUnique({
            where: { id: session.id as string },
            select: { role: true }
        })

        if (user?.role !== 'ADMIN' && user?.role !== 'TECHNICIAN') {
            return { success: false, error: 'غير مصرح لك بعرض الإحصائيات' }
        }

        const [total, open, inProgress, resolved, closed] = await Promise.all([
            prisma.ticket.count(),
            prisma.ticket.count({ where: { status: 'OPEN' } }),
            prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.ticket.count({ where: { status: 'RESOLVED' } }),
            prisma.ticket.count({ where: { status: 'CLOSED' } })
        ])

        return {
            success: true,
            data: {
                total,
                open,
                inProgress,
                resolved,
                closed
            }
        }
    } catch (error) {
        console.error('Error fetching ticket stats:', error)
        return { success: false, error: 'فشل في تحميل الإحصائيات' }
    }
}

// ==================== DELETE TICKET ====================
export async function deleteTicket(ticketId: string) {
    try {
        const session = await getSession('ADMIN')
        if (!session?.id) {
            return { success: false, error: 'يجب تسجيل الدخول أولاً' }
        }

        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            select: { createdById: true }
        })

        if (!ticket) {
            return { success: false, error: 'التذكرة غير موجودة' }
        }

        const user = await prisma.user.findUnique({
            where: { id: session.id as string },
            select: { role: true }
        })

        const isAdmin = user?.role === 'ADMIN'
        const isOwner = ticket.createdById === session.id

        if (!isAdmin && !isOwner) {
            return { success: false, error: 'غير مصرح لك بحذف هذه التذكرة' }
        }

        await prisma.ticket.delete({
            where: { id: ticketId }
        })

        revalidatePath('/portal/support')
        revalidatePath('/support')

        return { success: true }
    } catch (error) {
        console.error('Error deleting ticket:', error)
        return { success: false, error: 'فشل في حذف التذكرة' }
    }
}

// ==================== GET TECHNICIANS ====================
export async function getTechnicians() {
    try {
        const session = await getSession('ADMIN')
        if (!session?.id) {
            return { success: false, error: 'يجب تسجيل الدخول أولاً' }
        }

        const technicians = await prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'TECHNICIAN']
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true
            }
        })

        return { success: true, data: technicians }
    } catch (error) {
        console.error('Error fetching technicians:', error)
        return { success: false, error: 'فشل في تحميل قائمة الفنيين' }
    }
}
