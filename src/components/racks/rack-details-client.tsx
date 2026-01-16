"use client"

import { useState } from "react"
import { updateAssetPosition } from "@/app/actions/racks"
import { RackView } from "./rack-view"
import { RackAssetList } from "./rack-asset-list"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface RackDetailsClientProps {
    rack: any
    unassignedAssets: any[]
}

export function RackDetailsClient({ rack: initialRack, unassignedAssets: initialUnassigned }: RackDetailsClientProps) {
    const router = useRouter()
    // Optimistic UI could be implemented here, but for simplicity we rely on router refresh for now

    const handleAssetDrop = async (assetId: string, uPosition: number) => {
        const res = await updateAssetPosition(assetId, initialRack.id, uPosition)
        if (res.success) {
            toast.success("Asset moved successfully")
            router.refresh()
        } else {
            toast.error("Failed to move asset")
        }
    }

    const handleAssetRemove = async (assetId: string) => {
        const res = await updateAssetPosition(assetId, null, null) // Remove from rack
        if (res.success) {
            toast.success("Asset removed from rack")
            router.refresh()
        } else {
            toast.error("Failed to remove asset")
        }
    }

    return (
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
            <div className="min-h-[600px] flex flex-col items-center">
                <RackView
                    rack={initialRack}
                    onAssetDrop={handleAssetDrop}
                    onAssetRemove={handleAssetRemove}
                />
            </div>
            <div className="h-[calc(100vh-200px)] sticky top-6">
                <RackAssetList assets={initialUnassigned} />
            </div>
        </div>
    )
}
