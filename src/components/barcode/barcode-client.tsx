"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getEmployeeCustodyForBarcode } from "@/app/actions/barcode"
import { Loader2, Printer, ScanBarcode, User } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

interface BarcodeClientProps {
    employees: any[]
}

export function BarcodeClient({ employees }: BarcodeClientProps) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
    const [custodyItems, setCustodyItems] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)

    async function handleEmployeeChange(value: string) {
        setSelectedEmployeeId(value)
        setIsLoading(true)
        const result = await getEmployeeCustodyForBarcode(value)
        if (result.success) {
            setCustodyItems(result.data || [])
        }
        setIsLoading(false)
    }

    return (
        <div className="space-y-8">
            <PremiumPageHeader
                title="طباعة الباركود"
                description="طباعة ملصقات الباركود للأصول المسلمة للموظفين"
                icon={ScanBarcode}
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        اختر الموظف
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={handleEmployeeChange}>
                        <SelectTrigger className="w-full md:w-[400px]">
                            <SelectValue placeholder="ابحث عن موظف..." />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                    {emp.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedEmployeeId && (
                <Card>
                    <CardHeader>
                        <CardTitle>الأصول المسلمة (العهد)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : custodyItems.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">اسم الأصل</TableHead>
                                        <TableHead className="text-right">رقم الأصل (Tag)</TableHead>
                                        <TableHead className="text-right">تاريخ التسليم</TableHead>
                                        <TableHead className="text-left">طباعة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {custodyItems.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.asset?.name || item.name}</TableCell>
                                            <TableCell className="font-mono">{item.asset?.tag || "N/A"}</TableCell>
                                            <TableCell>{new Date(item.assignedDate).toLocaleDateString('ar-SA')}</TableCell>
                                            <TableCell className="text-left">
                                                {item.asset?.tag ? (
                                                    <Link href={`/barcode/print/${item.id}`} target="_blank">
                                                        <Button size="sm" variant="outline" className="gap-2">
                                                            <Printer className="h-4 w-4" />
                                                            طباعة الملصق
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">لا يوجد رقم أصل</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                لا توجد عهد مسجلة لهذا الموظف
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
