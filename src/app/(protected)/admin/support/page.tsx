'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Headset } from "lucide-react"
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
import { MoreHorizontal, CheckCircle, Clock, AlertCircle, XCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { RequestsFilter, FilterValues } from "@/components/requests/requests-filter"
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

interface SupportRequest {
    id: string
    type: string
    status: string
    subject: string | null
    details: string | null
    createdAt: Date
    priority: string
    employee: {
        name: string
        email: string
        phone: string | null
        department: {
            name: string
        } | null
    }
}

import { TicketBoard } from "@/components/kanban/ticket-board"
import { LayoutGrid, List as ListIcon } from "lucide-react"

export default function SupportRequestsPage() {
    const [requests, setRequests] = useState<SupportRequest[]>([])
    const [filteredRequests, setFilteredRequests] = useState<SupportRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list')

    useEffect(() => {
        fetchRequests()
    }, [])

    async function fetchRequests() {
        try {
            const response = await fetch('/api/support-requests')
            const data = await response.json()
            if (data.success) {
                setRequests(data.data)
                setFilteredRequests(data.data)
            }
        } catch (error) {
            console.error('Error fetching support requests:', error)
        } finally {
            setLoading(false)
        }
    }

    function handleFilterChange(filters: FilterValues) {
        let filtered = [...requests]

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(req =>
                req.subject?.toLowerCase().includes(searchLower) ||
                req.details?.toLowerCase().includes(searchLower) ||
                req.employee.name.toLowerCase().includes(searchLower)
            )
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(req => req.status === filters.status)
        }

        // Priority filter
        if (filters.priority !== 'all') {
            filtered = filtered.filter(req => req.priority === filters.priority)
        }

        // Sorting
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
                case 'status':
                    return a.status.localeCompare(b.status)
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
                // تحديث القائمة محلياً
                setRequests(prev => prev.filter(r => r.id !== requestId))
                setFilteredRequests(prev => prev.filter(r => r.id !== requestId))
            } else {
                toast.error(result.error || "فشل حذف الطلب")
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الحذف")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <Badge className="bg-yellow-600">قيد الانتظار</Badge>
            case 'IN_PROGRESS': return <Badge className="bg-blue-500">جاري العمل</Badge>
            case 'COMPLETED': return <Badge className="bg-green-500">مكتمل</Badge>
            case 'REJECTED': return <Badge className="bg-red-600">مرفوض</Badge>
            case 'CANCELLED': return <Badge className="bg-gray-600">ملغي</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'URGENT': return <Badge variant="destructive">عاجل</Badge>
            case 'HIGH': return <Badge className="bg-orange-500">مهم</Badge>
            case 'NORMAL': return <Badge variant="secondary">عادي</Badge>
            case 'LOW': return <Badge variant="outline">منخفض</Badge>
            default: return <Badge variant="outline">{priority}</Badge>
        }
    }

    return (
        <div className="w-full py-6 space-y-6 min-h-screen">
            <PremiumPageHeader
                title="طلبات الدعم الفني"
                description="جميع طلبات الدعم الفني الواردة من الموظفين"
                icon={Headset}
                stats={[
                    { label: "إجمالي الطلبات", value: requests.length, icon: AlertCircle },
                    { label: "قيد الانتظار", value: requests.filter(r => r.status === 'PENDING').length, icon: Clock, color: "text-amber-300" },
                    { label: "جاري العمل", value: requests.filter(r => r.status === 'IN_PROGRESS').length, icon: Headset, color: "text-blue-300" },
                    { label: "مكتمل", value: requests.filter(r => r.status === 'COMPLETED').length, icon: CheckCircle, color: "text-emerald-300" },
                ]}
                rightContent={
                    <div className="flex items-center bg-slate-100 rounded-lg p-1 border">
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => setViewMode('list')}
                        >
                            <ListIcon className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only">قائمة</span>
                        </Button>
                        <Button
                            variant={viewMode === 'board' ? 'default' : 'ghost'}
                            size="sm"
                            className="h-8 gap-2"
                            onClick={() => setViewMode('board')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only">لوحة</span>
                        </Button>
                    </div>
                }
            />

            <RequestsFilter
                onFilterChange={handleFilterChange}
                totalCount={requests.length}
                filteredCount={filteredRequests.length}
                hideTypeFilter={true}
            />

            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-muted-foreground mt-4">جاري تحميل البيانات...</p>
                </div>
            ) : viewMode === 'list' ? (
                <Card className="dark:bg-slate-900/40">
                    <CardHeader>
                        <CardTitle>جميع طلبات الدعم الفني</CardTitle>
                        <CardDescription>
                            عرض {filteredRequests.length} طلب
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الموظف</TableHead>
                                    <TableHead>الموضوع</TableHead>
                                    <TableHead>التفاصيل</TableHead>
                                    <TableHead>الأولوية</TableHead>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead className="text-left">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((request) => (
                                    <TableRow key={request.id} className="group !bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <TableCell>
                                            <div className="font-medium">{request.employee.name}</div>
                                            <div className="text-xs text-muted-foreground">{request.employee.department?.name}</div>
                                            <div className="text-xs text-muted-foreground">{request.employee.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{request.subject || 'بدون عنوان'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[300px] truncate text-sm text-muted-foreground">
                                                {request.details}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getPriorityBadge(request.priority)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {new Date(request.createdAt).toLocaleDateString('ar-EG')}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(request.createdAt).toLocaleTimeString('ar-EG')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(request.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/requests/${request.id}`}>
                                                    <Button variant="secondary" size="icon" className="h-8 w-8 hover:bg-primary hover:text-primary-foreground transition-colors" title="عرض التفاصيل">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </Link>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>هل أنت متأكد من حذف هذا الطلب؟</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                لا يمكن التراجع عن هذا الإجراء. سيتم حذف الطلب وجميع البيانات المرتبطة به نهائياً.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(request.id)} className="bg-red-600 hover:bg-red-700">
                                                                حذف
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredRequests.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            {requests.length === 0 ? 'لا توجد طلبات دعم فني' : 'لا توجد نتائج تطابق البحث'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ) : (
                <div className="min-h-[600px]">
                    <TicketBoard requests={filteredRequests} />
                </div>
            )}
        </div>
    )
}
