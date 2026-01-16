export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation"
import { getSupplierById } from "@/app/actions/suppliers"
import { NewContractForm } from "@/components/suppliers/new-contract-form"

interface PageProps {
    params: {
        id: string
    }
}

export default async function NewContractPage({ params }: PageProps) {
    const result = await getSupplierById(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    return <NewContractForm supplierId={params.id} supplierName={result.data.name} />
}
