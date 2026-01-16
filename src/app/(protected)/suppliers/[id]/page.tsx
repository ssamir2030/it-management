export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation"
import { getSupplierWithStats } from "@/app/actions/suppliers"
import { SupplierDetails } from "@/components/suppliers/supplier-details"

interface PageProps {
    params: {
        id: string
    }
}

export default async function SupplierDetailsPage({ params }: PageProps) {
    const result = await getSupplierWithStats(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    return <SupplierDetails supplier={result.data} />
}
