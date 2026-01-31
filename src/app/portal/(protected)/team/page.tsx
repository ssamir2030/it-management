'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Users, Briefcase, FileSignature, Monitor, Clock, ChevronRight, AlertTriangle } from 'lucide-react'
import { getTeamOverview } from '@/app/actions/manager'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

export default function ManagerDashboard() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        async function load() {
            try {
                const res = await getTeamOverview()
                if (res.success) {
                    setData(res.data)
                } else {
                    setError(res.error || "خطأ غير معروف")
                }
            } catch (err) {
                setError("فشل الاتصال بالخادم")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <div className="p-12 text-center text-muted-foreground">جاري تحميل بيانات الفريق...</div>

    const HeroHeader = () => (
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800 p-8 text-white transition-all duration-500 mb-8">
            <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5" />
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/20 dark:bg-white/10 blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black mb-2 text-white">لوحة تحكم المدير</h1>
                        <p className="text-lg text-blue-100 dark:text-blue-200">نظرة عامة على فريق العمل والطلبات</p>
                    </div>
                </div>

                <Button
                    variant="secondary"
                    onClick={() => router.push('/portal')}
                    className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm gap-2"
                >
                    <ChevronRight className="h-4 w-4" />
                    العودة للرئيسية
                </Button>
            </div>
        </div>
    )

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8" dir="rtl">
                <HeroHeader />
                <div className="flex flex-col items-center justify-center p-12 text-red-500 bg-red-50 rounded-xl mt-8 border border-red-100">
                    <AlertTriangle className="h-12 w-12 mb-4" />
                    <h3 className="text-xl font-bold">فشل في تحميل البيانات</h3>
                    <p className="mt-2 text-slate-700">{error}</p>
                </div>
            </div>
        )
    }

    if (!data) return null;

    if (data.team.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8" dir="rtl">
                <HeroHeader />
                <Card className="mt-8 border-dashed shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Users className="h-12 w-12 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">لا يوجد موظفين تابعين لك</h3>
                        <p className="text-slate-500 max-w-md mx-auto text-lg">
                            يبدو أنك لست مسجلاً كمدير لأي موظف حالياً. يرجى التواصل مع إدارة النظام إذا كان هذا خطأ.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900" dir="rtl">
            <div className="container mx-auto px-4 py-8 space-y-8">
                <HeroHeader />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">عدد الموظفين</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.stats.totalEmployees}</div>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">أصول الفريق</CardTitle>
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.stats.totalAssets}</div>
                        </CardContent>
                    </Card>
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">طلبات معلقة</CardTitle>
                            <FileSignature className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{data.stats.pendingRequestsCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Requests Section */}
                {data.pendingRequests.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50/50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                طلبات بانتظار المراجعة
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {data.pendingRequests.map((req: any) => (
                                <div key={req.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{req.employee.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-bold text-sm">{req.employee.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(req.createdAt), 'dd MMM yyyy', { locale: ar })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 px-8">
                                        <div className="font-medium">{req.type}</div>
                                        <div className="text-sm text-muted-foreground truncate">{req.subject || 'بدون عنوان'}</div>
                                    </div>
                                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                                        قيد الانتظار
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Team Members List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">فريق العمل</CardTitle>
                        <CardDescription>قائمة الموظفين والأصول المسجلة بعهدتهم</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {data.team.map((member: any) => (
                            <div key={member.id} className="flex flex-col md:flex-row gap-6 p-4 rounded-xl border hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4 md:w-1/4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {member.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-bold">{member.name}</h4>
                                        <p className="text-sm text-muted-foreground">{member.jobTitle || 'موظف'}</p>
                                    </div>
                                </div>

                                <div className="md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg border text-sm">
                                        <div className="font-semibold mb-2 flex items-center gap-2 text-slate-600">
                                            <Monitor className="h-3 w-3" />
                                            الأصول ({member.assets.length})
                                        </div>
                                        {member.assets.length > 0 ? (
                                            <div className="space-y-1">
                                                {member.assets.map((asset: any) => (
                                                    <div key={asset.id} className="flex justify-between items-center text-xs">
                                                        <span>{asset.name}</span>
                                                        <span className="text-muted-foreground font-mono">{asset.tag}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">لا يوجد أصول</p>
                                        )}
                                    </div>

                                    <div className="bg-white p-3 rounded-lg border text-sm">
                                        <div className="font-semibold mb-2 flex items-center gap-2 text-slate-600">
                                            <FileSignature className="h-3 w-3" />
                                            آخر الطلبات
                                        </div>
                                        {member.requests.length > 0 ? (
                                            <div className="space-y-1">
                                                {member.requests.slice(0, 3).map((req: any) => (
                                                    <div key={req.id} className="flex justify-between items-center text-xs">
                                                        <span>{req.type}</span>
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1">{req.status}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">لا يوجد طلبات حديثة</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
