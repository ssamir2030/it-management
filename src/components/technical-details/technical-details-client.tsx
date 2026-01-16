"use client"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import Link from "next/link"
import { Plus, Search, FileCode2, Trash2 } from "lucide-react"
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
import { useState } from "react"
import { deleteTechnicalDetails } from "@/app/actions/technical-details"

interface TechnicalDetailsClientProps {
    items: any[]
}

export function TechnicalDetailsClient({ items }: TechnicalDetailsClientProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredItems = items.filter(item =>
        item.computerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-8">
            <PremiumPageHeader
                title="التفاصيل الفنية للأصول"
                description="سجل فني شامل للأجهزة والبرمجيات وتراخيصها"
                icon={FileCode2}
                rightContent={
                    <Link href="/technical-details/new">
                        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                            <Plus className="h-4 w-4" />
                            إضافة سجل جديد
                        </Button>
                    </Link>
                }
                stats={[
                    { label: "إجمالي السجلات", value: items.length, icon: FileCode2 },
                ]}
            />

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="بحث (اسم الجهاز، الموظف، السيريال)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 h-11"
                    />
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="text-right">اسم الجهاز</TableHead>
                            <TableHead className="text-right">الموظف</TableHead>
                            <TableHead className="text-right">المواصفات (CPU/RAM)</TableHead>
                            <TableHead className="text-right">نظام التشغيل</TableHead>
                            <TableHead className="text-right">Service Tag</TableHead>
                            <TableHead className="text-left">إجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id} className="group hover:bg-muted/50">
                                <TableCell className="font-medium">{item.computerName}</TableCell>
                                <TableCell>{item.employee.name}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {item.processor} / {item.ram}
                                </TableCell>
                                <TableCell>{item.os}</TableCell>
                                <TableCell className="font-mono text-xs">{item.serialNumber}</TableCell>
                                <TableCell className="text-left">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={async () => {
                                            if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
                                                await deleteTechnicalDetails(item.id)
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredItems.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    لا توجد سجلات
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
