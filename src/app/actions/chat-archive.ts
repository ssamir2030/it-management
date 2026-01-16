"use server"

import { getSession } from "@/lib/simple-auth"
import prisma from "@/lib/prisma"
import { hasPermission } from "@/lib/rbac"

export async function getConversations() {
    const session = await getSession('ADMIN')

    if (!session?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // 1. Get Employees with ChatMessages
        const chatEmployees = await prisma.employee.findMany({
            where: { messages: { some: {} } },
            include: {
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                department: { select: { name: true } }
            }
        })

        // 2. Get Users with ChatMessages
        const chatUsers = await prisma.user.findMany({
            where: {
                OR: [
                    { sentMessages: { some: {} } },
                    { receivedMessages: { some: {} } }
                ]
            },
            include: {
                sentMessages: { orderBy: { createdAt: 'desc' }, take: 1 },
                receivedMessages: { orderBy: { createdAt: 'desc' }, take: 1 }
            }
        })

        // 3. Get Users with Tickets
        const ticketUsers = await prisma.user.findMany({
            where: { ticketsCreated: { some: {} } },
            include: {
                ticketsCreated: {
                    include: {
                        messages: { orderBy: { createdAt: 'desc' }, take: 1 }
                    },
                    orderBy: { updatedAt: 'desc' },
                    take: 1
                }
            }
        })

        const conversationsMap = new Map<string, any>()

        // Process Employees
        for (const emp of chatEmployees) {
            conversationsMap.set(emp.id, {
                id: emp.id,
                type: 'EMPLOYEE',
                name: emp.name,
                email: emp.email,
                jobTitle: emp.jobTitle,
                department: emp.department,
                lastMessage: emp.messages[0],
                updatedAt: emp.messages[0]?.createdAt || new Date(0)
            })
        }

        // Process Chat Users
        for (const user of chatUsers) {
            const lastSent = user.sentMessages[0]
            const lastReceived = user.receivedMessages[0]
            const lastMsg = (!lastSent || (lastReceived && lastReceived.createdAt > lastSent.createdAt))
                ? lastReceived
                : lastSent

            if (!conversationsMap.has(user.id)) {
                conversationsMap.set(user.id, {
                    id: user.id,
                    type: 'USER',
                    name: user.name,
                    email: user.email,
                    jobTitle: 'مستخدم',
                    department: null,
                    lastMessage: lastMsg,
                    updatedAt: lastMsg?.createdAt || new Date(0)
                })
            }
        }

        // Process Ticket Users (Merge if exists)
        for (const user of ticketUsers) {
            const lastTicket = user.ticketsCreated[0]
            const lastMsg = lastTicket?.messages[0]
            // Use ticket updated date or message date
            const ticketDate = lastMsg?.createdAt || lastTicket?.updatedAt || new Date(0)

            const existing = conversationsMap.get(user.id)
            if (existing) {
                if (ticketDate > existing.updatedAt) {
                    existing.updatedAt = ticketDate
                    existing.lastMessage = lastMsg ? { ...lastMsg, content: `[تذكرة] ${lastMsg.content}` } : { content: `[تذكرة] ${lastTicket?.title}`, createdAt: ticketDate }
                }
            } else {
                conversationsMap.set(user.id, {
                    id: user.id,
                    type: 'USER',
                    name: user.name,
                    email: user.email,
                    jobTitle: 'مستخدم',
                    department: null,
                    lastMessage: lastMsg || { content: `[تذكرة] ${lastTicket?.title}`, createdAt: ticketDate },
                    updatedAt: ticketDate
                })
            }
        }

        const conversations = Array.from(conversationsMap.values())
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
            .map(c => ({
                id: c.id,
                name: c.name,
                email: c.email,
                jobTitle: c.jobTitle,
                department: c.department,
                _count: { messages: 1 }, // Simplified count
                messages: c.lastMessage ? [c.lastMessage] : []
            }))

        return { success: true, data: conversations }
    } catch (error) {
        console.error("Get conversations error:", error)
        return { success: false, error: "Failed to fetch conversations" }
    }
}

export async function getMessages(id: string) {
    const session = await getSession('ADMIN')

    if (!session?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // 1. Fetch Chat Messages (as Employee OR User)
        const chatMessages = await prisma.chatMessage.findMany({
            where: {
                OR: [
                    { employeeId: id },
                    { userId: id },
                    { recipientUserId: id }
                ]
            },
            include: {
                user: { select: { name: true, email: true, image: true, role: true } },
                employee: { select: { name: true, email: true } }
            },
            orderBy: { createdAt: 'asc' }
        })

        // 2. Fetch Ticket Messages (if it's a User)
        // Check if ID is a user ID
        const user = await prisma.user.findUnique({ where: { id } })
        let ticketMessages: any[] = []

        if (user) {
            const tickets = await prisma.ticket.findMany({
                where: { createdById: id },
                include: {
                    messages: {
                        include: {
                            sender: { select: { name: true, email: true, image: true, role: true } },
                            attachments: true
                        },
                        orderBy: { createdAt: 'asc' }
                    }
                }
            })

            ticketMessages = tickets.flatMap(ticket =>
                ticket.messages.map(msg => ({
                    id: msg.id,
                    content: `[تذكرة: ${ticket.title}] ${msg.content}`,
                    senderType: msg.sender.role === 'ADMIN' || msg.sender.role === 'TECHNICIAN' ? 'EMPLOYEE' : 'USER',
                    createdAt: msg.createdAt,
                    user: msg.sender,
                    employee: null, // Ticket messages are usually from Users or Admins (User table)
                    isRead: true,
                    attachments: msg.attachments,
                    isTicket: true
                }))
            )
        }

        // Merge and Sort
        const allMessages = [
            ...chatMessages.map(msg => ({
                id: msg.id,
                content: msg.content,
                senderType: msg.senderType,
                createdAt: msg.createdAt,
                user: msg.user,
                employee: msg.employee,
                isRead: msg.isRead,
                attachmentUrl: msg.attachmentUrl,
                isTicket: false
            })),
            ...ticketMessages
        ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

        return { success: true, data: allMessages }
    } catch (error) {
        console.error("Get messages error:", error)
        return { success: false, error: "Failed to fetch messages" }
    }
}

export async function getChatStats() {
    const session = await getSession('ADMIN')

    if (!session?.id || session.role !== 'ADMIN') {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const [totalMessages, totalConversations, messagesToday] = await Promise.all([
            // Total messages
            prisma.chatMessage.count(),

            // Total unique conversations (employees with messages)
            prisma.employee.count({
                where: {
                    messages: {
                        some: {}
                    }
                }
            }),

            // Messages today
            prisma.chatMessage.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            })
        ])

        // Get top employees manually (SQLite doesn't support orderBy _count)
        const employeesWithMessages = await prisma.employee.findMany({
            where: {
                messages: {
                    some: {}
                }
            },
            include: {
                messages: true
            }
        })

        const topEmployees = employeesWithMessages
            .map(emp => ({
                id: emp.id,
                name: emp.name,
                _count: {
                    messages: emp.messages.length
                }
            }))
            .sort((a, b) => b._count.messages - a._count.messages)
            .slice(0, 5)

        return {
            success: true,
            data: {
                totalMessages,
                totalConversations,
                messagesToday,
                topEmployees
            }
        }
    } catch (error) {
        console.error("Get chat stats error:", error)
        return { success: false, error: "Failed to fetch stats" }
    }
}

export async function searchConversations(query: string) {
    const session = await getSession('ADMIN')

    if (!session?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const employees = await prisma.employee.findMany({
            where: {
                AND: [
                    {
                        messages: {
                            some: {}
                        }
                    },
                    {
                        OR: [
                            {
                                name: {
                                    contains: query
                                }
                            },
                            {
                                email: {
                                    contains: query
                                }
                            }
                        ]
                    }
                ]
            },
            include: {
                messages: true
            }
        })

        const conversations = employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
            jobTitle: emp.jobTitle,
            _count: {
                messages: emp.messages.length
            }
        }))

        return { success: true, data: conversations }
    } catch (error) {
        console.error("Search conversations error:", error)
        return { success: false, error: "Failed to search" }
    }
}
