export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Wrench, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MaintenancePage() {
    return (
        <div className="w-full py-6 space-y-6">
            <PremiumPageHeader
                title="الصيانة الدورية"
                description="إدارة جدول الصيانة الدورية للأصول"
                icon={Wrench}
                rightContent={
                    <Link href="/admin/maintenance/new">
                        <Button>
                            <Plus className="ml-2 h-4 w-4" />
                            صيانة جديدة
                        </Button>
                    </Link>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>جدول الصيانة</CardTitle>
                    <CardDescription>
                        عرض وإدارة جميع عمليات الصيانة المجدولة
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <Wrench className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>لا توجد عمليات صيانة مجدولة</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
