'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { useState } from "react"
import { createCategory } from "@/app/actions/knowledge"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function CategoriesList({ categories }: { categories: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleCreate(formData: FormData) {
        setLoading(true)
        const result = await createCategory(formData)
        setLoading(false)

        if (result.success) {
            toast.success("تم إضافة التصنيف")
            setOpen(false)
        } else {
            toast.error(result.error)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            تصنيف جديد
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
                        </DialogHeader>
                        <form action={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>اسم التصنيف</Label>
                                <Input name="nameAr" required placeholder="مثال: مشاكل الشبكة" />
                            </div>
                            <div className="space-y-2">
                                <Label>الوصف</Label>
                                <Input name="description" placeholder="وصف قصير للتصنيف..." />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>حفظ</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-right">اسم التصنيف</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-center">عدد المقالات</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((cat) => (
                        <TableRow key={cat.id}>
                            <TableCell className="font-medium">{cat.nameAr}</TableCell>
                            <TableCell className="text-muted-foreground">{cat.description || '-'}</TableCell>
                            <TableCell className="text-center">{cat._count?.articles || 0}</TableCell>
                        </TableRow>
                    ))}
                    {categories.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                لا توجد تصنيفات
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
