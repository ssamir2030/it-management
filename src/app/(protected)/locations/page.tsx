export const dynamic = 'force-dynamic';

import { getLocations } from "@/app/actions/locations"
import { LocationClient } from "@/components/locations/location-client"

export default async function LocationsPage() {
    const { data: locations } = await getLocations()

    return <LocationClient locations={locations || []} />
}
