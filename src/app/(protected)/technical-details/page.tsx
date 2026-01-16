export const dynamic = 'force-dynamic';

import { getTechnicalDetailsList } from "@/app/actions/technical-details"
import { TechnicalDetailsClient } from "@/components/technical-details/technical-details-client"

export default async function TechnicalDetailsPage() {
    const { data: items } = await getTechnicalDetailsList()

    return (
        <div className="w-full py-10">
            <TechnicalDetailsClient items={items || []} />
        </div>
    )
}

