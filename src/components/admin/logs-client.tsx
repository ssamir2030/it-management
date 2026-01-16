'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { getAuditLogs, AuditLogFilters } from '@/app/actions/audit-log'
import { useDebounce } from '@/hooks/use-debounce'

export function LogsClient() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<AuditLogFilters>({
        page: 1,
        limit: 20,
        action: 'ALL',
        entityType: 'ALL',
        search: ''
    })
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 1
    })

    const debouncedSearch = useDebounce(filters.search, 500)

    useEffect(() => {
        fetchLogs()
    }, [filters.page, filters.action, filters.entityType, debouncedSearch])

    async function fetchLogs() {
        setLoading(true)
        try {
            const res = await getAuditLogs({ ...filters, search: debouncedSearch })
            if (res.success) {
                setLogs(res.data || [])
                if (res.pagination) setPagination(res.pagination)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const getActionColor = (action: string) => {
        if (action.includes('CREATE') || action.includes('ADD')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        if (action.includes('DELETE') || action.includes('REMOVE')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-400'
    }

    return (
        <Card dir="rtl">
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>سجلات النظام</CardTitle>
                        <CardDescription>
                            عرض وتصفية سجلات النظام ({pagination.total})
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={filters.page === 1}
                            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                            صفحة {pagination.page} من {pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={filters.page === pagination.totalPages}
                            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div className="relative">
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث في السجلات..."
                            className="pr-9"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                        />
                    </div>
                    <Select
                        value={filters.action}
                        onValueChange={(val) => setFilters(prev => ({ ...prev, action: val, page: 1 }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="نوع العملية" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">الكل</SelectItem>
                            <SelectItem value="CREATE">إضافة</SelectItem>
                            <SelectItem value="UPDATE">تعديل</SelectItem>
                            <SelectItem value="DELETE">حذف</SelectItem>
                            <SelectItem value="LOGIN">تسجيل دخول</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.entityType}
                        onValueChange={(val) => setFilters(prev => ({ ...prev, entityType: val, page: 1 }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="نوع السجل" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">الكل</SelectItem>
                            <SelectItem value="ASSET">الأصول</SelectItem>
                            <SelectItem value="TICKET">التذاكر</SelectItem>
                            <SelectItem value="EMPLOYEE">الموظفين</SelectItem>
                            <SelectItem value="USER">المستخدمين</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">المستخدم</TableHead>
                                <TableHead className="text-right">العملية</TableHead>
                                <TableHead className="text-right">الهدف</TableHead>
                                <TableHead className="text-right">التفاصيل</TableHead>
                                <TableHead className="text-right">التاريخ</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="h-12 animate-pulse bg-slate-50 dark:bg-slate-900/50" />
                                    </TableRow>
                                ))
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        لا توجد نتائج
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{log.userName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getActionColor(log.action)}>
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{log.entityType}</span>
                                                <span className="text-xs text-muted-foreground">{log.entityName || log.entityId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate">
                                            <span title={log.changes || ''}>{log.changes || '-'}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm" dir="ltr">
                                            {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ar })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
