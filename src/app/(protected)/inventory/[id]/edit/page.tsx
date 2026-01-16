export const dynamic = 'force-dynamic';

import { getInventoryItemById } from "@/app/actions/inventory"
import { EditInventoryForm } from "@/components/inventory/edit-inventory-form"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EditInventoryPageProps {
    params: {
        id: string
    }
}

export default async function EditInventoryPage({ params }: EditInventoryPageProps) {
    const { success, data: item } = await getInventoryItemById(params.id)

    if (!success || !item) {
        return <div className="flex items-center justify-center h-screen">لم يتم العثور على العنصر</div>
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <PremiumPageHeader
                title="تعديل عنصر المستودع"
                description="تحديث بيانات عنصر المخزون"
                icon={Package}
                rightContent={
                    <Link href="/inventory">
                        <Button variant="ghost" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            إلغاء
                        </Button>
                    </Link>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>بيانات العنصر</CardTitle>
                </CardHeader>
                <CardContent>
                    <EditInventoryForm item={item} />
                </CardContent>
            </Card>
        </div>
    )
}
