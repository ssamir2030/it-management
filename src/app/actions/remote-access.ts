"use server"

import prisma from "@/lib/prisma"
import { dwServiceClient } from "@/lib/dwservice"
import { revalidatePath } from "next/cache"

// تسجيل جهاز جديد في DWService
export async function registerRemoteAgent(assetId: string) {
    try {
        const asset = await prisma.asset.findUnique({
            where: { id: assetId },
            include: { employee: true }
        })

        if (!asset) {
            return { success: false, error: "الجهاز غير موجود" }
        }

        // التحقق من عدم وجود تسجيل مسبق
        const existing = await prisma.remoteAgent.findUnique({
            where: { assetId }
        })

        if (existing) {
            return { success: false, error: "الجهاز مسجل بالفعل" }
        }

        // إنشاء Agent في DWService
        const employeeName = asset.employee?.name || 'غير محدد'
        const dwAgent = await dwServiceClient.createAgent(
            `${asset.name} - ${asset.tag}`,
            `${asset.type} | ${employeeName} | ${asset.manufacturer || ''}`
        )

        // حفظ في قاعدة البيانات
        const remoteAgent = await prisma.remoteAgent.create({
            data: {
                assetId,
                dwAgentId: dwAgent.id,
                installCode: dwAgent.install_code,
                state: dwAgent.state,
                osType: dwAgent.os_type,
                supportedApps: dwAgent.supported_apps.join(',')
            }
        })

        revalidatePath(`/assets/${assetId}`)
        return {
            success: true,
            data: {
                installCode: remoteAgent.installCode,
                agentId: remoteAgent.id,
                dwAgentId: dwAgent.id
            }
        }
    } catch (error: any) {
        console.error("Error registering remote agent:", error)
        return { success: false, error: error.message || "فشل تسجيل الجهاز للوصول عن بعد" }
    }
}

// إنشاء جلسة وصول عن بعد
export async function createRemoteSession(
    assetId: string,
    purpose?: string,
    startedBy?: string
) {
    try {
        const remoteAgent = await prisma.remoteAgent.findUnique({
            where: { assetId },
            include: { asset: true }
        })

        if (!remoteAgent) {
            return { success: false, error: "الجهاز غير مسجل في نظام الوصول عن بعد" }
        }

        if (remoteAgent.state !== 'online') {
            return {
                success: false,
                error: `الجهاز غير متصل. الحالة الحالية: ${remoteAgent.state}`
            }
        }

        // إنشاء Session في DWService
        const dwSession = await dwServiceClient.createSession(
            remoteAgent.dwAgentId,
            'screen'
        )

        // حفظ الجلسة
        const session = await prisma.remoteSession.create({
            data: {
                agentId: remoteAgent.id,
                dwSessionId: dwSession.id,
                sessionUrl: dwSession.url,
                purpose: purpose || `دعم فني لـ ${remoteAgent.asset.name}`,
                startedBy,
                status: 'ACTIVE'
            }
        })

        revalidatePath(`/assets/${assetId}`)
        revalidatePath('/remote-access')

        return {
            success: true,
            data: {
                sessionId: session.id,
                url: session.sessionUrl
            }
        }
    } catch (error) {
        console.error("Error creating remote session:", error)
        return { success: false, error: "فشل إنشاء جلسة الوصول عن بعد" }
    }
}

// إنهاء جلسة
export async function endRemoteSession(sessionId: string) {
    try {
        const session = await prisma.remoteSession.findUnique({
            where: { id: sessionId }
        })

        if (!session) {
            return { success: false, error: "الجلسة غير موجودة" }
        }

        if (session.status === 'CLOSED') {
            return { success: false, error: "الجلسة منتهية بالفعل" }
        }

        // إنهاء في DWService
        await dwServiceClient.destroySession(session.dwSessionId)

        // تحديث في قاعدة البيانات
        const endTime = new Date()
        const duration = Math.floor(
            (endTime.getTime() - session.startTime.getTime()) / 60000
        )

        await prisma.remoteSession.update({
            where: { id: sessionId },
            data: {
                status: 'CLOSED',
                endTime,
                duration
            }
        })

        revalidatePath('/remote-access')
        return { success: true }
    } catch (error) {
        console.error("Error ending remote session:", error)
        return { success: false, error: "فشل إنهاء الجلسة" }
    }
}

// تحديث حالة Agent
export async function syncAgentStatus(agentId: string) {
    try {
        const remoteAgent = await prisma.remoteAgent.findUnique({
            where: { id: agentId }
        })

        if (!remoteAgent) {
            return { success: false, error: "Agent غير موجود" }
        }

        // جلب الحالة من DWService
        const dwAgent = await dwServiceClient.getAgent(remoteAgent.dwAgentId)

        // تحديث في قاعدة البيانات
        const updated = await prisma.remoteAgent.update({
            where: { id: agentId },
            data: {
                state: dwAgent.state,
                lastOnline: dwAgent.state === 'online' ? new Date() : remoteAgent.lastOnline
            }
        })

        revalidatePath('/remote-access')
        return { success: true, data: { state: updated.state } }
    } catch (error) {
        console.error("Error syncing agent status:", error)
        return { success: false, error: "فشل تحديث حالة الجهاز" }
    }
}

// جلب جميع الأجهزة التي لها إمكانية وصول عن بعد (DWService, IP, AnyDesk)
export async function getRemoteAgents() {
    try {
        // 1. Fetch DWService Agents
        const agents = await prisma.remoteAgent.findMany({
            include: {
                asset: {
                    include: {
                        employee: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // 2. Fetch Assets with IP or AnyDesk ID (that might not have DWService)
        const otherAssets = await prisma.asset.findMany({
            where: {
                OR: [
                    { ipAddress: { not: null } },
                    { ipAddress: { not: "" } },
                    { anydeskId: { not: null } },
                    { anydeskId: { not: "" } },
                    { dwServiceId: { not: null } },
                    { dwServiceId: { not: "" } }
                ],
                // Exclude assets that are already in the agents list to avoid duplicates
                remoteAgent: {
                    is: null
                }
            },
            include: {
                employee: true,
                remoteAgent: true
            }
        })

        return {
            success: true,
            data: {
                registeredAgents: agents,
                otherConnectableAssets: otherAssets
            }
        }
    } catch (error) {
        console.error("Error fetching remote agents:", error)
        return { success: false, error: "فشل جلب الأجهزة" }
    }
}

// جلب الجلسات النشطة
export async function getActiveSessions() {
    try {
        const sessions = await prisma.remoteSession.findMany({
            where: {
                status: 'ACTIVE'
            },
            include: {
                agent: {
                    include: {
                        asset: {
                            include: {
                                employee: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                startTime: 'desc'
            }
        })

        return { success: true, data: sessions }
    } catch (error) {
        console.error("Error fetching active sessions:", error)
        return { success: false, error: "فشل جلب الجلسات" }
    }
}

// جلب سجل الجلسات
export async function getSessionHistory(limit: number = 50) {
    try {
        const sessions = await prisma.remoteSession.findMany({
            include: {
                agent: {
                    include: {
                        asset: {
                            include: {
                                employee: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                startTime: 'desc'
            },
            take: limit
        })

        return { success: true, data: sessions }
    } catch (error) {
        console.error("Error fetching session history:", error)
        return { success: false, error: "فشل جلب سجل الجلسات" }
    }
}

// حذف تسجيل وصول عن بعد
export async function unregisterRemoteAgent(agentId: string) {
    try {
        const remoteAgent = await prisma.remoteAgent.findUnique({
            where: { id: agentId }
        })

        if (!remoteAgent) {
            return { success: false, error: "Agent غير موجود" }
        }

        // حذف من DWService
        await dwServiceClient.deleteAgent(remoteAgent.dwAgentId)

        // حذف من قاعدة البيانات (سيحذف الجلسات تلقائياً بسبب Cascade)
        await prisma.remoteAgent.delete({
            where: { id: agentId }
        })

        revalidatePath('/remote-access')
        return { success: true }
    } catch (error) {
        console.error("Error unregistering remote agent:", error)
        return { success: false, error: "فشل إلغاء تسجيل الجهاز" }
    }
}
