export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { FileText, Activity } from 'lucide-react'
import { LogsClient } from '@/components/admin/logs-client'
import { ActivityList } from '@/components/admin/activity-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from 'react'

export default function LogsPage() {
    return (
        <div className="container mx-auto p-6 space-y-6" dir="rtl">
            <PremiumPageHeader
                title="النشاط والسجلات"
                description="متابعة أنشطة النظام وسجلات التدقيق"
                icon={FileText}
            />

            <Tabs defaultValue="activity" className="w-full">
                <TabsList className="w-full justify-start h-auto p-1 bg-muted/50">
                    <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-background">
                        <Activity className="h-4 w-4" />
                        خلاصة النشاط (Timeline)
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="gap-2 data-[state=active]:bg-background">
                        <FileText className="h-4 w-4" />
                        سجلات النظام (Table)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="mt-6">
                    <Suspense fallback={<div>جاري التحميل...</div>}>
                        <ActivityList />
                    </Suspense>
                </TabsContent>

                <TabsContent value="logs" className="mt-6">
                    <LogsClient />
                </TabsContent>
            </Tabs>
        </div>
    )
}
