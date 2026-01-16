"use client"

import { IPStatus } from "@/app/actions/ipam"
import { Card } from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface IPGridProps {
    ips: IPStatus[]
}

export function IPGrid({ ips }: IPGridProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'USED': return "bg-blue-500 hover:bg-blue-600"
            case 'GATEWAY': return "bg-orange-500 hover:bg-orange-600"
            case 'RESERVED': return "bg-purple-500 hover:bg-purple-600"
            default: return "bg-emerald-500/20 hover:bg-emerald-500/40"
        }
    }

    // Split into rows of 32 or 16 for visual nicety? 
    // 256 IPs fits well in a 16x16 grid perfectly.

    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(40px,1fr))] gap-2 p-4 h-full content-start">
            <TooltipProvider delayDuration={0}>
                {ips.map((ipItem) => (
                    <Tooltip key={ipItem.ip}>
                        <TooltipTrigger asChild>
                            <div
                                className={cn(
                                    "aspect-square rounded-md flex items-center justify-center text-[10px] sm:text-xs font-mono cursor-pointer transition-all",
                                    getStatusColor(ipItem.status),
                                    ipItem.status === 'FREE' ? "text-emerald-700 dark:text-emerald-300" : "text-white shadow-sm"
                                )}
                            >
                                {ipItem.ip.split('.').pop()}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-xs">
                                <p className="font-bold">{ipItem.ip}</p>
                                <div className="border-t my-1"></div>
                                {ipItem.status === 'FREE' ? (
                                    <span className="text-emerald-500">Available</span>
                                ) : (
                                    <>
                                        <p>{ipItem.device?.name || ipItem.status}</p>
                                        <p className="text-muted-foreground">{ipItem.device?.type}</p>
                                        {ipItem.device?.tag && <p className="font-mono text-[10px]">{ipItem.device.tag}</p>}
                                    </>
                                )}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
    )
}
