export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { getConsumables, getConsumableCategories, getLowStockStats } from '@/app/actions/consumables'
import { ConsumablesClient } from '@/components/consumables/consumables-client'
import { Loader2 } from 'lucide-react'

async function ConsumablesContent() {
    const [consumablesRes, categoriesRes, lowStockRes] = await Promise.all([
        getConsumables(),
        getConsumableCategories(),
        getLowStockStats()
    ])

    const initialData = consumablesRes.success ? consumablesRes.data : []
    const categories = categoriesRes.success ? categoriesRes.data : []
    const lowStockCount = lowStockRes.success && lowStockRes.data ? lowStockRes.data.length : 0

    return (
        <ConsumablesClient
            initialData={initialData || []}
            categories={categories || []}
            lowStockCount={lowStockCount}
        />
    )
}

export default function ConsumablesPage() {
    return (
        <div className="space-y-6">

            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-muted-foreground" /></div>}>
                <ConsumablesContent />
            </Suspense>
        </div>
    )
}
