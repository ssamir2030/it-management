export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/simple-auth"
import { redirect } from "next/navigation"
import { NetworkDiscoveryClient } from "@/components/admin/discovery/scan-results"

export default async function NetworkDiscoveryPage() {
    const session = await getSession()
    if (!session) redirect('/portal')

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">اكتشاف الشبكة</h1>
                    <p className="text-muted-foreground mt-2">
                        فحص الشبكة للعثور على الأجهزة المتصلة وإضافتها للمخزون
                    </p>
                </div>
            </div>

            <NetworkDiscoveryClient />
        </div>
    )
}
