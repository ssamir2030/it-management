"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateNetworkDevice, createNetworkDevice } from "@/app/actions/network"
import { Wifi, Server, Network, Shield, Info, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface NetworkDeviceFormProps {
    locations: any[]
    initialData?: any
}

export function NetworkDeviceForm({ locations, initialData }: NetworkDeviceFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        let result

        if (initialData) {
            result = await updateNetworkDevice(initialData.id, formData)
        } else {
            result = await createNetworkDevice(formData)
        }

        setIsLoading(false)

        if (result.success) {
            toast.success("تم الحفظ بنجاح", {
                description: initialData ? "تم تحديث بيانات الجهاز" : "تم إضافة الجهاز الجديد بنجاح",
            })
            router.push("/network")
            router.refresh()
        } else {
            toast.error("خطأ", {
                description: result.error,
            })
        }
    }

    return (
        <div className="content-spacing animate-fade-in">


            {/* Form */}
            <form action={onSubmit} className="space-y-6 animate-slide-up stagger-1" dir="rtl">
                <Tabs defaultValue="general" className="w-full" dir="rtl">
                    <TabsList className="grid w-full grid-cols-4 h-14">
                        <TabsTrigger value="general" className="text-base font-semibold">البيانات الأساسية</TabsTrigger>
                        <TabsTrigger value="network" className="text-base font-semibold">الشبكة</TabsTrigger>
                        <TabsTrigger value="access" className="text-base font-semibold">الدخول</TabsTrigger>
                        <TabsTrigger value="other" className="text-base font-semibold">أخرى</TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general">
                        <Card className="card-elevated">
                            <CardHeader className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Server className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl font-bold text-right">البيانات الأساسية</CardTitle>
                                        <CardDescription className="text-base text-right">معلومات الجهاز الرئيسية</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="block text-base font-semibold text-right w-full">اسم الجهاز *</Label>
                                    <Input id="name" name="name" placeholder="SRV-DC-01" required defaultValue={initialData?.name} className="h-12 text-base font-mono" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="block text-base font-semibold text-right w-full">نوع الجهاز *</Label>
                                    <Select name="type" required defaultValue={initialData?.type}>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر النوع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Server">سيرفر (Server)</SelectItem>
                                            <SelectItem value="Router">راوتر (Router)</SelectItem>
                                            <SelectItem value="Switch">سويتش (Switch)</SelectItem>
                                            <SelectItem value="Firewall">جدار حماية (Firewall)</SelectItem>
                                            <SelectItem value="Access Point">أكسس بوينت (Access Point)</SelectItem>
                                            <SelectItem value="NAS">وحدة تخزين (NAS)</SelectItem>
                                            <SelectItem value="Other">أخرى (Other)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="brand" className="block text-base font-semibold text-right w-full">الشركة المصنعة</Label>
                                    <Input id="brand" name="brand" placeholder="Cisco, Dell, HP" defaultValue={initialData?.brand} className="h-12 text-base" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="model" className="block text-base font-semibold text-right w-full">الموديل</Label>
                                    <Input id="model" name="model" placeholder="Catalyst 2960" defaultValue={initialData?.model} className="h-12 text-base" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="serialNumber" className="block text-base font-semibold text-right w-full">الرقم التسلسلي</Label>
                                    <Input id="serialNumber" name="serialNumber" defaultValue={initialData?.serialNumber} className="h-12 text-base font-mono" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="locationId" className="block text-base font-semibold text-right w-full">الموقع</Label>
                                    <Select name="locationId" defaultValue={initialData?.locationId || ""}>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر الموقع" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {locations.map((loc) => (
                                                <SelectItem key={loc.id} value={loc.id}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status" className="block text-base font-semibold text-right w-full">الحالة</Label>
                                    <Select name="status" defaultValue={initialData?.status || "ACTIVE"}>
                                        <SelectTrigger className="h-12 text-base">
                                            <SelectValue placeholder="اختر الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">نشط (Active)</SelectItem>
                                            <SelectItem value="OFFLINE">غير متصل (Offline)</SelectItem>
                                            <SelectItem value="MAINTENANCE">تحت الصيانة (Maintenance)</SelectItem>
                                            <SelectItem value="RETIRED">خارج الخدمة (Retired)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Network Tab */}
                    <TabsContent value="network">
                        <Card className="card-elevated">
                            <CardHeader className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-500/10 p-2">
                                        <Network className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl font-bold text-right">إعدادات الشبكة</CardTitle>
                                        <CardDescription className="text-base text-right">معلومات الشبكة والاتصال</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="ipAddress" className="block text-base font-semibold text-right w-full">عنوان IP</Label>
                                    <Input id="ipAddress" name="ipAddress" placeholder="192.168.1.10" defaultValue={initialData?.ipAddress} className="h-12 text-base font-mono" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="macAddress" className="block text-base font-semibold text-right w-full">عنوان MAC</Label>
                                    <Input id="macAddress" name="macAddress" placeholder="00:11:22:33:44:55" defaultValue={initialData?.macAddress} className="h-12 text-base font-mono" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subnetMask" className="block text-base font-semibold text-right w-full">قناع الشبكة</Label>
                                    <Input id="subnetMask" name="subnetMask" placeholder="255.255.255.0" defaultValue={initialData?.subnetMask} className="h-12 text-base font-mono" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gateway" className="block text-base font-semibold text-right w-full">البوابة الافتراضية</Label>
                                    <Input id="gateway" name="gateway" placeholder="192.168.1.1" defaultValue={initialData?.gateway} className="h-12 text-base font-mono" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="vlan" className="block text-base font-semibold text-right w-full">معرف VLAN</Label>
                                    <Input id="vlan" name="vlan" placeholder="10, 20, 100" defaultValue={initialData?.vlan} className="h-12 text-base font-mono" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="managementUrl" className="block text-base font-semibold text-right w-full">رابط الإدارة</Label>
                                    <Input id="managementUrl" name="managementUrl" placeholder="https://192.168.1.10:8443" defaultValue={initialData?.managementUrl} className="h-12 text-base" dir="ltr" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Access Tab */}
                    <TabsContent value="access">
                        <Card className="card-elevated">
                            <CardHeader className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-purple-500/10 p-2">
                                        <Shield className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl font-bold text-right">بيانات الدخول</CardTitle>
                                        <CardDescription className="text-base text-right">معلومات الوصول والأمان</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="block text-base font-semibold text-right w-full">اسم المستخدم</Label>
                                    <Input id="username" name="username" placeholder="admin" defaultValue={initialData?.username} className="h-12 text-base" dir="ltr" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="block text-base font-semibold text-right w-full">كلمة المرور</Label>
                                    <Input id="password" name="password" type="password" placeholder="••••••••" defaultValue={initialData?.password} className="h-12 text-base" dir="ltr" />
                                    <p className="text-xs text-muted-foreground">سيتم تخزين كلمة المرور وتشفيرها في العرض فقط.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sshPort" className="block text-base font-semibold text-right w-full">منفذ SSH</Label>
                                    <Input id="sshPort" name="sshPort" type="number" placeholder="22" defaultValue={initialData?.sshPort || 22} className="h-12 text-base font-mono" dir="ltr" />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Other Tab */}
                    <TabsContent value="other">
                        <Card className="card-elevated">
                            <CardHeader className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-500/10 p-2">
                                        <Info className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl font-bold text-right">معلومات إضافية</CardTitle>
                                        <CardDescription className="text-base text-right">تفاصيل تكميلية</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label htmlFor="firmwareVersion" className="block text-base font-semibold text-right w-full">إصدار النظام</Label>
                                        <Input id="firmwareVersion" name="firmwareVersion" placeholder="v12.4.1" defaultValue={initialData?.firmwareVersion} className="h-12 text-base" dir="ltr" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="installationDate" className="block text-base font-semibold text-right w-full">تاريخ التركيب</Label>
                                        <Input
                                            id="installationDate"
                                            name="installationDate"
                                            type="date"
                                            defaultValue={initialData?.installationDate ? new Date(initialData.installationDate).toISOString().split('T')[0] : ''}
                                            className="h-12 text-base"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="block text-base font-semibold text-right w-full">ملاحظات</Label>
                                    <Textarea id="notes" name="notes" placeholder="أي تفاصيل إضافية..." className="min-h-[120px] text-base" defaultValue={initialData?.notes} />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 animate-slide-up stagger-2">
                    <Link href="/network">
                        <Button type="button" variant="outline" size="lg" className="shadow-sm">
                            إلغاء
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        size="lg"
                        className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover-scale min-w-[200px]"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                جاري الحفظ...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                حفظ
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}

