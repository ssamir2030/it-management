export const dynamic = 'force-dynamic';

import { getCurrentEmployee } from "@/app/actions/employee-portal"
import { redirect } from "next/navigation"
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header"
import { PackageX } from "lucide-react"
import { AssetReturnForm } from "./asset-return-form"

export default async function AssetReturnPage() {
    const employee = await getCurrentEmployee()

    if (!employee) {
        redirect('/portal/login')
    }

    const allAssets = [
        ...employee.assets.map((asset: any) => ({
            id: asset.id,
            name: asset.name,
            type: 'ASSET' as const,
            serialNumber: asset.serialNumber,
            tag: asset.tag
        })),
        ...employee.custodyItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: 'CUSTODY' as const,
            description: item.description,
            assignedDate: item.assignedDate
        }))
    ]

    return (
        <div className="min-h-screen bg-gray-50/50" dir="rtl">
            <main className="py-8 space-y-8">
                <EnhancedPageHeader
                    title="طلب إرجاع عهدة"
                    description="قم بتحديد العهدة التي تريد إرجاعها للقسم التقني"
                    icon={PackageX}
                    iconBgGradient="from-orange-500 to-red-600"
                    titleGradient="from-orange-600 to-red-800"
                />

                <div className="bg-white rounded-lg border shadow-sm p-6">
                    {allAssets.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                                <PackageX className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-600">لا توجد عهدة مسجلة باسمك</h3>
                            <p className="text-muted-foreground">لا يمكنك تقديم طلب إرجاع عهدة</p>
                        </div>
                    ) : (
                        <AssetReturnForm assets={allAssets} employeeId={employee.id} />
                    )}
                </div>
            </main>
        </div>
    )
}
