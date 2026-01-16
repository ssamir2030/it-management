export const dynamic = 'force-dynamic';

import { scanSubnet } from "@/app/actions/ipam"
import { IPGrid } from "@/components/ipam/ip-grid"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PageProps {
    params: {
        id: string
    }
}

export default async function SubnetDetailPage({ params }: PageProps) {
    // Always scan on load to get fresh status
    const res = await scanSubnet(params.id)

    if (!res.success || !res.data || !res.subnet) {
        notFound()
    }

    const { data: ips, subnet } = res

    // Calculate stats
    const total = ips.length
    const used = ips.filter(i => i.status === 'USED' || i.status === 'GATEWAY' || i.status === 'RESERVED').length
    const free = total - used
    const usagePercent = Math.round((used / total) * 100)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/ipam">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight font-mono">{subnet.cidr}</h1>
                        <p className="text-muted-foreground">{subnet.name} {subnet.vlan && `(VLAN ${subnet.vlan})`}</p>
                    </div>
                </div>
                <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh Scan
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-emerald-500">{free}</div>
                        <p className="text-xs text-muted-foreground">Free Addresses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-500">{used}</div>
                        <p className="text-xs text-muted-foreground">Used / Reserved</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{usagePercent}%</div>
                        <p className="text-xs text-muted-foreground">Utilization</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="flex-1 flex flex-col min-h-[500px]">
                <CardContent className="p-0 flex-1">
                    <IPGrid ips={ips} />
                </CardContent>
            </Card>

            <div className="flex gap-4 justify-center text-xs text-muted-foreground pb-6">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-500"></div>
                    <span>Used</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-orange-500"></div>
                    <span>Gateway</span>
                </div>
            </div>
        </div>
    )
}
