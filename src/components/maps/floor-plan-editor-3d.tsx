"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FloorPlanEditor3DProps {
    locationId: string
}

export default function FloorPlanEditor3D({ locationId }: FloorPlanEditor3DProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>محرر المخطط (ثلاثي الأبعاد)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] flex items-center justify-center bg-muted rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">محرر المخطط قيد التطوير...</p>
                </div>
            </CardContent>
        </Card>
    )
}
