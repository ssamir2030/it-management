'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    FileText, FileCheck, FileClock, Plus, Search,
    Download, Trash2, MoreHorizontal, Edit, Filter
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Pagination } from "@/components/ui/pagination"
import { FilterSheet, FilterSection } from "@/components/ui/data-table/filter-sheet"
import { SelectionBar } from "@/components/ui/data-table/selection-bar"
import { toast } from "sonner"

// Placeholder type
interface Document {
    id: string
    title: string
    type: string
    date: string
    amount: number
    status: string
}

interface DocumentClientProps {
    initialDocuments: Document[]
}

export function DocumentClient({ initialDocuments }: DocumentClientProps) {
    const router = useRouter()

    // -- State --
    const [documents, setDocuments] = useState(initialDocuments)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        type: "all",
        status: "all",
        year: "all"
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedDocs, setSelectedDocs] = useState<string[]>([])

    // -- Derived --
    const availableYears = useMemo(() => {
        const years = new Set(documents.map(d => {
            // Extract year from date string (e.g. "٢٠/١٢/٢٠٢٤") or use current year if conversion fails
            // Since we use ar-EG, the digits might be Arabic or standard. 
            // Better to rely on parsing it roughly or check the format.
            // Assuming the date string format is standard or similar to 'DD/MM/YYYY'
            const dateStr = d.date
            const parts = dateStr.includes('/') ? dateStr.split('/') : []
            if (parts.length === 3) return parts[2] // parts[2] is likely the year
            // Fallback: try to match standard digits if ar-EG uses them, or Arabic digits
            return new Date().getFullYear().toString()
        }))
        return Array.from(years).sort().reverse()
    }, [documents])

    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesType = filters.type === "all" || doc.type === filters.type
            const matchesStatus = filters.status === "all" || doc.status === filters.status

            // Year Match
            let matchesYear = true
            if (filters.year !== "all") {
                const parts = doc.date.split('/')
                const docYear = parts.length === 3 ? parts[2] : ''
                matchesYear = docYear === filters.year
            }

            return matchesSearch && matchesType && matchesStatus && matchesYear
        })
    }, [documents, searchQuery, filters])

    // -- Pagination --
    const paginatedDocs = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredDocs.slice(startIndex, startIndex + pageSize)
    }, [filteredDocs, currentPage, pageSize])

    const totalPages = Math.ceil(filteredDocs.length / pageSize)

    // -- Selection --
    const toggleSelectAll = () => {
        if (selectedDocs.length === paginatedDocs.length) {
            setSelectedDocs([])
        } else {
            setSelectedDocs(paginatedDocs.map(d => d.id))
        }
    }

    const toggleSelectDoc = (id: string) => {
        if (selectedDocs.includes(id)) {
            setSelectedDocs(selectedDocs.filter(d => d !== id))
        } else {
            setSelectedDocs([...selectedDocs, id])
        }
    }

    // -- Actions --
    const handleBulkDelete = () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedDocs.length} مستندات؟`)) return
        toast.success(`تم حذف ${selectedDocs.length} مستندات`)
        setDocuments(documents.filter(d => !selectedDocs.includes(d.id)))
        setSelectedDocs([])
    }

    // -- Stats --
    const stats = useMemo(() => ([
        { label: "إجمالي المستندات", value: documents.length, icon: FileText },
        { label: "نشط", value: documents.filter(d => d.status === 'ACTIVE').length, icon: FileCheck },
        { label: "إجمالي المبالغ", value: documents.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('ar-EG') + ' ر.س', icon: FileClock },
    ]), [documents])

    const activeFiltersCount = (filters.type !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0) + (filters.year !== 'all' ? 1 : 0)

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            <PremiumPageHeader
                title="إدارة المستندات"
                description="مستندات عروض الأسعار، الفواتير، العقود وغيرها من الوثائق المتعلقة بتقنية المعلومات"
                icon={FileText}
                rightContent={
                    <Link href="/documents/new">
                        <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                            <Plus className="h-4 w-4" />
                            إضافة مستند جديد
                        </Button>
                    </Link>
                }
                stats={stats}
            />

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-8 animate-slide-up stagger-2">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث في المستندات..."
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
                    onReset={() => setFilters({ status: 'all', type: 'all', year: 'all' })}
                    title="تصفية المستندات"
                    description="تخصيص القائمة حسب النوع أو الحالة أو السنة"
                >
                    <FilterSection title="النوع">
                        <Select
                            value={filters.type}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر النوع" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="QUOTATION">عرض سعر</SelectItem>
                                <SelectItem value="INVOICE">فاتورة</SelectItem>
                                <SelectItem value="CONTRACT">عقد</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterSection>

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
                                <SelectItem value="ACTIVE">نشط</SelectItem>
                                <SelectItem value="ARCHIVED">مؤرشف</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterSection>

                    <FilterSection title="السنة">
                        <Select
                            value={filters.year}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, year: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر السنة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                {availableYears.map(year => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterSection>
                </FilterSheet>
            </div>

            {/* Table */}
            <div className="card-elevated overflow-hidden animate-slide-up stagger-3">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[50px] py-4">
                                    <Checkbox
                                        checked={paginatedDocs.length > 0 && selectedDocs.length === paginatedDocs.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-right font-semibold">العنوان</TableHead>
                                <TableHead className="text-right font-semibold">النوع</TableHead>
                                <TableHead className="text-right font-semibold">التاريخ</TableHead>
                                <TableHead className="text-right font-semibold">المبلغ</TableHead>
                                <TableHead className="text-right font-semibold">الحالة</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedDocs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <FileText className="h-16 w-16 opacity-20 mb-4" />
                                            <p className="text-xl font-semibold">لا توجد مستندات</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedDocs.map((doc) => (
                                    <TableRow key={doc.id} className="group hover:bg-muted/40 transition-colors">
                                        <TableCell className="py-4">
                                            <Checkbox
                                                checked={selectedDocs.includes(doc.id)}
                                                onCheckedChange={() => toggleSelectDoc(doc.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <span>{doc.title}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{doc.type}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm font-mono cursor-default">{doc.date}</TableCell>
                                        <TableCell className="font-semibold text-primary">{doc.amount.toLocaleString('ar-EG')} ر.س</TableCell>
                                        <TableCell>
                                            <Badge variant={doc.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                {doc.status}
                                            </Badge>
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
                                                        <Link href={`/documents/${doc.id}/edit`} className="flex items-center">
                                                            <Edit className="mr-2 h-4 w-4 ml-2" />
                                                            تعديل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/documents/${doc.id}`} className="flex items-center">
                                                            <FileText className="mr-2 h-4 w-4 ml-2" />
                                                            تفاصيل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="flex items-center">
                                                        <Download className="mr-2 h-4 w-4 ml-2" />
                                                        تحميل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => {
                                                            if (confirm('تأكيد الحذف؟')) {
                                                                toast.success('تم الحذف')
                                                                setDocuments(documents.filter(d => d.id !== doc.id))
                                                            }
                                                        }}
                                                    >
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
                        totalItems={filteredDocs.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size)
                            setCurrentPage(1)
                        }}
                    />
                </div>
            </div>

            <SelectionBar
                selectedCount={selectedDocs.length}
                totalCount={filteredDocs.length}
                onClearSelection={() => setSelectedDocs([])}
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
