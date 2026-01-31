'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import {
    Inbox,
    Wrench,
    Laptop,
    Box,
    Printer,
    MoreHorizontal,
    CheckCircle,
    Clock,
    FileText,
    Trash2,
    ShoppingCart,
    LayoutList,
    Archive,
    AlertCircle,
    Eye
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { RequestsFilter, FilterValues } from "@/components/requests/requests-filter"
import { SLAIndicator } from "@/components/requests/sla-indicator"
import { RequestsTableSkeleton } from "@/components/requests/requests-skeleton"
import { deleteRequest } from "@/app/actions/requests"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Request {
    id: string
    type: string
    status: string
    subject: string | null
    details: string | null
    createdAt: Date
    priority: string
    expectedCompletionDate: Date | null
    employee: {
        name: string
        department: {
            name: string
        } | null
    }
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<Request[]>([])
    const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRequests()
    }, [])

    async function fetchRequests() {
        try {
            const response = await fetch('/api/requests')
            const data = await response.json()
            if (data.success) {
                setRequests(data.data)
                setFilteredRequests(data.data)
            }
        } catch (error) {
            console.error('Error fetching requests:', error)
        } finally {
            setLoading(false)
        }
    }

    function handleFilterChange(filters: FilterValues) {
        let filtered = [...requests]

        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(req =>
                req.subject?.toLowerCase().includes(searchLower) ||
                req.details?.toLowerCase().includes(searchLower) ||
                req.employee.name.toLowerCase().includes(searchLower) ||
                req.type.toLowerCase().includes(searchLower)
            )
        }

        if (filters.status !== 'all') {
            filtered = filtered.filter(req => req.status === filters.status)
        }

        if (filters.type !== 'all') {
            filtered = filtered.filter(req => req.type === filters.type)
        }

        if (filters.priority !== 'all') {
            filtered = filtered.filter(req => req.priority === filters.priority)
        }

        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                case 'priority':
                    const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3 }
                    return (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) -
                        (priorityOrder[b.priority as keyof typeof priorityOrder] || 4)
                default:
                    return 0
            }
        })

        setFilteredRequests(filtered)
    }

    async function handleDelete(requestId: string) {
        try {
            const result = await deleteRequest(requestId)
            if (result.success) {
                toast.success("تم حذف الطلب بنجاح")
                setRequests(prev => prev.filter(r => r.id !== requestId))
                setFilteredRequests(prev => prev.filter(r => r.id !== requestId))
            } else {
                toast.error(result.error || "فشل حذف الطلب")
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الحذف")
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'MAINTENANCE': return <Wrench className="h-4 w-4 text-amber-500" />
            case 'SUPPORT': return <Laptop className="h-4 w-4 text-blue-500" />
            case 'HARDWARE': return <Box className="h-4 w-4 text-indigo-500" />
            case 'CONSUMABLE': return <Printer className="h-4 w-4 text-emerald-500" />
            default: return <FileText className="h-4 w-4 text-muted-foreground" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50">إنتظار تقني</Badge>
            case 'NEEDS_PURCHASE': return <Badge variant="outline" className="text-teal-700 border-teal-200 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800/50 font-black">يطلب شراء 🛒</Badge>
            case 'IN_PROGRESS': return <Badge variant="default" className="bg-blue-600">جاري التنفيذ</Badge>
            case 'COMPLETED': return <Badge variant="default" className="bg-emerald-600">مكتمل</Badge>
            case 'REJECTED': return <Badge variant="destructive">مرفوض</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const getTypeText = (type: string) => {
        switch (type) {
            case 'MAINTENANCE': return 'صيانة'
            case 'SUPPORT': return 'دعم فني'
            case 'HARDWARE': return 'قطع غيار'
            case 'CONSUMABLE': return 'أحبار/أوراق'
            default: return 'أخرى'
        }
    }

    // Tab-specific filters
    const actionableRequests = filteredRequests.filter(r => ['PENDING', 'IN_PROGRESS'].includes(r.status))
    const procurementRequests = filteredRequests.filter(r => r.status === 'NEEDS_PURCHASE')
    const archivedRequests = filteredRequests.filter(r => ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status))

    const RequestsTable = ({ data, emptyMessage }: { data: Request[], emptyMessage: string }) => (
        <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900 border-y-2">
                <TableRow>
                    <TableHead className="w-[80px] text-center"></TableHead>
                    <TableHead className="font-black text-slate-900 dark:text-slate-100">الموظف / القسم</TableHead>
                    <TableHead className="font-black text-slate-900 dark:text-slate-100">نوع الطلب</TableHead>
                    <TableHead className="font-black text-slate-900 dark:text-slate-100 w-[350px]">التفاصيل</TableHead>
                    <TableHead className="font-black text-slate-900 dark:text-slate-100">الحالة</TableHead>
                    <TableHead className="text-end font-black text-slate-900 dark:text-slate-100">الإجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length > 0 ? data.map((request) => (
                    <TableRow key={request.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all border-b dark:border-slate-800/50">
                        <TableCell className="w-[80px] text-center">
                            <div className="flex justify-center">
                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
                                    {getIcon(request.type)}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="font-black text-slate-900 dark:text-slate-100">{request.employee.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{request.employee.department?.name || 'بدون قسم'}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="font-black border-2 border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/40 px-3">
                                {getTypeText(request.type)}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="max-w-[350px] space-y-1">
                                <div className="font-black text-slate-700 dark:text-slate-200 truncate">{request.subject}</div>
                                <div className="text-xs text-slate-400 line-clamp-1 italic">
                                    {request.details ? request.details.replace(/:::DATA:::[\s\S]*?:::END_DATA:::/g, '').replace(/<!-- DATA: .*? -->/g, '').replace(/<!-- USER_NOTES_START -->/g, '').trim() : ''}
                                </div>
                                <SLAIndicator
                                    expectedCompletionDate={request.expectedCompletionDate}
                                    status={request.status}
                                    priority={request.priority}
                                />
                            </div>
                        </TableCell>
                        <TableCell>
                            {getStatusBadge(request.status)}
                        </TableCell>
                        <TableCell className="text-end">
                            <div className="flex justify-end gap-2">
                                <Link href={`/requests/${request.id}`}>
                                    <Button variant="outline" size="sm" className="bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 border-2 font-black rounded-xl transition-all">
                                        <Eye className="h-4 w-4 ml-2" />
                                        فتح
                                    </Button>
                                </Link>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="font-arabic" dir="rtl">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>هل أنت متأكد من حذف الطلب؟</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                هذا الإجراء سيقوم بحذف الطلب نهائياً من النظام.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-2">
                                            <AlertDialogCancel className="font-black">إلغاء</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(request.id)} className="bg-red-600 hover:bg-red-700 font-black">حذف نهائي</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-40 text-center text-slate-400 font-bold italic">
                            {emptyMessage}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )

    return (
        <div className="w-full py-8 space-y-8 min-h-screen" dir="rtl">
            <PremiumPageHeader
                title="إدارة طلبات الموظفين"
                description="نظام إدارة ومتابعة الطلبات الذكي للمؤسسات"
                icon={Inbox}
                stats={[
                    { label: "قيد الانتظار", value: requests.filter(r => r.status === 'PENDING').length, icon: Clock, color: "text-amber-400" },
                    { label: "تحت الشراء", value: requests.filter(r => r.status === 'NEEDS_PURCHASE').length, icon: ShoppingCart, color: "text-teal-400" },
                    { label: "جاري التنفيذ", value: requests.filter(r => r.status === 'IN_PROGRESS').length, icon: Wrench, color: "text-blue-400" },
                    { label: "مكتمل", value: requests.filter(r => r.status === 'COMPLETED').length, icon: CheckCircle, color: "text-emerald-400" },
                ]}
            />

            <Tabs defaultValue="actionable" className="w-full space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-[2rem] border dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <TabsList className="grid grid-cols-3 w-full md:w-[650px] h-[60px] bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border-2 dark:border-white/10">
                        <TabsTrigger value="actionable" className="rounded-xl font-black text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white gap-3 transition-all duration-300">
                            <LayoutList className="h-5 w-5" />
                            المهام التقنية
                            <Badge variant="secondary" className="bg-white/20 text-white border-0 h-6 px-2 font-black">
                                {requests.filter(r => ['PENDING', 'IN_PROGRESS'].includes(r.status)).length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="procurement" className="rounded-xl font-black text-sm data-[state=active]:bg-teal-600 data-[state=active]:text-white gap-3 transition-all duration-300">
                            <ShoppingCart className="h-5 w-5" />
                            تحت الشراء
                            <Badge variant="secondary" className="bg-white/20 text-white border-0 h-6 px-2 font-black">
                                {requests.filter(r => r.status === 'NEEDS_PURCHASE').length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="archive" className="rounded-xl font-black text-sm data-[state=active]:bg-slate-800 data-[state=active]:text-white gap-3 transition-all duration-300">
                            <Archive className="h-5 w-5" />
                            الأرشيف
                        </TabsTrigger>
                    </TabsList>

                    <RequestsFilter
                        onFilterChange={handleFilterChange}
                        totalCount={requests.length}
                        filteredCount={filteredRequests.length}
                    />
                </div>

                <TabsContent value="actionable" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-sm border dark:border-slate-800/50">
                        <CardHeader className="bg-gradient-to-r from-blue-700 to-indigo-900 dark:from-blue-900 dark:to-slate-950 p-10 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl font-black mb-2">صندوق العمليات التقنية</CardTitle>
                                    <CardDescription className="text-blue-100 text-lg">الطلبات الجاهزة للتنفيذ المباشر من قبل الفريق الفني</CardDescription>
                                </div>
                                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20">
                                    <Wrench className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <RequestsTableSkeleton /> : <RequestsTable data={actionableRequests} emptyMessage="لا توجد مهام تقنية حالياً." />}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="procurement" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-sm border dark:border-slate-800/50">
                        <CardHeader className="bg-gradient-to-r from-teal-600 to-indigo-700 dark:from-teal-800 dark:to-slate-900 p-10 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl font-black mb-2">عمليات الشراء والتأمين</CardTitle>
                                    <CardDescription className="text-teal-50 text-lg">الأصناف غير المتوفرة التي تم تحويلها للمشتريات</CardDescription>
                                </div>
                                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20">
                                    <ShoppingCart className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <RequestsTableSkeleton /> : <RequestsTable data={procurementRequests} emptyMessage="لا توجد طلبات شراء معلقة." />}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="archive" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-sm border dark:border-slate-800/50">
                        <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-950 dark:from-slate-900 dark:to-black p-10 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl font-black mb-2">أرشيف الطلبات</CardTitle>
                                    <CardDescription className="text-slate-300 text-lg">السجل الكامل للطلبات المكتملة والمرفوضة</CardDescription>
                                </div>
                                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20">
                                    <Archive className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <RequestsTableSkeleton /> : <RequestsTable data={archivedRequests} emptyMessage="الأرشيف فارغ." />}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
