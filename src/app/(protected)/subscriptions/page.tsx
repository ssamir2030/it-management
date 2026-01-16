export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { getSubscriptions, getSubscriptionStats, deleteSubscription } from "@/app/actions/subscriptions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, CreditCard, TrendingUp, AlertTriangle, Calendar, Package } from "lucide-react"
import Link from "next/link"

export default async function SubscriptionsPage() {
    const { data: subscriptions } = await getSubscriptions()
    const { data: stats } = await getSubscriptionStats()

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <Badge variant="default" className="bg-green-500">نشط</Badge>
            case 'EXPIRING_SOON': return <Badge variant="default" className="bg-orange-500">ينتهي قريباً</Badge>
            case 'EXPIRED': return <Badge variant="destructive">منتهي</Badge>
            case 'CANCELLED': return <Badge variant="outline">ملغي</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            'HOSTING': 'استضافة',
            'SAAS': 'برمجيات كخدمة',
            'CLOUD': 'سحابي',
            'EMAIL': 'بريد إلكتروني',
            'DOMAIN': 'نطاق',
            'OTHER': 'أخرى'
        }
        return labels[category] || category
    }

    const getBillingCycleLabel = (cycle: string) => {
        return cycle === 'MONTHLY' ? 'شهري' : 'سنوي'
    }

    return (
        <div className="w-full py-6 space-y-6">
            <PremiumPageHeader
                title="اشتراكات البرامج والإستضافة"
                description="إدارة ومتابعة الاشتراكات والخدمات المدفوعة"
                icon={Package}
                rightContent={
                    <Link href="/subscriptions/new">
                        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            <Plus className="h-4 w-4" />
                            اشتراك جديد
                        </Button>
                    </Link>
                }
                stats={[
                    { label: "إجمالي الاشتراكات", value: stats?.total || 0, icon: CreditCard },
                    { label: "التكلفة الشهرية", value: `${stats?.monthlyCost || 0} ر.س`, icon: TrendingUp },
                    { label: "تنبيهات (ينتهي قريباً)", value: stats?.expiringSoon || 0, icon: AlertTriangle },
                    { label: "الاشتراكات الشهرية", value: stats?.monthly || 0, icon: Calendar },
                ]}
            />

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>جميع الاشتراكات</CardTitle>
                    <CardDescription>
                        عرض {subscriptions?.length || 0} اشتراك
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الاسم</TableHead>
                                <TableHead>المزود</TableHead>
                                <TableHead>الفئة</TableHead>
                                <TableHead>تاريخ التجديد</TableHead>
                                <TableHead>التكلفة</TableHead>
                                <TableHead>دورة الدفع</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead className="text-left">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subscriptions?.map((sub: any) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="font-medium">{sub.name}</TableCell>
                                    <TableCell>{sub.provider || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{getCategoryLabel(sub.category)}</Badge>
                                    </TableCell>
                                    <TableCell>{new Date(sub.renewalDate).toLocaleDateString('ar-EG')}</TableCell>
                                    <TableCell>{sub.cost} ر.س</TableCell>
                                    <TableCell>{getBillingCycleLabel(sub.billingCycle)}</TableCell>
                                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                                    <TableCell className="text-left">
                                        <Link href={`/subscriptions/${sub.id}`}>
                                            <Button variant="ghost" size="sm">عرض</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!subscriptions || subscriptions.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                        لا توجد اشتراكات مسجلة
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

