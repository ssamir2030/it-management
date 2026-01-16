'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Plus, Search, Monitor, Edit, Trash2, Printer,
    Filter, Archive, Download, CheckCircle2,
    MoreHorizontal, User, Tag, Calendar
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { AssetStats } from "@/components/assets/asset-stats"
import { ExportButton } from "@/components/ui/export-button"
import { Pagination } from "@/components/ui/pagination"

// New Premium Components
import { FilterSheet, FilterSection } from "@/components/ui/data-table/filter-sheet"
import { SelectionBar } from "@/components/ui/data-table/selection-bar"

import { exportToExcel, exportToCSV, assetsExportColumns } from "@/lib/export"
import { BulkImportDialog } from "@/components/assets/bulk-import-dialog"

interface Asset {
    id: string
    name: string
    type: string
    tag: string
    serialNumber: string | null
    status: string
    purchaseDate: Date | null
    employee?: {
        name: string
    } | null
}

interface AssetClientProps {
    assets: Asset[]
}

export function AssetClient({ assets }: AssetClientProps) {
    const router = useRouter()

    // -- State --
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        type: "all",
        status: "all"
    })

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Selection State
    const [selectedAssets, setSelectedAssets] = useState<string[]>([])
    const [isExporting, setIsExporting] = useState(false)

    // -- Derived State (Filtering) --
    // Extract unique types for filter
    const uniqueTypes = useMemo(() => {
        return Array.from(new Set(assets.map(a => a.type))).sort()
    }, [assets])

    const filteredAssets = useMemo(() => {
        return assets.filter(asset => {
            const matchesSearch =
                asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                asset.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (asset.employee && asset.employee.name.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesType = filters.type === "all" || asset.type === filters.type
            const matchesStatus = filters.status === "all" || asset.status === filters.status

            return matchesSearch && matchesType && matchesStatus
        })
    }, [assets, searchQuery, filters])

    // -- Pagination Logic --
    const paginatedAssets = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredAssets.slice(startIndex, startIndex + pageSize)
    }, [filteredAssets, currentPage, pageSize])

    const totalPages = Math.ceil(filteredAssets.length / pageSize)

    // -- Selection Logic --
    const toggleSelectAll = () => {
        if (selectedAssets.length === paginatedAssets.length) {
            setSelectedAssets([])
        } else {
            setSelectedAssets(paginatedAssets.map(a => a.id))
        }
    }

    const toggleSelectAsset = (id: string) => {
        if (selectedAssets.includes(id)) {
            setSelectedAssets(selectedAssets.filter(a => a !== id))
        } else {
            setSelectedAssets([...selectedAssets, id])
        }
    }

    // -- Actions --
    const handlePrintLabels = () => {
        if (selectedAssets.length > 0) {
            router.push(`/assets/print-labels?ids=${selectedAssets.join(',')}`)
        }
    }

    const handleExportExcel = async () => {
        try {
            setIsExporting(true)
            const dataToExport = selectedAssets.length > 0
                ? assets.filter(a => selectedAssets.includes(a.id))
                : filteredAssets
            exportToExcel(dataToExport, assetsExportColumns, 'assets-export')
        } finally {
            setIsExporting(false)
        }
    }

    const handleExportCSV = async () => {
        try {
            setIsExporting(true)
            const dataToExport = selectedAssets.length > 0
                ? assets.filter(a => selectedAssets.includes(a.id))
                : filteredAssets
            exportToCSV(dataToExport, assetsExportColumns, 'assets-export')
        } finally {
            setIsExporting(false)
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedAssets.length} أصل؟`)) return

        // In a real app, we'd call a server action here
        const { deleteAsset } = await import("@/app/actions/assets")
        let successCount = 0

        for (const id of selectedAssets) {
            const result = await deleteAsset(id)
            if (result.success) successCount++
        }

        if (successCount > 0) {
            setSelectedAssets([])
            router.refresh()
        }
    }

    // -- Sub Components --
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            AVAILABLE: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
            ASSIGNED: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200",
            MAINTENANCE: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
            BROKEN: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
            RETIRED: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
        }

        const labels: Record<string, string> = {
            AVAILABLE: "متاح",
            ASSIGNED: "مستخدم",
            MAINTENANCE: "صيانة",
            BROKEN: "تالف",
            RETIRED: "متقاعد"
        }

        return (
            <Badge className={styles[status] || "variant-outline"}>
                {labels[status] || status}
            </Badge>
        )
    }

    const stats = useMemo(() => ({
        total: assets.length,
        available: assets.filter(a => a.status === 'AVAILABLE').length,
        assigned: assets.filter(a => a.status === 'ASSIGNED').length,
        maintenance: assets.filter(a => a.status === 'MAINTENANCE').length
    }), [assets])

    const activeFiltersCount = (filters.type !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0)

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            {/* 1. Header */}
            <PremiumPageHeader
                title="الأصول"
                description="إدارة وتتبع الأصول التقنية والعهد"
                icon={Monitor}
                rightContent={
                    <div className="flex items-center gap-3">
                        <BulkImportDialog />
                        <ExportButton
                            onExportExcel={handleExportExcel}
                            onExportCSV={handleExportCSV}
                            isLoading={isExporting}
                        />
                        <Link href="/assets/new">
                            <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                                <Plus className="h-4 w-4" />
                                إضافة أصل جديد
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* 2. Stats */}
            <div className="animate-slide-up stagger-1 mb-8">
                <AssetStats
                    totalAssets={stats.total}
                    availableAssets={stats.available}
                    assignedAssets={stats.assigned}
                    maintenanceAssets={stats.maintenance}
                />
            </div>

            {/* 3. Controls & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up stagger-2">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث عن أصل..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1) // Reset pagination on search
                        }}
                        className="pr-10 h-11 bg-card shadow-sm border-muted/60 focus:border-primary/50 text-base"
                    />
                </div>

                <FilterSheet
                    activeFiltersCount={activeFiltersCount}
                    onReset={() => setFilters({ type: 'all', status: 'all' })}
                    title="تصفية الأصول"
                    description="استخدم خيارات التصفية أدناه لتخصيص عرض القائمة"
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
                                <SelectItem value="AVAILABLE">متاح</SelectItem>
                                <SelectItem value="ASSIGNED">مستخدم</SelectItem>
                                <SelectItem value="MAINTENANCE">صيانة</SelectItem>
                                <SelectItem value="BROKEN">تالف</SelectItem>
                                <SelectItem value="RETIRED">متقاعد</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterSection>

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
                                {uniqueTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
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
                                        checked={paginatedAssets.length > 0 && selectedAssets.length === paginatedAssets.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="min-w-[200px] text-right">الأصل</TableHead>
                                <TableHead className="text-right">Tag</TableHead>
                                <TableHead className="text-right">النوع</TableHead>
                                <TableHead className="text-right">المستخدم</TableHead>
                                <TableHead className="text-right">الحالة</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedAssets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="p-4 rounded-full bg-muted/50">
                                                <Search className="h-8 w-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium">لا توجد نتائج</p>
                                            <p className="text-sm">لم نتمكن من العثور على أي أصول تطابق بحثك.</p>
                                            <Button
                                                variant="link"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setFilters({ type: 'all', status: 'all' })
                                                }}
                                            >
                                                مسح جميع الفلاتر
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedAssets.map((asset) => (
                                    <TableRow key={asset.id} className="group hover:bg-muted/40 transition-colors">
                                        <TableCell className="py-4">
                                            <Checkbox
                                                checked={selectedAssets.includes(asset.id)}
                                                onCheckedChange={() => toggleSelectAsset(asset.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-1">
                                                <Link href={`/assets/${asset.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                                                    {asset.name}
                                                </Link>
                                                <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                                    {asset.serialNumber || 'بدون سيريال'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono text-xs bg-background/50">
                                                {asset.tag}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Monitor className="h-4 w-4 text-muted-foreground" />
                                                <span>{asset.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {asset.employee ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                        {asset.employee.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm truncate max-w-[150px]" title={asset.employee.name}>
                                                        {asset.employee.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(asset.status)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">قائمة الإجراءات</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/assets/${asset.id}`} className="flex items-center cursor-pointer">
                                                            <Monitor className="mr-2 h-4 w-4 ml-2" />
                                                            عرض التفاصيل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/assets/${asset.id}/edit`} className="flex items-center cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4 ml-2" />
                                                            تعديل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                                        onClick={async () => {
                                                            if (!confirm('هل أنت متأكد من حذف هذا الأصل؟')) return
                                                            const { deleteAsset } = await import("@/app/actions/assets")
                                                            const result = await deleteAsset(asset.id)
                                                            if (result.success) {
                                                                router.refresh()
                                                            } else {
                                                                alert(result.error)
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
                        totalItems={filteredAssets.length}
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
                selectedCount={selectedAssets.length}
                totalCount={filteredAssets.length}
                onClearSelection={() => setSelectedAssets([])}
                actions={[
                    {
                        label: `طباعة الملصقات (${selectedAssets.length})`,
                        icon: Printer,
                        onClick: handlePrintLabels,
                        variant: "secondary"
                    },
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
