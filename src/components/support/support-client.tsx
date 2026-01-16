'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Plus, Search, Ticket, Edit, AlertCircle, CheckCircle2, Clock,
    Filter, Trash2, CheckSquare, MoreHorizontal, User, ShieldAlert, BrainCircuit
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { TicketStats } from "@/components/support/ticket-stats"
import { Pagination } from "@/components/ui/pagination"

// New Premium Components
import { FilterSheet, FilterSection } from "@/components/ui/data-table/filter-sheet"
import { SelectionBar } from "@/components/ui/data-table/selection-bar"

interface TicketType {
    id: string
    title: string
    description: string
    status: string
    priority: string
    assignedTo: { name: string | null } | null
    createdBy: { name: string | null }
    createdAt: Date
    category: string
    messages: { content: string; createdAt: Date }[]
    _count: { messages: number }
}

interface SupportClientProps {
    tickets: TicketType[]
}

export function SupportClient({ tickets }: SupportClientProps) {
    const router = useRouter()

    // -- State --
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        status: "all",
        priority: "all"
    })

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Selection State
    const [selectedTickets, setSelectedTickets] = useState<string[]>([])

    // -- Derived State (Filtering) --
    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const matchesSearch =
                (ticket.title && ticket.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (ticket.description && ticket.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (ticket.id && ticket.id.includes(searchQuery)) ||
                (ticket.createdBy.name && ticket.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesStatus = filters.status === "all" || ticket.status === filters.status
            const matchesPriority = filters.priority === "all" || ticket.priority === filters.priority

            return matchesSearch && matchesStatus && matchesPriority
        })
    }, [tickets, searchQuery, filters])

    // -- Pagination Logic --
    const paginatedTickets = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredTickets.slice(startIndex, startIndex + pageSize)
    }, [filteredTickets, currentPage, pageSize])

    const totalPages = Math.ceil(filteredTickets.length / pageSize)

    // -- Selection Logic --
    const toggleSelectAll = () => {
        if (selectedTickets.length === paginatedTickets.length) {
            setSelectedTickets([])
        } else {
            setSelectedTickets(paginatedTickets.map(t => t.id))
        }
    }

    const toggleSelectTicket = (id: string) => {
        if (selectedTickets.includes(id)) {
            setSelectedTickets(selectedTickets.filter(t => t !== id))
        } else {
            setSelectedTickets([...selectedTickets, id])
        }
    }

    // -- Actions --
    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedTickets.length} تذكرة؟`)) return

        const { deleteTicket } = await import("@/app/actions/support")
        for (const id of selectedTickets) {
            await deleteTicket(id)
        }

        setSelectedTickets([])
        router.refresh()
    }

    // -- Helpers --
    const getPriorityBadge = (priority: string) => {
        const styles = {
            CRITICAL: "bg-red-100 text-red-800 border-red-200",
            HIGH: "bg-orange-100 text-orange-800 border-orange-200",
            MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
            LOW: "bg-green-100 text-green-800 border-green-200"
        }
        const labels = {
            CRITICAL: "حـرج",
            HIGH: "عـالـي",
            MEDIUM: "متوسط",
            LOW: "منخفض"
        }
        return (
            <Badge variant="outline" className={`${styles[priority as keyof typeof styles]} border font-bold`}>
                {labels[priority as keyof typeof labels] || priority}
            </Badge>
        )
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            OPEN: "bg-blue-100 text-blue-800",
            IN_PROGRESS: "bg-purple-100 text-purple-800",
            RESOLVED: "bg-green-100 text-green-800",
            CLOSED: "bg-gray-100 text-gray-800"
        }
        const labels = {
            OPEN: "مفتوح",
            IN_PROGRESS: "جاري العمل",
            RESOLVED: "تم الحل",
            CLOSED: "مغلق"
        }
        return (
            <Badge variant="secondary" className={styles[status as keyof typeof styles]}>
                {labels[status as keyof typeof labels] || status}
            </Badge>
        )
    }

    // Stats calculation
    const stats = useMemo(() => ({
        total: tickets.length,
        open: tickets.filter(t => t.status === 'OPEN').length,
        resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
        critical: tickets.filter(t => t.priority === 'CRITICAL').length
    }), [tickets])

    const activeFiltersCount = (filters.status !== 'all' ? 1 : 0) + (filters.priority !== 'all' ? 1 : 0)

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            {/* 1. Header */}
            <PremiumPageHeader
                title="الدعم الفني"
                description="إدارة التذاكر وطلبات الدعم"
                icon={Ticket}
                rightContent={
                    <Link href="/support/new">
                        <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                            <Plus className="h-4 w-4" />
                            تذكرة جديدة
                        </Button>
                    </Link>
                }
            />

            {/* 2. Stats */}
            <div className="animate-slide-up stagger-1 mb-8">
                <TicketStats
                    totalTickets={stats.total}
                    openTickets={stats.open}
                    resolvedTickets={stats.resolved}
                    criticalTickets={stats.critical}
                />
            </div>

            {/* 3. Controls & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up stagger-2">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث في التذاكر..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="pr-10 h-11 bg-card shadow-sm border-muted/60 focus:border-primary/50 text-base"
                    />
                </div>

                <FilterSheet
                    activeFiltersCount={activeFiltersCount}
                    onReset={() => setFilters({ status: 'all', priority: 'all' })}
                    title="تصفية التذاكر"
                    description="تخصيص القائمة حسب الحالة أو الأولوية"
                >
                    <FilterSection title="الحالة">
                        <Select
                            value={filters.status}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="OPEN">مفتوح</SelectItem>
                                <SelectItem value="IN_PROGRESS">جاري العمل</SelectItem>
                                <SelectItem value="RESOLVED">تم الحل</SelectItem>
                                <SelectItem value="CLOSED">مغلق</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterSection>

                    <FilterSection title="الأولوية">
                        <Select
                            value={filters.priority}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, priority: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر الأولوية" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="CRITICAL">حرج</SelectItem>
                                <SelectItem value="HIGH">عالي</SelectItem>
                                <SelectItem value="MEDIUM">متوسط</SelectItem>
                                <SelectItem value="LOW">منخفض</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterSection>
                </FilterSheet>
            </div>

            {/* 4. Data Table */}
            <div className="card-elevated overflow-hidden animate-slide-up stagger-3">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[50px] py-4">
                                    <Checkbox
                                        checked={paginatedTickets.length > 0 && selectedTickets.length === paginatedTickets.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="w-[100px] text-right font-semibold">رقم التذكرة</TableHead>
                                <TableHead className="text-right font-semibold">الموضوع</TableHead>
                                <TableHead className="text-right font-semibold">الأولوية</TableHead>
                                <TableHead className="text-right font-semibold">الحالة</TableHead>
                                <TableHead className="text-right font-semibold">المسؤول</TableHead>
                                <TableHead className="text-right font-semibold">مقدم الطلب</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="p-4 rounded-full bg-muted/50">
                                                <Ticket className="h-8 w-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium">لا توجد تذاكر</p>
                                            <Button
                                                variant="link"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setFilters({ status: 'all', priority: 'all' })
                                                }}
                                            >
                                                مسح الفلاتر
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedTickets.map((ticket) => (
                                    <TableRow key={ticket.id} className="group hover:bg-muted/40 transition-colors">
                                        <TableCell className="py-4">
                                            <Checkbox
                                                checked={selectedTickets.includes(ticket.id)}
                                                onCheckedChange={() => toggleSelectTicket(ticket.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            #{ticket.id.slice(-6)}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <Link href={`/support/${ticket.id}`} className="hover:text-primary transition-colors">
                                                {ticket.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {getPriorityBadge(ticket.priority)}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(ticket.status)}
                                        </TableCell>
                                        <TableCell>
                                            {ticket.assignedTo ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                        {ticket.assignedTo.name?.charAt(0)}
                                                    </div>
                                                    <span className="text-sm">{ticket.assignedTo.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground italic">غير مسند</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{ticket.createdBy.name}</span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/support/${ticket.id}`} className="flex items-center">
                                                            <Ticket className="mr-2 h-4 w-4 ml-2" />
                                                            عرض التفاصيل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-purple-600 focus:text-purple-600" onClick={async () => {
                                                        const { toast } = await import("sonner")
                                                        const { AIService } = await import("@/lib/ai/ai-service")

                                                        toast.promise(AIService.analyzeTicket(ticket.description || ticket.title), {
                                                            loading: 'جارٍ تحليل التذكرة بواسطة الذكاء الاصطناعي...',
                                                            success: (data) => {
                                                                return (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="font-bold flex items-center gap-2">
                                                                            <BrainCircuit className="h-4 w-4 text-purple-600" />
                                                                            اقتراح الذكاء الاصطناعي ({(data.confidence * 100).toFixed(0)}%)
                                                                        </div>
                                                                        <div className="text-sm">{data.suggestion}</div>
                                                                    </div>
                                                                )
                                                            },
                                                            error: 'حدث خطأ أثناء التحليل'
                                                        })
                                                    }}>
                                                        <BrainCircuit className="mr-2 h-4 w-4 ml-2" />
                                                        اسأل الذكاء الاصطناعي
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={async () => {
                                                        if (confirm('تأكيد الحذف؟')) {
                                                            const { deleteTicket } = await import("@/app/actions/support")
                                                            await deleteTicket(ticket.id)
                                                            router.refresh()
                                                        }
                                                    }}>
                                                        <Trash2 className="mr-2 h-4 w-4 ml-2" />
                                                        حذف
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t bg-muted/10">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredTickets.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size)
                            setCurrentPage(1)
                        }}
                    />
                </div>
            </div>

            {/* 5. Floating Action Bar */}
            <SelectionBar
                selectedCount={selectedTickets.length}
                totalCount={filteredTickets.length}
                onClearSelection={() => setSelectedTickets([])}
                actions={[
                    {
                        label: "حذف المحدد",
                        icon: Trash2,
                        onClick: handleBulkDelete,
                        variant: "destructive"
                    }
                ]}
            />
        </div>
    )
}
