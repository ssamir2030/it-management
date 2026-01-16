'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    KeyRound, CheckCircle, Shield, AlertCircle,
    Plus, Search, Filter, MoreHorizontal, Edit, Trash2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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

interface License {
    id: string
    name: string
    vendor: string | null
    key: string
    licenseType: string
    purchaseType: string
    status: string
    purchaseDate: Date
    expiryDate: Date | null
    cost: number
    totalLicenses: number
    usedLicenses: number
}

interface LicenseClientProps {
    licenses: License[]
    stats: any
}

export function LicenseClient({ licenses, stats }: LicenseClientProps) {
    const router = useRouter()

    // -- State --
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        status: "all",
        type: "all"
    })

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Selection
    const [selectedLicenses, setSelectedLicenses] = useState<string[]>([])

    // -- Derived State --
    const filteredLicenses = useMemo(() => {
        return licenses.filter(license => {
            const matchesSearch =
                license.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (license.vendor && license.vendor.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesStatus = filters.status === "all" || license.status === filters.status
            const matchesType = filters.type === "all" || license.licenseType === filters.type

            return matchesSearch && matchesStatus && matchesType
        })
    }, [licenses, searchQuery, filters])

    const paginatedLicenses = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredLicenses.slice(startIndex, startIndex + pageSize)
    }, [filteredLicenses, currentPage, pageSize])

    const totalPages = Math.ceil(filteredLicenses.length / pageSize)

    // -- Selection Logic --
    const toggleSelectAll = () => {
        if (selectedLicenses.length === paginatedLicenses.length) {
            setSelectedLicenses([])
        } else {
            setSelectedLicenses(paginatedLicenses.map(l => l.id))
        }
    }

    const toggleSelectLicense = (id: string) => {
        if (selectedLicenses.includes(id)) {
            setSelectedLicenses(selectedLicenses.filter(l => l !== id))
        } else {
            setSelectedLicenses([...selectedLicenses, id])
        }
    }

    // -- Actions --
    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedLicenses.length} ترخيص؟`)) return

        const { deleteLicense } = await import("@/app/actions/licenses")
        for (const id of selectedLicenses) {
            await deleteLicense(id)
        }

        setSelectedLicenses([])
        router.refresh()
    }

    // -- Helpers --
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE': return <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">نشط</Badge>
            case 'EXPIRING': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">ينتهي قريباً</Badge>
            case 'EXPIRED': return <Badge variant="destructive">منتهي</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const getLicenseTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'PERPETUAL': 'دائم',
            'SUBSCRIPTION': 'اشتراك',
            'CONCURRENT': 'متزامن'
        }
        return labels[type] || type
    }

    // Calculate active filters
    const activeFiltersCount = (filters.status !== 'all' ? 1 : 0) + (filters.type !== 'all' ? 1 : 0)

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            {/* 1. Header */}
            <PremiumPageHeader
                title="تراخيص البرامج والأنظمة"
                description="إدارة ومتابعة التراخيص ومفاتيح التفعيل"
                icon={KeyRound}
                rightContent={
                    <Link href="/licenses/new">
                        <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                            <Plus className="h-4 w-4" />
                            ترخيص جديد
                        </Button>
                    </Link>
                }
                stats={[
                    { label: "إجمالي التراخيص", value: stats?.total || 0, icon: KeyRound },
                    { label: "التراخيص المستخدمة", value: stats?.usedLicensesCount || 0, icon: CheckCircle },
                    { label: "التراخيص المتاحة", value: stats?.availableLicensesCount || 0, icon: Shield },
                    { label: "تنبيهات الانتهاء", value: stats?.expiring || 0, icon: AlertCircle },
                ]}
            />

            {/* 2. Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-8 animate-slide-up stagger-1">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث عن ترخيص..."
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
                    onReset={() => setFilters({ status: 'all', type: 'all' })}
                    title="تصفية التراخيص"
                    description="تخصيص القائمة حسب الحالة أو النوع"
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
                                <SelectItem value="ACTIVE">نشط</SelectItem>
                                <SelectItem value="EXPIRING">ينتهي قريباً</SelectItem>
                                <SelectItem value="EXPIRED">منتهي</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterSection>

                    <FilterSection title="نوع الترخيص">
                        <Select
                            value={filters.type}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر النوع" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="PERPETUAL">دائم</SelectItem>
                                <SelectItem value="SUBSCRIPTION">اشتراك</SelectItem>
                                <SelectItem value="CONCURRENT">متزامن</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterSection>
                </FilterSheet>
            </div>

            {/* 3. Table */}
            <div className="card-elevated overflow-hidden animate-slide-up stagger-2">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[50px] py-4">
                                    <Checkbox
                                        checked={paginatedLicenses.length > 0 && selectedLicenses.length === paginatedLicenses.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-right font-semibold">اسم البرنامج</TableHead>
                                <TableHead className="text-right font-semibold">المزود</TableHead>
                                <TableHead className="text-right font-semibold">نوع الترخيص</TableHead>
                                <TableHead className="text-right font-semibold w-[200px]">الاستخدام</TableHead>
                                <TableHead className="text-right font-semibold">الحالة</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedLicenses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="p-4 rounded-full bg-muted/50">
                                                <KeyRound className="h-8 w-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium">لا توجد تراخيص</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedLicenses.map((license) => {
                                    const usage = license.totalLicenses > 0
                                        ? (license.usedLicenses / license.totalLicenses) * 100
                                        : 0

                                    return (
                                        <TableRow key={license.id} className="group hover:bg-muted/40 transition-colors">
                                            <TableCell className="py-4">
                                                <Checkbox
                                                    checked={selectedLicenses.includes(license.id)}
                                                    onCheckedChange={() => toggleSelectLicense(license.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <Link href={`/licenses/${license.id}`} className="hover:text-primary transition-colors">
                                                    {license.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{license.vendor || "-"}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{getLicenseTypeLabel(license.licenseType)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>{license.usedLicenses} مستخدم</span>
                                                        <span>{Math.round(usage)}%</span>
                                                    </div>
                                                    <Progress value={usage} className="h-2" />
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(license.status)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/licenses/${license.id}`} className="flex items-center">
                                                                <Edit className="mr-2 h-4 w-4 ml-2" />
                                                                تفاصيل
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={async () => {
                                                            if (confirm('تأكيد الحذف؟')) {
                                                                const { deleteLicense } = await import("@/app/actions/licenses")
                                                                await deleteLicense(license.id)
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
                        totalItems={filteredLicenses.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size)
                            setCurrentPage(1)
                        }}
                    />
                </div>
            </div>

            {/* 4. Selection Bar */}
            <SelectionBar
                selectedCount={selectedLicenses.length}
                totalCount={filteredLicenses.length}
                onClearSelection={() => setSelectedLicenses([])}
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
