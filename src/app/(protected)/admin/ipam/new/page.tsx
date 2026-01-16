export const dynamic = 'force-dynamic';

import { getLocations } from "@/app/actions/locations"
import { NewSubnetForm } from "@/components/ipam/new-subnet-form"
import { ArrowLeft, Network } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default async function NewSubnetPage() {
    const locationsRes = await getLocations()
    const locations = locationsRes.success && locationsRes.data ? locationsRes.data : []

    return (
        <div className="container mx-auto p-6 space-y-6" dir="rtl">
            <div className="flex items-center gap-4">
                <Link href="/admin/ipam">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        العودة للشبكات
                    </Button>
                </Link>
            </div>

            <PremiumPageHeader
                title="إضافة شبكة جديدة"
                description="تعريف نطاق شبكة جديد وتخصيص إعداداتها"
                icon={Network}
            />

            <NewSubnetForm locations={locations} />
        </div>
    )
}
