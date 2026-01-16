'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { LifeBuoy, Wifi, Printer, Mail, Monitor, ArrowRight, CheckCircle2, XCircle, MessageSquare, Ticket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// Troubleshooting Data Structure Types
type TroubleshootingOption = {
    id?: string
    label: string
    icon?: any
    next?: string
}

type TroubleshootingStep = {
    q: string
    options: TroubleshootingOption[]
}

type TroubleshootingNode = {
    title?: string
    steps?: TroubleshootingStep[]
    solution?: string
    options?: TroubleshootingOption[] // For start node
}

type TroubleshootingFlow = {
    [key: string]: TroubleshootingNode
}

const TROUBLESHOOTING_FLOW: TroubleshootingFlow = {
    start: {
        title: "ما هي المشكلة التي تواجهها؟",
        options: [
            { id: 'internet', label: "مشكلة في الإنترنت / الشبكة", icon: Wifi },
            { id: 'printer', label: "مشكلة في الطابعة", icon: Printer },
            { id: 'email', label: "مشكلة في البريد الإلكتروني", icon: Mail },
            { id: 'pc', label: "جهاز الحاسب بطيء / لا يعمل", icon: Monitor },
        ]
    },
    internet: {
        title: "مشكلة الإنترنت",
        steps: [
            {
                q: "هل المشكلة في الواي فاي أم الكيبل؟",
                options: [
                    { label: "Wi-Fi", next: 'wifi_check' },
                    { label: "Ethernet Cable", next: 'cable_check' }
                ]
            }
        ]
    },
    wifi_check: {
        title: "فحص الواي فاي",
        steps: [
            {
                q: "هل تظهر شبكة الشركة في القائمة؟",
                options: [
                    { label: "نعم، ولكن لا تتصل", next: 'wifi_connect_fail' },
                    { label: "لا، لا تظهر الشبكة", next: 'wifi_hidden' },
                    { label: "نعم متصل، ولكن لا يوجد إنترنت", next: 'wifi_no_internet' }
                ]
            }
        ]
    },
    wifi_hidden: {
        solution: "تأكد من أن زر الواي فاي في جهازك مفعل. جرب إعادة تشغيل الجهاز. إذا استمرت المشكلة، قد تكون المشكلة في تغطية الشبكة في موقعك."
    },
    wifi_connect_fail: {
        solution: "تأكد من إدخال كلمة المرور الصحيحة أو أن حسابك فعال. إذا قمت بتغيير كلمة المرور مؤخراً، قم بـ 'نسيان الشبكة' ثم الاتصال مجدداً."
    },
    wifi_no_internet: {
        solution: "قد تكون هناك مشكلة عامة. جرب فتح موقع داخلي (مثل البوابة). إذا فتح، فالمشكلة في الإنترنت الخارجي فقط."
    },
    cable_check: {
        title: "فحص الكيبل",
        steps: [
            {
                q: "هل ضوء المنفذ (خلف الكمبيوتر أو في الجدار) يضيء؟",
                options: [
                    { label: "نعم يومض", next: 'cable_blink' },
                    { label: "لا، طافي تماماً", next: 'cable_dead' }
                ]
            }
        ]
    },
    cable_dead: {
        solution: "تأكد من توصيل الكيبل بإحكام من الطرفين. جرب كيبل آخر إذا توفر."
    },
    cable_blink: {
        solution: "جرب إعادة تشغيل الجهاز. تحقق من إعدادات IP (يجب أن تكون تلقائية DHCP)."
    },
    printer: {
        title: "مشكلة الطابعة",
        steps: [
            {
                q: "ما نوع المشكلة؟",
                options: [
                    { label: "الطابعة لا تطبع", next: 'printer_no_print' },
                    { label: "جودة الطباعة سيئة", next: 'printer_bad_quality' },
                    { label: "انحشار الورق", next: 'printer_jam' }
                ]
            }
        ]
    },
    printer_no_print: {
        solution: "تأكد من أن الطابعة مختارة كطابعة افتراضية. تحقق من وجود ورق وحبر. انظر للشاشة إذا كان هناك رسالة خطأ."
    },
    printer_bad_quality: {
        solution: "قد تكون الأحبار منتهية أو بحاجة لتنظيف الرؤوس. حاول طباعة صفحة اختبار."
    },
    printer_jam: {
        solution: "افتح غطاء الطابعة واسحب الورق العالق برفق في اتجاه خروجه. لا تستخدم القوة."
    },
    email: {
        title: "مشكلة البريد",
        steps: [
            {
                q: "هل تستطيع الدخول على البريد من المتصفح؟",
                options: [
                    { label: "نعم، المشكلة في Outlook فقط", next: 'outlook_issue' },
                    { label: "لا، لا استطيع الدخول نهائياً", next: 'account_locked' }
                ]
            }
        ]
    },
    outlook_issue: {
        solution: "قد يكون Outlook معلقاً. أعد تشغيل الجهاز. تأكد من اتصال الإنترنت."
    },
    account_locked: {
        solution: "قد يكون حسابك مقفلاً أو انتهت صلاحية كلمة المرور. جرب خدمة 'نسيت كلمة المرور' أو تواصل معنا لفك القفل."
    },
    pc: {
        title: "مشكلة الحاسب",
        steps: [
            {
                q: "ما هي المشكلة بالتحديد؟",
                options: [
                    { label: "بطيء جداً", next: 'pc_slow' },
                    { label: "شاشة زرقاء / سوداء", next: 'pc_crash' },
                    { label: "لا يعمل نهائياً", next: 'pc_dead' }
                ]
            }
        ]
    },
    pc_slow: {
        solution: "أغلق البرامج غير الضرورية. تأكد من وجود مساحة فارغة في القرص C. أعد تشغيل الجهاز إذ لم تقم بذلك منذ فترة."
    },
    pc_crash: {
        solution: "اكتب رمز الخطأ الذي يظهر على الشاشة (مثلاً 0x000...). هذا سيساعدنا في الحل."
    },
    pc_dead: {
        solution: "تأكد من توصيل الكهرباء والشاحن. اضغط زر التشغيل لمدة 10 ثوانٍ ثم حاول مجدداً."
    }
}

export default function TroubleshootPage() {
    const router = useRouter()
    const [history, setHistory] = useState<string[]>(['start'])
    const [currentNode, setCurrentNode] = useState<TroubleshootingNode>(TROUBLESHOOTING_FLOW.start)

    const currentKey = history[history.length - 1]

    function handleOptionClick(nextKey?: string) {
        if (!nextKey) return

        const node = TROUBLESHOOTING_FLOW[nextKey]
        if (node) {
            setHistory([...history, nextKey])
            setCurrentNode(node)
        }
    }

    function goBack() {
        if (history.length > 1) {
            const newHistory = history.slice(0, -1)
            setHistory(newHistory)

            const prevKey = newHistory[newHistory.length - 1]
            if (TROUBLESHOOTING_FLOW[prevKey]) {
                setCurrentNode(TROUBLESHOOTING_FLOW[prevKey])
            }
        } else {
            router.back()
        }
    }

    function createTicket() {
        // Redirect to new ticket page with pre-filled subject based on troubleshooting path
        const subject = `Troubleshooting: ${currentNode.title || 'Technical Issue'} - ${currentKey}`
        router.push(`/portal/support/new?subject=${encodeURIComponent(subject)}&category=IT_SUPPORT`)
    }

    // Determine if we are at a step with options or a solution
    const isSolution = !!currentNode.solution
    const isStep = currentNode.steps && currentNode.steps.length > 0
    // Simplify: Assume steps[0] is the current question if multiple steps existed we'd track step index.
    // For this simple version, each node has steps array but usually just 1 item or it's a solution node.

    // Flatten logic: 
    // Key -> Title, Options (for Start)
    // Key -> Title, Steps[{q, options}] (for intermediate)
    // Key -> Solution (for end)

    // Start layout
    // List options

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900" dir="rtl">
            <div className="container mx-auto px-4 py-8">
                {/* Hero Header matching Portal Dashboard */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800 p-8 text-white transition-all duration-500 mb-8">
                    <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-white/5" />
                    <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/20 dark:bg-white/10 blur-3xl" />

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg">
                                <LifeBuoy className="h-8 w-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black mb-2 text-white">المساعد الذكي للأعطال</h1>
                                <p className="text-lg text-blue-100 dark:text-blue-200">تشخيص المشاكل التقنية والنصائح للحلول السريعة</p>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            onClick={goBack}
                            className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm gap-2"
                        >
                            <ArrowRight className="h-4 w-4" />
                            {history.length > 1 ? 'السابق' : 'العودة للرئيسية'}
                        </Button>
                    </div>
                </div>

                <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-t-4 border-t-primary shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl">
                                {currentNode.title || (isSolution ? "الحل المقترح" : "تشخيص المشكلة")}
                            </CardTitle>
                            {isStep && currentNode.steps && currentNode.steps[0] && (
                                <CardDescription className="text-lg text-foreground mt-2">
                                    {currentNode.steps[0].q}
                                </CardDescription>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Start / Options Mode */}
                            {currentKey === 'start' && currentNode.options && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {currentNode.options.map((opt: any) => {
                                        const Icon = opt.icon
                                        return (
                                            <Button
                                                key={opt.id}
                                                variant="outline"
                                                className="h-auto py-8 flex flex-col gap-4 hover:border-primary hover:bg-primary/5 transition-all"
                                                onClick={() => handleOptionClick(opt.id)}
                                            >
                                                <div className="p-4 rounded-full bg-primary/10 text-primary">
                                                    <Icon className="h-8 w-8" />
                                                </div>
                                                <span className="font-bold text-lg">{opt.label}</span>
                                            </Button>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Question Mode */}
                            {isStep && currentNode.steps && currentNode.steps.length > 0 && (
                                <div className="space-y-3">
                                    {currentNode.steps[0].options.map((opt: any, idx: number) => (
                                        <Button
                                            key={idx}
                                            variant="secondary"
                                            className="w-full justify-between h-14 text-lg px-6 hover:bg-primary hover:text-white transition-colors group"
                                            onClick={() => handleOptionClick(opt.next)}
                                        >
                                            {opt.label}
                                            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 transform rotate-180" />
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Solution Mode */}
                            {isSolution && (
                                <div className="space-y-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex gap-4 items-start">
                                        <div className="bg-green-100 p-2 rounded-full mt-1">
                                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-green-800">الحل المقترح:</h4>
                                            <p className="text-green-800 leading-relaxed text-lg">
                                                {currentNode.solution}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t">
                                        <p className="text-center font-medium text-muted-foreground">هل تم حل المشكلة؟</p>
                                        <div className="flex gap-4">
                                            <Button
                                                className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                                                onClick={() => {
                                                    toast.success("الحمدلله! سعدنا بخدمتك.")
                                                    router.push('/portal/dashboard')
                                                }}
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                نعم، شكراً
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 gap-2 border-primary text-primary hover:bg-primary/5"
                                                onClick={createTicket}
                                            >
                                                <Ticket className="h-4 w-4" />
                                                لا، افتح تذكرة دعم
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="bg-slate-50 dark:bg-slate-800/50 text-xs text-muted-foreground justify-center py-3">
                            المساعد الذكي - الإصدار 1.0
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
