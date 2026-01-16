export const dynamic = 'force-dynamic';

import { getLocations } from "@/app/actions/locations"
import { NewRackForm } from "@/components/racks/new-rack-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function NewRackPage() {
    const locationsRes = await getLocations()
    const locations = locationsRes.success && locationsRes.data ? locationsRes.data : []

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
                <Link href="/admin/racks">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">إضافة كبينة سيرفرات</h1>
                    <p className="text-muted-foreground">تعريف وحدة تخزين جديدة وأبعادها</p>
                </div>
            </div>

            <NewRackForm locations={locations} />
        </div>
    )
}
