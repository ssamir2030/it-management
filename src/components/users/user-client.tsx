'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Users, Plus, Search, Shield, Edit, Trash2,
    MoreHorizontal, UserCheck, UserCog, ShieldCheck
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
import { Pagination } from "@/components/ui/pagination"

// New Premium Components
import { FilterSheet, FilterSection } from "@/components/ui/data-table/filter-sheet"
import { SelectionBar } from "@/components/ui/data-table/selection-bar"

interface User {
    id: string
    name: string | null
    email: string | null
    role: string
    createdAt: Date
}

interface UserClientProps {
    users: User[]
}

export function UserClient({ users }: UserClientProps) {
    const router = useRouter()

    // -- State --
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        role: "all"
    })

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Selection State
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])

    // -- Derived State (Filtering) --
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch =
                (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesRole = filters.role === "all" || user.role === filters.role

            return matchesSearch && matchesRole
        })
    }, [users, searchQuery, filters])

    // -- Pagination Logic --
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredUsers.slice(startIndex, startIndex + pageSize)
    }, [filteredUsers, currentPage, pageSize])

    const totalPages = Math.ceil(filteredUsers.length / pageSize)

    // -- Selection Logic --
    const toggleSelectAll = () => {
        if (selectedUsers.length === paginatedUsers.length) {
            setSelectedUsers([])
        } else {
            setSelectedUsers(paginatedUsers.map(u => u.id))
        }
    }

    const toggleSelectUser = (id: string) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(u => u !== id))
        } else {
            setSelectedUsers([...selectedUsers, id])
        }
    }

    // -- Actions --
    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedUsers.length} مستخدم؟`)) return

        const { deleteUser } = await import("@/app/actions/users")
        // NOTE: Ideally batch endpoint, but looping for now
        for (const id of selectedUsers) {
            await deleteUser(id)
        }

        setSelectedUsers([])
        router.refresh()
    }

    // -- Helpers --
    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200">مدير النظام</Badge>
            case 'TECHNICIAN':
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">فني</Badge>
            default:
                return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200">مستخدم</Badge>
        }
    }

    // Stats
    const stats = useMemo(() => ({
        total: users.length,
        admins: users.filter(u => u.role === 'ADMIN').length,
        technicians: users.filter(u => u.role === 'TECHNICIAN').length,
        viewers: users.filter(u => u.role === 'USER').length
    }), [users])

    const activeFiltersCount = (filters.role !== 'all' ? 1 : 0)

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            {/* 1. Header */}
            <PremiumPageHeader
                title="المستخدمين"
                description="إدارة صلاحيات وحسابات المستخدمين"
                icon={Shield}
                rightContent={
                    <Link href="/admin/users/new">
                        <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                            <Plus className="h-4 w-4" />
                            إضافة مستخدم جديد
                        </Button>
                    </Link>
                }
                stats={[
                    { label: "إجمالي المستخدمين", value: stats.total, icon: Users },
                    { label: "مدراء النظام", value: stats.admins, icon: ShieldCheck },
                    { label: "فنيين", value: stats.technicians, icon: UserCog },
                    { label: "مستخدمين", value: stats.viewers, icon: Users },
                ]}
            />

            {/* 2. Controls & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-8 animate-slide-up stagger-1">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث عن مستخدم..."
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
                    onReset={() => setFilters({ role: 'all' })}
                    title="تصفية المستخدمين"
                    description="تخصيص القائمة حسب الدور"
                >
                    <FilterSection title="الدور الوظيفي">
                        <Select
                            value={filters.role}
                            onValueChange={(val) => setFilters(prev => ({ ...prev, role: val }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر الدور" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="ADMIN">مدير النظام</SelectItem>
                                <SelectItem value="TECHNICIAN">فني</SelectItem>
                                <SelectItem value="USER">مستخدم</SelectItem>
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
                                        checked={paginatedUsers.length > 0 && selectedUsers.length === paginatedUsers.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-right font-semibold">المستخدم</TableHead>
                                <TableHead className="text-right font-semibold">البريد الإلكتروني</TableHead>
                                <TableHead className="text-right font-semibold">الدور</TableHead>
                                <TableHead className="text-right font-semibold">تاريخ التسجيل</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="p-4 rounded-full bg-muted/50">
                                                <Users className="h-8 w-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium">لا توجد نتائج</p>
                                            <Button
                                                variant="link"
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setFilters({ role: 'all' })
                                                }}
                                            >
                                                مسح الفلاتر
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <TableRow key={user.id} className="group hover:bg-muted/40 transition-colors">
                                        <TableCell className="py-4">
                                            <Checkbox
                                                checked={selectedUsers.includes(user.id)}
                                                onCheckedChange={() => toggleSelectUser(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">
                                                    {user.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <span className="font-semibold">{user.name || 'مستخدم غير معروف'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm font-mono">
                                            {new Date(user.createdAt).toLocaleDateString('ar-EG')}
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
                                                        <Link href={`/admin/users/${user.id}/edit`} className="flex items-center">
                                                            <Edit className="mr-2 h-4 w-4 ml-2" />
                                                            تعديل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={async () => {
                                                        if (confirm('تأكيد الحذف؟')) {
                                                            const { deleteUser } = await import("@/app/actions/users")
                                                            await deleteUser(user.id)
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
                        totalItems={filteredUsers.length}
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
                selectedCount={selectedUsers.length}
                totalCount={filteredUsers.length}
                onClearSelection={() => setSelectedUsers([])}
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
