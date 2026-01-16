"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Server, CircuitBoard, Info, Trash2, Edit } from "lucide-react"
import { cn } from "@/lib/utils"
// import { RackAssetItem } from "./rack-asset-item" // We will create this next

interface RackViewProps {
    rack: any
    onAssetDrop?: (assetId: string, uPosition: number) => void
    onAssetRemove?: (assetId: string) => void
    readOnly?: boolean
}

export function RackView({ rack, onAssetDrop, onAssetRemove, readOnly = false }: RackViewProps) {
    const [hoveredU, setHoveredU] = useState<number | null>(null)

    // Generate slots from capacity down to 1 (Racks are counted from bottom up)
    const slots = Array.from({ length: rack.capacity }, (_, i) => rack.capacity - i)

    // Map assets to positions
    const assetMap = new Map()
    rack.assets.forEach((asset: any) => {
        if (asset.uPosition) {
            assetMap.set(asset.uPosition, asset)
        }
    })

    // Helper to check if a slot is occupied by an asset starting there OR extending into it
    const getSlotState = (u: number) => {
        // Check if an asset STARTS here
        const startingAsset = assetMap.get(u)
        if (startingAsset) return { type: 'START', asset: startingAsset }

        // Check if occupied by a multi-U asset below
        // Iterate from u-1 down to 1
        for (let i = u - 1; i >= 1; i--) {
            // Limit check range for performance, max asset height unlikely to exceed 42
            if (u - i > 10) break;

            const asset = assetMap.get(i)
            if (asset && (asset.uPosition + asset.uHeight - 1) >= u) {
                return { type: 'OCCUPIED', asset }
            }
        }

        return { type: 'EMPTY' }
    }

    const handleDragOver = (e: React.DragEvent, u: number) => {
        e.preventDefault()
        if (readOnly) return
        setHoveredU(u)
    }

    const handleDrop = (e: React.DragEvent, u: number) => {
        e.preventDefault()
        setHoveredU(null)
        if (readOnly) return

        const assetId = e.dataTransfer.getData("assetId")
        const height = parseInt(e.dataTransfer.getData("uHeight") || "1")

        // Simple validation: check if fits
        // (In a real app, we'd do more robust overlap checking here too)
        if (onAssetDrop) {
            onAssetDrop(assetId, u)
        }
    }

    return (
        <Card className="w-full mx-auto bg-zinc-950 border-zinc-800 p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4 px-2">
                <div>
                    <h3 className="text-zinc-100 font-bold text-lg">{rack.name}</h3>
                    <p className="text-zinc-500 text-xs">{rack.capacity}U Server Rack</p>
                </div>
                <div className="flex gap-2 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Used</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-zinc-800"></div> Free</span>
                </div>
            </div>

            <div className="relative border-x-4 border-zinc-800 bg-zinc-900/50 rounded-sm">
                {slots.map((u) => {
                    const slotState = getSlotState(u)
                    const isHovered = hoveredU === u

                    // Render Logic
                    if (slotState.type === 'START') {
                        const asset = slotState.asset
                        // We only render the component at the start position with height
                        return (
                            <div
                                key={u}
                                className="relative border-b border-zinc-800/50 last:border-0"
                                style={{ height: `${asset.uHeight * 32}px` }} // Assuming 32px per U
                            >
                                {/* Asset Box */}
                                <div className={cn(
                                    "absolute inset-x-1 inset-y-0.5 rounded-sm flex items-center justify-between px-3 transition-all group",
                                    asset.status === 'AVAILABLE' ? "bg-zinc-800 border-zinc-700" :
                                        "bg-blue-950/40 border border-blue-800/50 hover:bg-blue-900/40"
                                )}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full animate-pulse",
                                            asset.status === 'AVAILABLE' ? "bg-zinc-500" : "bg-emerald-500"
                                        )}></div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-mono text-zinc-300 truncate">{asset.name}</span>
                                            <span className="text-[10px] text-zinc-500 truncate">{asset.tag}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-1 rounded">{asset.uHeight}U</span>

                                        {!readOnly && onAssetRemove && (
                                            <button
                                                onClick={() => onAssetRemove(asset.id)}
                                                className="text-zinc-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* U Marker (Left) */}
                                <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-mono w-4 text-right">
                                    {u}
                                </div>
                            </div>
                        )
                    } else if (slotState.type === 'OCCUPIED') {
                        // Do not render anything, slot is covered by previous element
                        return null
                    } else {
                        // Empty Slot
                        return (
                            <div
                                key={u}
                                className={cn(
                                    "h-8 border-b border-zinc-800/50 flex items-center relative transition-colors",
                                    isHovered ? "bg-blue-500/10" : "hover:bg-zinc-800/30"
                                )}
                                onDragOver={(e) => handleDragOver(e, u)}
                                onDragLeave={() => setHoveredU(null)}
                                onDrop={(e) => handleDrop(e, u)}
                            >
                                <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-[10px] text-zinc-700 font-mono w-4 text-right select-none">
                                    {u}
                                </div>
                                <div className="w-full text-center text-[9px] text-zinc-800 select-none opacity-0 hover:opacity-100">
                                    Empty Slot
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
        </Card>
    )
}
