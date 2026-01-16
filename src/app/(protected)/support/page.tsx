export const dynamic = 'force-dynamic';

import { getTickets } from "@/app/actions/support"
import { SupportClient } from "@/components/support/support-client"

export default async function SupportPage() {
    const result = await getTickets()
    console.log('Support Page - getTickets result:', result)

    return <SupportClient tickets={result?.data || []} />
}
