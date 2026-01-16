'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Package2, Plus, Search, Edit, Trash2,
    MoreHorizontal, Filter
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
import { InventoryStats } from "@/components/inventory/inventory-stats"

interface InventoryItem {
    id: string
    name: string
    category: string | null
    manufacturer: string | null
    model: string | null
    sku: string | null
    quantity: number
    minQuantity: number
    unitPrice: number | null
}

interface InventoryClientProps {
    items: InventoryItem[]
}

export function InventoryClient({ items }: InventoryClientProps) {
    const router = useRouter()

    // -- State --
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        category: "all",
        manufacturer: "all",
        stockStatus: "all"
    })

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Selection
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    // -- Derived Data (Unique Values) --
    const categories = useMemo(
        () => Array.from(new Set(items.map((item) => item.category).filter(Boolean))) as string[],
        [items]
    )

    const manufacturers = useMemo(
        () => Array.from(new Set(items.map((item) => item.manufacturer).filter(Boolean))) as string[],
        [items]
    )

    // -- Filtering Logic --
    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = searchQuery === "" ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.manufacturer && item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.model && item.model.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesCategory = filters.category === "all" || item.category === filters.category
            const matchesManufacturer = filters.manufacturer === "all" || item.manufacturer === filters.manufacturer

            const matchesStockStatus =
                filters.stockStatus === "all" ||
                (filters.stockStatus === "low" && item.quantity <= item.minQuantity) ||
                (filters.stockStatus === "normal" && item.quantity > item.minQuantity)

            return matchesSearch && matchesCategory && matchesManufacturer && matchesStockStatus
        })
    }, [items, searchQuery, filters])

    // -- Pagination Logic --
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredItems.slice(startIndex, startIndex + pageSize)
    }, [filteredItems, currentPage, pageSize])

    const totalPages = Math.ceil(filteredItems.length / pageSize)

    // -- Selection Logic --
    const toggleSelectAll = () => {
        if (selectedItems.length === paginatedItems.length) {
            setSelectedItems([])
        } else {
            setSelectedItems(paginatedItems.map(i => i.id))
        }
    }

    const toggleSelectItem = (id: string) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(i => i !== id))
        } else {
            setSelectedItems([...selectedItems, id])
        }
    }

    // -- Actions --
    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedItems.length} عناصر؟`)) return

        // Dynamic import to avoid server-action issues in client component if any
        // Assuming deleteInventoryItem exists
        const { deleteInventoryItem } = await import("@/app/actions/inventory")
        for (const id of selectedItems) {
            await deleteInventoryItem(id)
        }

        setSelectedItems([])
        router.refresh()
    }

    // -- Stats --
    const stats = useMemo(() => {
        const lowStockCount = items.filter((item) => item.quantity <= item.minQuantity).length
        const totalValue = items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0)
        const categoriesCount = categories.length

        return {
            totalItems: items.length,
            lowStockCount,
            totalValue,
            categoriesCount,
        }
    }, [items, categories])

    const activeFiltersCount =
        (filters.category !== "all" ? 1 : 0) +
        (filters.manufacturer !== "all" ? 1 : 0) +
        (filters.stockStatus !== "all" ? 1 : 0)

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            {/* 1. Header */}
            <PremiumPageHeader
                title="المستودع"
                description="إدارة وتتبع المخزون والأصول الاستهلاكية"
                icon={Package2}
                rightContent={
                    <Link href="/inventory/new">
                        <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                            <Plus className="h-4 w-4" />
                            إضافة عنصر
                        </Button>
                    </Link>
                }
            />

            {/* 2. Stats */}
            <div className="mt-8 animate-slide-up stagger-1">
                <InventoryStats
                    totalItems={stats.totalItems}
                    lowStockCount={stats.lowStockCount}
                    totalValue={stats.totalValue}
                    categoriesCount={stats.categoriesCount}
                />
            </div>

            {/* 3. Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-8 animate-slide-up stagger-2">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث باسم العنصر، SKU، أو الشركة..."
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
                    onReset={() => setFilters({ category: 'all', manufacturer: 'all', stockStatus: 'all' })}
                    title="تصفية المخزون"
                    description="تخصيص القائمة حسب الفئة، المصنع، أو حالة المخزون"
                >
                    <FilterSection title="الفئة">
                        <Select
                            value={filters.category}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, category: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر الفئة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterSection>

                    <FilterSection title="الشركة المصنعة">
                        <Select
                            value={filters.manufacturer}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, manufacturer: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر الشركة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                {manufacturers.map(man => (
                                    <SelectItem key={man} value={man}>{man}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterSection>

                    <FilterSection title="حالة المخزون">
                        <Select
                            value={filters.stockStatus}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, stockStatus: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="low">منخفض</SelectItem>
                                <SelectItem value="normal">طبيعي</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterSection>
                </FilterSheet>
            </div>

            {/* 4. Table */}
            <div className="card-elevated overflow-hidden animate-slide-up stagger-3">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[50px] py-4">
                                    <Checkbox
                                        checked={paginatedItems.length > 0 && selectedItems.length === paginatedItems.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-right font-semibold">اسم العنصر</TableHead>
                                <TableHead className="text-right font-semibold">المعلومات</TableHead>
                                <TableHead className="text-right font-semibold">الكمية</TableHead>
                                <TableHead className="text-right font-semibold">السعر</TableHead>
                                <TableHead className="text-right font-semibold">SKU</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="p-4 rounded-full bg-muted/50">
                                                <Package2 className="h-8 w-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium">لا توجد عناصر</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedItems.map((item) => {
                                    const isLowStock = item.quantity <= item.minQuantity
                                    return (
                                        <TableRow key={item.id} className="group hover:bg-muted/40 transition-colors">
                                            <TableCell className="py-4">
                                                <Checkbox
                                                    checked={selectedItems.includes(item.id)}
                                                    onCheckedChange={() => toggleSelectItem(item.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-base text-primary/90">{item.name}</span>
                                                    {item.model && (
                                                        <span className="text-xs text-muted-foreground">{item.model}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {item.category && (
                                                        <Badge variant="outline" className="w-fit">
                                                            {item.category}
                                                        </Badge>
                                                    )}
                                                    {item.manufacturer && (
                                                        <span className="text-xs text-muted-foreground">{item.manufacturer}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={isLowStock ? "destructive" : "secondary"}
                                                    className={`font-semibold ${!isLowStock ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}`}
                                                >
                                                    {item.quantity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-foreground/80">
                                                {item.unitPrice ? `${item.unitPrice.toLocaleString('ar-SA')} ر.س` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-muted px-2 py-1 rounded border border-muted-foreground/20">
                                                    {item.sku || '-'}
                                                </code>
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
                                                            <Link href={`/inventory/${item.id}/edit`} className="flex items-center">
                                                                <Edit className="mr-2 h-4 w-4 ml-2" />
                                                                تعديل
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={async () => {
                                                            if (confirm('تأكيد الحذف؟')) {
                                                                const { deleteInventoryItem } = await import("@/app/actions/inventory")
                                                                await deleteInventoryItem(item.id)
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
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t bg-muted/10">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredItems.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size)
                            setCurrentPage(1)
                        }}
                    />
                </div>
            </div>

            {/* 5. Selection Bar */}
            <SelectionBar
                selectedCount={selectedItems.length}
                totalCount={filteredItems.length}
                onClearSelection={() => setSelectedItems([])}
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
