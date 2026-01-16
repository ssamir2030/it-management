'use client'
import { useState } from 'react'
import { Users, UserPlus, LogIn, LogOut, Search, Building2, Phone, Clock, BadgeCheck, X, FileSpreadsheet, Trash2, Edit, MoreHorizontal, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { registerVisitor, checkOutVisitor, deleteVisit } from '@/app/actions/visitors'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Visit { id: string; status: string; checkIn: Date | string | null; checkOut: Date | string | null; purpose: string | null; badgeNumber: string | null; visitor: { id: string; name: string; company: string | null; phone: string | null }; host: { id: string; name: string } | null }
interface VisitorClientProps { initialVisits: Visit[]; activeVisits: Visit[] }

export function VisitorClient({ initialVisits, activeVisits }: VisitorClientProps) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', purpose: '', identityType: 'NATIONAL_ID', identityNo: '' })
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const handleDelete = async () => {
        if (!deleteId) return
        const result = await deleteVisit(deleteId)
        if (result.success) { toast.success('تم حذف الزيارة'); setDeleteId(null); router.refresh() } else toast.error(result.error)
    }

    const filteredVisits = initialVisits.filter(v => v.visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.visitor.company?.toLowerCase().includes(searchQuery.toLowerCase()))

    const handleRegister = async () => {
        if (!formData.name) { toast.error('يرجى إدخال اسم الزائر'); return }
        setIsRegistering(true)
        const result = await registerVisitor(formData)
        if (result.success) { toast.success(`تم تسجيل الزائر برقم: ${result.data?.visit.badgeNumber}`); setFormData({ name: '', email: '', phone: '', company: '', purpose: '', identityType: 'NATIONAL_ID', identityNo: '' }); router.refresh() }
        else toast.error(result.error)
        setIsRegistering(false)
    }

    const handleCheckOut = async (visitId: string) => {
        const result = await checkOutVisitor(visitId)
        if (result.success) { toast.success('تم تسجيل الخروج'); router.refresh() } else toast.error(result.error)
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = { ACTIVE: 'bg-green-100 text-green-700', COMPLETED: 'bg-gray-100 text-gray-700', PLANNED: 'bg-blue-100 text-blue-700' }
        const labels: Record<string, string> = { ACTIVE: 'داخل المبنى', COMPLETED: 'غادر', PLANNED: 'مخطط' }
        return <Badge className={styles[status]}>{labels[status] || status}</Badge>
    }

    return (
        <div className="w-full content-spacing py-6" dir="rtl">
            <PremiumPageHeader title="إدارة الزوار" description="تسجيل دخول وخروج الزوار" icon={Users} rightContent={
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={async () => {
                        const { generateReportData } = await import('@/app/actions/reports')
                        const { exportToExcel } = await import('@/lib/export-utils')
                        const res = await generateReportData('VISITS')
                        if (res.success && res.data) {
                            await exportToExcel({ title: 'سجل الزوار', fileName: `visitors-${Date.now()}`, data: res.data, columns: res.columns.map((c: any) => ({ header: c.label, key: c.key, width: 20 })) })
                            toast.success('تم تصدير التقرير')
                        } else toast.error('فشل التصدير')
                    }}>
                        <FileSpreadsheet className="h-4 w-4" />
                        تصدير Excel
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                تسجيل زائر
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 gap-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
                            <DialogTitle className="sr-only">تسجيل زائر جديد</DialogTitle>
                            <DialogDescription className="sr-only">إدخال بيانات الزائر وتصريح الدخول</DialogDescription>
                            <div className="w-full h-full overflow-y-auto">
                                <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-6">
                                    <PremiumPageHeader
                                        title="تسجيل زائر جديد"
                                        description="إدخال بيانات الزائر وتصريح الدخول"
                                        icon={UserPlus}
                                        rightContent={
                                            <DialogClose asChild>
                                                <Button variant="ghost" size="lg" className="text-muted-foreground hover:bg-slate-200/50 gap-2">
                                                    <X className="h-4 w-4" />
                                                    إغلاق
                                                </Button>
                                            </DialogClose>
                                        }
                                    />
                                    <Card className="card-elevated border-t-4 border-t-primary/20">
                                        <CardHeader>
                                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                                <BadgeCheck className="h-5 w-5 text-primary" />
                                                بيانات الزيارة
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Auto Date/Time Display */}
                                            <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">تاريخ ووقت الزيارة</p>
                                                        <p className="text-lg font-bold" dir="ltr">
                                                            {format(new Date(), "dd/MM/yyyy - HH:mm", { locale: ar })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    تسجيل تلقائي
                                                </Badge>
                                            </div>
                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-base">الاسم الكامل *</Label>
                                                    <Input
                                                        className="h-12"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="اسم الزائر الرباعي"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-base">رقم الجوال</Label>
                                                    <Input
                                                        className="h-12"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="05xxxxxxxx"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-base">الجهة / الشركة</Label>
                                                    <Input
                                                        className="h-12"
                                                        value={formData.company}
                                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                        placeholder="اسم الشركة أو الجهة"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-base">رقم الهوية / الإقامة</Label>
                                                    <Input
                                                        className="h-12"
                                                        value={formData.identityNo}
                                                        onChange={(e) => setFormData({ ...formData, identityNo: e.target.value })}
                                                        placeholder="رقم الهوية الوطنية أو الإقامة"
                                                    />
                                                </div>
                                                <div className="col-span-full space-y-2">
                                                    <Label className="text-base">غرض الزيارة</Label>
                                                    <Input
                                                        className="h-12"
                                                        value={formData.purpose}
                                                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                                        placeholder="سبب الزيارة أو اسم الموظف المستضيف"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                                                <DialogClose asChild>
                                                    <Button variant="outline" size="lg">إلغاء</Button>
                                                </DialogClose>
                                                <Button onClick={handleRegister} disabled={isRegistering} size="lg" className="min-w-[120px]">
                                                    {isRegistering ? 'جاري التسجيل...' : 'تسجيل الدخول'}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            } />
            <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-green-500/20 rounded-xl"><LogIn className="h-6 w-6 text-green-600" /></div><div><p className="text-sm text-muted-foreground">داخل المبنى</p><p className="text-3xl font-bold text-green-600">{activeVisits.length}</p></div></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-blue-500/20 rounded-xl"><Users className="h-6 w-6 text-blue-600" /></div><div><p className="text-sm text-muted-foreground">زيارات اليوم</p><p className="text-3xl font-bold">{initialVisits.filter(v => v.checkIn && new Date(v.checkIn).toDateString() === new Date().toDateString()).length}</p></div></div></CardContent></Card>
                <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-purple-500/20 rounded-xl"><BadgeCheck className="h-6 w-6 text-purple-600" /></div><div><p className="text-sm text-muted-foreground">إجمالي الزيارات</p><p className="text-3xl font-bold">{initialVisits.length}</p></div></div></CardContent></Card>
            </div>
            {activeVisits.length > 0 && <Card className="mb-6 border-green-200 bg-green-50/50"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><LogIn className="h-5 w-5 text-green-600" />الزوار داخل المبنى ({activeVisits.length})</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-3">{activeVisits.map(v => <div key={v.id} className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm border"><div><p className="font-medium">{v.visitor.name}</p><p className="text-xs text-muted-foreground">{v.badgeNumber}</p></div><Button size="sm" variant="outline" onClick={() => handleCheckOut(v.id)}><LogOut className="h-4 w-4 ml-1" />خروج</Button></div>)}</div></CardContent></Card>}
            <div className="flex gap-4 mb-6"><div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10" /></div></div>
            <Card><Table><TableHeader><TableRow><TableHead>رقم التصريح</TableHead><TableHead>الزائر</TableHead><TableHead>الشركة</TableHead><TableHead>سبب الزيارة</TableHead><TableHead>وقت الدخول</TableHead><TableHead>الحالة</TableHead><TableHead className="w-[100px]">إجراءات</TableHead></TableRow></TableHeader><TableBody>
                {filteredVisits.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-12">لا توجد زيارات</TableCell></TableRow> : filteredVisits.map(v => (
                    <TableRow key={v.id}>
                        <TableCell><Badge variant="outline" className="font-mono">{v.badgeNumber}</Badge></TableCell>
                        <TableCell>
                            <div>
                                <p className="font-medium">{v.visitor.name}</p>
                                {v.visitor.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{v.visitor.phone}</p>}
                            </div>
                        </TableCell>
                        <TableCell>{v.visitor.company && <span className="flex items-center gap-1"><Building2 className="h-4 w-4 text-muted-foreground" />{v.visitor.company}</span>}</TableCell>
                        <TableCell>{v.purpose || '-'}</TableCell>
                        <TableCell>{v.checkIn && <span className="flex items-center gap-1 text-sm"><Clock className="h-4 w-4" />{format(new Date(v.checkIn), 'HH:mm - dd/MM', { locale: ar })}</span>}</TableCell>
                        <TableCell>{getStatusBadge(v.status)}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {v.status === 'ACTIVE' && (
                                    <Button size="sm" variant="outline" onClick={() => handleCheckOut(v.id)}>
                                        <LogOut className="h-4 w-4 ml-1" />خروج
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/visitors/${v.id}`} className="flex items-center cursor-pointer">
                                                <Edit className="ml-2 h-4 w-4" />
                                                تعديل
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteId(v.id)}>
                                            <Trash2 className="ml-2 h-4 w-4" />
                                            حذف
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody></Table></Card>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            حذف الزيارة
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذفه نهائياً من قاعدة البيانات.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">حذف نهائي</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
