"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    Server,
    Router,
    Wifi,
    Shield,
    MoreHorizontal,
    Plus,
    Search,
    Activity,
    Power,
    AlertCircle,
    Network,
    Edit,
    Trash2,
    Filter
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
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import { FilterSheet, FilterSection } from "@/components/ui/data-table/filter-sheet"
import { SelectionBar } from "@/components/ui/data-table/selection-bar"
import { deleteNetworkDevice } from "@/app/actions/network"
import { useToast } from "@/components/ui/use-toast"
import { toast as sonnerToast } from "sonner" // Assuming we are moving to Sonner for consistency, but keeping useToast if legacy depends on it. Ideally use Sonner everywhere.

interface NetworkClientProps {
    initialDevices: any[]
}

export function NetworkClient({ initialDevices }: NetworkClientProps) {
    const router = useRouter()

    // -- State --
    const [devices, setDevices] = useState(initialDevices)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState({
        status: "all",
        type: "all"
    })

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Selection
    const [selectedDevices, setSelectedDevices] = useState<string[]>([])

    // -- Derived (Filtering) --
    const filteredDevices = useMemo(() => {
        return devices.filter(device => {
            const matchesSearch =
                device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                device.ipAddress?.includes(searchQuery) ||
                device.type.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus = filters.status === "all" || device.status === filters.status
            const matchesType = filters.type === "all" || device.type === filters.type

            return matchesSearch && matchesStatus && matchesType
        })
    }, [devices, searchQuery, filters])

    // -- Pagination Logic --
    const paginatedDevices = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredDevices.slice(startIndex, startIndex + pageSize)
    }, [filteredDevices, currentPage, pageSize])

    const totalPages = Math.ceil(filteredDevices.length / pageSize)

    // -- Selection Logic --
    const toggleSelectAll = () => {
        if (selectedDevices.length === paginatedDevices.length) {
            setSelectedDevices([])
        } else {
            setSelectedDevices(paginatedDevices.map(d => d.id))
        }
    }

    const toggleSelectDevice = (id: string) => {
        if (selectedDevices.includes(id)) {
            setSelectedDevices(selectedDevices.filter(d => d !== id))
        } else {
            setSelectedDevices([...selectedDevices, id])
        }
    }

    // -- Actions --
    async function handleBulkDelete() {
        if (!confirm(`هل أنت متأكد من حذف ${selectedDevices.length} أجهزة؟`)) return

        // We can loop through and delete. In a real app, a bulk delete API is better.
        let successCount = 0
        for (const id of selectedDevices) {
            const result = await deleteNetworkDevice(id)
            if (result.success) successCount++
        }

        if (successCount > 0) {
            sonnerToast.success(`تم حذف ${successCount} أجهزة بنجاح`)
            setDevices(devices.filter(d => !selectedDevices.includes(d.id)))
            setSelectedDevices([])
            router.refresh()
        }
    }

    async function handleDeleteSingle(id: string) {
        if (!confirm("هل أنت متأكد من حذف هذا الجهاز؟")) return
        const result = await deleteNetworkDevice(id)
        if (result.success) {
            sonnerToast.success("تم حذف الجهاز بنجاح")
            setDevices(devices.filter(d => d.id !== id))
            router.refresh()
        } else {
            sonnerToast.error("فشل حذف الجهاز")
        }
    }

    // -- Helpers --
    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'server': return <Server className="h-4 w-4 text-blue-500" />
            case 'router': return <Router className="h-4 w-4 text-orange-500" />
            case 'switch': return <Activity className="h-4 w-4 text-green-500" />
            case 'firewall': return <Shield className="h-4 w-4 text-red-500" />
            case 'access point': return <Wifi className="h-4 w-4 text-purple-500" />
            default: return <Server className="h-4 w-4 text-muted-foreground" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            case 'OFFLINE': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            case 'MAINTENANCE': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    const stats = useMemo(() => ({
        total: devices.length,
        active: devices.filter(d => d.status === 'ACTIVE').length,
        offline: devices.filter(d => d.status === 'OFFLINE').length,
        maintenance: devices.filter(d => d.status === 'MAINTENANCE').length,
    }), [devices])

    // Get unique types for filter
    const deviceTypes = useMemo(() => Array.from(new Set(devices.map(d => d.type))), [devices])
    const activeFiltersCount = (filters.status !== 'all' ? 1 : 0) + (filters.type !== 'all' ? 1 : 0)

    return (
        <div className="content-spacing py-6 animate-fade-in">
            {/* 1. Header */}
            <PremiumPageHeader
                title="إدارة الشبكة والبنية التحتية"
                description="إدارة السيرفرات، الروترات، وأجهزة الشبكة"
                icon={Network}
                rightContent={
                    <Link href="/network/new">
                        <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover-scale transition-all">
                            <Plus className="h-4 w-4" />
                            إضافة جهاز جديد
                        </Button>
                    </Link>
                }
                stats={[
                    { label: "إجمالي الأجهزة", value: stats.total, icon: Server },
                    { label: "نشط (Active)", value: stats.active, icon: Power },
                    { label: "غير متصل (Offline)", value: stats.offline, icon: Power },
                    { label: "تحت الصيانة", value: stats.maintenance, icon: AlertCircle },
                ]}
            />

            {/* 2. Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-8 animate-slide-up stagger-2">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث باسم الجهاز، IP، أو النوع..."
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
                    title="تصفية الشبكة"
                    description="تخصيص القائمة حسب النوع أو الحالة"
                >
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
                                {deviceTypes.map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterSection>

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
                                <SelectItem value="ACTIVE">نشط (Active)</SelectItem>
                                <SelectItem value="OFFLINE">غير متصل (Offline)</SelectItem>
                                <SelectItem value="MAINTENANCE">صيانة (Maintenance)</SelectItem>
                            </SelectContent>
                        </Select>
                    </FilterSection>
                </FilterSheet>
            </div>

            {/* 3. Table */}
            <div className="card-elevated overflow-hidden animate-slide-up stagger-3">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[50px] py-4">
                                    <Checkbox
                                        checked={paginatedDevices.length > 0 && selectedDevices.length === paginatedDevices.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-right font-bold text-base">الاسم</TableHead>
                                <TableHead className="text-right font-bold text-base">النوع</TableHead>
                                <TableHead className="text-right font-bold text-base">IP Address</TableHead>
                                <TableHead className="text-right font-bold text-base">الموقع</TableHead>
                                <TableHead className="text-right font-bold text-base">الحالة</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedDevices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center text-muted-foreground">
                                            <Network className="h-16 w-16 opacity-20 mb-4" />
                                            <p className="text-xl font-semibold">لا توجد أجهزة مطابقة</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedDevices.map((device) => (
                                    <TableRow key={device.id} className="group hover:bg-muted/50 transition-all">
                                        <TableCell className="py-4">
                                            <Checkbox
                                                checked={selectedDevices.includes(device.id)}
                                                onCheckedChange={() => toggleSelectDevice(device.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                {getIcon(device.type)}
                                                <span className="text-base">{device.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-base">{device.type}</TableCell>
                                        <TableCell className="font-mono text-sm">{device.ipAddress || "-"}</TableCell>
                                        <TableCell className="text-base">{device.location?.name || "-"}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={getStatusColor(device.status)}>
                                                {device.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/network/${device.id}`)}>
                                                        <Search className="mr-2 h-4 w-4 ml-2" />
                                                        عرض التفاصيل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.push(`/network/${device.id}/edit`)}>
                                                        <Edit className="mr-2 h-4 w-4 ml-2" />
                                                        تعديل
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => handleDeleteSingle(device.id)}
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
                        totalItems={filteredDevices.length}
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
                selectedCount={selectedDevices.length}
                totalCount={filteredDevices.length}
                onClearSelection={() => setSelectedDevices([])}
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
