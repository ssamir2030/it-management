'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Inbox } from "lucide-react"
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
import { Wrench, Laptop, Box, Printer, MoreHorizontal, CheckCircle, Clock, FileText, Trash2 } from "lucide-react"
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

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(req =>
                req.subject?.toLowerCase().includes(searchLower) ||
                req.details?.toLowerCase().includes(searchLower) ||
                req.employee.name.toLowerCase().includes(searchLower) ||
                req.type.toLowerCase().includes(searchLower)
            )
        }

        // Status filter
        if (filters.status !== 'all') {
            filtered = filtered.filter(req => req.status === filters.status)
        }

        // Type filter
        if (filters.type !== 'all') {
            filtered = filtered.filter(req => req.type === filters.type)
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
            case 'PENDING': return <Badge variant="secondary">قيد الانتظار</Badge>
            case 'IN_PROGRESS': return <Badge variant="default" className="bg-blue-600">جاري العمل</Badge>
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
            case 'SOFTWARE': return 'طلب برامج'
            case 'ACCESS': return 'صلاحيات'
            case 'VPN': return 'اتصال VPN'
            case 'ERP': return 'نظام ERP'
            case 'WIFI': return 'شبكة WiFi'
            default: return 'أخرى'
        }
    }

    return (
        <div className="w-full py-6 space-y-6 min-h-screen">
            <PremiumPageHeader
                title="طلبات الموظفين"
                description="إدارة ومتابعة الطلبات الواردة من البوابة"
                icon={Inbox}
                stats={[
                    { label: "إجمالي الطلبات", value: requests.length, icon: FileText },
                    { label: "قيد الانتظار", value: requests.filter(r => r.status === 'PENDING').length, icon: Clock, color: "text-amber-300" },
                    { label: "جاري العمل", value: requests.filter(r => r.status === 'IN_PROGRESS').length, icon: Wrench, color: "text-blue-300" },
                    { label: "مكتمل", value: requests.filter(r => r.status === 'COMPLETED').length, icon: CheckCircle, color: "text-emerald-300" },
                ]}
            />

            <RequestsFilter
                onFilterChange={handleFilterChange}
                totalCount={requests.length}
                filteredCount={filteredRequests.length}
            />

            <Card>
                <CardHeader>
                    <CardTitle>جميع الطلبات</CardTitle>
                    <CardDescription>
                        عرض {filteredRequests.length} طلب
                    </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[500px]">
                    {loading ? (
                        <RequestsTableSkeleton />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead>الموظف</TableHead>
                                    <TableHead>النوع</TableHead>
                                    <TableHead>التفاصيل</TableHead>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>الحالة</TableHead>
                                    <TableHead className="text-left">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((request) => (
                                    <TableRow key={request.id} className="group hover:bg-muted/50 transition-colors">
                                        <TableCell>
                                            <div className="p-2 bg-muted rounded-lg group-hover:bg-white transition-colors">
                                                {getIcon(request.type)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{request.employee.name}</div>
                                            <div className="text-xs text-muted-foreground">{request.employee.department?.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">
                                                {getTypeText(request.type)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[300px] truncate text-sm text-muted-foreground">
                                                {request.subject || request.details}
                                            </div>
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
                                            <div className="flex flex-col gap-1">
                                                {getStatusBadge(request.status)}
                                                <SLAIndicator
                                                    expectedCompletionDate={request.expectedCompletionDate}
                                                    status={request.status}
                                                    priority={request.priority}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/requests/${request.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </Link>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
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
                                            {requests.length === 0 ? 'لا توجد طلبات' : 'لا توجد نتائج تطابق البحث'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
