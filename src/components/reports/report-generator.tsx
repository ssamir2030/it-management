'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from "@/components/ui/label"
import { FileDown, Printer, FileSpreadsheet, Loader2, LayoutGrid, List, FileText, Check } from 'lucide-react'
import { toast } from 'sonner'
import { generateReportData, ReportType } from '@/app/actions/reports'
import { exportToExcel, exportToPDF } from '@/lib/export-utils'
import { getCompanyProfile } from '@/app/actions/system'
import { cn } from '@/lib/utils'

const REPORT_Types: { id: ReportType, label: string, description: string }[] = [
    { id: 'INVENTORY', label: 'تقرير الأصول الشامل', description: 'قائمة بجميع الأصول وحالاتها ومواقعها' },
    { id: 'FINANCIAL', label: 'التقرير المالي للإهلاك', description: 'تحليل قيمة الأصول وتكلفة الشراء والإهلاك' },
    { id: 'OPERATIONAL_PLAN', label: 'الخطة التشغيلية', description: 'متابعة المشاريع والميزانيات ونسب الإنجاز' },
    { id: 'MAINTENANCE', label: 'تقرير الصيانة', description: 'سجل تذاكر الصيانة الدورية للأصول' },
    { id: 'TICKETS', label: 'تقرير التذاكر والدعم الفني', description: 'متابعة جميع تذاكر الدعم وحالاتها' },
    { id: 'SLA_BREACHES', label: 'تجاوزات مستوى الخدمة (SLA)', description: 'رصد التذاكر المتأخرة عن الوقت المحدد' },
    { id: 'EMPLOYEES', label: 'تقرير الموظفين', description: 'قائمة الموظفين والأقسام والمناصب' },
    { id: 'EMPLOYEE_ONBOARDING', label: 'تهيئة الموظفين الجدد', description: 'حالة إجراءات استلام العمل للموظفين الجدد' },
    { id: 'CUSTODY_HISTORY', label: 'سجل العهد التاريخي', description: 'تفاصيل تسليم وإرجاع العهد للموظفين' },
    { id: 'PURCHASING', label: 'تقرير المشتريات', description: 'أوامر الشراء والموردين والتكاليف' },
    { id: 'VENDOR_PERFORMANCE', label: 'أداء الموردين', description: 'تحليل حجم التعاملات مع الموردين' },
    { id: 'CONSUMABLES', label: 'مخزون المستهلكات', description: 'الأحبار والأوراق ومستويات المخزون' },
    { id: 'LOW_STOCK', label: 'تنبيهات نقص المخزون', description: 'المواد التي وصلت للحد الأدنى وتحتاج طلب' },
    { id: 'CONSUMABLE_USAGE', label: 'استهلاك الأحبار والأوراق', description: 'تحليل صرف المستهلكات للموظفين والأقسام' },
    { id: 'LICENSES', label: 'تراخيص البرامج', description: 'البرامج وتواريخ الانتهاء والاستخدام' },
    { id: 'VISITS', label: 'سجل الزوار', description: 'حركة الزوار وتفاصيل الدخول والخروج' },
    { id: 'EQUIPMENT_BOOKINGS', label: 'حجوزات المعدات', description: 'سجل استعارة الأجهزة المشتركة' },
    { id: 'ASSET_AUDITS', label: 'تقارير الجرد', description: 'نتائج عمليات جرد الأصول والمطابقة' },
    { id: 'TRAINING', label: 'التدريب والتطوير', description: 'الدورات التدريبية المتاحة في النظام' },
]

export function ReportGenerator() {
    const [selectedReport, setSelectedReport] = useState<ReportType>('INVENTORY')
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const [loading, setLoading] = useState(false)
    const [companyProfile, setCompanyProfile] = useState<any>(null)

    useEffect(() => {
        getCompanyProfile().then(res => {
            if (res.success) {
                setCompanyProfile(res.data)
            }
        })
    }, [])

    async function handleExport(format: 'excel' | 'pdf') {
        setLoading(true)
        try {
            const res = await generateReportData(selectedReport)

            if (!res.success || !res.data) {
                toast.error("فشل في جلب البيانات")
                return
            }

            if (res.data.length === 0) {
                toast.warning("لا توجد بيانات للعرض")
                return
            }

            const reportInfo = REPORT_Types.find(t => t.id === selectedReport)
            const options = {
                title: reportInfo?.label || 'Report',
                subtitle: reportInfo?.description,
                fileName: `report-${selectedReport.toLowerCase()}-${new Date().getTime()}`,
                data: res.data,
                columns: res.columns.map((c: any) => ({ header: c.label, key: c.key, width: 20 })),
                companyProfile
            }

            if (format === 'excel') {
                await exportToExcel(options)
            } else {
                await exportToPDF(options)
            }

            toast.success("تم تصدير التقرير بنجاح")
        } catch (error) {
            console.error(error)
            toast.error("حدث خطأ أثناء التصدير")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">مركز التقارير</h2>
                    <p className="text-muted-foreground">توليد وتصدير تقارير النظام بصيغ متعددة</p>
                </div>
                <div className="flex bg-muted p-1 rounded-lg">
                    <Button
                        variant={view === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('grid')}
                        className="px-3"
                    >
                        <LayoutGrid className="h-4 w-4 ml-2" />
                        شبكة
                    </Button>
                    <Button
                        variant={view === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setView('list')}
                        className="px-3"
                    >
                        <List className="h-4 w-4 ml-2" />
                        قائمة
                    </Button>
                </div>
            </div>

            {view === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {REPORT_Types.map((type) => (
                        <Card
                            key={type.id}
                            className={cn(
                                "cursor-pointer transition-all hover:shadow-md border-2",
                                selectedReport === type.id ? "border-primary bg-primary/5" : "border-transparent hover:border-slate-200"
                            )}
                            onClick={() => setSelectedReport(type.id)}
                        >
                            <CardHeader className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "p-2 rounded-lg w-fit",
                                        selectedReport === type.id ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                    )}>
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    {selectedReport === type.id && (
                                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}
                                </div>
                                <CardTitle className="text-base pt-2">{type.label}</CardTitle>
                                <CardDescription className="text-xs line-clamp-2">
                                    {type.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        {REPORT_Types.map((type, index) => (
                            <div
                                key={type.id}
                                onClick={() => setSelectedReport(type.id)}
                                className={cn(
                                    "flex items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                                    selectedReport === type.id ? "bg-primary/5" : "",
                                    index !== REPORT_Types.length - 1 ? "border-b" : ""
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg ml-4",
                                    selectedReport === type.id ? "bg-primary text-primary-foreground" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                )}>
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <h4 className={cn("font-medium", selectedReport === type.id ? "text-primary" : "")}>
                                        {type.label}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{type.description}</p>
                                </div>
                                {selectedReport === type.id && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card className="border-t-4 border-t-primary">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">تصدير التقرير المحدد</h3>
                                <p className="text-sm text-muted-foreground">
                                    {REPORT_Types.find(t => t.id === selectedReport)?.label}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none gap-2"
                                onClick={() => handleExport('excel')}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 text-green-600" />}
                                تصدير Excel
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 sm:flex-none gap-2"
                                onClick={() => handleExport('pdf')}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4 text-red-600" />}
                                تصدير PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
