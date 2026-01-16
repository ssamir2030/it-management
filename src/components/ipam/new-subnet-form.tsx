"use client"

import { useFormStatus } from "react-dom"
import { createSubnet } from "@/app/actions/ipam"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Globe, Settings, Save, X, Server, Wifi, Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface NewSubnetFormProps {
    locations: any[]
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} size="lg" className="min-w-[150px] gap-2 h-12">
            {pending ? (
                <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري الحفظ...
                </>
            ) : (
                <>
                    <Save className="h-5 w-5" />
                    حفظ الشبكة
                </>
            )}
        </Button>
    )
}

export function NewSubnetForm({ locations }: NewSubnetFormProps) {
    const router = useRouter()
    const [networkType, setNetworkType] = useState<"WIRED" | "WIRELESS">("WIRED")
    const [showPassword, setShowPassword] = useState(false)

    async function clientAction(formData: FormData) {
        // Enforce validations or modifications if needed before server action
        const res = await createSubnet(formData)
        if (res.success) {
            toast.success("تم إنشاء الشبكة بنجاح")
            router.push("/admin/ipam")
        } else {
            toast.error(res.error)
        }
    }

    return (
        <form action={clientAction} className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Network Type Selector */}
            <div className="grid grid-cols-2 gap-4 p-1 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800">
                <button
                    type="button"
                    onClick={() => setNetworkType("WIRED")}
                    className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                        networkType === "WIRED"
                            ? "bg-slate-800 text-white shadow-lg"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                >
                    <Server className="h-4 w-4" />
                    شبكة سلكية (Wired LAN)
                </button>
                <button
                    type="button"
                    onClick={() => setNetworkType("WIRELESS")}
                    className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                        networkType === "WIRELESS"
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    )}
                >
                    <Wifi className="h-4 w-4" />
                    شبكة لاسلكية (Wi-Fi)
                </button>
                <input type="hidden" name="type" value={networkType} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info Card */}
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl md:col-span-1 h-full">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <Globe className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-base">المعلومات الأساسية</CardTitle>
                                <CardDescription className="text-xs">بيانات التعريف الخاصة بالشبكة</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">اسم الشبكة <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder={networkType === 'WIRED' ? "مثال: شبكة الإدارة - Management LAN" : "مثال: شبكة زوار - Guest Wi-Fi"}
                                required
                                className="h-11 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cidr" className="text-sm font-medium">نطاق الشبكة (CIDR) <span className="text-red-500">*</span></Label>
                            <div dir="ltr">
                                <Input
                                    id="cidr"
                                    name="cidr"
                                    placeholder="e.g. 192.168.10.0/24"
                                    required
                                    className="h-11 font-mono text-left bg-slate-950/50 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">الوصف</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="وصف قصير للشبكة..."
                                className="h-11 bg-slate-950/50 border-slate-800 focus:border-blue-500/50 focus:ring-blue-500/20"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Configuration Card */}
                <div className="space-y-6 flex flex-col h-full">
                    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl flex-1">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/10">
                                    <Settings className="h-5 w-5 text-purple-500" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-base">الإعدادات التقنية</CardTitle>
                                    <CardDescription className="text-xs">تكوين البوابة والموقع الجغرافي</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="gateway" className="text-sm font-medium">البوابة (Gateway)</Label>
                                        <div dir="ltr">
                                            <Input
                                                id="gateway"
                                                name="gateway"
                                                placeholder="192.168.10.1"
                                                className="h-11 font-mono text-left bg-slate-950/50 border-slate-800 focus:border-purple-500/50 focus:ring-purple-500/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vlan" className="text-sm font-medium">رقم VLAN</Label>
                                        <div dir="ltr">
                                            <Input
                                                id="vlan"
                                                name="vlan"
                                                type="number"
                                                placeholder="10"
                                                className="h-11 font-mono text-left bg-slate-950/50 border-slate-800 focus:border-purple-500/50 focus:ring-purple-500/20"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="locationId" className="text-sm font-medium">الموقع الجغرافي</Label>
                                    <Select name="locationId">
                                        <SelectTrigger className="h-11 bg-slate-950/50 border-slate-800 focus:border-purple-500/50 focus:ring-purple-500/20">
                                            <SelectValue placeholder="اختر الموقع (اختياري)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- بدون موقع --</SelectItem>
                                            {locations.map((loc) => (
                                                <SelectItem key={loc.id} value={loc.id}>
                                                    {loc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Wireless Settings Card (Conditional) */}
                    {networkType === "WIRELESS" && (
                        <Card className="border-indigo-500/30 bg-indigo-950/10 backdrop-blur-sm shadow-xl animate-in slide-in-from-top-4 duration-300">
                            <CardHeader className="border-b border-indigo-500/20 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-indigo-500/20">
                                        <Wifi className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-base text-indigo-100">إعدادات الشبكة اللاسلكية</CardTitle>
                                        <CardDescription className="text-xs text-indigo-300">بيانات الاتصال والأمان للواي فاي</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="ssid" className="text-sm font-medium text-indigo-100">اسم الشبكة (SSID) <span className="text-red-500">*</span></Label>
                                    <div dir="ltr">
                                        <Input
                                            id="ssid"
                                            name="ssid"
                                            placeholder="Guest_WiFi"
                                            required={networkType === "WIRELESS"}
                                            className="h-11 text-left bg-slate-950/50 border-slate-800 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="securityProtocol" className="text-sm font-medium text-indigo-100">نظام التشفير</Label>
                                        <Select name="securityProtocol" defaultValue="WPA2">
                                            <SelectTrigger className="h-11 bg-slate-950/50 border-slate-800 focus:border-indigo-500/50 focus:ring-indigo-500/20">
                                                <SelectValue placeholder="اختر التشفير" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="WPA3">WPA3 Personal</SelectItem>
                                                <SelectItem value="WPA2">WPA2 Personal</SelectItem>
                                                <SelectItem value="WPA2_ENT">WPA2 Enterprise</SelectItem>
                                                <SelectItem value="OPEN">Open (No Password)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="wifiPassword" className="text-sm font-medium text-indigo-100">كلمة المرور</Label>
                                        <div className="relative" dir="ltr">
                                            <Input
                                                id="wifiPassword"
                                                name="wifiPassword"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="h-11 text-left bg-slate-950/50 border-slate-800 focus:border-indigo-500/50 focus:ring-indigo-500/20 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <Link href="/admin/ipam">
                    <Button type="button" variant="ghost" size="lg" className="min-w-[120px] h-12 hover:bg-white/5">
                        <X className="mr-2 h-4 w-4" />
                        إلغاء
                    </Button>
                </Link>
                <SubmitButton />
            </div>
        </form>
    )
}
