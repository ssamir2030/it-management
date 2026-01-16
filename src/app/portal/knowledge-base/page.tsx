export const dynamic = 'force-dynamic';

import { getCurrentEmployee } from '@/app/actions/employee-portal'
import { redirect } from 'next/navigation'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Search,
    BookOpen,
    Wifi,
    Printer,
    Mail,
    Shield,
    Monitor,
    ArrowRight,
    ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export default async function KnowledgeBasePage() {
    const employee = await getCurrentEmployee()

    if (!employee) {
        redirect('/portal/login')
    }

    const categories = [
        { id: 'email', name: 'البريد الإلكتروني', icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'network', name: 'الشبكة والإنترنت', icon: Wifi, color: 'text-green-500', bg: 'bg-green-50' },
        { id: 'printers', name: 'الطابعات', icon: Printer, color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'security', name: 'الأمن السيبراني', icon: Shield, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 'hardware', name: 'الأجهزة والملحقات', icon: Monitor, color: 'text-purple-500', bg: 'bg-purple-50' },
    ]

    const faqs = [
        {
            question: "كيف يمكنني تغيير كلمة مرور البريد الإلكتروني؟",
            answer: "يمكنك تغيير كلمة المرور من خلال الدخول إلى إعدادات الحساب في Outlook Web App واختيار 'تغيير كلمة المرور'. يجب أن تكون كلمة المرور الجديدة معقدة وتحتوي على حروف وأرقام ورموز.",
            category: 'email'
        },
        {
            question: "كيف أقوم بإعداد البريد الإلكتروني على هاتفي؟",
            answer: "قم بتحميل تطبيق Outlook من المتجر، ثم أدخل بريدك الإلكتروني وكلمة المرور. سيقوم التطبيق بإعداد الخوادم تلقائياً. إذا واجهت مشكلة، تواصل مع الدعم الفني.",
            category: 'email'
        },
        {
            question: "الإنترنت بطيء جداً، ماذا أفعل؟",
            answer: "تأكد أولاً من إغلاق أي برامج تقوم بتحميل ملفات كبيرة. جرب فصل الاتصال بالشبكة وإعادة الاتصال. إذا استمرت المشكلة، قد يكون هناك ضغط عام على الشبكة.",
            category: 'network'
        },
        {
            question: "الطابعة لا تستجيب للأمر، ما الحل؟",
            answer: "تأكد من أن الطابعة متصلة بالكهرباء والشبكة، وأن هناك ورق كافٍ. جرب إعادة تشغيل الطابعة. إذا ظهرت رسالة خطأ على شاشة الطابعة، سجلها وأرسلها للدعم الفني.",
            category: 'printers'
        },
        {
            question: "كيف أطلب جهاز حاسب جديد؟",
            answer: "يمكنك تقديم طلب 'قطعة هاردوير' من خلال البوابة، واختيار نوع الجهاز وتوضيح مبررات الطلب. سيتم مراجعة الطلب من قبل الإدارة.",
            category: 'hardware'
        },
        {
            question: "نسيت كلمة المرور للدخول للجهاز، ماذا أفعل؟",
            answer: "يجب عليك التواصل فوراً مع الدعم الفني لإعادة تعيين كلمة المرور. لا تحاول إدخال كلمات مرور خاطئة بشكل متكرر حتى لا يتم قفل الحساب.",
            category: 'security'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-8">
                <PremiumPageHeader
                    title="قاعدة المعرفة"
                    description="ابحث في قاعدة المعرفة عن حلول سريعة للمشاكل الشائعة"
                    icon={BookOpen}
                    rightContent={
                        <Link href="/portal/dashboard">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة للرئيسية
                            </Button>
                        </Link>
                    }
                />

                <div className="relative max-w-xl mx-auto -mt-6 mb-8 z-10">
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-2">
                            <div className="relative">
                                <Search className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="ابحث عن مشكلة أو سؤال..."
                                    className="pr-10 h-12 bg-white text-foreground border-0 focus-visible:ring-0"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 -mt-8">
                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
                    {categories.map((cat) => (
                        <Card key={cat.id} className="hover:shadow-lg transition-all cursor-pointer border-0 shadow-md">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                                <div className={`p-3 rounded-full ${cat.bg}`}>
                                    <cat.icon className={`h-6 w-6 ${cat.color}`} />
                                </div>
                                <h3 className="font-semibold text-gray-700">{cat.name}</h3>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* FAQs */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-foreground">الأسئلة الشائعة</h2>
                        </div>

                        <Card className="shadow-md">
                            <CardContent className="p-6">
                                <Accordion type="single" collapsible className="w-full">
                                    {faqs.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger className="text-right font-medium text-gray-800 hover:text-blue-600">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-gray-600 leading-relaxed">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Support */}
                    <div className="space-y-6">
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md">
                            <CardContent className="p-6 text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Shield className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-blue-900 mb-2">لم تجد حلاً؟</h3>
                                <p className="text-blue-700 mb-6">
                                    فريق الدعم الفني جاهز لمساعدتك في أي وقت.
                                </p>
                                <Link href="/portal/support/new">
                                    <Button className="w-full gap-2 shadow-lg hover:shadow-xl transition-all">
                                        فتح تذكرة دعم
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">روابط سريعة</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href="/portal/dashboard" className="block p-2 hover:bg-gray-50 rounded-lg transition-colors text-blue-600 hover:underline">
                                    العودة للرئيسية
                                </Link>
                                <Link href="/portal/bookings/new" className="block p-2 hover:bg-gray-50 rounded-lg transition-colors text-blue-600 hover:underline">
                                    حجز قاعة اجتماعات
                                </Link>
                                <Link href="/portal/profile" className="block p-2 hover:bg-gray-50 rounded-lg transition-colors text-blue-600 hover:underline">
                                    الملف الشخصي
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
