'use client'

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { ScanBarcode, Search, CheckCircle, MapPin, X, User, Box, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { getAssetByTag, updateAssetLocation, markAssetAudited, getAllLocations } from '@/app/actions/scan'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'

export default function MobileScanPage() {
    const inputRef = useRef<HTMLInputElement>(null)
    const [tag, setTag] = useState('')
    const [loading, setLoading] = useState(false)
    const [asset, setAsset] = useState<any>(null)
    const [locations, setLocations] = useState<any[]>([])
    const [selectedLocation, setSelectedLocation] = useState<string>('')

    // Fetch locations on mount
    useEffect(() => {
        getAllLocations().then(res => {
            if (res.success && res.data) {
                setLocations(res.data)
            }
        })
        // Auto focus
        inputRef.current?.focus()
    }, [])

    async function handleSearch(e?: React.FormEvent) {
        e?.preventDefault()
        if (!tag) return

        setLoading(true)
        setAsset(null)
        try {
            const res = await getAssetByTag(tag)
            if (res.success && res.data) {
                setAsset(res.data)
                setSelectedLocation(res.data.locationId || '')
                toast.success('تم العثور على الأصل')
            } else {
                toast.error('لم يتم العثور على أصل بهذا الرقم')
            }
        } catch (error) {
            toast.error("حدث خطأ")
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdateLocation() {
        if (!asset || !selectedLocation) return
        try {
            const res = await updateAssetLocation(asset.id, selectedLocation)
            if (res.success) {
                toast.success("تم تحديث الموقع بنجاح")
                // Update local state
                setAsset({ ...asset, locationId: selectedLocation, location: locations.find(l => l.id === selectedLocation) })
            } else {
                toast.error("فشل التحديث")
            }
        } catch (error) {
            toast.error("حدث خطأ")
        }
    }

    async function handleAuditConfirm() {
        if (!asset) return
        try {
            const res = await markAssetAudited(asset.id)
            if (res.success) {
                toast.success("تم تأكيد الجرد بنجاح")
                reset()
            } else {
                toast.error("فشل العملية")
            }
        } catch (error) {
            toast.error("حدث خطأ")
        }
    }

    function reset() {
        setAsset(null)
        setTag('')
        setTimeout(() => inputRef.current?.focus(), 100)
    }

    return (
        <div className="space-y-6 pb-20">
            <PremiumPageHeader
                title="المسح الضوئي (Mobile Scan)"
                description="مسح الباركود للجرد السريع أو تحديث الموقع"
                icon={ScanBarcode}
                rightContent={
                    <Button variant="ghost" asChild>
                        <Link href="/admin/dashboard">
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Button>
                }
            />

            {/* Input Area */}
            <Card className={asset ? "hidden" : "block"}>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                <ScanBarcode className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                                ref={inputRef}
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                placeholder="امسح الباركود أو اكتب الرقم..."
                                className="h-16 text-xl pl-10 text-center font-mono"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" size="lg" className="w-full h-12 text-lg" disabled={loading || !tag}>
                            {loading ? "جاري البحث..." : "بحث"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Result Area */}
            {asset && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in">
                    <Card className="border-t-4 border-t-blue-500 shadow-lg">
                        <CardContent className="pt-6 space-y-6">
                            {/* Header info */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold">{asset.name}</h2>
                                    <Badge variant="outline" className="mt-1 font-mono text-base">{asset.tag}</Badge>
                                </div>
                                <Button variant="ghost" size="icon" onClick={reset}>
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        المسؤول
                                    </span>
                                    <p className="font-medium">{asset.employee?.name || 'غير معين'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Box className="h-3 w-3" />
                                        النوع
                                    </span>
                                    <p className="font-medium">{asset.type}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-blue-500" />
                                        تحديث الموقع
                                    </label>
                                    <div className="flex gap-2">
                                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="اختر الموقع" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {locations.map((loc: any) => (
                                                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={handleUpdateLocation} disabled={selectedLocation === asset.locationId}>
                                            حفظ
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 text-lg gap-2 bg-green-600 hover:bg-green-700"
                                    onClick={handleAuditConfirm}
                                >
                                    <CheckCircle className="h-6 w-6" />
                                    تأكيد الجرد (Audit)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="outline" className="w-full" onClick={reset}>
                        مسح أصل آخر
                    </Button>
                </div>
            )}
        </div>
    )
}
