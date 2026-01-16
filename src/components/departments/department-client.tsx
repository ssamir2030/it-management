'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Building2, Users, BarChart3, Plus, Search,
    Edit, Trash2, MoreHorizontal, Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Pagination } from "@/components/ui/pagination"

// New Premium Components
import { FilterSheet, FilterSection } from "@/components/ui/data-table/filter-sheet"
import { SelectionBar } from "@/components/ui/data-table/selection-bar"

interface Department {
    id: string
    name: string
    managerName: string | null
    description: string | null
    employeeCount?: number
}

interface DepartmentClientProps {
    departments: Department[]
}

export function DepartmentClient({ departments }: DepartmentClientProps) {
    const router = useRouter()

    // -- State --
    const [searchQuery, setSearchQuery] = useState("")

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Selection State
    const [selectedDepts, setSelectedDepts] = useState<string[]>([])

    // -- Derived State (Filtering) --
    const filteredDepartments = useMemo(() => {
        return departments.filter((dept) =>
            dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (dept.managerName && dept.managerName.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    }, [departments, searchQuery])

    // -- Pagination Logic --
    const paginatedDepartments = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredDepartments.slice(startIndex, startIndex + pageSize)
    }, [filteredDepartments, currentPage, pageSize])

    const totalPages = Math.ceil(filteredDepartments.length / pageSize)

    // -- Selection Logic --
    const toggleSelectAll = () => {
        if (selectedDepts.length === paginatedDepartments.length) {
            setSelectedDepts([])
        } else {
            setSelectedDepts(paginatedDepartments.map(d => d.id))
        }
    }

    const toggleSelectDept = (id: string) => {
        if (selectedDepts.includes(id)) {
            setSelectedDepts(selectedDepts.filter(d => d !== id))
        } else {
            setSelectedDepts([...selectedDepts, id])
        }
    }

    // -- Actions --
    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedDepts.length} إدارة؟`)) return

        const { deleteDepartment } = await import("@/app/actions/departments")
        for (const id of selectedDepts) {
            await deleteDepartment(id)
        }

        setSelectedDepts([])
        router.refresh()
    }

    // -- Stats --
    const stats = useMemo(() => {
        const totalDepartments = departments.length
        const totalEmployees = departments.reduce((acc, curr) => acc + (curr.employeeCount || 0), 0)
        const avgEmployees = totalDepartments > 0 ? Math.round(totalEmployees / totalDepartments) : 0

        return { totalDepartments, totalEmployees, avgEmployees }
    }, [departments])

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            {/* 1. Header */}
            <PremiumPageHeader
                title="الإدارات"
                description="إدارة الهيكل التنظيمي والأقسام"
                icon={Building2}
                rightContent={
                    <Link href="/departments/new">
                        <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                            <Plus className="h-4 w-4" />
                            إضافة إدارة
                        </Button>
                    </Link>
                }
                stats={[
                    { label: "إجمالي الإدارات", value: stats.totalDepartments, icon: Building2 },
                    { label: "إجمالي الموظفين", value: stats.totalEmployees, icon: Users },
                    { label: "متوسط الموظفين/إدارة", value: stats.avgEmployees, icon: BarChart3 },
                ]}
            />

            {/* 2. Controls & Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-8 animate-slide-up stagger-1">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث عن إدارة (الاسم، المدير)..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="pr-10 h-11 bg-card shadow-sm border-muted/60 focus:border-primary/50 text-base"
                    />
                </div>
            </div>

            {/* 3. Data Table */}
            <div className="card-elevated overflow-hidden animate-slide-up stagger-2">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[50px] py-4">
                                    <Checkbox
                                        checked={paginatedDepartments.length > 0 && selectedDepts.length === paginatedDepartments.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-right font-semibold">اسم الإدارة</TableHead>
                                <TableHead className="text-right font-semibold">مدير الإدارة</TableHead>
                                <TableHead className="text-right font-semibold">عدد الموظفين</TableHead>
                                <TableHead className="text-right font-semibold">الوصف</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedDepartments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="p-4 rounded-full bg-muted/50">
                                                <Building2 className="h-8 w-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium">لا توجد نتائج</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedDepartments.map((dept) => (
                                    <TableRow key={dept.id} className="group hover:bg-muted/40 transition-colors">
                                        <TableCell className="py-4">
                                            <Checkbox
                                                checked={selectedDepts.includes(dept.id)}
                                                onCheckedChange={() => toggleSelectDept(dept.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Building2 className="h-4 w-4" />
                                                </div>
                                                <span>{dept.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{dept.managerName || '-'}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center justify-center min-w-[2rem] h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                                                {dept.employeeCount || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground truncate max-w-[200px]">
                                            {dept.description || '-'}
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
                                                        <Link href={`/departments/${dept.id}/edit`} className="flex items-center">
                                                            <Edit className="mr-2 h-4 w-4 ml-2" />
                                                            تعديل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={async () => {
                                                        if (confirm('تأكيد الحذف؟')) {
                                                            const { deleteDepartment } = await import("@/app/actions/departments")
                                                            await deleteDepartment(dept.id)
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
                        totalItems={filteredDepartments.length}
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
                selectedCount={selectedDepts.length}
                totalCount={filteredDepartments.length}
                onClearSelection={() => setSelectedDepts([])}
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
