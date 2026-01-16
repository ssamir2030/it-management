'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Key, User, Monitor, Users, Trash, Plus, Shield, Banknote, Building2 } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { assignLicense, unassignLicense } from "@/app/actions/licenses"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { SearchableSelect } from "@/components/ui/searchable-select" 

interface LicenseDetailsClientProps {
    license: any // Typed as any for flexibility, ideally proper type
    assets: any[] // Available assets for assignment
    employees: any[] // Available employees for assignment
}

export function LicenseDetailsClient({ license, assets, employees }: LicenseDetailsClientProps) {
    const router = useRouter()
    const [isAssignAssetOpen, setIsAssignAssetOpen] = useState(false)
    const [isAssignEmployeeOpen, setIsAssignEmployeeOpen] = useState(false)
    const [selectedAssetId, setSelectedAssetId] = useState("")
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
    const [loading, setLoading] = useState(false)

    const usedCount = (license._count?.assets || 0) + (license._count?.employees || 0)
    const available = license.seats - usedCount

    const handleAssign = async (type: 'ASSET' | 'EMPLOYEE') => {
        const entityId = type === 'ASSET' ? selectedAssetId : selectedEmployeeId
        if (!entityId) return

        setLoading(true)
        const result = await assignLicense(license.id, entityId, type)
        setLoading(false)

        if (result.success) {
            toast.success("تم التعيين بنجاح")
            if (type === 'ASSET') setIsAssignAssetOpen(false)
            else setIsAssignEmployeeOpen(false)
            router.refresh()
        } else {
            toast.error(result.error || "فشل التعيين")
        }
    }

    const handleUnassign = async (entityId: string, type: 'ASSET' | 'EMPLOYEE') => {
        if (!confirm("هل أنت متأكد من إلغاء التعيين؟")) return

        const result = await unassignLicense(license.id, entityId, type)
        if (result.success) {
            toast.success("تم إلغاء التعيين بنجاح")
            router.refresh()
        } else {
            toast.error(result.error || "فشل العملية")
        }
    }

    const isExpired = license.expiryDate && new Date(license.expiryDate) < new Date()

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Overview Column */}
            <div className="md:col-span-1 space-y-6">
                <Card>
                    <CardHeader className="bg-slate-50 border-b pb-4">
                        <CardTitle className="text-lg">تفاصيل الرخصة</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground font-semibold">المفتاح / Key</span>
                            <div className="flex items-center gap-2 font-mono bg-slate-100 p-2 rounded text-sm break-all">
                                <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                                {license.key || 'N/A'}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-semibold">النوع</span>
                                <div>
                                    <Badge variant="outline">
                                        {license.type === 'SUBSCRIPTION' ? 'اشتراك' :
                                            license.type === 'PERPETUAL' ? 'دائم' : 'مجاني'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-semibold">المقاعد</span>
                                <div className="font-bold flex items-center gap-1">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    {license.seats}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground font-semibold">الحالة</span>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">المستخدم: {usedCount}</span>
                                <span className={`text-sm font-bold ${available <= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    المتاح: {available}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                                <div
                                    className={`h-full ${available <= 0 ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min((usedCount / license.seats) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground font-semibold">تاريخ الانتهاء</span>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className={isExpired ? "text-red-600 font-bold" : ""}>
                                    {license.expiryDate ? format(new Date(license.expiryDate), 'dd/MM/yyyy') : 'مدى الحياة'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground font-semibold">المورد</span>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span>{license.supplier?.name || '-'}</span>
                            </div>
                        </div>

                        {license.cost > 0 && (
                            <div className="space-y-1">
                                <span className="text-xs text-muted-foreground font-semibold">التكلفة</span>
                                <div className="flex items-center gap-2">
                                    <Banknote className="h-4 w-4 text-green-600" />
                                    <span>{license.cost.toLocaleString()} ر.س</span>
                                </div>
                            </div>
                        )}

                        {license.notes && (
                            <div className="space-y-1 pt-2 border-t">
                                <span className="text-xs text-muted-foreground font-semibold">ملاحظات</span>
                                <p className="text-sm text-slate-600">{license.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Assignments Column */}
            <div className="md:col-span-2">
                <Tabs defaultValue="assets" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="assets" className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            الأصول المرتبطة ({license.assets.length})
                        </TabsTrigger>
                        <TabsTrigger value="employees" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            الموظفين المرتبطين ({license.employees.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="assets" className="space-y-4">
                        <div className="flex justify-end">
                            <Dialog open={isAssignAssetOpen} onOpenChange={setIsAssignAssetOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" disabled={available <= 0} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        تعيين لأصل
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>تعيين الرخصة لأصل</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>اختر الأصل</Label>
                                            <Select onValueChange={setSelectedAssetId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="بحث عن أصل..." />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    {assets.map(asset => (
                                                        <SelectItem key={asset.id} value={asset.id}>
                                                            {asset.name} ({asset.tag})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={() => handleAssign('ASSET')}
                                            disabled={loading || !selectedAssetId}
                                            className="w-full"
                                        >
                                            {loading ? "جاري التعيين..." : "تأكيد التعيين"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid gap-3">
                            {license.assets.map((asset: any) => (
                                <Card key={asset.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center">
                                            <Monitor className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{asset.name}</p>
                                            <p className="text-xs text-muted-foreground">{asset.tag}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleUnassign(asset.id, 'ASSET')}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </Card>
                            ))}
                            {license.assets.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground bg-slate-50 border rounded-lg border-dashed">
                                    لا توجد أصول مرتبطة بهذه الرخصة
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="employees" className="space-y-4">
                        <div className="flex justify-end">
                            <Dialog open={isAssignEmployeeOpen} onOpenChange={setIsAssignEmployeeOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" disabled={available <= 0} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        تعيين لموظف
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>تعيين الرخصة لموظف</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>اختر الموظف</Label>
                                            <Select onValueChange={setSelectedEmployeeId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="بحث عن موظف..." />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    {employees.map(emp => (
                                                        <SelectItem key={emp.id} value={emp.id}>
                                                            {emp.name} - {emp.jobTitle}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            onClick={() => handleAssign('EMPLOYEE')}
                                            disabled={loading || !selectedEmployeeId}
                                            className="w-full"
                                        >
                                            {loading ? "جاري التعيين..." : "تأكيد التعيين"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid gap-3">
                            {license.employees.map((emp: any) => (
                                <Card key={emp.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{emp.name}</p>
                                            <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleUnassign(emp.id, 'EMPLOYEE')}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </Card>
                            ))}
                            {license.employees.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground bg-slate-50 border rounded-lg border-dashed">
                                    لا يوجد موظفين مرتبطين بهذه الرخصة
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
