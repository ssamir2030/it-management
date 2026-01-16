'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- Plan Year Actions ---

export async function getOperationalPlan(year: number) {
    try {
        const plan = await prisma.operationalPlanYear.findUnique({
            where: { year },
            include: {
                activities: {
                    orderBy: { createdAt: 'desc' },
                    include: { items: true }
                }
            }
        })
        return { success: true, data: plan }
    } catch (error) {
        console.error("Failed to get operational plan:", error)
        return { success: false, error: "فشل تحميل الخطة التشغيلية" }
    }
}

export async function createOperationalPlan(year: number, title: string) {
    try {
        const plan = await prisma.operationalPlanYear.create({
            data: {
                year,
                title,
                status: 'ACTIVE'
            }
        })
        revalidatePath("/admin/operational-plan")
        return { success: true, data: plan }
    } catch (error) {
        console.error("Failed to create plan:", error)
        return { success: false, error: "فشل إنشاء الخطة (قد تكون السنة موجودة مسبقاً)" }
    }
}

export async function getAllPlanYears() {
    try {
        const plans = await prisma.operationalPlanYear.findMany({
            select: { id: true, year: true, title: true, status: true },
            orderBy: { year: 'desc' }
        })
        return { success: true, data: plans }
    } catch (error) {
        console.error("Failed to fetch plans:", error)
        return { success: false, error: "فشل تحميل قائمة الخطط" }
    }
}

export async function closePlanYear(id: string) {
    try {
        await prisma.operationalPlanYear.update({
            where: { id },
            data: {
                status: 'CLOSED',
                closedAt: new Date()
            }
        })
        revalidatePath("/admin/operational-plan")
        return { success: true }
    } catch (error) {
        console.error("Failed to close plan:", error)
        return { success: false, error: "فشل إغلاق الخطة" }
    }
}

// --- Activity Actions ---

// --- Activity Actions ---

export async function addActivity(planId: string, data: any) {
    try {
        const items = data.items || []

        // Total Project Budget/Spent
        const totalBudget = parseFloat(data.budget) || 0
        const totalSpent = parseFloat(data.spent) || 0

        // Sum of Activities (Items)
        const itemsTotal = items.reduce((sum: number, i: any) => sum + (parseFloat(i.amount) || 0), 0)

        // Validation: 
        if (totalSpent > totalBudget) {
            return { success: false, error: "المصروف يتجاوز ميزانية المشروع" }
        }
        if (itemsTotal > totalBudget) {
            return { success: false, error: `إجمالي مبالغ الأنشطة (${itemsTotal}) يتجاوز ميزانية المشروع (${totalBudget})` }
        }

        const activity = await prisma.operationalActivity.create({
            data: {
                planYearId: planId,
                name: data.name,
                code: data.code,
                project: data.name, // Use name as project
                budget: totalBudget,
                spent: totalSpent,
                remaining: totalBudget - totalSpent,
                priority: data.priority || 'MEDIUM',
                status: 'PENDING',
                responsible: data.responsible,
                quarter: parseInt(data.quarter) || 1,
                items: {
                    create: items.map((item: any) => ({
                        title: item.title,
                        amount: parseFloat(item.amount) || 0,
                        spent: parseFloat(item.spent) || 0
                    }))
                }
            },
            include: {
                items: true
            }
        })

        await updatePlanTotals(planId)
        revalidatePath("/admin/operational-plan")
        return { success: true, data: activity }
    } catch (error) {
        console.error("Failed to add activity:", error)
        return { success: false, error: "فشل إضافة المشروع" }
    }
}

export async function updateActivity(id: string, data: any) {
    try {
        // If items are provided, handle full update transactionally
        if (data.items) {
            // Validate sum
            const totalBudget = data.budget !== undefined ? parseFloat(data.budget) : 0
            const itemsTotal = data.items.reduce((sum: number, i: any) => sum + (parseFloat(i.amount) || 0), 0)

            // Note: If budget isn't being updated, we should fetch existing budget to validate, but for now assuming budget is passed if items are passed.
            // Or simple logic: UI validates. Backend double checks if budget is passed.

            if (data.budget !== undefined && itemsTotal > totalBudget) {
                return { success: false, error: `إجمالي مبالغ الأنشطة (${itemsTotal}) يتجاوز ميزانية المشروع (${totalBudget})` }
            }

            return await prisma.$transaction(async (tx) => {
                // 1. Delete existing items
                await tx.operationalItem.deleteMany({
                    where: { activityId: id }
                })

                // 2. Create new items (With Amounts)
                if (data.items.length > 0) {
                    await tx.operationalItem.createMany({
                        data: data.items.map((item: any) => ({
                            activityId: id,
                            title: item.title,
                            amount: parseFloat(item.amount) || 0,
                            spent: parseFloat(item.spent) || 0
                        }))
                    })
                }

                // 3. Update Activity with manual Budget/Spent
                const activity = await tx.operationalActivity.update({
                    where: { id },
                    data: {
                        name: data.name,
                        code: data.code,
                        project: data.project,
                        budget: data.budget !== undefined ? parseFloat(data.budget) : undefined,
                        spent: data.spent !== undefined ? parseFloat(data.spent) : undefined,
                        remaining: (data.budget !== undefined && data.spent !== undefined) ? (parseFloat(data.budget) - parseFloat(data.spent)) : undefined,
                        status: data.status,
                        completionPercentage: data.completionPercentage !== undefined ? parseFloat(data.completionPercentage) : undefined,
                        priority: data.priority,
                        responsible: data.responsible,
                        quarter: data.quarter !== undefined ? parseInt(data.quarter) : undefined,
                        notes: data.notes
                    }
                })

                return activity
            }).then(async (activity) => {
                if (activity.planYearId) {
                    await updatePlanTotals(activity.planYearId)
                }
                revalidatePath("/admin/operational-plan")
                return { success: true, data: activity }
            }).catch((error) => {
                console.error("Transaction failed:", error)
                return { success: false, error: error.message || "فشل تحديث النشاط" }
            })
        }

        // Fallback for simple updates (no items passed)
        const activity = await prisma.operationalActivity.update({
            where: { id },
            data: {
                name: data.name,
                code: data.code,
                project: data.project,
                budget: data.budget !== undefined ? parseFloat(data.budget) : undefined,
                spent: data.spent !== undefined ? parseFloat(data.spent) : undefined,
                status: data.status,
                completionPercentage: data.completionPercentage !== undefined ? parseFloat(data.completionPercentage) : undefined,
                priority: data.priority,
                responsible: data.responsible,
                quarter: data.quarter !== undefined ? parseInt(data.quarter) : undefined,
                notes: data.notes
            }
        })

        if (activity.planYearId) {
            await updatePlanTotals(activity.planYearId)
        }

        revalidatePath("/admin/operational-plan")
        return { success: true, data: activity }
    } catch (error) {
        console.error("Failed to update activity:", error)
        return { success: false, error: "فشل تحديث النشاط" }
    }
}

export async function updateActivityItems(activityId: string, items: any[]) {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.operationalItem.deleteMany({
                where: { activityId }
            })

            if (items.length > 0) {
                await tx.operationalItem.createMany({
                    data: items.map((item: any) => ({
                        activityId,
                        title: item.title,
                        amount: 0,
                        spent: 0
                    }))
                })
            }

            // Note: We NOT updating activity budget here anymore as items are cost-free.
        })

        // Fetch updated activity to get planYearId
        const activity = await prisma.operationalActivity.findUnique({
            where: { id: activityId }
        })

        if (activity?.planYearId) {
            // No need to update plan totals if activity budget didn't change, 
            // but harmless to re-ensure consistnecy.
            await updatePlanTotals(activity.planYearId)
        }

        revalidatePath("/admin/operational-plan")
        return { success: true }
    } catch (error) {
        console.error("Failed to update activity items:", error)
        return { success: false, error: "فشل تحديث بنود النشاط" }
    }
}

export async function deleteActivity(id: string) {
    try {
        const activity = await prisma.operationalActivity.delete({
            where: { id }
        })

        if (activity.planYearId) {
            await updatePlanTotals(activity.planYearId)
        }

        revalidatePath("/admin/operational-plan")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete activity:", error)
        return { success: false, error: "فشل حذف النشاط" }
    }
}

// --- Internal Helpers ---

async function updatePlanTotals(planId: string) {
    // Calculate total budget from all activities
    const aggregate = await prisma.operationalActivity.aggregate({
        where: { planYearId: planId },
        _sum: {
            budget: true
        }
    })

    await prisma.operationalPlanYear.update({
        where: { id: planId },
        data: {
            totalBudget: aggregate._sum.budget || 0
        }
    })
}
