'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { Wrench, Package, Undo2, QrCode, HelpCircle, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { submitKioskRequest } from '@/app/actions/kiosk'

const actions = [
    { id: 'SUPPORT', title: 'الإبلاغ عن مشكلة', description: 'إنشاء تذكرة دعم فني', icon: Wrench, color: 'from-red-500 to-orange-500' },
    { id: 'CONSUMABLE', title: 'طلب مستلزمات', description: 'طلب أدوات مكتبية', icon: Package, color: 'from-blue-500 to-cyan-500' },
    { id: 'RETURN', title: 'إرجاع عهدة', description: 'تسليم جهاز أو عهدة', icon: Undo2, color: 'from-green-500 to-emerald-500' },
    { id: 'SCAN', title: 'مسح باركود', description: 'التحقق من معلومات الأصل', icon: QrCode, color: 'from-purple-500 to-pink-500' }
]

export default function KioskPage() {
    const [selectedAction, setSelectedAction] = useState<string | null>(null)
    const [employeeId, setEmployeeId] = useState('')
    const [issueDescription, setIssueDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async () => {
        if (!employeeId) { toast.error('يرجى إدخال رقم الموظف'); return }
        setIsSubmitting(true)

        const result = await submitKioskRequest({
            type: selectedAction || 'SUPPORT',
            employeeIdentifier: employeeId,
            description: issueDescription
        })

        if (result.success) {
            setIsSuccess(true)
            setTimeout(() => {
                setSelectedAction(null)
                setEmployeeId('')
                setIssueDescription('')
                setIsSuccess(false)
            }, 3000)
        } else {
            toast.error(result.error || 'حدث خطأ')
        }
        setIsSubmitting(false)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-black text-white mb-4">الخدمة الذاتية</h1>
                <p className="text-xl text-blue-200">اختر الخدمة المطلوبة</p>
                <div className="flex items-center justify-center gap-2 mt-4 text-blue-300">
                    <Clock className="h-5 w-5" />
                    <span className="text-lg font-medium">{new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="mx-2">|</span>
                    <span className="text-lg">{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-8 max-w-4xl w-full">
                {actions.map(action => (
                    <Card key={action.id} className={`cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${action.color} border-0 text-white overflow-hidden group`} onClick={() => setSelectedAction(action.id)}>
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <div className="p-6 bg-white/20 rounded-3xl mb-6 group-hover:bg-white/30 transition-colors"><action.icon className="h-16 w-16" /></div>
                            <h2 className="text-2xl font-bold mb-2">{action.title}</h2>
                            <p className="text-white/80">{action.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Button variant="ghost" className="mt-12 text-blue-200 hover:text-white hover:bg-white/10"><HelpCircle className="h-5 w-5 ml-2" />هل تحتاج مساعدة؟</Button>

            <Dialog open={!!selectedAction} onOpenChange={() => { setSelectedAction(null); setIsSuccess(false) }}>
                <DialogContent className="max-w-md">
                    {isSuccess ? (
                        <div className="py-12 text-center">
                            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                            <h2 className="text-2xl font-bold mb-2">تم إرسال طلبك بنجاح!</h2>
                            <p className="text-muted-foreground">سيتم التواصل معك قريباً</p>
                        </div>
                    ) : (
                        <>
                            <DialogHeader><DialogTitle>{actions.find(a => a.id === selectedAction)?.title}</DialogTitle></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2"><Label>رقم الموظف أو البريد</Label><Input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="أدخل رقم الموظف أو البريد" className="text-lg h-12" /></div>
                                {(selectedAction === 'SUPPORT' || selectedAction === 'CONSUMABLE') && <div className="grid gap-2"><Label>التفاصيل</Label><Textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder="اكتب التفاصيل..." className="min-h-[120px]" /></div>}
                            </div>
                            <DialogFooter><DialogClose asChild><Button variant="outline" size="lg">إلغاء</Button></DialogClose><Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'جاري الإرسال...' : 'إرسال'}</Button></DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
