export const dynamic = 'force-dynamic';

import { getConsumableTransactions } from "@/app/actions/consumables"
import { ConsumablesReportsClient } from "@/components/consumables/consumables-reports-client"

export default async function ConsumablesReportsPage() {
    const { data: transactions } = await getConsumableTransactions()

    return (
        <ConsumablesReportsClient initialTransactions={transactions || []} />
    )
}
