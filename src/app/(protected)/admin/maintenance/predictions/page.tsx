export const dynamic = 'force-dynamic';

import { getPredictiveMaintenanceReport } from '@/app/actions/device-health'
import { PredictiveMaintenanceClient } from '@/components/maintenance/predictive-client'

export default async function PredictiveMaintenancePage() {
    const result = await getPredictiveMaintenanceReport()
    return <PredictiveMaintenanceClient predictions={result.data || []} />
}
