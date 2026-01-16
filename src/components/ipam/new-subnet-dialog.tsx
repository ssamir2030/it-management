"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { createSubnet } from "@/app/actions/ipam"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Network, Globe, Settings, ArrowRight, Save, LayoutGrid } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/hooks/use-sidebar"

interface NewSubnetDialogProps {
    locations: any[]
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} size="lg" className="min-w-[200px] h-12 text-lg gap-2">
            {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            إنشاء الشبكة
        </Button>
    )
}

export function NewSubnetDialog({ locations }: NewSubnetDialogProps) {
    const [open, setOpen] = useState(false)
    const { isOpen: isSidebarOpen } = useSidebar()

    async function clientAction(formData: FormData) {
        const res = await createSubnet(formData)
        if (res.success) {
            toast.success("تم إنشاء الشبكة بنجاح")
            setOpen(false)
        } else {
            toast.error(res.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen} modal={false}>
            <DialogContent
                className={cn(
                    "fixed bottom-0 left-0 right-0 top-16 z-[50] h-[calc(100vh-4rem)] max-w-none p-0 border-0 rounded-none sm:rounded-none translate-x-0 translate-y-0",
                    "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950",
                    "data-[state=open]:!zoom-in-100 data-[state=open]:!slide-in-from-left-0 data-[state=open]:!slide-in-from-top-0 data-[state=open]:!fade-in-0 data-[state=open]:duration-300",
                    "transition-all duration-300 ease-in-out",
                    isSidebarOpen ? "lg:pr-[280px]" : "lg:pr-[80px]"
                )}
            >
                <div className="w-full h-full overflow-y-auto">
                    <PremiumPageHeader
                        title="إضافة شبكة جديدة"
                        description="تعريف نطاق شبكة جديد وتخصيص إعداداتها"
                        icon={Network}
                        rightContent={
                            <Button variant="ghost" size="lg" onClick={() => setOpen(false)} className="text-white hover:bg-white/20 gap-2">
                                <ArrowRight className="h-4 w-4" />
                                إلغاء والعودة
                            </Button>
                        }
                    />

                    <div className="container mx-auto px-4 py-8">
                        <form action={clientAction} className="space-y-6 animate-slide-up stagger-1 max-w-5xl mx-auto">

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Basic Info Card */}
                                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-blue-500/10 p-2">
                                                <Globe className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle>المعلومات الأساسية</CardTitle>
                                                <CardDescription>بيانات التعريف الخاصة بالشبكة</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-base">اسم الشبكة</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="مثال: شبكة الإدارة - Management LAN"
                                                required
                                                className="h-11 bg-slate-950/50 border-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="cidr" className="text-base">نطاق الشبكة (CIDR)</Label>
                                            <Input
                                                id="cidr"
                                                name="cidr"
                                                placeholder="مثال: 192.168.10.0/24"
                                                required
                                                className="h-11 font-mono bg-slate-950/50 border-slate-800"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="description" className="text-base">الوصف (اختياري)</Label>
                                            <Input
                                                id="description"
                                                name="description"
                                                placeholder="وصف قصير للشبكة..."
                                                className="h-11 bg-slate-950/50 border-slate-800"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Technical Settings Card */}
                                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-purple-500/10 p-2">
                                                <Settings className="h-5 w-5 text-purple-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle>الإعدادات التقنية</CardTitle>
                                                <CardDescription>تكوين البوابة والموقع الجغرافي</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="gateway" className="text-base">البوابة (Gateway)</Label>
                                                <Input
                                                    id="gateway"
                                                    name="gateway"
                                                    placeholder="192.168.10.1"
                                                    className="h-11 font-mono bg-slate-950/50 border-slate-800"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="vlan" className="text-base">رقم VLAN</Label>
                                                <Input
                                                    id="vlan"
                                                    name="vlan"
                                                    type="number"
                                                    placeholder="10"
                                                    className="h-11 font-mono bg-slate-950/50 border-slate-800"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="locationId" className="text-base">الموقع</Label>
                                            <Select name="locationId">
                                                <SelectTrigger className="h-11 bg-slate-950/50 border-slate-800">
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
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-white/5 mt-8">
                                <SubmitButton />
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
