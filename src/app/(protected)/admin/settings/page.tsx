export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Settings, Users, Trash2, Timer, Shield, Building2, KeyRound, Database, Bell, Palette, Tags, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function SettingsPage() {
    const settingsItems = [
        {
            title: "بيانات الشركة",
            description: "معلومات الشركة والشعار والمستندات",
            icon: Building2,
            href: "/admin/settings/company",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "إدارة المستخدمين",
            description: "إدارة حسابات المسؤولين والصلاحيات",
            icon: Users,
            href: "/admin/settings/users",
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: "سلة المحذوفات",
            description: "استعادة الحسابات المحذوفة",
            icon: Trash2,
            href: "/admin/settings/deleted-users",
            color: "text-red-600",
            bg: "bg-red-100"
        },
        {
            title: "اتفاقيات مستوى الخدمة (SLA)",
            description: "تكوين سياسات الوقت والاستجابة",
            icon: Timer,
            href: "/admin/settings/sla",
            color: "text-orange-600",
            bg: "bg-orange-100"
        },
        {
            title: "إدارة الصلاحيات",
            description: "تحديد صلاحيات الوصول للمستخدمين",
            icon: KeyRound,
            href: "/admin/settings/permissions",
            color: "text-indigo-500",
            bg: "bg-indigo-50"
        },
        {
            title: "إدارة النظام",
            description: "النسخ الاحتياطي وإعادة التعيين",
            icon: Database,
            href: "/admin/settings/system",
            color: "text-red-500",
            bg: "bg-red-50"
        },
        {
            title: "الإشعارات",
            description: "تخصيص تنبيهات النظام",
            icon: Bell,
            href: "/admin/settings/notifications",
            color: "text-yellow-500",
            bg: "bg-yellow-50"
        },
        {
            title: "المظهر",
            description: "تخصيص الألوان والوضع الليلي",
            icon: Palette,
            href: "/admin/settings/appearance",
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            title: "تصنيفات الأصول",
            description: "إدارة أنواع وتصنيفات الأجهزة",
            icon: Tags,
            href: "/admin/settings/categories",
            color: "text-cyan-500",
            bg: "bg-cyan-50"
        },
        {
            title: "محرك الأتمتة",
            description: "إدارة قواعد الأتمتة والإجراءات التلقائية",
            icon: Zap,
            href: "/admin/settings/automation",
            color: "text-yellow-600",
            bg: "bg-yellow-100"
        }
    ]

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                title="الإعدادات العامة"
                description="مركز التحكم في إعدادات النظام والمستخدمين"
                icon={Settings}
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsItems.map((item, index) => (
                    <Link key={index} href={item.href}>
                        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${item.bg} group-hover:scale-110 transition-transform`}>
                                        <item.icon className={`h-6 w-6 ${item.color}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{item.title}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">
                                    {item.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
