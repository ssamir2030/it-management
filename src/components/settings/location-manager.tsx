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
import { Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import { createLocation, deleteLocation, updateLocation } from "@/app/actions/locations"

interface Location {
    id: string
    name: string
    _count?: {
        assets: number
    }
}

interface LocationManagerProps {
    initialLocations: Location[]
}

export function LocationManager({ initialLocations }: LocationManagerProps) {
    const router = useRouter()
    const [locations, setLocations] = useState<Location[]>(initialLocations)

    // Sync with props
    React.useEffect(() => {
        setLocations(initialLocations)
    }, [initialLocations])

    const [isLoading, setIsLoading] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editLocation, setEditLocation] = useState<Location | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // Form States
    const [name, setName] = useState("")

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name)

            const res = await createLocation(formData)
            if (res.success) {
                toast.success("تم إضافة الموقع بنجاح")
                setIsCreateOpen(false)
                setName("")
                router.refresh()
            } else {
                toast.error(res.error || "فشل إضافة الموقع")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editLocation) return

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name)

            const res = await updateLocation(editLocation.id, formData)
            if (res.success) {
                toast.success("تم تحديث الموقع بنجاح")
                setEditLocation(null)
                setName("")
                router.refresh()
            } else {
                toast.error(res.error || "فشل تحديث الموقع")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        setIsLoading(true)
        try {
            const res = await deleteLocation(deleteId)
            if (res.success) {
                toast.success("تم حذف الموقع بنجاح")
                setDeleteId(null)
                router.refresh()
            } else {
                toast.error(res.error || "فشل حذف الموقع")
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الحذف")
        } finally {
            setIsLoading(false)
        }
    }

    const openEdit = (loc: Location) => {
        setEditLocation(loc)
        setName(loc.name)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
                <div>
                    <h3 className="text-lg font-semibold">قائمة المواقع</h3>
                    <p className="text-sm text-muted-foreground">إدارة المواقع الجغرافية والغرف في النظام</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة موقع
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة موقع جديد</DialogTitle>
                            <DialogDescription>
                                قم بإدخال اسم الموقع أو الغرفة
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">اسم الموقع</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="مثال: معمل 1، المكتب الرئيسي"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>إلغاء</Button>
                                <Button type="submit" disabled={isLoading} className="gap-2">
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
                            <TableHead className="text-right">اسم الموقع</TableHead>
                            <TableHead className="text-center">عدد الأصول المرتبطة</TableHead>
                            <TableHead className="text-left">الإجراءات</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialLocations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    لا توجد مواقع مضافة حالياً
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialLocations.map((loc) => (
                                <TableRow key={loc.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <MapPin className="h-4 w-4 text-primary/50" />
                                    </TableCell>
                                    <TableCell className="font-medium text-right">
                                        {loc.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {loc._count?.assets || 0}
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEdit(loc)}>
                                                <Pencil className="h-4 w-4 text-primary" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => setDeleteId(loc.id)}>
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

            {/* Edit Dialog */}
            <Dialog open={!!editLocation} onOpenChange={(open) => !open && setEditLocation(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تعديل الموقع</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">اسم الموقع</Label>
                                <Input
                                    id="edit-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditLocation(null)}>إلغاء</Button>
                            <Button type="submit" disabled={isLoading} className="gap-2">
                                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                حفظ التعديلات
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تأكيد الحذف</DialogTitle>
                        <DialogDescription>
                            هل أنت متأكد من حذف هذا الموقع؟
                            لن يتم الحذف إذا كانت هناك أصول مرتبطة به.
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
