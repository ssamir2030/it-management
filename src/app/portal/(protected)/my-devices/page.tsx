export const dynamic = 'force-dynamic';

import { getEmployeeDeviceHealth } from '@/app/actions/device-health'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { redirect } from 'next/navigation'
import { DeviceHealthClient } from '@/components/portal/device-health-client'

export default async function MyDevicesPage() {
    const currentEmployee = await getCurrentEmployee()
    if (!currentEmployee) redirect('/portal/login')

    const result = await getEmployeeDeviceHealth(currentEmployee.id)
    const devices = (result.data || []).map((d: any) => ({
        ...d,
        purchaseDate: d.purchaseDate ? new Date(d.purchaseDate).toISOString() : undefined,
        warrantyExpiry: d.warrantyExpiry ? new Date(d.warrantyExpiry).toISOString() : undefined,
        healthStatus: d.healthStatus as 'GOOD' | 'FAIR' | 'POOR'
    }))

    return <DeviceHealthClient devices={devices} />
}
