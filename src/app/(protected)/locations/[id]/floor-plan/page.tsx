export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Map as MapIcon } from "lucide-react"
import FloorPlanEditor3D from "@/components/maps/floor-plan-editor-3d"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

interface FloorPlanPageProps {
    params: {
        id: string
    }
}

export default async function FloorPlanPage({ params }: FloorPlanPageProps) {
    const location = await prisma.location.findUnique({
        where: { id: params.id }
    })

    if (!location) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="مخطط المواقع"
                description="إدارة المخطط الهندسي للمكتب وتوزيع الأجهزة والإدارات عليه"
                icon={MapIcon}
                backLink="/locations"
            />

            <FloorPlanEditor3D locationId={params.id} />
        </div>
    )
}
