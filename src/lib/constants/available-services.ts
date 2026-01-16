import {
    Laptop, Monitor, Printer, Wifi,
    ShieldCheck, Key, FileText, Database,
    Headphones, PenTool, Globe, Calendar, Bot, Users
} from "lucide-react"

export type ServiceCategory = 'ALL' | 'HARDWARE' | 'SOFTWARE' | 'ACCESS' | 'SUPPORT' | 'MANAGEMENT'

export interface ServiceItem {
    id: string
    title: string
    description: string
    icon: any
    href: string
    category: ServiceCategory
    popular?: boolean
    color: string
}

export const AVAILABLE_SERVICES: ServiceItem[] = [
    {
        id: 'new-device',
        title: 'طلب جهاز جديد',
        description: 'طلب لابتوب، ديسكتوب، أو جهاز لوحي للعمل',
        icon: Laptop,
        href: '/portal/equipment',
        category: 'HARDWARE',
        popular: true,
        color: 'bg-blue-500'
    },
    {
        id: 'accessories',
        title: 'ملحقات أجهزة',
        description: 'ماوس، لوحة مفاتيح، سماعات، أو شاشات إضافية',
        icon: Headphones,
        href: '/portal/consumables',
        category: 'HARDWARE',
        color: 'bg-indigo-500'
    },
    {
        id: 'ink-request',
        title: 'أحبار طابعات',
        description: 'طلب خراطيش حبر للطابعات وآلات التصوير',
        icon: Printer,
        href: '/portal/ink',
        category: 'HARDWARE',
        color: 'bg-pink-500'
    },
    {
        id: 'paper-request',
        title: 'أوراق طباعة',
        description: 'طلب أوراق A4, A3 وغيرها من مستلزمات الورق',
        icon: FileText,
        href: '/portal/paper',
        category: 'HARDWARE',
        color: 'bg-amber-500'
    },
    {
        id: 'software-install',
        title: 'تثبيت برامج',
        description: 'طلب تثبيت برامج هندسية، تصميم، أو أوفيس',
        icon: PenTool,
        href: '/portal/requests/new?type=SOFTWARE',
        category: 'SOFTWARE',
        popular: true,
        color: 'bg-emerald-500'
    },
    {
        id: 'email-access',
        title: 'صلاحيات بريد',
        description: 'إنشاء بريد جديد أو إعادة تعيين كلمة المرور',
        icon: Globe,
        href: '/portal/requests/new?type=ACCESS',
        category: 'ACCESS',
        color: 'bg-cyan-500'
    },
    {
        id: 'vpn-access',
        title: 'دخول عن بعد (VPN)',
        description: 'طلب صلاحية الدخول للشبكة الداخلية من المنزل',
        icon: ShieldCheck,
        href: '/portal/requests/new?type=VPN',
        category: 'ACCESS',
        color: 'bg-rose-500'
    },
    {
        id: 'tech-support',
        title: 'دعم فني عام',
        description: 'الإبلاغ عن مشكلة تقنية أو عطل في النظام',
        icon: Monitor,
        href: '/portal/support/new',
        category: 'SUPPORT',
        popular: true,
        color: 'bg-slate-500'
    },
    {
        id: 'erp-access',
        title: 'نظام ERP',
        description: 'طلب صلاحيات أو حل مشاكل نظام الموارد البشرية',
        icon: Database,
        href: '/portal/requests/new?type=ERP',
        category: 'ACCESS',
        color: 'bg-violet-500'
    },
    {
        id: 'meeting-room',
        title: 'حجز قاعة',
        description: 'حجز قاعة اجتماعات مع تجهيزات تقنية',
        icon: Calendar,
        href: '/portal/bookings/new',
        category: 'SUPPORT',
        color: 'bg-teal-500'
    },
    {
        id: 'wifi-guest',
        title: 'شبكة ضيوف',
        description: 'إنشاء حساب مؤقت لشبكة الواي فاي للزوار',
        icon: Wifi,
        href: '/portal/requests/new?type=WIFI',
        category: 'ACCESS',
        color: 'bg-sky-500'
    },
    {
        id: 'smart-assistant',
        title: 'المساعد الذكي للأعطال',
        description: 'تشخيص وحل المشاكل التقنية تلقائياً',
        icon: Bot,
        href: '/portal/support/troubleshoot',
        category: 'SUPPORT',
        popular: true,
        color: 'bg-indigo-600'
    },
    {
        id: 'team-management',
        title: 'فريق العمل',
        description: 'عرض ومتابعة عهدة وطلبات فريق العمل (للمدراء)',
        icon: Users,
        href: '/portal/team',
        category: 'ACCESS',
        color: 'bg-orange-500'
    }
]
