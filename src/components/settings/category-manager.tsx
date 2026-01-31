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
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Loader2, Folder, Tag, Layers, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { createAssetCategory as createCategory, deleteAssetCategory as deleteCategory, updateAssetCategory } from '@/app/actions/categories-v2'
import Link from "next/link"

interface Category {
    id: string
    nameAr: string
    nameEn: string
    type: string
    parentId?: string | null
    children?: Category[]
    parent?: {
        nameAr: string
        nameEn: string
    }
    _count?: {
        assets: number
    }
}

interface CategoryManagerProps {
    initialCategories: Category[]
    mode: 'main' | 'sub'
}

export function CategoryManager({ initialCategories, mode }: CategoryManagerProps) {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>(initialCategories)

    // Sync state with props when router.refresh() updates the server component
    React.useEffect(() => {
        setCategories(initialCategories)
    }, [initialCategories])

    const [isLoading, setIsLoading] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editCategory, setEditCategory] = useState<Category | null>(null)

    // Form States
    const [nameAr, setNameAr] = useState("")
    const [nameEn, setNameEn] = useState("")
    const [selectedParentId, setSelectedParentId] = useState<string>("")
    const [type, setType] = useState("IT")

    // Filter categories based on mode
    const displayedCategories = React.useMemo(() => {
        if (mode === 'main') {
            return categories.filter(c => !c.parentId)
        } else {
            // For sub-categories, we want flat list of children
            // The initialCategories might be nested or flat depending on fetch
            // But usually getAssetCategories returns parents with children included
            // We need to flatten them or the API should return all.
            // Assuming initialCategories contains ALL categories or Parent->Children structure.
            // If it returns parents with children, we extract children.
            const subs: Category[] = []
            categories.forEach(p => {
                if (p.children) {
                    p.children.forEach(c => {
                        subs.push({ ...c, parent: p })
                    })
                } else if (p.parentId) {
                    // If list is flat and this is a child
                    subs.push(p)
                }
            })
            // Also defining parents for Dropdown
            return subs
        }
    }, [categories, mode])

    const parentCategories = React.useMemo(() => {
        return categories.filter(c => !c.parentId)
    }, [categories])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        if (mode === 'sub' && !selectedParentId) {
            toast.error("يجب اختيار التصنيف الرئيسي")
            setIsLoading(false)
            return
        }

        try {
            const payload: any = {
                nameAr,
                nameEn,
                type,
            }

            if (mode === 'sub') {
                payload.parentId = selectedParentId
            }

            const res = await createCategory(payload)
            if (res.success) {
                toast.success("تم إضافة التصنيف بنجاح")
                setIsCreateOpen(false)
                resetForm()
                router.refresh()
            } else {
                toast.error(res.error || "فشل إضافة التصنيف")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setNameAr("")
        setNameEn("")
        setSelectedParentId("")
        setType("IT")
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setIsLoading(true)
        try {
            const res = await deleteCategory(deleteId)
            if (res.success) {
                toast.success("تم الحذف بنجاح")
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

    const openEdit = (cat: Category) => {
        // Allow editing - logic similar to create but update
        // For brevity in this refactor, I'll link to existing edit page or implement edit logic here later
        // The user requested "Add", editing is nice to have inline but user didn't explicitly demand inline edit.
        // Existing code had Link to /edit page. I'll keep that for now to minimize risk.
        router.push(`/settings/categories/${cat.id}/edit`)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h3 className="text-lg font-semibold">
                        {mode === 'main' ? 'قائمة التصنيفات الرئيسية' : 'قائمة التصنيفات الفرعية'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {mode === 'main'
                            ? 'إدارة الأنواع العامة للأصول (مثل: أجهزة كمبيوتر، طابعات...)'
                            : 'إدارة الأنواع الدقيقة وتحديد تبعيتها للتصنيف الرئيسي'}
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            {mode === 'main' ? 'إضافة تصنيف رئيسي' : 'إضافة تصنيف فرعي'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {mode === 'main' ? 'إضافة تصنيف رئيسي جديد' : 'إضافة تصنيف فرعي جديد'}
                            </DialogTitle>
                            <DialogDescription>
                                أدخل تفاصيل التصنيف الجديد
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>الاسم بالعربية</Label>
                                    <Input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder="مثال: طابعات، لابتوب..." required />
                                </div>
                                <div className="space-y-2">
                                    <Label>الاسم بالإنجليزية</Label>
                                    <Input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="e.g. Printers, Laptops" required />
                                </div>

                                {mode === 'sub' && (
                                    <div className="space-y-2">
                                        <Label>تابع للتصنيف الرئيسي</Label>
                                        <Select value={selectedParentId} onValueChange={setSelectedParentId} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر التصنيف الرئيسي" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {parentCategories.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.nameAr}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    حفظ
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="text-right">الاسم</TableHead>
                            {mode === 'sub' && <TableHead className="text-right">التصنيف الرئيسي</TableHead>}
                            <TableHead className="text-center">عدد الأصول</TableHead>
                            <TableHead className="text-left">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {displayedCategories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={mode === 'sub' ? 5 : 4} className="text-center py-8 text-muted-foreground">
                                    لا توجد بيانات
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayedCategories.map((cat) => (
                                <TableRow key={cat.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        {mode === 'main' ? <Folder className="h-4 w-4 text-primary" /> : <Tag className="h-4 w-4 text-blue-500" />}
                                    </TableCell>
                                    <TableCell className="font-medium text-right">
                                        <div className="flex flex-col items-start gap-1">
                                            <span>{cat.nameAr}</span>
                                            <span className="text-xs text-muted-foreground">{cat.nameEn}</span>
                                        </div>
                                    </TableCell>
                                    {mode === 'sub' && (
                                        <TableCell className="text-right">
                                            {cat.parent ? (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded w-fit">
                                                    <Folder className="h-3 w-3" />
                                                    {cat.parent.nameAr}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                    )}
                                    <TableCell className="text-center">
                                        {cat._count?.assets || 0}
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                                                <Pencil className="h-4 w-4 text-primary" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(cat.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من الحذف؟
                            {mode === 'main' && " سيتم حذف جميع التصنيفات الفرعية التابعة له إذا وجدت."}
                            <br />
                            لا يمكن الحذف إذا كانت هناك أصول مرتبطة.
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
            </Dialog>
        </div>
    )
}
