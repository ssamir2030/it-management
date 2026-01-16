import type { Metadata, Viewport } from 'next'
import dynamicImport from 'next/dynamic'
import PortalHeader from '@/components/portal/portal-header'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
// import { FloatingChat } from '@/components/chat/floating-chat'
const FloatingChat = dynamicImport(() => import('@/components/chat/floating-chat'), {
    ssr: false
})
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt'
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration'
import { ForceUnregisterSW } from '@/components/pwa/force-unregister'
import { NotificationProvider } from '@/contexts/notification-context'

// Force dynamic rendering for all portal pages
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'بوابة الموظفين | IT Asset Management',
    description: 'بوابة خدمات الموظفين - نظام إدارة أصول تقنية المعلومات',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'بوابة الموظفين',
    },
    formatDetection: {
        telephone: false,
    },
}

export const viewport: Viewport = {
    themeColor: '#0f3c6e',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

import { PortalAnnouncements } from '@/components/portal/portal-announcements'

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const employee = await getCurrentEmployee()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
            <NotificationProvider>
                <PortalHeader employeeName={employee?.name} employeeImage={(employee as any)?.image} />
                <PortalAnnouncements />
                <main className="flex-1 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] pb-24">
                    <div className="container mx-auto px-4 py-8">
                        {children}
                    </div>
                </main>
            </NotificationProvider>
            {employee && (
                <FloatingChat
                    role="EMPLOYEE"
                    userData={{
                        id: employee.id,
                        name: employee.name,
                        email: employee.email
                    }}
                />
            )}
        </div>
    )
}
