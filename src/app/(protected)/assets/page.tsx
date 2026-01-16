export const dynamic = 'force-dynamic';

import { getAssets } from "@/app/actions/assets"
import { AssetClient } from "@/components/assets/asset-client"

export default async function AssetsPage() {
    const { data: assets } = await getAssets()

    return <AssetClient assets={assets || []} />
}
