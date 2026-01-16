'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Users, Briefcase, MapPin, Monitor,
    Plus, Edit, Trash2, Search, Filter,
    UserCircle, MoreHorizontal, Check, SlidersHorizontal
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
import { EmployeeStats } from "@/components/employees/employee-stats"
import { ExportButton } from "@/components/ui/export-button"
import { Pagination } from "@/components/ui/pagination"
import { ImportEmployeesDialog } from "@/components/employees/import-employees-dialog"

// New Premium Components
import { FilterSheet, FilterSection } from "@/components/ui/data-table/filter-sheet"
import { SelectionBar } from "@/components/ui/data-table/selection-bar"

import { exportToExcel, exportToCSV, employeesExportColumns } from "@/lib/export"

interface Employee {
    id: string
    name: string
    email: string
    department: { name: string } | null
    jobTitle: string | null
    phone: string | null
    identityNumber: string
    locationId: string | null
    _count: {
        assets: number
    }
}

interface EmployeeClientProps {
    employees: Employee[]
}

export function EmployeeClient({ employees }: EmployeeClientProps) {
    const router = useRouter()

    // -- State --
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        department: "all",
        jobTitle: "all"
    })

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Selection State
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
    const [isExporting, setIsExporting] = useState(false)

    // -- Derived State (Data & Filtering) --
    const departments = useMemo(
        () => Array.from(new Set(employees.map((emp) => emp.department?.name).filter(Boolean))) as string[],
        [employees]
    )

    const jobTitles = useMemo(
        () => Array.from(new Set(employees.map((emp) => emp.jobTitle).filter(Boolean))) as string[],
        [employees]
    )

    const filteredEmployees = useMemo(() => {
        return employees.filter((emp) => {
            const matchesSearch =
                emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.identityNumber.includes(searchQuery) ||
                (emp.phone && emp.phone.includes(searchQuery))

            const matchesDepartment = filters.department === "all" || emp.department?.name === filters.department
            const matchesJobTitle = filters.jobTitle === "all" || emp.jobTitle === filters.jobTitle

            return matchesSearch && matchesDepartment && matchesJobTitle
        })
    }, [employees, searchQuery, filters])

    // -- Pagination Logic --
    const paginatedEmployees = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredEmployees.slice(startIndex, startIndex + pageSize)
    }, [filteredEmployees, currentPage, pageSize])

    const totalPages = Math.ceil(filteredEmployees.length / pageSize)

    // -- Selection Logic --
    const toggleSelectAll = () => {
        if (selectedEmployees.length === paginatedEmployees.length) {
            setSelectedEmployees([])
        } else {
            setSelectedEmployees(paginatedEmployees.map(e => e.id))
        }
    }

    const toggleSelectEmployee = (id: string) => {
        if (selectedEmployees.includes(id)) {
            setSelectedEmployees(selectedEmployees.filter(e => e !== id))
        } else {
            setSelectedEmployees([...selectedEmployees, id])
        }
    }

    // -- Actions --
    const handleExportExcel = async () => {
        try {
            setIsExporting(true)
            const dataToExport = selectedEmployees.length > 0
                ? employees.filter(e => selectedEmployees.includes(e.id))
                : filteredEmployees
            exportToExcel(dataToExport, employeesExportColumns, 'employees-export')
        } finally {
            setIsExporting(false)
        }
    }

    const handleExportCSV = async () => {
        try {
            setIsExporting(true)
            const dataToExport = selectedEmployees.length > 0
                ? employees.filter(e => selectedEmployees.includes(e.id))
                : filteredEmployees
            exportToCSV(dataToExport, employeesExportColumns, 'employees-export')
        } finally {
            setIsExporting(false)
        }
    }

    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedEmployees.length} موظف؟`)) return

        const { deleteEmployee } = await import("@/app/actions/employees")
        // Note: Simple loop for now, ideally batch action on server
        for (const id of selectedEmployees) {
            await deleteEmployee(id)
        }

        setSelectedEmployees([])
        router.refresh()
    }

    // -- Stats Calculation --
    const stats = useMemo(() => {
        const totalAssets = employees.reduce((sum, emp) => sum + emp._count.assets, 0)
        const activeLocations = new Set(employees.map(e => e.locationId).filter(Boolean)).size

        return {
            totalEmployees: employees.length,
            departmentsCount: departments.length,
            totalAssets,
            activeLocations,
        }
    }, [employees, departments])

    const activeFiltersCount = (filters.department !== 'all' ? 1 : 0) + (filters.jobTitle !== 'all' ? 1 : 0)

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            {/* 1. Header */}
            <PremiumPageHeader
                title="الموظفين"
                description="إدارة سجلات الموظفين والعهد"
                icon={Users}
                rightContent={
                    <div className="flex items-center gap-3">
                        <ExportButton
                            onExportExcel={handleExportExcel}
                            onExportCSV={handleExportCSV}
                            isLoading={isExporting}
                        />
                        <ImportEmployeesDialog />
                        <Link href="/employees/new">
                            <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                                <Plus className="h-4 w-4" />
                                إضافة موظف
                            </Button>
                        </Link>
                    </div>
                }
                stats={[
                    { label: "إجمالي الموظفين", value: stats.totalEmployees, icon: Users },
                    { label: "الإدارات", value: stats.departmentsCount, icon: Briefcase },
                    { label: "إجمالي العهد", value: stats.totalAssets, icon: Monitor },
                    { label: "المواقع النشطة", value: stats.activeLocations, icon: MapPin },
                ]}
            />

            {/* 2. Controls & Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-8 animate-slide-up stagger-1">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث عن موظف (الاسم، البريد، الهوية، الهاتف)..."
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
                    onReset={() => setFilters({ department: 'all', jobTitle: 'all' })}
                    title="تصفية الموظفين"
                    description="تخصيص القائمة حسب الإدارة أو المسمى الوظيفي"
                >
                    <FilterSection title="الإدارة">
                        <Select
                            value={filters.department}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, department: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر الإدارة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterSection>

                    <FilterSection title="المسمى الوظيفي">
                        <Select
                            value={filters.jobTitle}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, jobTitle: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر المسمى" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                {jobTitles.map(title => (
                                    <SelectItem key={title} value={title}>{title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterSection>
                </FilterSheet>
            </div>

            {/* 3. Data Table */}
            <div className="card-elevated overflow-hidden animate-slide-up stagger-2">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[50px] py-4">
                                    <Checkbox
                                        checked={paginatedEmployees.length > 0 && selectedEmployees.length === paginatedEmployees.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="min-w-[200px] text-right">الموظف</TableHead>
                                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                                <TableHead className="text-right">الإدارة</TableHead>
                                <TableHead className="text-right">المسمى الوظيفي</TableHead>
                                <TableHead className="text-right">عدد العهد</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="p-4 rounded-full bg-muted/50">
                                                <Users className="h-8 w-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium">لا توجد نتائج</p>
                                            <Button
                                                variant="link"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setFilters({ department: 'all', jobTitle: 'all' })
                                                }}
                                            >
                                                مسح جميع الفلاتر
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedEmployees.map((employee) => (
                                    <TableRow key={employee.id} className="group hover:bg-muted/40 transition-colors">
                                        <TableCell className="py-4">
                                            <Checkbox
                                                checked={selectedEmployees.includes(employee.id)}
                                                onCheckedChange={() => toggleSelectEmployee(employee.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                                                    {employee.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <Link href={`/employees/${employee.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                                                        {employee.name}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground">{employee.phone || '-'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{employee.email}</TableCell>
                                        <TableCell>
                                            {employee.department && (
                                                <Badge variant="outline" className="font-normal bg-background/50">
                                                    {employee.department.name}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground font-medium">{employee.jobTitle || '-'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={employee._count.assets > 0 ? "secondary" : "outline"} className="font-mono">
                                                {employee._count.assets} أصول
                                            </Badge>
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
                                                        <Link href={`/employees/${employee.id}`} className="flex items-center cursor-pointer">
                                                            <UserCircle className="mr-2 h-4 w-4 ml-2" />
                                                            عرض الملف
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/employees/${employee.id}/edit`} className="flex items-center cursor-pointer">
                                                            <Edit className="mr-2 h-4 w-4 ml-2" />
                                                            تعديل البيانات
                                                        </Link>
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
                        totalItems={filteredEmployees.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size)
                            setCurrentPage(1)
                        }}
                    />
                </div>
            </div>

            {/* 4. Floating Action Bar */}
            <SelectionBar
                selectedCount={selectedEmployees.length}
                totalCount={filteredEmployees.length}
                onClearSelection={() => setSelectedEmployees([])}
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
