export const dynamic = 'force-dynamic';

import { getAsset, getEmployeesList, getAssetCategories } from "@/app/actions/assets"
import { EditAssetForm } from "@/components/assets/edit-asset-form"
import { notFound } from "next/navigation"
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Monitor, ArrowRight } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EditAssetPageProps {
    params: {
        id: string
    }
}

export default async function EditAssetPage({ params }: EditAssetPageProps) {
    const { success, data: asset } = await getAsset(params.id)
    const [employees, categoriesData] = await Promise.all([
        getEmployeesList(),
        getAssetCategories()
    ])

    const categories = categoriesData.success ? categoriesData.data : []

    if (!success || !asset) {
        notFound()
    }

    return (
        <div className="w-full py-10">
            <PremiumPageHeader
                title="تعديل الأصل"
                description={`تحديث بيانات الأصل ${asset.name}`}
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
            <div className="w-full">
                <EditAssetForm asset={asset} employees={employees} categories={categories} />
            </div>
        </div>
    )
}
