export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { getLicenses } from '@/app/actions/licenses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Key, Calendar, Loader2, Users, Monitor } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

async function LicensesList() {
    const { success, data: licenses } = await getLicenses()

    if (!success || !licenses) {
        return <div className="text-red-500 text-center py-10">فشل في جلب بيانات التراخيص</div>
    }

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader>
                <CardTitle>قائمة التراخيص</CardTitle>
                <CardDescription>عرض حالة الرخص وتواريخ الانتهاء</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">اسم البرنامج</TableHead>
                            <TableHead className="text-right">النوع</TableHead>
                            <TableHead className="text-right">المورد</TableHead>
                            <TableHead className="text-center">إجمالي المقاعد</TableHead>
                            <TableHead className="text-center">المستخدم (أجهزة)</TableHead>
                            <TableHead className="text-center">المستخدم (موظفين)</TableHead>
                            <TableHead className="text-center">المتاح</TableHead>
                            <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                            <TableHead className="text-right">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {licenses.map((license) => {
                            const isExpired = license.expiryDate && new Date(license.expiryDate) < new Date()
                            const isExpiringSoon = license.expiryDate && new Date(license.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            const usedCount = (license._count.assets || 0) + (license._count.employees || 0)
                            const available = license.seats - usedCount

                            return (
                                <TableRow key={license.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Key className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p>{license.name}</p>
                                                {license.key && <p className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">{license.key}</p>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={
                                            license.type === 'SUBSCRIPTION' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                license.type === 'PERPETUAL' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                        }>
                                            {license.type === 'SUBSCRIPTION' ? 'اشتراك' :
                                                license.type === 'PERPETUAL' ? 'دائم' : 'مجاني'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{license.supplier?.name || '-'}</TableCell>
                                    <TableCell className="text-center font-bold">{license.seats}</TableCell>
                                    <TableCell className="text-center">
                                        {license._count.assets > 0 ? (
                                            <Badge variant="secondary" className="gap-1">
                                                <Monitor className="h-3 w-3" />
                                                {license._count.assets}
                                            </Badge>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {license._count.employees > 0 ? (
                                            <Badge variant="secondary" className="gap-1">
                                                <Users className="h-3 w-3" />
                                                {license._count.employees}
                                            </Badge>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`font-bold ${available <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            {available}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {license.expiryDate ? (
                                            <Badge variant={isExpired ? "destructive" : isExpiringSoon ? "secondary" : "outline"} className={isExpiringSoon && !isExpired ? "bg-amber-100 text-amber-800 border-amber-200" : ""}>
                                                <Calendar className="mr-1 h-3 w-3" />
                                                {format(new Date(license.expiryDate), 'dd/MM/yyyy')}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/licenses/${license.id}`}>
                                            <Button variant="ghost" size="sm">التفاصيل</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {licenses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-3">
                                        <Key className="h-10 w-10 opacity-20" />
                                        <p>لا توجد تراخيص مسجلة في النظام</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function LicensesPage() {
    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="إدارة التراخيص والاشتراكات"
                description="تتبع تراخيص البرمجيات، المفاتيح، وتواريخ التجديد"
                icon={Key}
                rightContent={
                    <Link href="/admin/licenses/new">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            إضافة رخصة جديدة
                        </Button>
                    </Link>
                }
            />
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-muted-foreground" /></div>}>
                <LicensesList />
            </Suspense>
        </div>
    )
}

