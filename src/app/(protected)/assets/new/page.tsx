export const dynamic = 'force-dynamic';

import { createAsset, getEmployeesList, getInventoryItemsList, getAssetCategories } from "@/app/actions/assets"
import { NewAssetForm } from "@/components/assets/new-asset-form"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Monitor, ArrowRight } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function NewAssetPage() {
    const [employees, inventoryItems, categoriesData] = await Promise.all([
        getEmployeesList(),
        getInventoryItemsList(),
        getAssetCategories()
    ])

    const categories = categoriesData.success ? categoriesData.data : []

    return (
        <div className="w-full py-6 space-y-6 px-6">
            <PremiumPageHeader
                title="إضافة أصل جديد"
                description="تسجيل أصل جديد في النظام أو تحويل من المستودع"
                icon={Monitor}
                rightContent={
                    <Link href="/assets">
                        <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                            <ArrowRight className="h-4 w-4" />
                            إلغاء والعودة
                        </Button>
                    </Link>
                }
            />
            <NewAssetForm employees={employees} inventoryItems={inventoryItems} categories={categories} />
        </div>
    )
}
