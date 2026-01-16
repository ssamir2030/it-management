'use client'

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    MapPin, Users, Monitor, Plus, Search,
    Edit, Trash2, Map, MoreHorizontal
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

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { LocationStats } from "@/components/locations/location-stats"
import { Pagination } from "@/components/ui/pagination"
import { SelectionBar } from "@/components/ui/data-table/selection-bar"

interface Location {
    id: string
    name: string
    address: string | null
    googleMapsUrl: string | null
    latitude: number | null
    longitude: number | null
    createdAt: Date
    updatedAt: Date
    _count: {
        employees: number
        assets: number
    }
}

interface LocationClientProps {
    locations: Location[]
}

export function LocationClient({ locations }: LocationClientProps) {
    const router = useRouter()

    // -- State --
    const [searchQuery, setSearchQuery] = useState("")

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Selection State
    const [selectedLocations, setSelectedLocations] = useState<string[]>([])

    // -- Derived State (Filtering) --
    const filteredLocations = useMemo(() => {
        return locations.filter(location =>
            location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (location.address && location.address.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    }, [locations, searchQuery])

    // -- Pagination Logic --
    const paginatedLocations = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredLocations.slice(startIndex, startIndex + pageSize)
    }, [filteredLocations, currentPage, pageSize])

    const totalPages = Math.ceil(filteredLocations.length / pageSize)

    // -- Selection Logic --
    const toggleSelectAll = () => {
        if (selectedLocations.length === paginatedLocations.length) {
            setSelectedLocations([])
        } else {
            setSelectedLocations(paginatedLocations.map(l => l.id))
        }
    }

    const toggleSelectLocation = (id: string) => {
        if (selectedLocations.includes(id)) {
            setSelectedLocations(selectedLocations.filter(l => l !== id))
        } else {
            setSelectedLocations([...selectedLocations, id])
        }
    }

    // -- Actions --
    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedLocations.length} موقع؟`)) return

        const { deleteLocation } = await import("@/app/actions/locations")
        for (const id of selectedLocations) {
            await deleteLocation(id)
        }

        setSelectedLocations([])
        router.refresh()
    }

    // -- Stats --
    const stats = useMemo(() => {
        return {
            totalLocations: locations.length,
            totalEmployees: locations.reduce((acc, loc) => acc + loc._count.employees, 0),
            totalAssets: locations.reduce((acc, loc) => acc + loc._count.assets, 0)
        }
    }, [locations])

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            {/* 1. Header */}
            <PremiumPageHeader
                title="المواقع"
                description="إدارة الفروع والمواقع الجغرافية للشركة"
                icon={MapPin}
                rightContent={
                    <Link href="/locations/new">
                        <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40">
                            <Plus className="h-4 w-4" />
                            إضافة موقع جديد
                        </Button>
                    </Link>
                }
            />

            {/* 2. Stats */}
            <div className="animate-slide-up stagger-1 mb-8 mt-4">
                <LocationStats
                    totalLocations={stats.totalLocations}
                    totalEmployees={stats.totalEmployees}
                    totalAssets={stats.totalAssets}
                />
            </div>

            {/* 3. Controls & Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up stagger-2">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="بحث في المواقع..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="pr-10 h-11 bg-card shadow-sm border-muted/60 focus:border-primary/50 text-base"
                    />
                </div>
            </div>

            {/* 4. Data Table */}
            <div className="card-elevated overflow-hidden animate-slide-up stagger-3">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="w-[50px] py-4">
                                    <Checkbox
                                        checked={paginatedLocations.length > 0 && selectedLocations.length === paginatedLocations.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="text-right font-semibold">اسم الموقع</TableHead>
                                <TableHead className="text-right font-semibold">العنوان</TableHead>
                                <TableHead className="text-right font-semibold">الموظفين</TableHead>
                                <TableHead className="text-right font-semibold">الأصول</TableHead>
                                <TableHead className="text-right font-semibold">الإحداثيات</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedLocations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <div className="p-4 rounded-full bg-muted/50">
                                                <MapPin className="h-8 w-8 opacity-50" />
                                            </div>
                                            <p className="text-lg font-medium">لا توجد مواقع</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedLocations.map((location) => (
                                    <TableRow key={location.id} className="group hover:bg-muted/40 transition-colors">
                                        <TableCell className="py-4">
                                            <Checkbox
                                                checked={selectedLocations.includes(location.id)}
                                                onCheckedChange={() => toggleSelectLocation(location.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{location.name}</span>
                                                    {location.googleMapsUrl && (
                                                        <a
                                                            href={location.googleMapsUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                                        >
                                                            <Map className="h-3 w-3" />
                                                            الخريطة
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{location.address || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                <Users className="h-3 w-3" />
                                                {location._count.employees}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100">
                                                <Monitor className="h-3 w-3" />
                                                {location._count.assets}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground" dir="ltr">
                                            {location.latitude && location.longitude
                                                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                                                : '-'}
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
                                                        <Link href={`/locations/${location.id}/edit`} className="flex items-center">
                                                            <Edit className="mr-2 h-4 w-4 ml-2" />
                                                            تعديل
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/locations/${location.id}/floor-plan`} className="flex items-center">
                                                            <Map className="mr-2 h-4 w-4 ml-2" />
                                                            المخطط
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={async () => {
                                                        if (confirm('تأكيد الحذف؟')) {
                                                            const { deleteLocation } = await import("@/app/actions/locations")
                                                            await deleteLocation(location.id)
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
                        totalItems={filteredLocations.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size)
                            setCurrentPage(1)
                        }}
                    />
                </div>
            </div>

            {/* 5. Floating Action Bar */}
            <SelectionBar
                selectedCount={selectedLocations.length}
                totalCount={filteredLocations.length}
                onClearSelection={() => setSelectedLocations([])}
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
