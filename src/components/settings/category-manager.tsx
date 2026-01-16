"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Loader2, Save, ChevronDown, ChevronLeft } from "lucide-react"
import { toast } from "sonner"
import { deleteAssetCategory as deleteCategory } from '@/app/actions/categories-v2'
import Link from "next/link"

interface Category {
    id: string
    nameAr: string
    nameEn: string
    type: string
    parentId?: string | null
    children?: Category[]
    _count?: {
        assets: number
    }
}

interface CategoryManagerProps {
    initialCategories: Category[]
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
    const router = useRouter()
    const [categories] = useState<Category[]>(initialCategories)
    const [isLoading, setIsLoading] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedCategories(newExpanded)
    }

    async function handleDelete() {
        if (!deleteId) return

        setIsLoading(true)
        try {
            const res = await deleteCategory(deleteId)
            if (res.success) {
                toast.success("تم حذف التصنيف بنجاح")
                setDeleteId(null)
                router.refresh()
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الحذف")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h3 className="text-lg font-semibold">قائمة التصنيفات</h3>
                    <p className="text-sm text-muted-foreground">إدارة تصنيفات الأصول المتاحة في النظام</p>
                </div>
                <Link href="/settings/categories/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        إضافة تصنيف
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="text-right w-[30%]">الاسم</TableHead>
                            <TableHead className="text-center">تصنيف</TableHead>
                            <TableHead className="text-right">النوع العام</TableHead>
                            <TableHead className="text-center">عدد الأصول</TableHead>
                            <TableHead className="text-left">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    لا توجد تصنيفات مضافة حالياً
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.filter((c) => !c.parentId).map((parent) => {
                                const hasChildren = parent.children && parent.children.length > 0
                                const isExpanded = expandedCategories.has(parent.id)

                                return (
                                    <React.Fragment key={parent.id}>
                                        {/* Main Category Row */}
                                        <TableRow className="bg-muted/30 font-semibold hover:bg-muted/50 transition-colors">
                                            <TableCell>
                                                {hasChildren && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => toggleExpand(parent.id)}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                                                        )}
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <span>{parent.nameAr}</span>
                                                <span className="text-muted-foreground font-normal text-sm">({parent.nameEn})</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
                                                    رئيسي
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                    {parent.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {parent._count?.assets || 0}
                                            </TableCell>
                                            <TableCell className="text-left">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/settings/categories/${parent.id}/edit`}>
                                                        <Button variant="ghost" size="icon">
                                                            <Pencil className="h-4 w-4 text-primary" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(parent.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell >
                                        </TableRow >

                                        {/* Sub Categories Rows */}
                                        {isExpanded && parent.children?.map((child) => (
                                            <TableRow key={child.id} className="hover:bg-muted/10 animate-in fade-in slide-in-from-top-1">
                                                <TableCell></TableCell>
                                                <TableCell className="pr-8 flex items-center gap-2">
                                                    <span className="text-muted-foreground">↳</span>
                                                    <span>{child.nameAr}</span>
                                                    <span className="text-muted-foreground text-sm">({child.nameEn})</span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20">
                                                        فرعي
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground border-border bg-background">
                                                        {child.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center text-muted-foreground text-sm">
                                                    {child._count?.assets || 0}
                                                </TableCell>
                                                <TableCell className="text-left">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/settings/categories/${child.id}/edit`}>
                                                            <Button variant="ghost" size="icon">
                                                                <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(child.id)}>
                                                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </React.Fragment>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            < Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من رغبتك في حذف هذا التصنيف؟ لا يمكن التراجع عن هذا الإجراء.
                            لن يتم الحذف إذا كانت هناك أصول مرتبطة بهذا التصنيف.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>إلغاء</Button>
                        <Button variant="destructive" disabled={isLoading} onClick={handleDelete} className="gap-2">
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            حذف
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    )
}
