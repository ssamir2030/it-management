export const dynamic = 'force-dynamic';

import { getSoftwareById } from "@/app/actions/software-catalog"
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header"
import { Package } from "lucide-react"
import { SoftwareForm } from "../../software-form"
import { notFound } from "next/navigation"

export default async function EditSoftwarePage({ params }: { params: { id: string } }) {
    const result = await getSoftwareById(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    const software = result.data

    return (
        <div className="space-y-6">
            <EnhancedPageHeader
                title="تعديل البرنامج"
                description={`تعديل: ${software.name}`}
                icon={Package}
                iconBgGradient="from-violet-500 to-purple-600"
                titleGradient="from-violet-600 to-purple-800"
            />

            <div className="bg-white rounded-lg border shadow-sm p-6">
                <SoftwareForm software={software} />
            </div>
        </div>
    )
}
