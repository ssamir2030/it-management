"use client"

export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function PlaceholderSettingsPage() {
    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                title="إعدادات النظام"
                description="هذه الصفحة قيد التطوير"
                icon={Settings}
            />

            <Card className="text-center py-24">
                <CardHeader>
                    <div className="mx-auto bg-muted/20 p-6 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                        <Settings className="w-12 h-12 text-muted-foreground animate-spin-slow" />
                    </div>
                    <CardTitle className="text-2xl">قريباً...</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        نعمل حالياً على تطوير هذه الصفحة. ستكون متاحة في التحديث القادم.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
