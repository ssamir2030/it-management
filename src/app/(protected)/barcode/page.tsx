export const dynamic = 'force-dynamic';

import { getEmployeesForSelect } from "@/app/actions/custody"
import { BarcodeClient } from "@/components/barcode/barcode-client"

export default async function BarcodePage() {
    const { data: employees } = await getEmployeesForSelect()

    return (
        <div className="w-full py-10">
            <BarcodeClient employees={employees || []} />
        </div>
    )
}

