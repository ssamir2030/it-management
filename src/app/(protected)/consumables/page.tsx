export const dynamic = 'force-dynamic';

import { getConsumables, getConsumableStats, getConsumableCategories } from "@/app/actions/consumables"
import { ConsumablesClient } from "@/components/consumables/consumables-client"
import { getEmployees } from "@/app/actions/employees"

export default async function ConsumablesPage() {
    const [consumablesData, categoriesData, statsData] = await Promise.all([
        getConsumables(),
        getConsumableCategories(),
        getConsumableStats()
    ])

    return (
        <ConsumablesClient
            initialData={consumablesData.data || []}
            categories={categoriesData.data || []}
            lowStockCount={statsData.data?.lowStockCount || 0}
        />
    )
}
