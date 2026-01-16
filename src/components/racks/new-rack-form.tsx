"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { createRack } from "@/app/actions/racks"
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
import { Loader2, Server, MapPin, Save, X, Database } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

interface NewRackFormProps {
    locations: any[]
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} size="lg" className="min-w-[150px]">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                </>
            ) : (
                <>
                    <Save className="mr-2 h-4 w-4" />
                    حفظ الكبينة
                </>
            )}
        </Button>
    )
}

export function NewRackForm({ locations }: NewRackFormProps) {
    const router = useRouter()

    async function clientAction(formData: FormData) {
        const res = await createRack(formData)
        if (res.success) {
            toast.success("تم إنشاء كبينة السيرفرات بنجاح")
            router.push("/admin/racks")
        } else {
            toast.error(res.error)
        }
    }

    return (
        <form action={clientAction} className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-6">

                {/* Basic Info Card */}
                <Card>
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Server className="h-5 w-5" />
                            <span>بيانات الكبينة</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">اسم الكبينة <span className="text-red-500">*</span></Label>
                            <Input id="name" name="name" placeholder="مثال: كبينة غرفة السيرفر الرئيسية - Rack 01" required className="h-11 border-muted-foreground/20 focus:border-primary" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="capacity">السعة (Units) <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input id="capacity" name="capacity" type="number" defaultValue={42} min={1} max={60} required className="h-11 border-muted-foreground/20 focus:border-primary pl-10 font-mono" />
                                    <div className="absolute left-3 top-3 text-muted-foreground text-sm font-semibold">U</div>
                                </div>
                                <p className="text-xs text-muted-foreground">السعة القياسية هي 42U</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="locationId">الموقع <span className="text-red-500">*</span></Label>
                                <Select name="locationId" required>
                                    <SelectTrigger className="h-11 border-muted-foreground/20 focus:border-primary">
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
                        </div>
                    </CardContent>
                </Card>

            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Link href="/admin/racks">
                    <Button type="button" variant="outline" size="lg" className="min-w-[120px]">
                        <X className="mr-2 h-4 w-4" />
                        إلغاء
                    </Button>
                </Link>
                <SubmitButton />
            </div>
        </form>
    )
}
