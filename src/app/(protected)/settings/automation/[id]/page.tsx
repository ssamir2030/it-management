export const dynamic = 'force-dynamic';

import { AutomationRuleForm } from "@/components/admin/automation/automation-rule-form"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

type PageProps = {
    params: {
        id: string
    }
}

async function getRule(id: string) {
    const rule = await prisma.automationRule.findUnique({
        where: { id }
    })

    if (!rule) return null

    return {
        ...rule,
        conditions: JSON.parse(rule.conditions),
        actions: JSON.parse(rule.actions)
    }
}

export default async function EditAutomationRulePage({ params }: PageProps) {
    const rule = await getRule(params.id)

    if (!rule) {
        return notFound()
    }

    return <AutomationRuleForm initialData={rule} />
}
