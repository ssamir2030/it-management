'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { CheckCircle2, AlertTriangle, XCircle, Package, ScanLine, Laptop, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { getEmployeeAssetsForAudit, submitAssetAudit } from '@/app/actions/audit'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function AssetAuditPage() {
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedAsset, setSelectedAsset] = useState<any>(null)
    const [status, setStatus] = useState<'VERIFIED' | 'MISSING' | 'DAMAGED'>('VERIFIED')
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    useEffect(() => {
        loadAssets()
    }, [])

    async function loadAssets() {
        setLoading(true)
        const res = await getEmployeeAssetsForAudit()
        if (res.success) {
            setAssets(res.data || [])
        }
        setLoading(false)
    }

    function openAuditDialog(asset: any, auditStatus: 'VERIFIED' | 'MISSING' | 'DAMAGED') {
        setSelectedAsset(asset)
        setStatus(auditStatus)
        setNotes('')
        setDialogOpen(true)

        // If verifying, we can auto-submit or ask for optional notes.
        // For better UX, let's just confirm.
    }

    async function handleSubmit() {
        if (!selectedAsset) return

        setSubmitting(true)
        const res = await submitAssetAudit(selectedAsset.id, status, notes)

        if (res.success) {
            toast.success('تم إرسال حالة الأصل بنجاح')
            setDialogOpen(false)
            loadAssets()
        } else {
            toast.error(res.error || 'حدث خطأ')
        }
        setSubmitting(false)
    }

    const needsAudit = (asset: any) => {
        if (!asset.audits || asset.audits.length === 0) return true
        const lastAudit = new Date(asset.audits[0].auditDate)
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return lastAudit < monthAgo
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900" dir="rtl">
            <div className="container mx-auto px-4 py-8">
                <PremiumPageHeader
                    title="الجرد الذاتي للأصول"
                    description="يرجى تأكيد وجود وحالة الأجهزة المسجلة بعهدتك"
                    icon={ScanLine}
                    rightContent={
                        <Button variant="outline" onClick={loadAssets} disabled={loading} className="gap-2">
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            تحديث
                        </Button>
                    }
                />

                <div className="grid gap-6 mt-6">
                    {loading ? (
                        <div className="text-center py-20 bg-card rounded-xl border border-dashed animate-pulse">
                            <RefreshCw className="h-8 w-8 text-primary/40 mx-auto mb-3 animate-spin" />
                            <p className="text-muted-foreground font-medium">جاري تحميل أصولك بحماية...</p>
                        </div>
                    ) : assets.length === 0 ? (
                        <Card className="card-elevated text-center py-16 bg-muted/20 border-dashed border-2">
                            <CardContent>
                                <div className="bg-muted p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Package className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 mb-2">لا توجد أصول بعهدتك</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">عندما يتم تخصيص أجهزة أو أصول لك، ستظهر هنا تلقائياً لعملية الجرد الدوري.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                            {assets.map((asset) => {
                                const isPending = needsAudit(asset)
                                const lastAudit = asset.audits?.[0]

                                return (
                                    <Card key={asset.id} className={`card-elevated group overflow-hidden transition-all duration-300 ${isPending ? 'border-r-4 border-r-primary ring-1 ring-primary/10 shadow-primary/5 hover:shadow-primary/10' : 'opacity-85 hover:opacity-100'}`}>
                                        <div className="p-6">
                                            <div className="flex items-start gap-5">
                                                <div className={`p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-105 ${isPending ? 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Laptop className="h-7 w-7" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                                        <h3 className="font-black text-lg text-slate-900 truncate">{asset.name}</h3>
                                                        <Badge variant="outline" className="font-mono bg-white/50 backdrop-blur-sm shadow-sm">{asset.tag}</Badge>
                                                        {isPending && <Badge className="bg-amber-500 hover:bg-amber-600 animate-pulse">مطلوب جرد</Badge>}
                                                    </div>
                                                    <p className="text-slate-500 text-sm flex items-center gap-1.5">
                                                        <span className="font-medium">{asset.manufacturer}</span>
                                                        <span className="text-slate-300">|</span>
                                                        <span className="truncate">{asset.model}</span>
                                                    </p>

                                                    {asset.serialNumber && (
                                                        <p className="text-xs font-mono text-slate-400 mt-1">S/N: {asset.serialNumber}</p>
                                                    )}

                                                    {!isPending && lastAudit && (
                                                        <div className="flex items-center gap-2 text-xs font-bold text-green-600 mt-3 bg-green-50/80 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full border border-green-100">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            تم التحقق في {format(new Date(lastAudit.auditDate), 'dd MMM yyyy', { locale: ar })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100 w-full group-hover:border-primary/10 transition-colors">
                                                {isPending ? (
                                                    <>
                                                        <Button
                                                            className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11"
                                                            onClick={() => openAuditDialog(asset, 'VERIFIED')}
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 ml-2" />
                                                            تأكيد الوجود
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-slate-200 h-11"
                                                            onClick={() => openAuditDialog(asset, 'MISSING')}
                                                        >
                                                            <AlertTriangle className="h-4 w-4 ml-2" />
                                                            إبلاغ عن عطل
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button variant="ghost" disabled className="flex-1 h-11 bg-slate-50 text-slate-400 font-bold gap-2">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        تم التحقق بنجاح
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {status === 'VERIFIED' ? 'تأكيد وجود الأصل' : 'إبلاغ عن مشكلة'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {selectedAsset && (
                                <div className="bg-muted p-3 rounded-lg text-sm">
                                    <span className="font-bold">{selectedAsset.name}</span>
                                    <span className="mx-2 text-muted-foreground">|</span>
                                    <span className="font-mono">{selectedAsset.tag}</span>
                                </div>
                            )}

                            {status === 'VERIFIED' ? (
                                <p className="text-muted-foreground">
                                    هل تؤكد أن هذا الجهاز موجود بحوزتك حالياً ويعمل بشكل سليم؟
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    <RadioGroup value={status} onValueChange={(val: any) => setStatus(val)} className="flex flex-col gap-2">
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <RadioGroupItem value="MISSING" id="r-missing" />
                                            <Label htmlFor="r-missing">الأصل مفقود (غير موجود)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <RadioGroupItem value="DAMAGED" id="r-damaged" />
                                            <Label htmlFor="r-damaged">الأصل تالف (موجود ولكن لا يعمل)</Label>
                                        </div>
                                    </RadioGroup>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">تفاصيل المشكلة</label>
                                        <Textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="الرجاء وصف الحالة بالتفصيل..."
                                            rows={4}
                                        />
                                        <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded flex gap-2">
                                            <AlertTriangle className="h-4 w-4" />
                                            سيتم فتح تذكرة بلاغ تلقائياً للفريق المختص.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="ghost" onClick={() => setDialogOpen(false)}>إلغاء</Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={status !== 'VERIFIED' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                            >
                                {submitting ? 'جاري الإرسال...' : 'تأكيد وإرسال'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
