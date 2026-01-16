export const dynamic = 'force-dynamic';

import { getCustodyItem, getEmployeesForSelect } from "@/app/actions/custody"
import { EditCustodyForm } from "@/components/custody/edit-custody-form"
import { notFound } from "next/navigation"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { UserCog, ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"

interface EditCustodyPageProps {
    params: {
        id: string
    }
}

export default async function EditCustodyPage({ params }: EditCustodyPageProps) {
    const { success, data: item } = await getCustodyItem(params.id)
    const { data: employees } = await getEmployeesForSelect()

    if (!success || !item) {
        notFound()
    }

    return (
        <div className="w-full py-10 space-y-6">
            <PremiumPageHeader
                title="تعديل العهدة"
                description={`تحديث بيانات العهدة ${item.name}`}
                icon={UserCog}
                rightContent={
                    <Link href="/custody">
                        <Button variant="ghost" className="text-white hover:bg-white/20 gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            إلغاء
                        </Button>
                    </Link>
                }
            />
            <div className="max-w-7xl">
                <EditCustodyForm item={item} employees={employees || []} />
            </div>
        </div>
    )
}
