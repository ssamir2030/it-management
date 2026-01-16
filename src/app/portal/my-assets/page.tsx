export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import prisma from '@/lib/prisma'
import { Monitor, Download, CheckCircle2, AlertCircle, Calendar, MapPin, Package, Cpu, HardDrive, MemoryStick, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { PrintButton } from '@/components/portal/print-button'
import { AssetActions } from '@/components/portal/asset-actions'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

async function MyAssetsPage() {
    const employee = await getCurrentEmployee()

    if (!employee) {
        redirect('/portal/login')
    }

    const assets = await prisma.asset.findMany({
        where: { employeeId: employee.id },
        include: {
            location: true,
            employee: {
                include: {
                    department: true
                }
            },
            custodyItems: {
                where: { employeeId: employee.id },
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const getStatusBadge = (status: string) => {
        const variants = {
            ASSIGNED: { variant: 'default' as const, label: 'نشط', color: 'bg-green-100 text-green-700' },
            AVAILABLE: { variant: 'secondary' as const, label: 'متاح', color: 'bg-blue-100 text-blue-700' },
            MAINTENANCE: { variant: 'destructive' as const, label: 'صيانة', color: 'bg-red-100 text-red-700' },
            RETIRED: { variant: 'outline' as const, label: 'متقاعد', color: 'bg-gray-100 text-gray-700' }
        }
        return variants[status as keyof typeof variants] || variants.AVAILABLE
    }

    return (
        <div className="space-y-8 pb-12">
            <PremiumPageHeader
                title="عهدتي المسجلة"
                description={`الأصول والأجهزة المخصصة لي • ${assets.length} عنصر`}
                icon={Monitor}
                rightContent={
                    <div className="flex gap-3">
                        <Link href="/portal/dashboard">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة
                            </Button>
                        </Link>
                        <Link href="/portal/my-assets/download-report">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <Download className="h-4 w-4" />
                                تقرير العهدة
                            </Button>
                        </Link>
                        <PrintButton />
                    </div>
                }
            />

            {/* Summary Stats */}
            < div className="grid gap-4 md:grid-cols-4" >
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-700">
                                <Monitor className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">إجمالي العهدة</p>
                                <p className="text-3xl font-black">{assets.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-emerald-600">
                                <CheckCircle2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">نشطة</p>
                                <p className="text-3xl font-black">{assets.filter(a => a.status === 'ASSIGNED').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-amber-600">
                                <AlertCircle className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">في الصيانة</p>
                                <p className="text-3xl font-black">{assets.filter(a => a.status === 'MAINTENANCE').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-indigo-600">
                                <Calendar className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                                <p className="text-sm font-bold mt-1">
                                    {new Date().toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div >

            {/* Assets List */}
            < div className="grid gap-6" >
                {
                    assets.map((asset) => {
                        const status = getStatusBadge(asset.status)
                        const latestCustody = asset.custodyItems[0]

                        return (
                            <Card key={asset.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex flex-col md:flex-row">
                                    {/* Asset Image / Icon */}
                                    <div className="w-full md:w-48 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6 bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-800">
                                        <Monitor className="h-16 w-16 text-slate-400" />
                                    </div>

                                    {/* Asset Details */}
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-2xl font-bold">{asset.name}</h3>
                                                    <Badge className={status.color}>{status.label}</Badge>
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-4 w-4" />
                                                        <span>{asset.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{asset.location?.name || 'غير محدد'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                        <span>{asset.tag}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-3">
                                                <div className="text-left">
                                                    <p className="text-sm text-muted-foreground">تاريخ الاستلام</p>
                                                    <p className="font-semibold">
                                                        {new Date(asset.createdAt).toLocaleDateString('ar-EG', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                {/* Action Button */}
                                                <div className="mt-2">
                                                    <AssetActions asset={asset} custodyItem={latestCustody} />
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="my-6" />

                                        {/* Specs Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                                                    <Cpu className="h-3 w-3" />
                                                    المعالج
                                                </div>
                                                <p className="font-medium">{asset.processor || '-'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                                                    <MemoryStick className="h-3 w-3" />
                                                    الذاكرة
                                                </div>
                                                <p className="font-medium">{asset.ram || '-'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                                                    <HardDrive className="h-3 w-3" />
                                                    التخزين
                                                </div>
                                                <p className="font-medium">{asset.storage || '-'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
                                                    <Monitor className="h-3 w-3" />
                                                    نظام التشغيل
                                                </div>
                                                <p className="font-medium">{asset.operatingSystem || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )
                    })
                }

                {
                    assets.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed">
                            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">لا توجد أصول مسجلة</h3>
                            <p className="text-muted-foreground">لم يتم تخصيص أي أجهزة أو أصول لك حتى الآن</p>
                        </div>
                    )
                }
            </div >
        </div >
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div className="text-center py-12">جاري التحميل...</div>}>
            <MyAssetsPage />
        </Suspense>
    )
}
