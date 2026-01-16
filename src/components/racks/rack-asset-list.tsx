"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Server, Network, HardDrive, Box, GripVertical } from "lucide-react"

interface RackAssetListProps {
    assets: any[]
}

export function RackAssetList({ assets }: RackAssetListProps) {
    const handleDragStart = (e: React.DragEvent, asset: any) => {
        e.dataTransfer.setData("assetId", asset.id)
        e.dataTransfer.setData("uHeight", asset.uHeight?.toString() || "1")
        e.dataTransfer.effectAllowed = "move"
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'SERVER': return <Server className="h-4 w-4" />
            case 'NETWORK':
            case 'SWITCH':
            case 'ROUTER': return <Network className="h-4 w-4" />
            case 'UPS': return <HardDrive className="h-4 w-4" />
            default: return <Box className="h-4 w-4" />
        }
    }

    return (
        <Card className="h-full flex flex-col bg-card">
            <div className="p-4 border-b">
                <h3 className="font-semibold mb-1">Unassigned Assets</h3>
                <p className="text-xs text-muted-foreground">Drag assets to the rack</p>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {assets.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No compatible assets found.
                        </div>
                    ) : (
                        assets.map((asset) => (
                            <div
                                key={asset.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, asset)}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-grab active:cursor-grabbing transition-colors group"
                            >
                                <GripVertical className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground" />
                                <div className="p-2 rounded-md bg-muted group-hover:bg-background">
                                    {getIcon(asset.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{asset.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                            {asset.uHeight || 1}U
                                        </Badge>
                                        <span className="text-xs text-muted-foreground truncate font-mono">
                                            {asset.tag}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </Card>
    )
}
