'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, FileText, AlertTriangle } from 'lucide-react'
import { acknowledgeCustody } from '@/app/actions/custody'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface CustodyAcknowledgmentModalProps {
    isOpen: boolean
    onClose: () => void
    item: {
        id: string
        name: string
        asset?: {
            tag: string
            serialNumber?: string | null
        } | null
    }
}

export function CustodyAcknowledgmentModal({ isOpen, onClose, item }: CustodyAcknowledgmentModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [agreed, setAgreed] = useState(false)

    const handleConfirm = async () => {
        if (!agreed) {
            toast.error('يجب الموافقة على الشروط أولاً')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await acknowledgeCustody(item.id)
            if (result.success) {
                toast.success('تم توقيع إقرار الاستلام بنجاح')
                onClose()
            } else {
                toast.error('حدث خطأ أثناء التوقيع')
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        إقرار استلام عهدة
                    </DialogTitle>
                    <DialogDescription>
                        يرجى مراجعة تفاصيل الجهاز والموافقة على الاستلام.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg space-y-3 mb-4 border text-sm">
                    <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                        <span className="text-muted-foreground">الجهاز:</span>
                        <span className="font-bold">{item.name}</span>
                    </div>
                    {item.asset?.tag && (
                        <div className="flex justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
                            <span className="text-muted-foreground">رقم الأصل (Tag):</span>
                            <span className="font-mono">{item.asset.tag}</span>
                        </div>
                    )}
                    {item.asset?.serialNumber && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">السيريال:</span>
                            <span className="font-mono">{item.asset.serialNumber}</span>
                        </div>
                    )}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-800/50 flex gap-3 items-start text-amber-800 dark:text-amber-200 text-xs mb-4">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                        أقر أنا الموظف الموقع أدناه باستلامي العهدة الموضحة أعلاه بحالة جيدة، وأتعهد بالمحافظة عليها واستخدامها لأغراض العمل فقط، وإعادتها عند طلبها أو عند ترك العمل. وأتحمل المسؤولية الكاملة في حال الفقدان أو التلف الناتج عن سوء الاستخدام.
                    </p>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse mb-4">
                    <Checkbox id="terms" checked={agreed} onCheckedChange={(c) => setAgreed(!!c)} />
                    <Label htmlFor="terms" className="text-sm cursor-pointer select-none font-medium">
                        أوافق على استلام العهدة والشروط المذكورة
                    </Label>
                </div>

                <DialogFooter className="sm:justify-start gap-2">
                    <Button onClick={handleConfirm} disabled={isSubmitting || !agreed} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                        {isSubmitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle className="ml-2 h-4 w-4" />}
                        توقيع الاستلام إلكترونياً
                    </Button>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">إلغاء</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
