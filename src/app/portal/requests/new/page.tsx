'use client'

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation'
import { GenericRequestForm } from '@/components/portal/generic-request-form'
import { Laptop, PenTool, ShieldCheck, Database, Wifi, HelpCircle } from 'lucide-react'

// Map types to content
const FORM_CONFIG: Record<string, { title: string, description: string, icon: any }> = {
    'HARDWARE': {
        title: 'طلب جهاز جديد',
        description: 'نموذج طلب لابتوب، مكتبي، أو ملحقات أجهزة',
        icon: Laptop
    },
    'SOFTWARE': {
        title: 'طلب برامج',
        description: 'تثبيت برامج جديدة، تحديث أنظمة، أو طلب تراخيص',
        icon: PenTool
    },
    'ACCESS': {
        title: 'طلب صلاحيات',
        description: 'صلاحيات بريد، مجلدات مشتركة، أو وصول للأنظمة',
        icon: ShieldCheck
    },
    'VPN': {
        title: 'طلب دخول عن بعد (VPN)',
        description: 'صلاحية العمل من المنزل عبر الشبكة الآمنة',
        icon: ShieldCheck
    },
    'ERP': {
        title: 'دعم نظام ERP',
        description: 'مشاكل في نظام الموارد البشرية أو المالية',
        icon: Database
    },
    'WIFI': {
        title: 'شبكة لاسلكية (WiFi)',
        description: 'طلب حساب واي فاي للضيوف أو الأجهزة الخاصة',
        icon: Wifi
    },
    'OTHER': {
        title: 'طلب عام / آخر',
        description: 'أي خدمات أخرى غير مذكورة في القائمة',
        icon: HelpCircle
    }
}

export default function NewRequestPage() {
    const searchParams = useSearchParams()
    const type = searchParams.get('type') || 'OTHER'

    // Normalize type key to handle potential variations or default to OTHER
    const configKey = Object.keys(FORM_CONFIG).find(k => k === type) || 'OTHER'
    const config = FORM_CONFIG[configKey]

    return (
        <GenericRequestForm
            type={type}
            title={config.title}
            description={config.description}
            icon={config.icon}
        />
    )
}
