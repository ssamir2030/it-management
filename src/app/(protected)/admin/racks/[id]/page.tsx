export const dynamic = 'force-dynamic';

import { getRack, getUnassignedAssets } from "@/app/actions/racks"
import { RackDetailsClient } from "@/components/racks/rack-details-client"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PageProps {
    params: {
        id: string
    }
}

export default async function RackDetailPage({ params }: PageProps) {
    const rackId = params.id

    const [rackRes, assetsRes] = await Promise.all([
        getRack(rackId),
        getUnassignedAssets() // We could filter by location if we wanted strict enforcement
    ])

    if (!rackRes.success || !rackRes.data) {
        notFound()
    }

    const rack = rackRes.data
    // Filter assets to only those that match location? Optional. 
    // For now let's show all unassigned server-grade assets.
    const unassignedAssets = assetsRes.success && assetsRes.data ? assetsRes.data : []

    // Filter unassigned assets to match rack location if desired, for now let's be flexible
    // const filteredAssets = unassignedAssets.filter(a => a.locationId === rack.locationId)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/racks">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{rack.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        {rack.location?.name}
                        <span className="text-zinc-300">•</span>
                        {rack.capacity}U Capacity
                    </p>
                </div>
            </div>

            <RackDetailsClient rack={rack} unassignedAssets={unassignedAssets} />
        </div>
    )
}
