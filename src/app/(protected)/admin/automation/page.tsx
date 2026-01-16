export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import AutomationDashboard from "@/components/automation/automation-dashboard"
import { Bot } from "lucide-react"

export default function AutomationPage() {
    return (
        <div className="min-h-screen bg-background" dir="rtl">
            <div className="p-6 space-y-6">
                <PremiumPageHeader
                    title="الأتمتة التشغيلية"
                    description="إدارة الأجهزة في الوقت الفعلي وتنفيذ الأوامر عن بعد"
                    icon={Bot}
                    backLink="/admin/settings"
                />

                <AutomationDashboard />
            </div>
        </div>
    )
}
