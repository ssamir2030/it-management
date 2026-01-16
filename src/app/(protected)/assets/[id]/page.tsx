export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Page } from "@/components/page-layout"
import { Package, Calendar, User, Tag, FileText, MapPin, Building2, Shield, History as HistoryIcon, MessageSquare } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { ItemHistory } from "@/components/item-history"
import { CommentsSystem } from "@/components/comments-system"
import { getSession } from "@/lib/simple-auth"
import { AssetRemoteRegistration } from "@/components/assets/asset-remote-registration"
import { MaintenanceScheduler } from "@/components/assets/maintenance-scheduler"
import { AssetFinancialsCard } from "@/components/assets/asset-financials-card"

interface AssetDetailsPageProps {
    params: {
        id: string
    }
}

export default async function AssetDetailsPage({ params }: AssetDetailsPageProps) {
    const session = await getSession()

    const asset = await prisma.asset.findUnique({
        where: { id: params.id },
        include: {
            employee: {
                include: {
                    department: true,
                    location: true
                }
            },
            documents: true,
            remoteAgent: true,
            maintenanceSchedules: true
        }
    })

    if (!asset) {
        notFound()
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">متاح</Badge>
            case 'ASSIGNED':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">مستخدم</Badge>
            case 'MAINTENANCE':
                return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">صيانة</Badge>
            case 'BROKEN':
                return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">تالف</Badge>
            case 'RETIRED':
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200">متقاعد</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <Page
            title={asset.name}
            description={`تفاصيل الأصل: ${asset.tag}`}
            icon={Package}
            breadcrumbs={[
                { label: 'الرئيسية', href: '/dashboard' },
                { label: 'الأصول', href: '/assets' },
                { label: asset.name }
            ]}
            actions={
                <div className="flex gap-2">
                    <QRCodeGenerator
                        data={`/assets/${asset.id}`}
                        name={asset.name}
                        description={asset.type}
                        department={asset.employee?.department?.name || 'المخزون'}
                        assetTag={asset.tag}
                        employeeName={asset.employee?.name}
                        assetType={asset.type}
                    />
                    <Link href={`/assets/${asset.id}/edit`}>
                        <Button variant="outline">تعديل</Button>
                    </Link>
                </div>
            }
        >
            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content Area with Tabs */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                                <FileText className="h-4 w-4 ml-2" />
                                المعلومات الأساسية
                            </TabsTrigger>
                            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                                <HistoryIcon className="h-4 w-4 ml-2" />
                                سجل العمليات
                            </TabsTrigger>
                            <TabsTrigger value="comments" className="rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                                <MessageSquare className="h-4 w-4 ml-2" />
                                الملاحظات
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6 mt-0">
                            <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        تفاصيل الأصل
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-x-8 gap-y-6 sm:grid-cols-2 pt-6">
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">الاسم</span>
                                        <p className="font-bold text-base text-slate-900 dark:text-slate-100">{asset.name}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tag</span>
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-blue-500" />
                                            <p className="font-mono font-bold text-base">{asset.tag}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">النوع</span>
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-slate-400" />
                                            <p className="font-medium">{asset.type}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">الحالة</span>
                                        <div>{getStatusBadge(asset.status)}</div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">الرقم التسلسلي</span>
                                        <p className="font-mono font-medium">{asset.serialNumber || '-'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">الموديل</span>
                                        <p className="font-medium">{asset.model || '-'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">الشركة المصنعة</span>
                                        <p className="font-medium">{asset.manufacturer || '-'}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">تاريخ الشراء</span>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <p className="font-medium">
                                                {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('ar-EG') : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">انتهاء الضمان</span>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 text-green-600" />
                                            <p className="font-medium">
                                                {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString('ar-EG') : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents Section within Overview (Optional, could be separate tab) */}
                            {asset.documents.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">المستندات المرفقة</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {asset.documents.map(doc => (
                                                <Badge key={doc.id} variant="secondary" className="flex items-center gap-2 p-2 px-3">
                                                    <FileText className="h-3 w-3" />
                                                    {doc.fileName}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="mt-0">
                            <ItemHistory
                                entityType="ASSET"
                                entityId={asset.id}
                                title="سجل تحركات وتعديلات الأصل"
                            />
                        </TabsContent>

                        {/* Comments Tab */}
                        <TabsContent value="comments" className="mt-0">
                            <CommentsSystem
                                entityType="ASSET"
                                entityId={asset.id}
                                currentUserId={(session?.id as string) || ''}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Info - Sticky */}
                <div className="space-y-6">
                    {/* Remote Access Registration */}
                    <AssetRemoteRegistration
                        assetId={asset.id}
                        assetName={asset.name}
                        remoteAgent={asset.remoteAgent}
                    />

                    {/* Assignment Info */}
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                        <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/50">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="h-4 w-4 text-blue-600" />
                                المسؤول الحالي
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {asset.employee ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl font-bold text-white shadow-md ring-2 ring-white">
                                            {asset.employee.name.charAt(0)}
                                        </div>
                                        <div>
                                            <Link href={`/employees/${asset.employee.id}`} className="font-bold text-slate-900 hover:text-blue-600 hover:underline transition-colors block">
                                                {asset.employee.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground mt-0.5">{asset.employee.jobTitle}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Building2 className="h-4 w-4" />
                                            <span>{asset.employee.department?.name || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <MapPin className="h-4 w-4" />
                                            <span>{asset.employee.location?.name || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-muted-foreground">
                                    <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <User className="h-6 w-6 opacity-20" />
                                    </div>
                                    <p className="text-sm">غير معين لأي موظف</p>
                                    <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                                        <Link href={`/assets/${asset.id}/edit`}>
                                            تعيين موظف
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Maintenance Scheduler */}
                    <MaintenanceScheduler
                        assetId={asset.id}
                        schedules={asset.maintenanceSchedules}
                    />

                    {/* Financials Card */}
                    <AssetFinancialsCard
                        price={asset.price}
                        salvageValue={asset.salvageValue}
                        lifespan={asset.lifespan}
                        purchaseDate={asset.purchaseDate}
                    />

                    {/* Quick Info Card */}
                    <Card className="bg-slate-900 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-xs font-medium uppercase">آخر تحديث</span>
                                <HistoryIcon className="h-4 w-4 text-slate-500" />
                            </div>
                            <p className="font-mono text-2xl font-bold">
                                {new Date(asset.updatedAt).toLocaleDateString('en-GB')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Page>
    )
}
