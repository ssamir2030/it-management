export const dynamic = 'force-dynamic';

import { getSuppliers } from "@/app/actions/suppliers"
import { SupplierClient } from "@/components/suppliers/supplier-client"

export default async function SuppliersPage() {
    const result = await getSuppliers()
    const suppliers: any[] = result?.success && result.data ? result.data : []

    return <SupplierClient initialSuppliers={suppliers} />
}
