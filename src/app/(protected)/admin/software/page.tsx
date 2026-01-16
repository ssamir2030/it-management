export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { AppWindow, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SoftwarePage() {
    return (
        <div className="w-full py-6 space-y-6">
            <PremiumPageHeader
                title="دليل البرامج"
                description="قائمة شاملة بجميع البرامج المستخدمة"
                icon={AppWindow}
                rightContent={
                    <Link href="/admin/software/new">
                        <Button>
                            <Plus className="ml-2 h-4 w-4" />
                            برنامج جديد
                        </Button>
                    </Link>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>البرامج</CardTitle>
                    <CardDescription>
                        جميع البرامج والتطبيقات المستخدمة في المؤسسة
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <AppWindow className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p>لا توجد برامج مسجلة</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
