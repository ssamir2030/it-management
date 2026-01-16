export const dynamic = 'force-dynamic';

import { getRacks } from "@/app/actions/racks"
import { getLocations } from "@/app/actions/locations"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Server, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default async function RacksPage() {
    const racksRes = await getRacks()
    const locationsRes = await getLocations()

    const racks = racksRes.success && racksRes.data ? racksRes.data : []
    const locations = locationsRes.success && locationsRes.data ? locationsRes.data : []

    const stats = [
        {
            label: "إجمالي الكبائن",
            value: racks.length,
            icon: Server
        },
        {
            label: "السعة الكلية (U)",
            value: racks.reduce((acc: number, rack: any) => acc + (rack.capacity || 0), 0),
            icon: Server
        }
    ]

    return (
        <div className="w-full py-6 space-y-6">
            <PremiumPageHeader
                title="إدارة كبائن السيرفرات"
                description="إدارة البنية التحتية لمركز البيانات وتنظيم الكبائن"
                icon={Server}
                rightContent={
                    <Link href="/admin/racks/new">
                        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                            <Plus className="h-4 w-4" />
                            إضافة كبينة جديدة
                        </Button>
                    </Link>
                }
                stats={stats}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {racks?.map((rack: any) => (
                    <Link key={rack.id} href={`/admin/racks/${rack.id}`}>
                        <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {rack.location?.name || 'Unknown Location'}
                                </CardTitle>
                                <Server className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold mb-1">{rack.name}</div>
                                <p className="text-xs text-muted-foreground mb-4">
                                    {rack.capacity}U Capacity
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground">Assets:</span>
                                        <span className="font-medium">{rack._count?.assets || 0}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="-mr-2">
                                        View Rack <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {racks?.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                        <Server className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-semibold">No Racks Found</h3>
                        <p className="text-muted-foreground mb-4">Get started by creating your first server rack definition.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
