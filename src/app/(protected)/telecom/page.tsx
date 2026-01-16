export const dynamic = 'force-dynamic';

import { getTelecomServices } from "@/app/actions/telecom"
import { TelecomClient } from "@/components/telecom/telecom-client"

export default async function TelecomPage() {
    const { data: services } = await getTelecomServices()

    return <TelecomClient services={services || []} />
}
