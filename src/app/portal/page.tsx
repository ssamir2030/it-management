export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import prisma from '@/lib/prisma'
import {
    Monitor, FileText, LifeBuoy, Clock, TrendingUp, Package,
    CheckCircle2, AlertCircle, Calendar, Award, Activity, Zap,
    Wrench, ShoppingCart, ClipboardList, User, Building2, Mail, Phone, BookOpen,
    Smartphone, CalendarCheck, Book
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ServiceCatalog } from '@/components/portal/service-catalog'
import { PortalAnnouncements } from '@/components/portal/portal-announcements'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

async function getEmployeeDashboardData(employeeId: string) {
    const [employee, assets, requests, tickets, bookingsCount] = await Promise.all([
        prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                department: true
            }
        }),
        prisma.asset.findMany({
            where: { employeeId },
            include: {
                location: { select: { name: true } }
            }
        }),
        prisma.employeeRequest.findMany({
            where: { employeeId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                type: true,
                status: true,
                subject: true,
                createdAt: true,
                updatedAt: true,
                priority: true,
                details: true
            }
        }),
        prisma.ticket.findMany({
            where: {
                OR: [
                    { employeeId },
                    { employeeName: { contains: employeeId } }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        }),
        prisma.roomBooking.count({
            where: {
                employeeId,
                startTime: { gte: new Date() },
                status: { not: 'REJECTED' }
            }
        })
    ])

    // Statistics
    const stats = {
        totalAssets: assets.length,
        activeAssets: assets.filter((a: any) => a.status === 'ASSIGNED').length,
        maintenanceAssets: assets.filter((a: any) => a.status === 'MAINTENANCE').length,
        totalRequests: requests.length,
        pendingRequests: requests.filter((r: any) => r.status === 'PENDING').length,
        approvedRequests: requests.filter((r: any) => r.status === 'APPROVED').length,
        completedRequests: requests.filter((r: any) => r.status === 'COMPLETED').length,
        totalTickets: tickets.length,
        openTickets: tickets.filter((t: any) => t.status === 'OPEN').length,
        resolvedTickets: tickets.filter((t: any) => t.status === 'RESOLVED').length,
        upcomingBookings: bookingsCount
    }

    return { employee, assets, requests, tickets, stats }
}

async function EmployeeDashboard() {
    const currentEmployee = await getCurrentEmployee()

    if (!currentEmployee) {
        redirect('/portal/login')
    }

    const { employee: employeeData, assets, requests, tickets, stats } = await getEmployeeDashboardData(currentEmployee.id)

    if (!employeeData) {
        return <div className="text-center py-12 text-red-600">لم يتم العثور على بيانات الموظف</div>
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-[2rem] shadow-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-8 text-white transition-all duration-500">
                <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5" />
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/20 dark:bg-white/10 blur-3xl" />

                <div className="relative">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                                <User className="h-10 w-10" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black mb-2 text-white">مرحباً، {employeeData?.name}! 👋</h1>
                                <p className="text-lg text-blue-50 dark:text-blue-100 mb-1">{employeeData?.jobTitle || 'موظف'}</p>
                                <p className="text-sm text-blue-100 dark:text-blue-200">{employeeData?.department?.name || 'غير محدد'}</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <Badge variant="secondary" className="bg-white/20 backdrop-blur-xl text-white border-0 mb-2">
                                <Clock className="h-4 w-4 ml-2" />
                                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </Badge>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex gap-6 mt-6">
                        {employeeData?.email && (
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-blue-200" />
                                <span>{employeeData.email}</span>
                            </div>
                        )}
                        {employeeData?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-blue-200" />
                                <span>{employeeData.phone}</span>
                            </div>
                        )}
                        {employeeData?.department?.name && (
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-blue-200" />
                                <span>{employeeData.department.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Announcements */}
            <PortalAnnouncements />

            {/* Quick Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/portal/my-assets">
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950/20">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-blue-700 shadow-lg">
                                    <Monitor className="h-6 w-6 text-white" />
                                </div>
                                {stats.maintenanceAssets > 0 && (
                                    <Badge variant="destructive" className="animate-pulse">
                                        {stats.maintenanceAssets} صيانة
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">العهدة المسجلة</p>
                                <h3 className="text-3xl font-black mb-2">{stats.totalAssets}</h3>
                                <p className="text-xs text-muted-foreground">{stats.activeAssets} نشط • {stats.maintenanceAssets} صيانة</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/portal/requests">
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-emerald-600 shadow-lg">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                {stats.pendingRequests > 0 && (
                                    <Badge variant="secondary">
                                        {stats.pendingRequests} معلق
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">طلباتي</p>
                                <h3 className="text-3xl font-black mb-2">{stats.totalRequests}</h3>
                                <p className="text-xs text-muted-foreground">{stats.completedRequests} مكتمل • {stats.pendingRequests} معلق</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/portal/support">
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-amber-600 shadow-lg">
                                    <LifeBuoy className="h-6 w-6 text-white" />
                                </div>
                                {stats.openTickets > 0 && (
                                    <Badge variant="secondary">
                                        {stats.openTickets} مفتوح
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">تذاكر الدعم</p>
                                <h3 className="text-3xl font-black mb-2">{stats.totalTickets}</h3>
                                <p className="text-xs text-muted-foreground">{stats.resolvedTickets} محلول • {stats.openTickets} مفتوح</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/portal/learning">
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-purple-600 shadow-lg">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-0">
                                    جديد
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">المركز التعليمي</p>
                                <h3 className="text-2xl font-black mb-2">دورات وشروحات</h3>
                                <p className="text-xs text-muted-foreground">تصفح الدورات التدريبية المتاحة</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-2xl bg-indigo-600 shadow-lg">
                                <Award className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">معدل الإنجاز</p>
                            <h3 className="text-3xl font-black mb-2">
                                {stats.totalRequests > 0 ? Math.round((stats.completedRequests / stats.totalRequests) * 100) : 0}%
                            </h3>
                            <p className="text-xs text-muted-foreground">من إجمالي الطلبات</p>
                        </div>
                    </CardContent>
                </Card>


                {/* New Card 6: Meeting Rooms */}
                <Link href="/portal/bookings">
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-rose-600 shadow-lg">
                                    <CalendarCheck className="h-6 w-6 text-white" />
                                </div>
                                {stats.upcomingBookings > 0 && (
                                    <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border-0">
                                        {stats.upcomingBookings} قادم
                                    </Badge>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">حجوزات الغرف</p>
                                <h3 className="text-3xl font-black mb-2">{stats.upcomingBookings}</h3>
                                <p className="text-xs text-muted-foreground">غرف الاجتماعات المحجوزة</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* New Card 7: My Devices */}
                <Link href="/portal/my-devices">
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/20 dark:to-sky-950/20">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-cyan-600 shadow-lg">
                                    <Smartphone className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">أجهزتي</p>
                                <h3 className="text-2xl font-black mb-2">إدارة الأجهزة</h3>
                                <p className="text-xs text-muted-foreground">صحة الاجهزة والربط</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* New Card 8: Knowledge Base */}
                <Link href="/portal/knowledge">
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/20 dark:to-green-950/20">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-2xl bg-lime-600 shadow-lg">
                                    <Book className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">قاعدة المعرفة</p>
                                <h3 className="text-2xl font-black mb-2">الأدلة والسياسات</h3>
                                <p className="text-xs text-muted-foreground">تصفح المقالات والشروحات</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Service Catalog */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-6 w-6 text-yellow-600" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">الخدمات السريعة</h2>
                </div>
                <ServiceCatalog />
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Requests */}
                <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-600" />
                            آخر الطلبات
                        </CardTitle>
                        <CardDescription>أحدث 5 طلبات</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {requests.length > 0 ? (
                            <div className="space-y-3">
                                {requests.slice(0, 5).map((request: any) => (
                                    <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                            <ClipboardList className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm">
                                                {request.type === 'HARDWARE' ? '🖥️ جهاز' :
                                                    request.type === 'SOFTWARE' ? '💿 برنامج' :
                                                        request.type === 'INK' ? '🖨️ حبر' :
                                                            request.type === 'PAPER' ? '📄 ورق' : '📦 أخرى'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>
                                        <Badge className={cn(
                                            request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                request.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    request.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-100 text-red-700'
                                        )}>
                                            {request.status === 'PENDING' ? 'معلق' :
                                                request.status === 'APPROVED' ? 'موافق' :
                                                    request.status === 'COMPLETED' ? 'مكتمل' :
                                                        request.status === 'REJECTED' ? 'مرفوض' : request.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">لا توجد طلبات حالياً</p>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Tickets */}
                <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                        <CardTitle className="flex items-center gap-2">
                            <LifeBuoy className="h-5 w-5 text-amber-600" />
                            آخر التذاكر
                        </CardTitle>
                        <CardDescription>أحدث 5 تذاكر دعم</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {tickets.length > 0 ? (
                            <div className="space-y-3">
                                {tickets.slice(0, 5).map((ticket: any) => (
                                    <div key={ticket.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                            <LifeBuoy className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">{ticket.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>
                                        <Badge variant={ticket.status === 'OPEN' ? 'destructive' : ticket.status === 'RESOLVED' ? 'default' : 'secondary'}>
                                            {ticket.status === 'OPEN' ? 'مفتوح' :
                                                ticket.status === 'IN_PROGRESS' ? 'جاري' :
                                                    ticket.status === 'RESOLVED' ? 'محلول' : ticket.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">لا توجد تذاكر حالياً</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* My Assets Preview */}
            {
                assets.length > 0 && (
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Monitor className="h-5 w-5 text-blue-700" />
                                        عهدتي المسجلة
                                    </CardTitle>
                                    <CardDescription>الأصول المخصصة لي</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Link href="/portal/my-assets/audit">
                                        <Button variant="secondary" size="sm" className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">
                                            <CheckCircle2 className="h-4 w-4 ml-2" />
                                            جرد العهدة
                                        </Button>
                                    </Link>
                                    <Link href="/portal/my-assets">
                                        <Badge variant="outline" className="cursor-pointer hover:bg-blue-100 h-9 px-4 flex items-center">
                                            عرض الكل ←
                                        </Badge>
                                    </Link>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {assets.slice(0, 3).map((asset: any) => (
                                    <Card key={asset.id} className="border hover:shadow-lg transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                                                    <Monitor className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{asset.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{asset.type}</p>
                                                    <Badge variant="outline" className="mt-2 text-xs">{asset.tag}</Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )
            }
        </div >
    )
}

export default function PortalDashboardPage() {
    return (
        <Suspense fallback={<div className="text-center py-12">جاري التحميل...</div>}>
            <EmployeeDashboard />
        </Suspense>
    )
}
