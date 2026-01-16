export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Target, TrendingUp, DollarSign, Calendar } from "lucide-react"
import { getOperationalPlan, createOperationalPlan, getAllPlanYears } from "@/app/actions/operational-plan"
import { PlanDashboard } from "@/components/operational/plan-dashboard"
import { PlanYearSelector } from "@/components/operational/plan-year-selector"
import prisma from "@/lib/prisma"

export default async function OperationalPlanPage({ searchParams }: { searchParams: { year?: string } }) {
    const year = searchParams.year ? parseInt(searchParams.year) : 2026

    // Fetch or create default plan for 2026 if it doesn't exist
    let planRes = await getOperationalPlan(year)
    let plan = planRes.data

    const allPlansRes = await getAllPlanYears()
    const allPlans = allPlansRes.data || []

    if (!plan && year === 2026) {
        await createOperationalPlan(2026, "الخطة التشغيلية 2026")
        planRes = await getOperationalPlan(2026)
        plan = planRes.data
    }

    return (
        <div className="space-y-6 pb-20">
            <PremiumPageHeader
                title="الخطة التشغيلية"
                description={`متابعة الأداء والميزانية والمشاريع لعام ${year}`}
                icon={Target}
                rightContent={<PlanYearSelector currentYear={year} allPlans={allPlans} />}
            />

            <PlanDashboard plan={plan} year={year} />
        </div>
    )
}
