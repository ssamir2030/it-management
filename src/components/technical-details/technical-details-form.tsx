"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createTechnicalDetails } from "@/app/actions/technical-details"
import { Loader2, Save, Monitor, Network, Key, Server, Cpu, HardDrive, Hash, Globe, Wifi, User, CheckCircle2, X } from "lucide-react"
import { toast } from "sonner"

interface TechnicalDetailsFormProps {
    assets: any[]
}

export function TechnicalDetailsForm({ assets }: TechnicalDetailsFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedAssetId, setSelectedAssetId] = useState<string>("")

    // Find selected asset details
    const selectedAsset = assets.find(a => a.id === selectedAssetId)

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        const result = await createTechnicalDetails(formData)
        setIsLoading(false)

        if (result.success) {
            toast.success("تم الحفظ بنجاح", {
                description: "تمت إضافة التفاصيل الفنية بنجاح"
            })
            router.push("/technical-details")
            router.refresh()
        } else {
            toast.error("خطأ", {
                description: result.error || "فشل حفظ البيانات"
            })
        }
    }

    return (
        <form action={onSubmit} className="space-y-6 animate-slide-up stagger-1">
            <div className="grid gap-6 lg:grid-cols-2">

                {/* Asset Identity Card */}
                <Card className="card-elevated border-t-4 border-t-blue-500/20 lg:col-span-2">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-500/10 p-2.5">
                                <Server className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">بيانات الأصل</CardTitle>
                                <CardDescription>اختر الجهاز لإضافة تفاصيله الفنية</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-base font-medium">اختر الجهاز <span className="text-red-500">*</span></Label>
                                <Select name="assetId" onValueChange={setSelectedAssetId} required>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="ابحث عن جهاز..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assets.map((asset) => (
                                            <SelectItem key={asset.id} value={asset.id}>
                                                <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-xs mr-2">{asset.tag}</span>
                                                {asset.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedAsset && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-dashed animate-fade-in">
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">الاسم</span>
                                        <span className="font-semibold text-sm">{selectedAsset.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">النوع</span>
                                        <span className="font-semibold text-sm">{selectedAsset.type || "--"}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Tag</span>
                                        <span className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded inline-block">{selectedAsset.tag}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">الشركة المصنعة</span>
                                        <span className="font-semibold text-sm">{selectedAsset.manufacturer || "--"}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Hardware Specs Card */}
                <Card className="card-elevated border-t-4 border-t-indigo-500/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-500/10 p-2.5">
                                <Cpu className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">مواصفات العتاد</CardTitle>
                                <CardDescription>المعالج، الذاكرة، والتخزين</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="computerName" className="text-base font-medium">اسم الجهاز (Host Name) <span className="text-red-500">*</span></Label>
                            <Input id="computerName" name="computerName" placeholder="PC-HR-01" className="h-12 text-base font-mono" required dir="ltr" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand" className="text-base font-medium">الشركة المصنعة (Brand) <span className="text-red-500">*</span></Label>
                            <Input id="brand" name="brand" placeholder="e.g. Dell, HP, Lenovo" className="h-12 text-base" required dir="ltr" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="processor" className="text-base font-medium">المعالج (Processor)</Label>
                            <Input id="processor" name="processor" placeholder="e.g. Intel Core i7-12700" className="h-12 text-base" dir="ltr" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="ram" className="text-base font-medium">الذاكرة (RAM)</Label>
                                <Input id="ram" name="ram" placeholder="16GB" className="h-12 text-base" dir="ltr" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="storage" className="text-base font-medium">التخزين (Storage)</Label>
                                <Input id="storage" name="storage" placeholder="512GB SSD" className="h-12 text-base" dir="ltr" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="serialNumber" className="text-base font-medium">السيريال (Service Tag) <span className="text-red-500">*</span></Label>
                            <Input id="serialNumber" name="serialNumber" placeholder="XXXXXXX" className="h-12 text-base font-mono uppercase" required dir="ltr" />
                        </div>
                    </CardContent>
                </Card>

                {/* Network & Identity Card */}
                <Card className="card-elevated border-t-4 border-t-purple-500/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-purple-500/10 p-2.5">
                                <Network className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">الشبكة والهوية</CardTitle>
                                <CardDescription>النطاق، العنوان الفيزيائي، والمستخدم</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="domainName" className="text-base font-medium">اسم النطاق (Domain)</Label>
                            <div className="relative">
                                <Input id="domainName" name="domainName" placeholder="company.local" className="h-12 text-base pl-10" dir="ltr" />
                                <Globe className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="macAddress" className="text-base font-medium">العنوان الفيزيائي (MAC)</Label>
                            <div className="relative">
                                <Input id="macAddress" name="macAddress" placeholder="00:1A:2B:3C:4D:5E" className="h-12 text-base font-mono pl-10" dir="ltr" />
                                <Wifi className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pcUserName" className="text-base font-medium">مستخدم الجهاز (User)</Label>
                            <div className="relative">
                                <Input id="pcUserName" name="pcUserName" placeholder="username" className="h-12 text-base pl-10" dir="ltr" />
                                <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="management" className="text-base font-medium">IP الإدارة</Label>
                                <Input id="management" name="management" placeholder="10.x.x.x" className="h-12 text-base font-mono" dir="ltr" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="supportId" className="text-base font-medium">AnyDesk/TeamViewer</Label>
                                <Input id="supportId" name="supportId" placeholder="ID..." className="h-12 text-base font-mono" dir="ltr" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Software & Licenses Card */}
                <Card className="card-elevated border-t-4 border-t-orange-500/20 lg:col-span-2">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-orange-500/10 p-2.5">
                                <Key className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">البرامج والتراخيص</CardTitle>
                                <CardDescription>نظام التشغيل وحزمة الأوفيس</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="os" className="text-base font-medium">نظام التشغيل (OS) <span className="text-red-500">*</span></Label>
                            <Input id="os" name="os" placeholder="Windows 11 Pro" className="h-12 text-base" required dir="ltr" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="osKey" className="text-base font-medium">مفتاح التفعيل (OS Key)</Label>
                            <Input id="osKey" name="osKey" className="h-12 text-base font-mono" placeholder="XXXXX-XXXXX-XXXXX-..." dir="ltr" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="office" className="text-base font-medium">إصدار الأوفيس (Office)</Label>
                            <Input id="office" name="office" placeholder="Office 2021 H&B" className="h-12 text-base" dir="ltr" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="officeKey" className="text-base font-medium">مفتاح الأوفيس (Office Key)</Label>
                            <Input id="officeKey" name="officeKey" className="h-12 text-base font-mono" placeholder="XXXXX-XXXXX-XXXXX-..." dir="ltr" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="installationDate" className="text-base font-medium">تاريخ التثبيت <span className="text-red-500">*</span></Label>
                            <Input id="installationDate" name="installationDate" type="date" className="h-12 text-base" required />
                        </div>
                    </CardContent>
                </Card>

            </div>

            <div className="flex justify-end gap-4 pt-6 animate-slide-up stagger-2">
                <Button variant="outline" type="button" onClick={() => router.back()} size="lg" className="gap-2 min-w-[120px]">
                    <X className="h-4 w-4" />
                    إلغاء
                </Button>
                <Button type="submit" disabled={isLoading} size="lg" className="gap-2 min-w-[200px] shadow-lg shadow-primary/20 hover:shadow-primary/30">
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            جاري الحفظ...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            حفظ البيانات
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
