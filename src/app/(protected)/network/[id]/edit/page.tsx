export const dynamic = 'force-dynamic';

import { getNetworkDevice } from "@/app/actions/network"
import { getLocations } from "@/app/actions/locations"
import { NetworkDeviceForm } from "@/components/network/network-device-form"
import { notFound } from "next/navigation"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Wifi, ArrowRight } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EditNetworkDevicePage({ params }: { params: { id: string } }) {
    const [deviceRes, locationsRes] = await Promise.all([
        getNetworkDevice(params.id),
        getLocations()
    ])

    if (!deviceRes.data) {
        notFound()
    }

    return (
        <div className="w-full py-10 max-w-7xl">
            <PremiumPageHeader
                title="تعديل بيانات الجهاز"
                description="Edit Network Device"
                icon={Wifi}
                rightContent={
                    <Link href="/network">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowRight className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />
            <NetworkDeviceForm
                locations={locationsRes.data || []}
                initialData={deviceRes.data}
            />
        </div>
    )
}
