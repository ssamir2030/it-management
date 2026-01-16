'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Headphones, Mouse, Keyboard, Monitor, Cable, Package, Check, Loader2, Plus, ArrowRight } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { createEmployeeRequest } from '@/app/actions/employee-portal'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

const ACCESSORIES = [
    { id: 'mouse', name: 'ماوس لاسلكي', icon: Mouse, description: 'ماوس بصري لاسلكي مريح مع بطارية' },
    { id: 'keyboard', name: 'لوحة مفاتيح', icon: Keyboard, description: 'لوحة مفاتيح قياسية سلكية/لاسلكية' },
    { id: 'headset', name: 'سماعة رأس', icon: Headphones, description: 'سماعة رأس مع ميكروفون للاجتماعات' },
    { id: 'monitor', name: 'شاشة إضافية', icon: Monitor, description: 'شاشة مكتبية 24 بوصة FHD' },
    { id: 'cable-hdmi', name: 'كابل HDMI', icon: Cable, description: 'كابل عرض عالي الدقة 1.8 متر' },
    { id: 'cable-typec', name: 'محول Type-C', icon: Cable, description: 'محول متعدد المنافذ (Hub)' },
    { id: 'other', name: 'ملحق آخر', icon: Package, description: 'طلب ملحق خاص أو غير مدرج' },
]

export default function AccessoriesPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [selectedItem, setSelectedItem] = useState<typeof ACCESSORIES[0] | null>(null)
    const [customItemName, setCustomItemName] = useState('')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)

    const handleSelect = (item: typeof ACCESSORIES[0]) => {
        setSelectedItem(item)
        setCustomItemName('')
        setReason('')
        setOpenDialog(true)
    }

    const handleSubmit = async () => {
        if (!selectedItem) return
        if (selectedItem.id === 'other' && !customItemName.trim()) {
            toast({ title: 'تنبيه', description: 'يرجى كتابة اسم الملحق المطلوب', variant: 'destructive' })
            return
        }
        if (!reason.trim()) {
            toast({ title: 'تنبيه', description: 'يرجى ذكر سبب الطلب', variant: 'destructive' })
            return
        }

        setLoading(true)
        try {
            const itemName = selectedItem.id === 'other' ? customItemName : selectedItem.name
            const details = `طلب ملحق: ${itemName}\nالسبب: ${reason}`

            const result = await createEmployeeRequest('HARDWARE', details, `طلب ملحق: ${itemName}`)

            if (result?.success) {
                toast({ title: 'تم تقديم الطلب', description: 'سيتم مراجعة طلبك من قبل الفريق المختص' })
                setOpenDialog(false)
                router.refresh()
            } else {
                toast({ title: 'خطأ', description: result?.error || 'فشل في تقديم الطلب', variant: 'destructive' })
            }
        } catch (error) {
            toast({ title: 'خطأ', description: 'حدث خطأ غير متوقع', variant: 'destructive' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <PremiumPageHeader
                title="ملحقات الأجهزة"
                description="اختر الملحق المطلوب من القائمة أدناه لتقديمه كطلب صرف"
                icon={Headphones}
                rightContent={
                    <Link href="/portal/dashboard">
                        <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                            <ArrowRight className="h-4 w-4" />
                            العودة للرئيسية
                        </Button>
                    </Link>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ACCESSORIES.map((item) => (
                    <Card
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/60 dark:bg-slate-800/60 backdrop-blur-md overflow-hidden"
                    >
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <item.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">{item.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">
                                {item.description}
                            </p>
                            <Button className="w-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-900/20 dark:hover:bg-indigo-600 transition-colors">
                                طلب هذا الملحق
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent dir="rtl" className="w-screen h-screen max-w-none m-0 p-0 rounded-none border-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto" aria-describedby={undefined}>
                    <DialogTitle className="sr-only">طلب {selectedItem?.name || 'ملحق'}</DialogTitle>
                    <div className="min-h-full flex flex-col">
                        <PremiumPageHeader
                            title={`طلب ${selectedItem?.name || 'ملحق'}`}
                            description="يرجى توضيح تفاصيل الطلب والمبررات ليتم مراجعته من قبل القسم المختص."
                            icon={selectedItem?.icon || Package}
                            rightContent={
                                <Button
                                    onClick={() => setOpenDialog(false)}
                                    variant="ghost"
                                    className="text-white hover:bg-white/20 gap-2"
                                >
                                    إغلاق
                                    <div className="bg-white/20 p-1 rounded-md">
                                        <span className="sr-only">Close</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                                    </div>
                                </Button>
                            }
                        />

                        <div className="container mx-auto px-4 py-8 max-w-7xl flex-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                                <CardContent className="p-8 md:p-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        {/* Visual/Info Column */}
                                        <div className="lg:col-span-4 space-y-6">
                                            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 text-center relative overflow-hidden">
                                                <div className="absolute inset-0 bg-indigo-500/5 dark:bg-indigo-900/20 pointer-events-none" />
                                                <div className="mx-auto w-24 h-24 bg-white dark:bg-slate-950 rounded-3xl shadow-lg flex items-center justify-center mb-6 ring-4 ring-indigo-50 dark:ring-indigo-900/20">
                                                    {selectedItem?.icon && <selectedItem.icon className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />}
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                                    {selectedItem?.name}
                                                </h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 px-2 leading-relaxed">
                                                    {selectedItem?.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Form Column */}
                                        <div className="lg:col-span-8 space-y-8">
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 mb-6">
                                                    <div className="bg-indigo-600 h-8 w-1.5 rounded-full" />
                                                    تفاصيل الطلب
                                                </h3>

                                                <div className="space-y-6">
                                                    {selectedItem?.id === 'other' && (
                                                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                            <Label className="text-lg font-semibold">اسم الملحق المطلوب</Label>
                                                            <Input
                                                                placeholder="ما الذي تحتاج إليه بالضبط؟"
                                                                value={customItemName}
                                                                onChange={(e) => setCustomItemName(e.target.value)}
                                                                className="h-12 bg-slate-50 dark:bg-slate-950 text-lg border-slate-200 dark:border-slate-800"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="space-y-3">
                                                        <Label className="text-lg font-semibold">سبب الاحتياج / المبررات</Label>
                                                        <Textarea
                                                            placeholder="اشرح هنا سبب طلب هذا الملحق (مثال: عطل في الجهاز الحالي، متطلبات مشروع جديد...)"
                                                            value={reason}
                                                            onChange={(e) => setReason(e.target.value)}
                                                            className="resize-none bg-slate-50 dark:bg-slate-950 text-base min-h-[150px] p-4 border-slate-200 dark:border-slate-800"
                                                        />
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            يرجى ذكر الأسباب بالتفصيل لتسريع عملية الموافقة.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                                                <Button variant="outline" size="lg" onClick={() => setOpenDialog(false)} className="h-12 px-8 text-base">
                                                    إلغاء
                                                </Button>
                                                <Button
                                                    onClick={handleSubmit}
                                                    disabled={loading}
                                                    size="lg"
                                                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white h-12 px-10 text-base shadow-lg shadow-indigo-500/20"
                                                >
                                                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : (
                                                        <>
                                                            تأكيد وإرسال
                                                            <ArrowRight className="mr-2 h-5 w-5" />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
