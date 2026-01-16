"use client"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Tags, Plus, Edit2, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown, Monitor, Armchair, Box } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { getAssetCategories, createAssetCategory, updateAssetCategory, deleteAssetCategory } from "@/app/actions/categories"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield } from "lucide-react"

type Category = {
    id: string
    nameAr: string
    nameEn: string
    type: string
    icon: string | null
    prefix: string | null
    parentId: string | null
    parent?: { nameAr: string } | null
    _count?: { assets: number; children: number }
    children?: Category[]
}

interface CategoriesViewProps {
    readOnly: boolean
}

export default function CategoriesView({ readOnly }: CategoriesViewProps) {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        nameAr: "",
        nameEn: "",
        type: "IT",
        prefix: "",
        parentId: "none"
    })

    const fetchCategories = async () => {
        setLoading(true)
        const result = await getAssetCategories() as { success: boolean; data?: Category[]; error?: string }
        if (result.success && result.data) {
            setCategories(result.data)
        } else {
            if (result.error === "Unauthorized") {
                // Should ideally be handled by page.tsx redirect/check, but fallback here
                // But wait, page.tsx allows view_settings or manage_settings.
                // If Unauthorized returned, it means NEITHER permission.
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleOpenDialog = (category?: Category) => {
        if (readOnly) return

        if (category) {
            setEditingCategory(category)
            setFormData({
                nameAr: category.nameAr,
                nameEn: category.nameEn,
                type: category.type,
                prefix: category.prefix || "",
                parentId: category.parentId || "none"
            })
        } else {
            setEditingCategory(null)
            setFormData({
                nameAr: "",
                nameEn: "",
                type: "IT",
                prefix: "",
                parentId: "none"
            })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (readOnly) return

        if (!formData.nameAr || !formData.nameEn) {
            toast.error("الرجاء تعبئة الحقول المطلوبة")
            return
        }

        const dataToSubmit = {
            ...formData,
            parentId: formData.parentId === "none" ? null : formData.parentId
        }

        if (editingCategory) {
            const result = await updateAssetCategory(editingCategory.id, dataToSubmit)
            if (result.success) {
                toast.success("تم تحديث التصنيف بنجاح")
                setIsDialogOpen(false)
                fetchCategories()
            } else {
                toast.error(result.error || "فشل التحديث")
            }
        } else {
            const result = await createAssetCategory(dataToSubmit)
            if (result.success) {
                toast.success("تم إضافة التصنيف بنجاح")
                setIsDialogOpen(false)
                fetchCategories()
            } else {
                toast.error(result.error || "فشل الإضافة")
            }
        }
    }

    const handleDelete = async () => {
        if (readOnly) return
        if (!deleteId) return
        const result = await deleteAssetCategory(deleteId)
        if (result.success) {
            toast.success("تم الحذف بنجاح")
            fetchCategories()
        } else {
            toast.error(result.error || "فشل الحذف")
        }
        setDeleteId(null)
    }

    // Build Hierarchy Tree
    const buildTree = (items: Category[]) => {
        const rootItems = items.filter(i => !i.parentId)
        return rootItems.map(root => ({
            ...root,
            children: items.filter(i => i.parentId === root.id)
        }))
    }

    const treeData = buildTree(categories)

    // Setup Type Icons
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'IT': return <Monitor className="w-4 h-4" />
            case 'FURNITURE': return <Armchair className="w-4 h-4" />
            default: return <Box className="w-4 h-4" />
        }
    }

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                backLink="/admin/settings"
                backText="الإعدادات"
                title="تصنيفات الأصول"
                description="إدارة شجرة التصنيفات والأنواع والفئات الفرعية"
                icon={Tags}
                rightContent={
                    !readOnly && (
                        <Button onClick={() => handleOpenDialog()} className="gap-2">
                            <Plus className="w-4 h-4" />
                            تصنيف جديد
                        </Button>
                    )
                }
            />

            {readOnly && (
                <Alert variant="default" className="bg-muted border-primary/20">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>وضع المشاهدة فقط</AlertTitle>
                    <AlertDescription>
                        ليس لديك صلاحية لتعديل التصنيفات. يمكنك فقط استعراض الهيكلية.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6">
                {loading ? (
                    <Card className="text-center py-12 text-muted-foreground">
                        جاري التحميل...
                    </Card>
                ) : categories.length === 0 ? (
                    <Card className="text-center py-12 text-muted-foreground">
                        لا توجد تصنيفات، ابدأ بإضافة واحد جديد.
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {treeData.map((parent) => (
                            <Card key={parent.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                {getTypeIcon(parent.type)}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{parent.nameAr}</CardTitle>
                                                <CardDescription className="text-xs font-mono mt-1">{parent.nameEn}</CardDescription>
                                            </div>
                                        </div>
                                        {!readOnly && (
                                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleOpenDialog(parent)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(parent.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1">
                                                <Box className="w-3 h-3" />
                                                الأصول: {parent._count?.assets || 0}
                                            </span>
                                            <Badge variant="outline">{parent.type}</Badge>
                                        </div>

                                        {parent.children && parent.children.length > 0 && (
                                            <div className="border-t pt-3">
                                                <p className="text-xs font-bold text-muted-foreground mb-2">الفئات الفرعية:</p>
                                                <ul className="space-y-1">
                                                    {parent.children.map(child => (
                                                        <li key={child.id} className="flex items-center justify-between text-sm bg-muted/20 p-2 rounded-md group hover:bg-muted/50 transition-colors">
                                                            <div className="flex items-center gap-2">
                                                                <ChevronDown className="w-3 h-3 rotate-90 text-muted-foreground" />
                                                                <span>{child.nameAr}</span>
                                                            </div>
                                                            {!readOnly && (
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenDialog(child)}>
                                                                        <Edit2 className="w-3 h-3" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeleteId(child.id)}>
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {(!parent.children || parent.children.length === 0) && (
                                            <p className="text-xs text-muted-foreground text-center py-2 border-t border-dashed">
                                                لا توجد فئات فرعية
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Dialog */}
            {!readOnly && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? "تعديل التصنيف" : "تصنيف جديد"}</DialogTitle>
                            <DialogDescription>
                                قم بإدخال تفاصيل التصنيف. يمكن ربطه بتصنيف رئيسي لجعله فرعياً.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>الاسم (عربي)</Label>
                                    <Input
                                        value={formData.nameAr}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                                        placeholder="مثال: أجهزة حاسوب"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>الاسم (إنجليزي)</Label>
                                    <Input
                                        value={formData.nameEn}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                                        placeholder="Ex: Computers"
                                        className="text-left dir-ltr"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>النوع (Type)</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IT">IT Equipment</SelectItem>
                                            <SelectItem value="FURNITURE">Furniture</SelectItem>
                                            <SelectItem value="GENERAL">General</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>بادئة الكود (Prefix)</Label>
                                    <Input
                                        value={formData.prefix}
                                        onChange={(e) => setFormData(prev => ({ ...prev, prefix: e.target.value }))}
                                        placeholder="مثال: PC, PRT"
                                        className="uppercase font-mono"
                                        maxLength={5}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>التصنيف الرئيسي (Parent)</Label>
                                <Select
                                    value={formData.parentId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, parentId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر تصنيفاً رئيسياً (اختياري)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">-- بدون (رئيسي) --</SelectItem>
                                        {categories
                                            .filter(c => !c.parentId && c.id !== editingCategory?.id) // Only main categories, exclude self
                                            .map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.nameAr}</SelectItem>
                                            ))
                                        }
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                            <Button onClick={handleSubmit}>{editingCategory ? "حفظ التغييرات" : "إضافة التصنيف"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation */}
            {!readOnly && (
                <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                            <AlertDialogDescription>
                                لا يمكن التراجع عن هذا الإجراء. لا يمكن حذف التصنيفات المرتبطة بأصول أو تصنيفات فرعية.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                نعم، احذف
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}
