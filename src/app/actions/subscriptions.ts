"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getSubscriptions() {
    try {
        const subscriptions = await prisma.subscription.findMany({
            orderBy: {
                renewalDate: 'asc'
            }
        })
        return { success: true, data: subscriptions }
    } catch (error) {
        console.error("Error fetching subscriptions:", error)
        return { success: false, error: "فشل جلب الاشتراكات" }
    }
}

export async function getSubscription(id: string) {
    try {
        const subscription = await prisma.subscription.findUnique({
            where: { id }
        })
        return { success: true, data: subscription }
    } catch (error) {
        console.error("Error fetching subscription:", error)
        return { success: false, error: "فشل جلب الاشتراك" }
    }
}

export async function createSubscription(data: any) {
    try {
        const subscription = await prisma.subscription.create({
            data: {
                name: data.name,
                provider: data.provider,
                category: data.category,
                startDate: new Date(data.startDate),
                renewalDate: new Date(data.renewalDate),
                cost: parseFloat(data.cost),
                billingCycle: data.billingCycle,
                email: data.email,
                managementUrl: data.managementUrl,
                userLimit: data.userLimit ? parseInt(data.userLimit) : null,
                currentUsers: data.currentUsers ? parseInt(data.currentUsers) : 0,
                status: data.status || "ACTIVE",
                autoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
                alertDays: data.alertDays ? parseInt(data.alertDays) : 30,
                notes: data.notes
            }
        })

        revalidatePath("/subscriptions")
        return { success: true, data: subscription }
    } catch (error) {
        console.error("Error creating subscription:", error)
        return { success: false, error: "فشل إنشاء الاشتراك" }
    }
}

export async function updateSubscription(id: string, data: any) {
    try {
        const subscription = await prisma.subscription.update({
            where: { id },
            data: {
                name: data.name,
                provider: data.provider,
                category: data.category,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                renewalDate: data.renewalDate ? new Date(data.renewalDate) : undefined,
                cost: data.cost ? parseFloat(data.cost) : undefined,
                billingCycle: data.billingCycle,
                email: data.email,
                managementUrl: data.managementUrl,
                userLimit: data.userLimit ? parseInt(data.userLimit) : null,
                currentUsers: data.currentUsers !== undefined ? parseInt(data.currentUsers) : undefined,
                status: data.status,
                autoRenew: data.autoRenew,
                alertDays: data.alertDays ? parseInt(data.alertDays) : undefined,
                notes: data.notes
            }
        })

        revalidatePath("/subscriptions")
        revalidatePath(`/subscriptions/${id}`)
        return { success: true, data: subscription }
    } catch (error) {
        console.error("Error updating subscription:", error)
        return { success: false, error: "فشل تحديث الاشتراك" }
    }
}

export async function deleteSubscription(id: string) {
    try {
        await prisma.subscription.delete({
            where: { id }
        })

        revalidatePath("/subscriptions")
        return { success: true }
    } catch (error) {
        console.error("Error deleting subscription:", error)
        return { success: false, error: "فشل حذف الاشتراك" }
    }
}

export async function getExpiringSubscriptions(days: number = 30) {
    try {
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + days)

        const subscriptions = await prisma.subscription.findMany({
            where: {
                renewalDate: {
                    lte: targetDate
                },
                status: {
                    in: ["ACTIVE", "EXPIRING_SOON"]
                }
            },
            orderBy: {
                renewalDate: 'asc'
            }
        })

        return { success: true, data: subscriptions }
    } catch (error) {
        console.error("Error fetching expiring subscriptions:", error)
        return { success: false, error: "فشل جلب الاشتراكات المنتهية" }
    }
}

export async function getSubscriptionStats() {
    try {
        const [total, active, expiringSoon, monthly, yearly] = await Promise.all([
            prisma.subscription.count(),
            prisma.subscription.count({ where: { status: "ACTIVE" } }),
            prisma.subscription.count({ where: { status: "EXPIRING_SOON" } }),
            prisma.subscription.count({ where: { billingCycle: "MONTHLY" } }),
            prisma.subscription.count({ where: { billingCycle: "YEARLY" } })
        ])

        // Calculate total monthly cost
        const activeSubscriptions = await prisma.subscription.findMany({
            where: { status: "ACTIVE" }
        })

        const monthlyCost = activeSubscriptions.reduce((sum, sub) => {
            const cost = sub.billingCycle === "MONTHLY" ? sub.cost : sub.cost / 12
            return sum + cost
        }, 0)

        const yearlyCost = monthlyCost * 12

        return {
            success: true,
            data: {
                total,
                active,
                expiringSoon,
                monthly,
                yearly,
                monthlyCost: monthlyCost.toFixed(2),
                yearlyCost: yearlyCost.toFixed(2)
            }
        }
    } catch (error) {
        console.error("Error fetching subscription stats:", error)
        return { success: false, error: "فشل جلب الإحصائيات" }
    }
}
