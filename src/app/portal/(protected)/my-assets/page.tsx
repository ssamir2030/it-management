export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import prisma from '@/lib/prisma'
import { Monitor, Download, CheckCircle2, AlertCircle, Calendar, MapPin, Package, Cpu, HardDrive, MemoryStick, ArrowRight, Wifi, Hash, Server, Network, Globe, ShoppingCart, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { PrintButton } from '@/components/portal/print-button'
import { AssetActions } from '@/components/portal/asset-actions'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

// Helper function to parse storage data
function parseStorageData(storage: string | null) {
    if (!storage || storage === '-') return null

    try {
        const data = JSON.parse(storage)
        if (Array.isArray(data) && data.length > 0) {
            return data.map((disk: any) => ({
                drive: disk.drive || disk.Name || 'Drive',
                size: disk.size || disk['Used(GB)'] || '0',
                free: disk.free || disk['Free(GB)'] || '0'
            }))
        }
    } catch {
        // Not JSON, return as plain text indicator
        return null
    }
    return null
}

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
            <div className="grid gap-4 md:grid-cols-4">
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
            </div>

            {/* Assets List */}
            <div className="grid gap-6">
                {assets.map((asset) => {
                    const status = getStatusBadge(asset.status)
                    const latestCustody = asset.custodyItems[0]
                    const storageData = parseStorageData(asset.storage)

                    return (
                        <Card key={asset.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div className="flex flex-col md:flex-row">
                                {/* Asset Image / Icon */}
                                <div className="w-full md:w-48 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6 bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-800">
                                    <Monitor className="h-16 w-16 text-slate-400" />
                                </div>

                                {/* Asset Details */}
                                <div className="flex-1 p-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
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

                                    {/* Professional Technical Specs Table */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border overflow-hidden">
                                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 px-4 py-3 border-b">
                                            <h4 className="font-bold text-sm flex items-center gap-2">
                                                <Server className="h-4 w-4 text-primary" />
                                                المواصفات الفنية الكاملة
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-200 dark:divide-slate-700">
                                            {/* Left Column */}
                                            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {/* Manufacturer */}
                                                <div className="px-4 py-3 flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">الشركة المصنعة</span>
                                                    <span className="font-semibold text-sm">{asset.manufacturer || '-'}</span>
                                                </div>
                                                {/* Model */}
                                                <div className="px-4 py-3 flex justify-between items-center bg-slate-100/50 dark:bg-slate-700/30">
                                                    <span className="text-xs text-muted-foreground">الموديل</span>
                                                    <span className="font-semibold text-sm">{asset.model || '-'}</span>
                                                </div>
                                                {/* Serial Number */}
                                                <div className="px-4 py-3 flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Hash className="h-3 w-3" />
                                                        الرقم التسلسلي
                                                    </span>
                                                    <span className="font-mono font-bold text-sm text-primary">{asset.serialNumber || '-'}</span>
                                                </div>
                                                {/* Processor */}
                                                <div className="px-4 py-3 flex justify-between items-center bg-slate-100/50 dark:bg-slate-700/30">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Cpu className="h-3 w-3" />
                                                        المعالج
                                                    </span>
                                                    <span className="font-medium text-sm text-left">{asset.processor || '-'}</span>
                                                </div>
                                                {/* RAM */}
                                                <div className="px-4 py-3 flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <MemoryStick className="h-3 w-3" />
                                                        الذاكرة العشوائية
                                                    </span>
                                                    <span className="font-semibold text-sm">{asset.ram || '-'}</span>
                                                </div>
                                                {/* Operating System */}
                                                <div className="px-4 py-3 flex justify-between items-center bg-slate-100/50 dark:bg-slate-700/30">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Monitor className="h-3 w-3" />
                                                        نظام التشغيل
                                                    </span>
                                                    <span className="font-medium text-sm">{asset.operatingSystem || '-'}</span>
                                                </div>
                                            </div>

                                            {/* Right Column */}
                                            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {/* IP Address */}
                                                <div className="px-4 py-3 flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Wifi className="h-3 w-3" />
                                                        عنوان IP
                                                    </span>
                                                    <span className="font-mono font-medium text-sm">{asset.ipAddress || '-'}</span>
                                                </div>
                                                {/* MAC Address */}
                                                <div className="px-4 py-3 flex justify-between items-center bg-slate-100/50 dark:bg-slate-700/30">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Network className="h-3 w-3" />
                                                        عنوان MAC
                                                    </span>
                                                    <span className="font-mono font-medium text-sm text-orange-600 dark:text-orange-400">{asset.macAddress || '-'}</span>
                                                </div>
                                                {/* Domain/Workgroup - from specifications JSON */}
                                                <div className="px-4 py-3 flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Globe className="h-3 w-3" />
                                                        Domain / Workgroup
                                                    </span>
                                                    <span className="font-medium text-sm">
                                                        {(() => {
                                                            try {
                                                                const specs = asset.specifications ? JSON.parse(asset.specifications) : {}
                                                                return specs.domain || specs.workgroup || specs.domainWorkgroup || '-'
                                                            } catch { return '-' }
                                                        })()}
                                                    </span>
                                                </div>
                                                {/* AnyDesk ID */}
                                                <div className="px-4 py-3 flex justify-between items-center bg-slate-100/50 dark:bg-slate-700/30">
                                                    <span className="text-xs text-muted-foreground">AnyDesk ID</span>
                                                    <span className="font-mono font-bold text-sm text-red-600 dark:text-red-400">{asset.anydeskId || '-'}</span>
                                                </div>
                                                {/* DWService ID */}
                                                <div className="px-4 py-3 flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">DWService ID</span>
                                                    <span className="font-mono font-bold text-sm text-green-600 dark:text-green-400">{asset.dwServiceId || '-'}</span>
                                                </div>
                                                {/* Asset Tag */}
                                                <div className="px-4 py-3 flex justify-between items-center bg-slate-100/50 dark:bg-slate-700/30">
                                                    <span className="text-xs text-muted-foreground">رمز الأصل</span>
                                                    <span className="font-mono font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">{asset.tag}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Warranty & Purchase Info - Full Width */}
                                        {(asset.purchaseDate || asset.warrantyExpiry) && (
                                            <div className="border-t border-slate-200 dark:divide-slate-700 grid grid-cols-2 divide-x divide-x-reverse divide-slate-200 dark:divide-slate-700">
                                                <div className="px-4 py-3 flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <ShoppingCart className="h-3 w-3" />
                                                        تاريخ الشراء
                                                    </span>
                                                    <span className="font-medium text-sm">
                                                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('ar-EG') : '-'}
                                                    </span>
                                                </div>
                                                <div className="px-4 py-3 flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Shield className="h-3 w-3" />
                                                        انتهاء الضمان
                                                    </span>
                                                    <span className={`font-medium text-sm ${asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                                                        {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString('ar-EG') : '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Storage Section - Full Width */}
                                        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                <HardDrive className="h-3 w-3" />
                                                <span className="font-semibold">التخزين</span>
                                            </div>

                                            {storageData ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {storageData.map((disk, idx) => {
                                                        const freeNum = parseFloat(disk.free) || 0
                                                        const sizeNum = parseFloat(disk.size) || 1
                                                        const usedPercent = Math.max(0, Math.min(100, ((sizeNum - freeNum) / sizeNum) * 100))

                                                        return (
                                                            <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-3 border shadow-sm">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="font-bold text-primary">{disk.drive}</span>
                                                                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded font-medium">{disk.size} GB</span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 dark:bg-slate-600 h-2.5 rounded-full overflow-hidden mb-1.5">
                                                                    <div
                                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all"
                                                                        style={{ width: `${usedPercent}%` }}
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between text-xs">
                                                                    <span className="text-muted-foreground">مستخدم: {(sizeNum - freeNum).toFixed(1)} GB</span>
                                                                    <span className="text-emerald-600 font-bold">متاح: {disk.free} GB</span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="font-medium text-sm text-muted-foreground">{asset.storage || 'لا توجد بيانات'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                })}

                {assets.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">لا توجد أصول مسجلة</h3>
                        <p className="text-muted-foreground">لم يتم تخصيص أي أجهزة أو أصول لك حتى الآن</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<div className="text-center py-12">جاري التحميل...</div>}>
            <MyAssetsPage />
        </Suspense>
    )
}
