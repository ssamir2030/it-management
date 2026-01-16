'use client'

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { CreditCard } from "lucide-react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Search, Phone, Edit, Wifi, Smartphone } from "lucide-react"
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
import { TelecomStats } from "@/components/telecom/telecom-stats"
import { TelecomFilters } from "@/components/telecom/telecom-filters"
import { TelecomDeleteButton } from "@/components/telecom/telecom-delete-button"
import { Badge } from "@/components/ui/badge"

interface TelecomService {
    id: string
    type: string
    provider: string
    accountNumber: string | null
    phoneNumber: string | null
    planDetails: string | null
    cost: number | null
    billingCycle: string | null
    employee?: {
        name: string
        department: { name: string } | null
    } | null
}

interface TelecomClientProps {
    services: TelecomService[]
}

export function TelecomClient({ services }: TelecomClientProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedProvider, setSelectedProvider] = useState("all")
    const [selectedType, setSelectedType] = useState("all")

    // Extract unique providers
    const providers = useMemo(() => {
        return Array.from(new Set(services.map(s => s.provider))).sort()
    }, [services])

    // Filter logic
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch =
                (service.provider && service.provider.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (service.phoneNumber && service.phoneNumber.includes(searchQuery)) ||
                (service.accountNumber && service.accountNumber.includes(searchQuery)) ||
                (service.employee && service.employee.name.toLowerCase().includes(searchQuery.toLowerCase()))

            const matchesProvider = selectedProvider === "all" || service.provider === selectedProvider
            const matchesType = selectedType === "all" || service.type === selectedType

            return matchesSearch && matchesProvider && matchesType
        })
    }, [services, searchQuery, selectedProvider, selectedType])

    // Stats calculation
    const stats = useMemo(() => {
        return {
            total: services.length,
            totalCost: services.reduce((acc, curr) => acc + (curr.cost || 0), 0),
            internetCount: services.filter(s => s.type === 'INTERNET').length,
            simCount: services.filter(s => s.type === 'SIM').length
        }
    }, [services])

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'INTERNET': return <Wifi className="h-4 w-4" />
            case 'SIM': return <Smartphone className="h-4 w-4" />
            default: return <Phone className="h-4 w-4" />
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <PremiumPageHeader
                title="خدمات الاتصالات"
                description="إدارة خطوط الهاتف، الإنترنت، والشرائح"
                icon={Phone}
                rightContent={
                    <Link href="/telecom/new">
                        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            <Plus className="h-4 w-4" />
                            إضافة خدمة جديدة
                        </Button>
                    </Link>
                }
                stats={[
                    { label: "إجمالي الخدمات", value: stats.total, icon: Phone },
                    { label: "إجمالي التكلفة", value: stats.totalCost.toLocaleString() + ' ر.س', icon: CreditCard },
                    { label: "خطوط الإنترنت", value: stats.internetCount, icon: Wifi },
                    { label: "شرائح الجوال", value: stats.simCount, icon: Smartphone },
                ]}
            />

            {/* Filters & Search */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="بحث (المزود، الرقم، الموظف)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10 h-11 bg-card shadow-sm border-muted/50 focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>
                <TelecomFilters
                    providers={providers}
                    selectedProvider={selectedProvider}
                    selectedType={selectedType}
                    onProviderChange={setSelectedProvider}
                    onTypeChange={setSelectedType}
                    onClearFilters={() => {
                        setSelectedProvider("all")
                        setSelectedType("all")
                        setSearchQuery("")
                    }}
                />
            </div>

            {/* Table */}
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="text-right font-semibold">النوع</TableHead>
                            <TableHead className="text-right font-semibold">المزود</TableHead>
                            <TableHead className="text-right font-semibold">رقم الهاتف / الحساب</TableHead>
                            <TableHead className="text-right font-semibold">الموظف المسؤول</TableHead>
                            <TableHead className="text-right font-semibold">الباقة</TableHead>
                            <TableHead className="text-right font-semibold">التكلفة</TableHead>
                            <TableHead className="text-left font-semibold">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredServices.map((service) => (
                            <TableRow key={service.id} className="group hover:bg-muted/50 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                            {getTypeIcon(service.type)}
                                        </div>
                                        <span>
                                            {service.type === 'INTERNET' ? 'إنترنت' :
                                                service.type === 'SIM' ? 'شريحة' : 'هاتف ثابت'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal">
                                        {service.provider}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                    {service.phoneNumber || service.accountNumber || '-'}
                                </TableCell>
                                <TableCell>
                                    {service.employee ? (
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{service.employee.name}</span>
                                            <span className="text-xs text-muted-foreground">{service.employee.department?.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-sm">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">{service.planDetails || '-'}</TableCell>
                                <TableCell className="font-semibold text-green-600">
                                    {service.cost?.toLocaleString()} ر.س
                                </TableCell>
                                <TableCell className="text-left">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/telecom/${service.id}/edit`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <TelecomDeleteButton id={service.id} serviceName={`${service.provider} - ${service.phoneNumber || service.accountNumber}`} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredServices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Phone className="h-8 w-8 opacity-20" />
                                        <p>لا توجد خدمات مطابقة للبحث</p>
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
