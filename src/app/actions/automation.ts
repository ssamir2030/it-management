"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/simple-auth"
import { hasPermission } from "@/lib/rbac"
import { logEvent } from "@/lib/system-log"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Types for JSON fields
type Condition = {
    field: string
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
    value: string
}

type Action = {
    type: 'UPDATE_FIELD' | 'SEND_EMAIL' | 'CREATE_TASK'
    params: Record<string, string>
}

const ruleSchema = z.object({
    name: z.string().min(3, "اسم القاعدة مطلوب"),
    description: z.string().optional(),
    triggerType: z.string(),
    conditions: z.string(), // Verified as JSON string on client
    actions: z.string(),    // Verified as JSON string on client
    isActive: z.boolean().default(true)
})

// ==========================================
// CRUD OPERATIONS
// ==========================================

export async function getAutomationRules() {
    const session = await getSession()
    if (!session?.role || (!hasPermission(session.role as string, 'manage_settings') && !hasPermission(session.role as string, 'view_settings'))) return { success: false, error: "Unauthorized" }

    try {
        const rules = await prisma.automationRule.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: rules }
    } catch (error) {
        return { success: false, error: "Failed to fetch rules" }
    }
}

export async function saveAutomationRule(data: z.infer<typeof ruleSchema>, id?: string) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    const validated = ruleSchema.safeParse(data)
    if (!validated.success) return { success: false, error: validated.error.errors[0].message }

    try {
        if (id) {
            await prisma.automationRule.update({
                where: { id },
                data: validated.data
            })
            await logEvent('UPDATE', 'SETTINGS', `تم تحديث قاعدة الأتمتة: ${data.name}`)
        } else {
            await prisma.automationRule.create({
                data: {
                    ...validated.data,
                    createdBy: session.id
                }
            })
            await logEvent('CREATE', 'SETTINGS', `تم إنشاء قاعدة أتمتة جديدة: ${data.name}`)
        }
        revalidatePath('/admin/settings/automation')
        return { success: true }
    } catch (error) {
        console.error("Save Rule Error:", error)
        return { success: false, error: "Failed to save rule" }
    }
}

export async function deleteAutomationRule(id: string) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    try {
        await prisma.automationRule.delete({ where: { id } })
        revalidatePath('/admin/settings/automation')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete rule" }
    }
}

export async function toggleAutomationRule(id: string, isActive: boolean) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    try {
        await prisma.automationRule.update({
            where: { id },
            data: { isActive }
        })
        revalidatePath('/admin/settings/automation')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to toggle rule" }
    }
}

// ==========================================
// ENGINE PROCESSOR
// ==========================================

export async function triggerAutomation(trigger: string, context: any) {
    console.log(`[Automation] Triggered: ${trigger}`)

    // 1. Fetch active rules for this trigger
    const rules = await prisma.automationRule.findMany({
        where: {
            isActive: true,
            triggerType: trigger
        }
    })

    if (rules.length === 0) return

    // 2. Evaluate & Execute
    for (const rule of rules) {
        try {
            const conditions: Condition[] = JSON.parse(rule.conditions)
            const actions: Action[] = JSON.parse(rule.actions)

            if (evaluateConditions(conditions, context)) {
                console.log(`[Automation] Rule matched: ${rule.name}`)
                await executeActions(actions, context)

                // Update stats
                await prisma.automationRule.update({
                    where: { id: rule.id },
                    data: {
                        runCount: { increment: 1 },
                        lastRunAt: new Date()
                    }
                })
            }
        } catch (err) {
            console.error(`[Automation] Failed to process rule ${rule.id}:`, err)
        }
    }
}

function evaluateConditions(conditions: Condition[], context: any): boolean {
    // strict AND logic for now
    return conditions.every(cond => {
        const val = context[cond.field]
        const target = cond.value

        switch (cond.operator) {
            case 'equals': return String(val) === target
            case 'not_equals': return String(val) !== target
            case 'contains': return String(val).includes(target)
            case 'greater_than': return Number(val) > Number(target)
            case 'less_than': return Number(val) < Number(target)
            default: return false
        }
    })
}

async function executeActions(actions: Action[], context: any) {
    for (const action of actions) {
        // Placeholder execution logic
        // In a real scenario, this would import other actions like 'updateTicket'
        // For now, we just log it to prove functionality
        console.log(`[Automation] Executing ${action.type}`, action.params)

        if (action.type === 'UPDATE_FIELD' && context.id) {
            // Check if context is a ticket or asset and update via Prisma directly for now
            // This is a simplified example
            // await prisma.ticket.update({ where: {id: context.id}, data: ... })
        }
    }
}

export async function seedAutomationRules() {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_settings')) return { success: false, error: "Unauthorized" }

    const defaults = [
        {
            name: "إشعار عند إنشاء تذكرة عالية الأولوية",
            description: "يقوم بإرسال بريد إلكتروني للمدير عند إنشاء تذكرة ذات أولوية عالية.",
            triggerType: "TICKET_CREATED",
            conditions: JSON.stringify([
                { field: "priority", operator: "equals", value: "HIGH" }
            ]),
            actions: JSON.stringify([
                { type: "SEND_EMAIL", params: { subject: "تنبيه: تذكرة جديدة عالية الأولوية" } }
            ]),
            isActive: true,
            createdBy: session.id
        },
        {
            name: "إغلاق التذاكر القديمة تلقائياً",
            description: "مثال على قاعدة مجدولة (Demo Only)",
            triggerType: "SCHEDULE_DAILY",
            conditions: JSON.stringify([]),
            actions: JSON.stringify([
                { type: "UPDATE_FIELD", params: { field: "status", value: "CLOSED" } }
            ]),
            isActive: false,
            createdBy: session.id
        }
    ]

    try {
        for (const rule of defaults) {
            const exists = await prisma.automationRule.findFirst({
                where: { name: rule.name }
            })
            if (!exists) {
                await prisma.automationRule.create({ data: rule })
            }
        }
        revalidatePath('/admin/settings/automation')
        return { success: true }
    } catch (error: any) {
        console.error("Seed Rules Error:", error)
        return { success: false, error: "Failed to seed rules: " + error.message }
    }
}
