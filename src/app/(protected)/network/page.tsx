export const dynamic = 'force-dynamic';

import { getNetworkDevices } from "@/app/actions/network"
import { NetworkClient } from "@/components/network/network-client"

export default async function NetworkPage() {
    const { data: devices } = await getNetworkDevices()

    return <NetworkClient initialDevices={devices || []} />
}
