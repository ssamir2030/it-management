'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAuditStats } from '@/app/actions/admin-audit'
import { CheckCircle2, XCircle, AlertTriangle, Clock, Search, Download, ScanLine, FileBarChart, ShieldCheck, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export default function AdminAuditPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')

    useEffect(() => {
        async function load() {
            setLoading(true)
            const res = await getAuditStats()
            setData(res)
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return <div className="p-8 text-center">جاري تحميل تقارير الجرد...</div>

    const filteredList = data?.list.filter((item: any) =>
        item.asset.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.asset.tag.toLowerCase().includes(filter.toLowerCase()) ||
        item.asset.employee?.name.toLowerCase().includes(filter.toLowerCase())
    ) || []

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'VERIFIED': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> تم التحقق</Badge>
            case 'MISSING': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> مفقود</Badge>
            case 'DAMAGED': return <Badge variant="destructive" className="bg-orange-500"><AlertTriangle className="w-3 h-3 mr-1" /> تالف</Badge>
            default: return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> لم يتم الجرد</Badge>
        }
    }

    const handleExport = () => {
        if (!data?.list) return

        const headers = ['اسم الأصل', 'Tag', 'الموظف', 'البريد الإلكتروني', 'الحالة', 'تاريخ التدقيق', 'الملاحظات']

        const escape = (text: string) => {
            if (!text) return '""'
            return `"${text.toString().replace(/"/g, '""')}"`
        }

        const rows = data.list.map((item: any) => {
            const statusMap: Record<string, string> = {
                'VERIFIED': 'تم التحقق',
                'MISSING': 'مفقود',
                'DAMAGED': 'تالف',
                'PENDING': 'لم يتم الجرد'
            }

            return [
                escape(item.asset.name),
                escape(item.asset.tag),
                escape(item.asset.employee?.name || '-'),
                escape(item.asset.employee?.email || '-'),
                escape(statusMap[item.status] || 'لم يتم الجرد'),
                escape(item.lastAudit ? format(new Date(item.lastAudit.auditDate), 'r-MM-dd') : '-'),
                escape(item.lastAudit?.notes || '-')
            ].join(',')
        })

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `audit-report-${format(new Date(), 'yyyy-MM-dd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="content-spacing py-6 animate-fade-in" dir="rtl">
            <PremiumPageHeader
                title="تقارير الجرد الذاتي"
                description="متابعة حالة جرد الأصول لدى الموظفين والتحقق من الوجود"
                icon={ScanLine}
                rightContent={
                    <Button onClick={handleExport} variant="outline" className="gap-2 bg-white/10 hover:bg-white/20 border-white/20 text-white">
                        <Download className="h-4 w-4" />
                        تصدير التقرير الكامل
                    </Button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="card-elevated border-t-2 border-t-primary/40">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">إجمالي الأصول</CardTitle>
                        <ShieldCheck className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{data?.stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1">الأصول الخاضعة للجرد</p>
                    </CardContent>
                </Card>
                <Card className="card-elevated border-t-2 border-t-green-500/40">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">تم التحقق</CardTitle>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-green-700 dark:text-green-400">{data?.stats.verified}</div>
                        <p className="text-xs text-muted-foreground mt-1">حالة سليمة ومؤكدة</p>
                    </CardContent>
                </Card>
                <Card className="card-elevated border-t-2 border-t-red-500/40">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">مفقود / تالف</CardTitle>
                        <XCircle className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-red-700 dark:text-red-400">{data?.stats.missing + data?.stats.damaged}</div>
                        <p className="text-xs text-muted-foreground mt-1">تطلب تدخل فني فوري</p>
                    </CardContent>
                </Card>
                <Card className="card-elevated border-t-2 border-t-yellow-500/40">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">بانتظار الجرد</CardTitle>
                        <Clock className="h-5 w-5 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-yellow-700 dark:text-yellow-400">{data?.stats.pending}</div>
                        <p className="text-xs text-muted-foreground mt-1">لم يتم تحديث حالتها</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="card-elevated overflow-hidden border-none shadow-xl">
                <CardHeader className="bg-gradient-to-l from-muted/50 to-transparent border-b">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <FileBarChart className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl font-bold">سجل الجرد المكتمل</CardTitle>
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="بحث عن أصل، سريال، أو موظف..."
                                className="pr-10 h-10 bg-background/50 border-muted/60 focus:border-primary/50"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="text-right py-4 font-bold">الأصل البرمجي</TableHead>
                                    <TableHead className="text-right py-4 font-bold">الموظف المسؤول</TableHead>
                                    <TableHead className="text-center py-4 font-bold">الحالة الحالية</TableHead>
                                    <TableHead className="text-right py-4 font-bold">تاريخ التدقيق</TableHead>
                                    <TableHead className="text-right py-4 font-bold max-w-xs">ملاحظات الفحص</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                            لا توجد سجلات تطابق بحثك...
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredList.map((item: any) => (
                                        <TableRow key={item.asset.id} className="hover:bg-muted/20 transition-colors">
                                            <TableCell>
                                                <div className="font-bold text-foreground">{item.asset.name}</div>
                                                <div className="text-xs font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded w-fit mt-1">{item.asset.tag}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-black text-primary border border-primary/20">
                                                        {item.asset.employee?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm leading-none">{item.asset.employee?.name}</div>
                                                        <div className="text-xs text-muted-foreground mt-1">{item.asset.employee?.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getStatusBadge(item.status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-foreground/80">
                                                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {item.lastAudit ? format(new Date(item.lastAudit.auditDate), 'dd MMM yyyy', { locale: ar }) : '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-xs text-sm text-muted-foreground leading-relaxed">
                                                {item.lastAudit?.notes || (<span className="text-muted-foreground/40 italic">لا توجد ملاحظات</span>)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
