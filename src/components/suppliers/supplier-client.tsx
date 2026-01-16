'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Building2, Package, CheckCircle2, XCircle, Plus, Search,
    Edit, Trash2, Globe, Phone, Mail, MapPin, MoreHorizontal, Filter
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Pagination } from "@/components/ui/pagination"
import { FilterSheet, FilterSection } from "@/components/ui/data-table/filter-sheet"
import { SelectionBar } from "@/components/ui/data-table/selection-bar"
import { deleteSupplier } from "@/app/actions/suppliers"
import { toast } from "sonner"

interface Supplier {
    id: string
    name: string
    contactPerson: string | null
    email: string | null
    phone: string | null
    address: string | null
    website: string | null
    category: string | null
    isActive: boolean
}

interface SupplierClientProps {
    initialSuppliers: Supplier[]
}

export function SupplierClient({ initialSuppliers }: SupplierClientProps) {
    const router = useRouter()

    // -- State --
    const [suppliers, setSuppliers] = useState(initialSuppliers)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        status: "all", // active/inactive
        category: "all"
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])

    // -- Derived --
    const categories = useMemo(() => Array.from(new Set(suppliers.map(s => s.category).filter(Boolean))), [suppliers])

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier => {
            const matchesSearch =
                supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesStatus =
                filters.status === "all" ||
                (filters.status === "active" && supplier.isActive) ||
                (filters.status === "inactive" && !supplier.isActive)

            const matchesCategory = filters.category === "all" || supplier.category === filters.category

            return matchesSearch && matchesStatus && matchesCategory
        })
    }, [suppliers, searchQuery, filters])

    // -- Pagination --
    const paginatedSuppliers = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredSuppliers.slice(startIndex, startIndex + pageSize)
    }, [filteredSuppliers, currentPage, pageSize])

    const totalPages = Math.ceil(filteredSuppliers.length / pageSize)

    // -- Selection --
    const toggleSelectAll = () => {
        if (selectedSuppliers.length === paginatedSuppliers.length) {
            setSelectedSuppliers([])
        } else {
            setSelectedSuppliers(paginatedSuppliers.map(s => s.id))
        }
    }

    const toggleSelectSupplier = (id: string) => {
        if (selectedSuppliers.includes(id)) {
            setSelectedSuppliers(selectedSuppliers.filter(s => s !== id))
        } else {
            setSelectedSuppliers([...selectedSuppliers, id])
        }
    }

    // -- Actions --
    async function handleBulkDelete() {
        if (!confirm(`هل أنت متأكد من حذف ${selectedSuppliers.length} موردين؟`)) return

        let successCount = 0
        for (const id of selectedSuppliers) {
            const result = await deleteSupplier(id)
            if (result.success) successCount++
        }

        if (successCount > 0) {
            toast.success(`تم حذف ${successCount} سجلات بنجاح`)
            setSuppliers(suppliers.filter(s => !selectedSuppliers.includes(s.id)))
            setSelectedSuppliers([])
            router.refresh()
        }
    }

    async function handleDeleteSingle(id: string) {
        if (!confirm("تأكيد حذف المورد؟")) return
        const result = await deleteSupplier(id)
        if (result.success) {
            toast.success("تم الحذف بنجاح")
            setSuppliers(suppliers.filter(s => s.id !== id))
            router.refresh()
        } else {
            toast.error("فشل الحذف")
        }
    }

    // -- Stats --
    const stats = useMemo(() => ([
        {
            label: "إجمالي بيوت الخبرة والموردين",
            value: suppliers.length,
            icon: Building2
        },
        {
            label: "الموردين النشطين",
            value: suppliers.filter(s => s.isActive).length,
            icon: CheckCircle2
        },
        {
            label: "عدد التصنيفات",
            value: new Set(suppliers.map(s => s.category)).size,
            icon: Package
        },
        {
            label: "غير نشطين",
            value: suppliers.filter(s => !s.isActive).length,
            icon: XCircle
        }
    ]), [suppliers])

    const activeFiltersCount = (filters.status !== "all" ? 1 : 0) + (filters.category !== "all" ? 1 : 0)

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            <PremiumPageHeader
                title="إدارة الموردين والشركات"
                description="قاعدة بيانات شاملة للموردين، بيوت الخبرة، ومزودي الخدمات"
                icon={Building2}
                rightContent={
                    <Link href="/suppliers/new">
                        <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                            <Plus className="h-4 w-4" />
                            إضافة مورد جديد
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
                        placeholder="بحث باسم المورد، المسؤول، أو البريد..."
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
                    onReset={() => setFilters({ status: 'all', category: 'all' })}
                    title="تصفية الموردين"
                    description="تخصيص القائمة حسب الحالة أو التصنيف"
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
                                <SelectItem value="active">نشط</SelectItem>
                                <SelectItem value="inactive">غير نشط</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterSection>

                    <FilterSection title="التصنيف">
                        <Select
                            value={filters.category}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, category: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر التصنيف" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={String(cat)} value={String(cat)}>{cat}</SelectItem>
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
                                        checked={paginatedSuppliers.length > 0 && selectedSuppliers.length === paginatedSuppliers.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-right font-semibold">اسم المورد / الشركة</TableHead>
                                <TableHead className="text-right font-semibold">المسؤول</TableHead>
                                <TableHead className="text-right font-semibold">معلومات الاتصال</TableHead>
                                <TableHead className="text-right font-semibold">التصنيف</TableHead>
                                <TableHead className="text-right font-semibold">الحالة</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSuppliers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <Building2 className="h-16 w-16 opacity-20 mb-4" />
                                            <p className="text-xl font-semibold">لا يوجد موردين</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedSuppliers.map((supplier) => (
                                    <TableRow key={supplier.id} className="group hover:bg-muted/40 transition-colors">
                                        <TableCell className="py-4">
                                            <Checkbox
                                                checked={selectedSuppliers.includes(supplier.id)}
                                                onCheckedChange={() => toggleSelectSupplier(supplier.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/suppliers/${supplier.id}`} className="font-semibold hover:text-blue-500 transition-colors">
                                                            {supplier.name}
                                                        </Link>
                                                        {supplier.website && (
                                                            <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                                                                <Globe className="h-3.5 w-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                    {supplier.address && (
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 max-w-[200px] truncate">
                                                            <MapPin className="h-3 w-3" />
                                                            {supplier.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{supplier.contactPerson || '-'}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                {supplier.phone && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        <span dir="ltr">{supplier.phone}</span>
                                                    </div>
                                                )}
                                                {supplier.email && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        <span className="truncate max-w-[150px]">{supplier.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {supplier.category && (
                                                <Badge variant="outline" className="font-normal">
                                                    {supplier.category}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {supplier.isActive ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1 pl-2">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    نشط
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1 pl-2 text-gray-600 bg-gray-100">
                                                    <XCircle className="h-3 w-3" />
                                                    غير نشط
                                                </Badge>
                                            )}
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
                                                        <Link href={`/suppliers/${supplier.id}`} className="flex items-center">
                                                            <Edit className="mr-2 h-4 w-4 ml-2" />
                                                            تعديل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => handleDeleteSingle(supplier.id)}
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
                        totalItems={filteredSuppliers.length}
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
                selectedCount={selectedSuppliers.length}
                totalCount={filteredSuppliers.length}
                onClearSelection={() => setSelectedSuppliers([])}
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
