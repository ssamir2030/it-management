'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createEmployeeRequest } from "@/app/actions/employee-portal"

interface Asset {
    id: string
    name: string
    type: 'ASSET' | 'CUSTODY'
    serialNumber?: string
    tag?: string
    description?: string
    assignedDate?: string
}

export function AssetReturnForm({ assets, employeeId }: { assets: Asset[]; employeeId: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedAssets, setSelectedAssets] = useState<string[]>([])
    const [reason, setReason] = useState("")

    function toggleAsset(assetId: string) {
        setSelectedAssets(prev =>
            prev.includes(assetId)
                ? prev.filter(id => id !== assetId)
                : [...prev, assetId]
        )
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (selectedAssets.length === 0) {
            toast.error("الرجاء اختيار عهدة واحدة على الأقل")
            return
        }

        setLoading(true)
        try {
            const selectedAssetNames = assets
                .filter(a => selectedAssets.includes(a.id))
                .map(a => a.name)
                .join(', ')

            const result = await createEmployeeRequest(
                'RETURN',
                `العهدة المطلوب إرجاعها:\n${selectedAssetNames}\n\nالسبب: ${reason || 'غير محدد'}`,
                `طلب إرجاع عهدة`
            )

            if (result.success) {
                toast.success("تم إرسال طلب الإرجاع بنجاح")
                router.push("/portal/requests")
            } else {
                toast.error(result.error || "فشل إرسال الطلب")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <Label className="text-base font-semibold">اختر العهدة المطلوب إرجاعها:</Label>
                <div className="space-y-3">
                    {assets.map((asset) => (
                        <Card
                            key={asset.id}
                            className={`cursor-pointer transition-all ${selectedAssets.includes(asset.id)
                                ? 'border-orange-500 bg-orange-50'
                                : 'hover:border-gray-300'
                                }`}
                            onClick={() => toggleAsset(asset.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        checked={selectedAssets.includes(asset.id)}
                                        onCheckedChange={() => toggleAsset(asset.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-semibold text-foreground">{asset.name}</h4>
                                            <Badge variant="outline" className="text-xs">
                                                {asset.type === 'ASSET' ? 'أصل' : 'عهدة'}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            {asset.serialNumber && (
                                                <p>الرقم التسلسلي: {asset.serialNumber}</p>
                                            )}
                                            {asset.tag && (
                                                <p>الكود: {asset.tag}</p>
                                            )}
                                            {asset.description && (
                                                <p>الوصف: {asset.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="reason">سبب الإرجاع (اختياري)</Label>
                <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="مثال: الاستقالة، استبدال الجهاز، إعادة توزيع الأصول..."
                    className="min-h-[120px]"
                />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    إلغاء
                </Button>
                <Button
                    type="submit"
                    disabled={loading || selectedAssets.length === 0}
                    className="bg-orange-600 hover:bg-orange-700"
                >
                    {loading ? "جاري الإرسال..." : `إرسال الطلب (${selectedAssets.length})`}
                </Button>
            </div>
        </form>
    )
}
