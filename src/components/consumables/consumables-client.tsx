'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Search, MoreHorizontal, ArrowDownCircle, ArrowUpCircle, AlertTriangle, Package } from 'lucide-react'
import { ConsumableForm } from './consumable-form'
import { TransactionDialog } from './transaction-dialog'
import { useRouter } from 'next/navigation'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

interface ConsumablesClientProps {
    initialData: any[]
    categories: any[]
    lowStockCount: number
}

export function ConsumablesClient({ initialData, categories, lowStockCount }: ConsumablesClientProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')

    // Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [transactionOpen, setTransactionOpen] = useState(false)
    const [transactionType, setTransactionType] = useState<'IN' | 'OUT'>('IN')
    const [selectedItem, setSelectedItem] = useState<any>(null)

    // Filtering
    const filteredData = initialData.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || item.categoryId === categoryFilter
        return matchesSearch && matchesCategory
    })

    const handleRefresh = () => {
        router.refresh()
    }

    const openTransaction = (item: any, type: 'IN' | 'OUT') => {
        setSelectedItem(item)
        setTransactionType(type)
        setTransactionOpen(true)
    }

    return (
        <div className="space-y-6 container mx-auto p-6" dir="rtl">
            <PremiumPageHeader
                title="إدارة المستهلكات والمخزون"
                description="تتبع الأحبار، الأوراق، والملحقات وإدارة الكميات المتوفرة"
                icon={Package}
            />

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initialData.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">تنبيهات انخفاض المخزون</CardTitle>
                        <AlertTriangle className={`h-4 w-4 ${lowStockCount > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-500" : ""}`}>{lowStockCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الوحدات بالمخزن</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {initialData.reduce((sum, item) => sum + item.quantity, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث باسم الصنف..."
                            className="pr-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="التصنيف" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع التصنيفات</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> إضافة صنف جديد
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">اسم الصنف</TableHead>
                            <TableHead className="text-right">التصنيف</TableHead>
                            <TableHead className="text-center">الكمية الحالية</TableHead>
                            <TableHead className="text-center">الحد الأدنى</TableHead>
                            <TableHead className="text-left">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    لا توجد بيانات للعرض
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.category?.name || '-'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={item.quantity <= item.minQuantity ? "destructive" : "secondary"}>
                                            {item.quantity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-muted-foreground">{item.minQuantity}</TableCell>
                                    <TableCell className="text-left">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openTransaction(item, 'IN')}>
                                                    <ArrowDownCircle className="ml-2 h-4 w-4 text-green-600" />
                                                    إضافة مخزون (شراء)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openTransaction(item, 'OUT')} disabled={item.quantity <= 0}>
                                                    <ArrowUpCircle className="ml-2 h-4 w-4 text-red-600" />
                                                    صرف مخزون (استخدام)
                                                </DropdownMenuItem>
                                                {/* <DropdownMenuSeparator />
                                                <DropdownMenuItem>تعديل</DropdownMenuItem> */}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialogs */}
            <ConsumableForm
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                categories={categories}
                onSuccess={handleRefresh}
            />

            <TransactionDialog
                open={transactionOpen}
                onOpenChange={setTransactionOpen}
                consumable={selectedItem}
                type={transactionType}
                onSuccess={handleRefresh}
            />
        </div>
    )
}
