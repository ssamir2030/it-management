export const dynamic = 'force-dynamic';

import { Page } from "@/components/page-layout"
import { OrgTreeView } from "@/components/org-chart/org-tree-view"
import { getOrgChartData } from "@/app/actions/org-chart"
import { Network } from "lucide-react"

export default async function OrgChartPage() {
    const data = await getOrgChartData()

    return (
        <div className="container mx-auto py-8 px-4 max-w-[1600px] space-y-8">
            <OrgTreeView data={data} />
        </div>
    )
}
