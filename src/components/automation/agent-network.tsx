"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Cpu, Activity, Laptop, Eye } from "lucide-react"
import { AgentDto } from "@/app/actions/automation-agents"
import { cn } from "@/lib/utils"
import AgentDetailsSheet from "./agent-details-sheet"

interface AgentNetworkProps {
    agents: AgentDto[]
    selectedAgents: string[]
    onSelectAgent: (id: string) => void
}

export default function AgentNetwork({ agents, selectedAgents, onSelectAgent }: AgentNetworkProps) {
    const [detailsAgent, setDetailsAgent] = useState<AgentDto | null>(null)

    if (agents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700/50 rounded-xl bg-slate-900/50">
                <Laptop className="h-12 w-12 text-slate-700 mb-4" />
                <h3 className="text-xl font-semibold text-slate-400">لا يوجد أجهزة متصلة</h3>
                <p className="text-slate-600">قم بتثبيت الـ Agent على الأجهزة للبدء</p>
            </div>
        )
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {agents.map((agent) => {
                    const isOnline = agent.status === 'AGENT_CONNECTED' || (new Date().getTime() - new Date(agent.lastSeen).getTime() < 5 * 60 * 1000);
                    const isSelected = selectedAgents.includes(agent.id);

                    return (
                        <div
                            key={agent.id}
                            className={cn(
                                "relative group cursor-pointer transition-all duration-300",
                                "rounded-xl overflow-hidden border",
                                isSelected
                                    ? "border-blue-500 bg-blue-950/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                                    : "border-slate-800 bg-slate-950 hover:border-slate-600 hover:shadow-lg"
                            )}
                        >
                            {/* Status Light Stripe */}
                            <div className={cn(
                                "absolute top-0 right-0 w-1 h-full transition-colors",
                                isOnline ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-rose-500 shadow-[0_0_10px_#f43f5e]"
                            )} />

                            <div className="p-4 mr-2">
                                {/* Header with checkbox area */}
                                <div
                                    className="flex justify-between items-start mb-3"
                                    onClick={() => onSelectAgent(agent.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center",
                                            "bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5"
                                        )}>
                                            <Laptop className="h-5 w-5 text-sky-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-100 text-sm dir-ltr tracking-wide truncate max-w-[120px]" title={agent.hostname || 'Unknown'}>
                                                {agent.hostname || 'Unknown Host'}
                                            </h4>
                                            <div className="text-[10px] sm:text-xs text-slate-500 font-mono mt-0.5">{agent.ipAddress}</div>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center animate-in zoom-in duration-200">
                                            <CheckCircle2 className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Specs Grid */}
                                <div
                                    className="grid grid-cols-2 gap-2 mt-4"
                                    onClick={() => onSelectAgent(agent.id)}
                                >
                                    <div className="bg-slate-900/50 rounded-md p-2 border border-white/5">
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                                            <Cpu className="h-3 w-3" />
                                            <span>CPU</span>
                                        </div>
                                        <div className="text-xs text-slate-300 truncate" title={agent.cpu}>{agent.cpu?.split(' ')[0] || '-'}</div>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-md p-2 border border-white/5">
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
                                            <Activity className="h-3 w-3" />
                                            <span>RAM</span>
                                        </div>
                                        <div className="text-xs text-slate-300">{agent.ram}</div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                                    <span className={cn("flex items-center gap-1.5 text-[10px]", isOnline ? "text-emerald-400" : "text-rose-400")}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-400")} />
                                        {isOnline ? "Online" : "Offline"}
                                    </span>

                                    {/* Details Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setDetailsAgent(agent)
                                        }}
                                        className="h-6 px-2 text-[10px] text-slate-400 hover:text-sky-400 hover:bg-sky-950/30"
                                    >
                                        <Eye className="h-3 w-3 ml-1" />
                                        التفاصيل
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Details Sheet */}
            <AgentDetailsSheet
                agent={detailsAgent}
                open={!!detailsAgent}
                onOpenChange={(open) => !open && setDetailsAgent(null)}
            />
        </>
    )
}
