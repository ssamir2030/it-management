'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2 } from "lucide-react"

export function ServiceItemsList({ items }: { items: any[] }) {
    if (!items?.length) {
        return <div className="text-center py-10 text-muted-foreground">لا توجد خدمات معرفة حالياً</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-right">اسم الخدمة</TableHead>
                    <TableHead className="text-right">التصنيف</TableHead>
                    <TableHead className="text-center">SLA</TableHead>
                    <TableHead className="text-center">الموافقة</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.nameAr}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{item.category?.nameAr}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {item.slaHours}h
                            </div>
                        </TableCell>
                        <TableCell className="text-center">
                            {item.approvalRequired ? (
                                <Badge variant="secondary">مطلوبة</Badge>
                            ) : (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">تلقائية</Badge>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
