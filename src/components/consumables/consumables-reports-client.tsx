'use client'

import { useState } from "react"
import {
    FileText,
    Search,
    Filter,
    ArrowDownCircle,
    ArrowUpCircle,
    Download,
    Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

interface ConsumablesReportsClientProps {
    initialTransactions: any[]
}

export function ConsumablesReportsClient({ initialTransactions }: ConsumablesReportsClientProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<"ALL" | "IN" | "OUT">("ALL")

    const filteredTransactions = initialTransactions.filter(tx => {
        const matchesSearch =
            tx.consumable.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.employee?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tx.notes?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesType = filterType === "ALL" || tx.type === filterType

        return matchesSearch && matchesType
    })

    const totalIn = filteredTransactions
        .filter(t => t.type === 'IN')
        .reduce((acc, curr) => acc + curr.quantity, 0)

    const totalOut = filteredTransactions
        .filter(t => t.type === 'OUT')
        .reduce((acc, curr) => acc + curr.quantity, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        تقارير الاستهلاك
                    </h1>
                    <p className="text-muted-foreground">
                        سجل تفصيلي لحركات التوريد والصرف للمواد الاستهلاكية.
                    </p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    تصدير Excel
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الحركات</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredTransactions.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">إجمالي التوريد</CardTitle>
                        <ArrowDownCircle className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{totalIn}</div>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-900/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-700 dark:text-indigo-400">إجمالي الصرف</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{totalOut}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث باسم المادة، الموظف، أو الملاحظات..."
                        className="pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        variant={filterType === "ALL" ? "default" : "outline"}
                        onClick={() => setFilterType("ALL")}
                        className="flex-1 md:flex-none"
                    >
                        الكل
                    </Button>
                    <Button
                        variant={filterType === "IN" ? "default" : "outline"}
                        onClick={() => setFilterType("IN")}
                        className="flex-1 md:flex-none gap-2"
                    >
                        <ArrowDownCircle className="h-4 w-4" />
                        توريد
                    </Button>
                    <Button
                        variant={filterType === "OUT" ? "default" : "outline"}
                        onClick={() => setFilterType("OUT")}
                        className="flex-1 md:flex-none gap-2"
                    >
                        <ArrowUpCircle className="h-4 w-4" />
                        صرف
                    </Button>
                </div>
            </div>

            {/* Transactions Table */}
            <Card className="overflow-hidden border-none shadow-md">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="text-right">التاريخ</TableHead>
                                <TableHead className="text-right">نوع الحركة</TableHead>
                                <TableHead className="text-right">المادة</TableHead>
                                <TableHead className="text-right">الكمية</TableHead>
                                <TableHead className="text-right">المستلم / المصدر</TableHead>
                                <TableHead className="text-right">القسم</TableHead>
                                <TableHead className="text-right">ملاحظات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        لا توجد حركات مطابقة للبحث
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <TableRow key={tx.id} className="group hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {format(new Date(tx.createdAt), "dd/MM/yyyy", { locale: ar })}
                                            </div>
                                            <span className="text-xs text-muted-foreground mr-6">
                                                {format(new Date(tx.createdAt), "hh:mm a", { locale: ar })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={tx.type === 'IN' ? 'default' : 'secondary'} className={
                                                tx.type === 'IN'
                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400"
                                            }>
                                                {tx.type === 'IN' ? 'توريد' : 'صرف'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">{tx.consumable.name}</TableCell>
                                        <TableCell>
                                            <span className="font-bold text-lg">{tx.quantity}</span>
                                            <span className="text-xs text-muted-foreground mr-1">{tx.consumable.unit}</span>
                                        </TableCell>
                                        <TableCell>
                                            {tx.employee ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                        {tx.employee.name.charAt(0)}
                                                    </div>
                                                    {tx.employee.name}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {tx.department ? (
                                                <Badge variant="outline">{tx.department}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground" title={tx.notes}>
                                            {tx.notes || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
