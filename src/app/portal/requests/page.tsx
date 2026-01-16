export const dynamic = 'force-dynamic';

import { getCurrentEmployee } from "@/app/actions/employee-portal"
import { redirect } from "next/navigation"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { FileText, Clock, CheckCircle, ArrowRight, Wrench, Box, Printer } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function RequestsPage() {
    const employee = await getCurrentEmployee()
    if (!employee) redirect("/portal/login")

    // Filter out SUPPORT requests
    const requests = employee.requests ? employee.requests.filter(r => r.type !== 'SUPPORT') : []

    const getIcon = (type: string) => {
        switch (type) {
            case 'MAINTENANCE': return <Wrench className="h-5 w-5 text-orange-500" />
            case 'HARDWARE': return <Box className="h-5 w-5 text-purple-500" />
            case 'CONSUMABLE': return <Printer className="h-5 w-5 text-green-500" />
            default: return <FileText className="h-5 w-5 text-muted-foreground" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">قيد الانتظار</Badge>
            case 'IN_PROGRESS': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">قيد التنفيذ</Badge>
            case 'COMPLETED': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">مكتمل</Badge>
            case 'REJECTED': return <Badge variant="destructive">مرفوض</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const getTypeText = (type: string) => {
        switch (type) {
            case 'MAINTENANCE': return 'طلب صيانة'
            case 'HARDWARE': return 'طلب قطعة'
            case 'CONSUMABLE': return 'طلب أحبار/أوراق'
            case 'SOFTWARE': return 'طلب برامج'
            case 'ACCESS': return 'طلب صلاحيات'
            case 'VPN': return 'طلب دخول عبر خدمة VPN'
            case 'ERP': return 'دعم نظام ERP'
            case 'WIFI': return 'طلب شبكة WiFi'
            default: return 'طلب عام'
        }
    }


    return (
        <div className="space-y-8">
            <PremiumPageHeader
                title="طلباتي"
                description="متابعة حالة طلبات الأجهزة والمواد الاستهلاكية"
                icon={FileText}
                stats={[
                    { label: "إجمالي الطلبات", value: requests.length, icon: FileText },
                    { label: "قيد الانتظار", value: requests.filter(r => r.status === 'PENDING').length, icon: Clock },
                    { label: "مكتمل", value: requests.filter(r => r.status === 'COMPLETED').length, icon: CheckCircle },
                ]}
                rightContent={
                    <Link href="/portal/dashboard">
                        <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                            <ArrowRight className="h-4 w-4" />
                            العودة للرئيسية
                        </Button>
                    </Link>
                }
            />

            {requests.length === 0 ? (
                <Card className="py-12 text-center dark:bg-slate-800 dark:border-slate-700">
                    <CardContent className="text-muted-foreground dark:text-slate-400">
                        لم تقم بتقديم أي طلبات بعد
                    </CardContent>
                </Card>
            ) : (
                requests.map((req) => (
                    <Link href={`/portal/requests/${req.id}`} key={req.id}>
                        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border-l-4 border-l-transparent hover:border-l-purple-500 dark:bg-slate-800 dark:border-slate-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-gray-50 rounded-full group-hover:bg-purple-50 transition-colors dark:bg-slate-900 dark:group-hover:bg-slate-900">
                                            {getIcon(req.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg dark:text-gray-200">{getTypeText(req.type)}</h3>
                                                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-gray-100 rounded-full dark:bg-slate-700">
                                                    {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground mt-1 line-clamp-1 dark:text-slate-400">{req.details}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(req.status)}
                                        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-purple-600 transition-colors" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))
            )}
        </div>
    )
}
