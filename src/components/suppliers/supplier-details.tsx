'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { arSA } from "date-fns/locale"
import {
    Building2, Mail, Phone, Globe, MapPin,
    FileText, Calendar, AlertCircle, Plus,
    Trash2, ExternalLink, ShieldCheck, History, User
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { toast } from "sonner"
import { deleteSupplierContract } from "@/app/actions/suppliers"

interface SupplierDetailsProps {
    supplier: any
}

export function SupplierDetails({ supplier }: SupplierDetailsProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("info")
    // State logic for contracts moved to separate page

    async function handleDeleteContract(id: string) {
        if (!confirm("هل أنت متأكد من حذف هذا العقد؟")) return
        const res = await deleteSupplierContract(id)
        if (res.success) {
            toast.success("تم الحذف بنجاح")
            router.refresh()
        } else {
            toast.error("فشل الحذف")
        }
    }

    // Calculated Stats
    const stats = [
        { label: "إجمالي الطلبات", value: supplier.calculatedStats?.totalOrders || 0, icon: History },
        { label: "المصروفات", value: (supplier.calculatedStats?.totalSpent || 0).toLocaleString() + " SAR", icon: Building2 },
        { label: "العقود النشطة", value: supplier.contracts?.filter((c: any) => c.status === 'ACTIVE').length || 0, icon: FileText },
        { label: "التقييم", value: supplier.rating + "/5", icon: ShieldCheck },
    ]

    return (
        <div className="w-full content-spacing py-6 animate-fade-in">
            <PremiumPageHeader
                title={supplier.name}
                description={supplier.category || "مورد"}
                icon={Building2}
                stats={stats}
                rightContent={
                    <Button variant="outline" onClick={() => router.push('/suppliers')}>
                        عودة للقائمة
                    </Button>
                }
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="w-full justify-start h-12 bg-muted/20 p-1">
                    <TabsTrigger value="info" className="h-10 px-6">معلومات المورد</TabsTrigger>
                    <TabsTrigger value="contracts" className="h-10 px-6">العقود والاتفاقيات (VRM)</TabsTrigger>
                    {/* Future: <TabsTrigger value="tickets">التذاكر</TabsTrigger> */}
                </TabsList>

                {/* Info Tab */}
                <TabsContent value="info" className="animate-slide-up stagger-1">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-blue-500" />
                                    بيانات الاتصال
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> المسؤول</span>
                                    <span className="font-medium">{supplier.contactPerson || "-"}</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground flex items-center gap-2"><Phone className="w-4 h-4" /> الهاتف</span>
                                    <span className="font-medium" dir="ltr">{supplier.phone || "-"}</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> البريد</span>
                                    <span className="font-medium">{supplier.email || "-"}</span>
                                </div>
                                <div className="flex items-center justify-between pb-2">
                                    <span className="text-muted-foreground flex items-center gap-2"><Globe className="w-4 h-4" /> الموقع</span>
                                    {supplier.website ? (
                                        <a href={supplier.website} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                                            زيارة <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ) : "-"}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-purple-500" />
                                    تفاصيل إضافية
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">الرقم الضريبي</span>
                                    <span className="font-mono">{supplier.taxNumber || "-"}</span>
                                </div>
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-muted-foreground">العنوان</span>
                                    <span className="max-w-[200px] truncate">{supplier.address || "-"}</span>
                                </div>
                                <div className="pt-2">
                                    <span className="text-muted-foreground block mb-2">ملاحظات</span>
                                    <p className="text-sm bg-muted p-3 rounded-lg min-h-[60px]">
                                        {supplier.notes || "لا توجد ملاحظات"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Contracts Tab */}
                <TabsContent value="contracts" className="animate-slide-up stagger-1">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold">العقود واتفاقيات مستوى الخدمة (SLA)</h3>
                            <p className="text-muted-foreground">إدارة العقود النشطة ومتابعة تواريخ الانتهاء</p>
                        </div>
                        <Button className="gap-2" onClick={() => router.push(`/suppliers/${supplier.id}/contracts/new`)}>
                            <Plus className="w-4 h-4" /> إضافة عقد جديد
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {supplier.contracts && supplier.contracts.length > 0 ? (
                            supplier.contracts.map((contract: any) => (
                                <Card key={contract.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className="bg-blue-100 p-3 rounded-xl h-fit">
                                                    <FileText className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-bold text-lg">{contract.title}</h4>
                                                        <Badge variant={contract.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                            {contract.status === 'ACTIVE' ? 'نشط' : 'منتهي'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-4 max-w-xl">
                                                        {contract.description || "لا يوجد وصف"}
                                                    </p>

                                                    <div className="flex gap-6 text-sm">
                                                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-md">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            <span>ينتهي: {format(new Date(contract.endDate), "dd MMM yyyy", { locale: arSA })}</span>
                                                        </div>
                                                        {(contract.slaResponseTime || contract.slaResolutionTime) && (
                                                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-md text-blue-700">
                                                                <ShieldCheck className="w-4 h-4" />
                                                                <span>SLA: {contract.slaResponseTime || 0}h / {contract.slaResolutionTime || 0}h</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeleteContract(contract.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">لا توجد عقود مسجلة</h3>
                                <p className="text-muted-foreground">أضف العقود واتفاقيات المستوى الخدمي لهذا المورد</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    )
}
