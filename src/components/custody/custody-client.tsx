'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Search, UserCog, Edit, Calendar, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CustodyStats } from "@/components/custody/custody-stats"
import { CustodyFilters } from "@/components/custody/custody-filters"
import { Badge } from "@/components/ui/badge"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

interface CustodyItem {
    id: string
    name: string
    description: string | null
    assignedDate: Date
    returnDate: Date | null
    employee: {
        id: string
        name: string
    }
}

interface CustodyClientProps {
    items: CustodyItem[]
    employees: { id: string, name: string }[]
}

export function CustodyClient({ items, employees }: CustodyClientProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedEmployee, setSelectedEmployee] = useState("all")
    const [selectedStatus, setSelectedStatus] = useState("all")

    // Filter logic
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                item.employee.name.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesEmployee = selectedEmployee === "all" || item.employee.id === selectedEmployee
            const matchesStatus = selectedStatus === "all" ||
                (selectedStatus === "active" ? !item.returnDate : !!item.returnDate)

            return matchesSearch && matchesEmployee && matchesStatus
        })
    }, [items, searchQuery, selectedEmployee, selectedStatus])

    // Stats calculation
    const stats = useMemo(() => {
        return {
            total: items.length,
            active: items.filter(i => !i.returnDate).length,
            returned: items.filter(i => !!i.returnDate).length
        }
    }, [items])

    return (
        <div className="flex flex-col gap-8">
            {/* Header */}
            {/* Header */}
            <PremiumPageHeader
                title="إدارة العهد"
                description="متابعة تسليم واستلام العهد من الموظفين"
                icon={UserCog}
                rightContent={
                    <Link href="/custody/new">
                        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            <Plus className="h-4 w-4" />
                            تسليم عهدة جديدة
                        </Button>
                    </Link>
                }
            />

            {/* Stats Cards */}
            <CustodyStats
                totalItems={stats.total}
                activeItems={stats.active}
                returnedItems={stats.returned}
            />

            {/* Filters & Search */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="بحث في العهد (الاسم، الوصف، الموظف)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10 h-11 bg-card shadow-sm border-muted/50 focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>
                <CustodyFilters
                    employees={employees}
                    selectedEmployee={selectedEmployee}
                    selectedStatus={selectedStatus}
                    onEmployeeChange={setSelectedEmployee}
                    onStatusChange={setSelectedStatus}
                    onClearFilters={() => {
                        setSelectedEmployee("all")
                        setSelectedStatus("all")
                        setSearchQuery("")
                    }}
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="text-right font-semibold">اسم العهدة</TableHead>
                            <TableHead className="text-right font-semibold">في عهدة</TableHead>
                            <TableHead className="text-right font-semibold">تاريخ التسليم</TableHead>
                            <TableHead className="text-right font-semibold">تاريخ الإرجاع</TableHead>
                            <TableHead className="text-right font-semibold">الحالة</TableHead>
                            <TableHead className="text-left font-semibold">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-foreground font-semibold">{item.name}</span>
                                        {item.description && (
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {item.employee.name.charAt(0)}
                                        </div>
                                        <span className="text-sm">{item.employee.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(item.assignedDate).toLocaleDateString('ar-EG')}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.returnDate ? (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(item.returnDate).toLocaleDateString('ar-EG')}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.returnDate ? "secondary" : "default"} className={!item.returnDate ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200" : ""}>
                                        {item.returnDate ? "تم الإرجاع" : "نشطة"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-left">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/custody/${item.id}/edit`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={async () => {
                                                if (confirm("هل أنت متأكد من حذف هذه العهدة؟")) {
                                                    const { deleteCustodyItem } = await import("@/app/actions/custody")
                                                    const result = await deleteCustodyItem(item.id)
                                                    if (!result.success) {
                                                        alert(result.error)
                                                    }
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredItems.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <UserCog className="h-8 w-8 opacity-20" />
                                        <p>لا توجد عهد مطابقة للبحث</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
