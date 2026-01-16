export const dynamic = 'force-dynamic';

import { getCustodyItems } from "@/app/actions/custody"
import { getEmployeesList } from "@/app/actions/assets" // Reusing this to get employees list
import { CustodyClient } from "@/components/custody/custody-client"

export default async function CustodyPage() {
    const { data: items } = await getCustodyItems()
    const employees = await getEmployeesList()

    return <CustodyClient items={items || []} employees={employees || []} />
}
