export const dynamic = 'force-dynamic';

import { getSubnets } from "@/app/actions/ipam"
import { getLocations } from "@/app/actions/locations"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Network, ArrowRight, ShieldCheck, Plus } from "lucide-react"
import Link from "next/link"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default async function IPAMPage() {
    const [subnetsRes, locationsRes] = await Promise.all([
        getSubnets(),
        getLocations()
    ])

    const subnets = subnetsRes.success && subnetsRes.data ? subnetsRes.data : []
    const locations = locationsRes.success && locationsRes.data ? locationsRes.data : []

    const stats = [
        {
            label: "إجمالي الشبكات",
            value: subnets.length,
            icon: Network
        },
        {
            label: "المواقع المغطاة",
            value: new Set(subnets.map((s: any) => s.locationId).filter(Boolean)).size,
            icon: ShieldCheck
        },
        {
            label: "عدد الـ VLANs",
            value: new Set(subnets.map((s: any) => s.vlan).filter(Boolean)).size,
            icon: ShieldCheck
        }
    ]

    return (
        <div className="w-full py-6 space-y-6">
            <PremiumPageHeader
                title="إدارة عناوين الشبكة (IPAM)"
                description="إدارة الشبكات الفرعية وتتبع عناوين IP"
                icon={Network}
                rightContent={
                    <Link href="/admin/ipam/new">
                        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                            <Plus className="h-4 w-4" />
                            إضافة شبكة جديدة
                        </Button>
                    </Link>
                }
                stats={stats}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {subnets?.map((subnet: any) => (
                    <Link key={subnet.id} href={`/admin/ipam/${subnet.id}`}>
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer group h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-zinc-500">
                                    {subnet.vlan ? `VLAN ${subnet.vlan}` : 'No VLAN'}
                                </CardTitle>
                                <Network className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-mono tracking-tight text-primary">
                                    {subnet.cidr}
                                </div>
                                <div className="text-sm font-medium mt-1 mb-4">{subnet.name}</div>

                                <div className="space-y-2 text-xs text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span>Gateway:</span>
                                        <span className="font-mono">{subnet.gateway || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Location:</span>
                                        <span>{subnet.location?.name || 'Global'}</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end">
                                    <Button variant="ghost" size="sm" className="-mr-2 text-xs">
                                        Scan Subnet <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {subnets?.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                        <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-semibold">No Subnets Defined</h3>
                        <p className="text-muted-foreground mb-4">Create your first subnet to start tracking IP usage.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
