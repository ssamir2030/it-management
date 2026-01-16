export const dynamic = 'force-dynamic';

import { getLocations } from "@/app/actions/locations"
import { NetworkDeviceForm } from "@/components/network/network-device-form"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Wifi, ArrowRight } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewNetworkDevicePage() {
    const { data: locations } = await getLocations()

    return (
        <div className="w-full py-6 space-y-6 px-6">
            <PremiumPageHeader
                title="إضافة جهاز شبكة جديد"
                description="تسجيل جهاز شبكة جديد في النظام"
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
            <NetworkDeviceForm locations={locations || []} />
        </div>
    )
}
