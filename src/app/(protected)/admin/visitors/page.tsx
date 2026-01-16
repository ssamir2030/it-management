export const dynamic = 'force-dynamic';

import { getAllVisits, getActiveVisits } from '@/app/actions/visitors'
import { VisitorClient } from '@/components/visitors/visitor-client'

export default async function VisitorsPage() {
    const [allVisitsResult, activeVisitsResult] = await Promise.all([getAllVisits(), getActiveVisits()])
    return <VisitorClient initialVisits={allVisitsResult.data || []} activeVisits={activeVisitsResult.data || []} />
}
