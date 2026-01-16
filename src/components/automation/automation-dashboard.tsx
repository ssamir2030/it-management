"use client"

import { useState, useEffect } from "react"
import { AgentDto, getConnectedAgents, setAgentPollingInterval } from "@/app/actions/automation-agents"
import AgentNetwork from "@/components/automation/agent-network"
import ScriptRunner from "@/components/automation/script-runner"
import QuickActions from "@/components/automation/quick-actions"
import ExecutionHistory, { ExecutionLogEntry } from "@/components/automation/execution-history"
import { Button } from "@/components/ui/button"
import { RefreshCw, Server, Layers, Command, Wifi, WifiOff, Terminal, History, Sparkles, CheckCircle2, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function AutomationDashboard() {
    const [agents, setAgents] = useState<AgentDto[]>([])
    const [selectedAgents, setSelectedAgents] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [executionLogs, setExecutionLogs] = useState<ExecutionLogEntry[]>([])
    const [isLiveMode, setIsLiveMode] = useState(false)

    const fetchAgents = async () => {
        setLoading(true)
        const res = await getConnectedAgents()
        if (res.success && res.data) {
            setAgents(res.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchAgents()
        const interval = setInterval(fetchAgents, 30000)
        return () => clearInterval(interval)
    }, [])

    const toggleAgent = (id: string) => {
        setSelectedAgents(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const selectAll = () => {
        if (selectedAgents.length === agents.length) {
            setSelectedAgents([])
        } else {
            setSelectedAgents(agents.map(a => a.id))
        }
    }

    const handleActionComplete = (action: string, result: any) => {
        const newLog: ExecutionLogEntry = {
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            action: action,
            targetCount: selectedAgents.length,
            status: result.success ? 'success' : 'error',
            message: result.message || result.error
        }
        setExecutionLogs(prev => [newLog, ...prev])
    }

    const onlineCount = agents.filter(a => a.status === 'AGENT_CONNECTED').length
    const offlineCount = agents.length - onlineCount

    return (
        <div className="space-y-6">
            {/* Stats Cards - Horizontal Layout */}
            <div className="flex flex-wrap gap-4">
                <StatCard label="إجمالي الأجهزة" value={agents.length} icon={<Server className="h-4 w-4" />} color="slate" />
                <StatCard label="متصل" value={onlineCount} icon={<Wifi className="h-4 w-4" />} color="emerald" />
                <StatCard label="غير متصل" value={offlineCount} icon={<WifiOff className="h-4 w-4" />} color="rose" />
                <StatCard label="محدد" value={selectedAgents.length} icon={<Command className="h-4 w-4" />} color="amber" />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="control" className="space-y-6">
                <TabsList className="bg-slate-900/80 border border-slate-800 p-1 h-auto">
                    <TabsTrigger value="control" className="data-[state=active]:bg-slate-700 gap-2 px-4 py-2">
                        <Terminal className="h-4 w-4" />
                        <span className="hidden sm:inline">مركز التحكم</span>
                    </TabsTrigger>
                    <TabsTrigger value="quick" className="data-[state=active]:bg-slate-700 gap-2 px-4 py-2">
                        <Sparkles className="h-4 w-4" />
                        <span className="hidden sm:inline">الأوامر السريعة</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-slate-700 gap-2 px-4 py-2">
                        <History className="h-4 w-4" />
                        <span className="hidden sm:inline">السجل</span>
                        {executionLogs.length > 0 && (
                            <Badge className="h-5 px-1.5 text-[10px] bg-sky-600">{executionLogs.length}</Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Control Tab */}
                <TabsContent value="control" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Agent Network - 3/5 */}
                        <div className="lg:col-span-3 space-y-4">
                            <SectionHeader
                                icon={<Layers className="h-5 w-5" />}
                                title="شبكة الأجهزة"
                                badge="مباشر"
                                actions={
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={async () => {
                                                const newMode = !isLiveMode
                                                setIsLiveMode(newMode)
                                                const interval = newMode ? 3 : 30

                                                // Apply to all selected agents
                                                for (const id of selectedAgents) {
                                                    await setAgentPollingInterval(id, interval)
                                                }

                                                handleActionComplete(
                                                    newMode ? 'تفعيل الوضع المباشر' : 'إيقاف الوضع المباشر',
                                                    { success: true, message: `تم ${newMode ? 'تسريع' : 'إبطاء'} التحديث لـ ${selectedAgents.length} جهاز` }
                                                )
                                            }}
                                            variant={isLiveMode ? "default" : "outline"}
                                            size="sm"
                                            disabled={selectedAgents.length === 0}
                                            className={cn("h-8 gap-2 transition-all", isLiveMode ? "bg-amber-600 hover:bg-amber-700 border-amber-600" : "border-slate-700 hover:bg-slate-800")}
                                        >
                                            <Zap className={cn("h-4 w-4", isLiveMode ? "fill-white" : "text-amber-400")} />
                                            {isLiveMode ? 'مباشر (ON)' : 'مباشر (OFF)'}
                                        </Button>
                                        <Button onClick={selectAll} variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs h-8">
                                            {selectedAgents.length === agents.length && agents.length > 0 ? 'إلغاء التحديد' : 'تحديد الكل'}
                                        </Button>
                                        <Button onClick={fetchAgents} variant="outline" size="icon" className="border-slate-700 hover:bg-slate-800 h-8 w-8">
                                            <RefreshCw className={cn("h-4 w-4 text-slate-400", loading && "animate-spin")} />
                                        </Button>
                                    </div>
                                }
                            />
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 min-h-[450px] max-h-[550px] overflow-y-auto">
                                <AgentNetwork agents={agents} selectedAgents={selectedAgents} onSelectAgent={toggleAgent} />
                            </div>
                        </div>

                        {/* Script Runner - 2/5 */}
                        <div className="lg:col-span-2 space-y-4">
                            <SectionHeader icon={<Command className="h-5 w-5" />} title="وحدة الأوامر" />
                            <ScriptRunner selectedAgentIds={selectedAgents} />
                        </div>
                    </div>
                </TabsContent>

                {/* Quick Actions Tab */}
                <TabsContent value="quick" className="mt-0">
                    <div className="space-y-6">
                        {/* Selected Agents Summary */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-amber-950/50 border border-amber-800/50 flex items-center justify-center">
                                        <Command className="h-6 w-6 text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {selectedAgents.length === 0 ? 'لم يتم تحديد أي جهاز' : `${selectedAgents.length} جهاز محدد`}
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            {selectedAgents.length === 0 ? 'اختر الأجهزة من القائمة أدناه' : 'جاهز لتنفيذ الأوامر'}
                                        </p>
                                    </div>
                                </div>
                                <Button onClick={selectAll} variant="outline" size="sm" className="border-slate-600">
                                    {selectedAgents.length === agents.length && agents.length > 0 ? 'إلغاء الكل' : 'تحديد الكل'}
                                </Button>
                            </div>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: Agent Selection */}
                            <div className="space-y-4">
                                <SectionHeader icon={<Layers className="h-5 w-5" />} title="اختر الأجهزة" />
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
                                    <ScrollArea className="h-[350px]">
                                        <div className="space-y-2 pr-2">
                                            {agents.map(agent => {
                                                const isOnline = agent.status === 'AGENT_CONNECTED'
                                                const isSelected = selectedAgents.includes(agent.id)
                                                return (
                                                    <div
                                                        key={agent.id}
                                                        onClick={() => toggleAgent(agent.id)}
                                                        className={cn(
                                                            "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                                                            isSelected
                                                                ? "bg-blue-950/30 border-blue-600"
                                                                : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                isOnline ? "bg-emerald-400" : "bg-slate-600"
                                                            )} />
                                                            <div>
                                                                <div className="font-medium text-sm text-white" dir="ltr">
                                                                    {agent.hostname || 'Unknown'}
                                                                </div>
                                                                <div className="text-xs text-slate-500 font-mono" dir="ltr">
                                                                    {agent.ipAddress}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <CheckCircle2 className="h-5 w-5 text-blue-400" />
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>

                            {/* Right: Quick Actions */}
                            <div className="space-y-4">
                                <SectionHeader icon={<Sparkles className="h-5 w-5 text-amber-400" />} title="الأوامر السريعة" />
                                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                                    <QuickActions selectedAgentIds={selectedAgents} onActionComplete={handleActionComplete} />
                                </div>

                                {/* Recent Logs Preview */}
                                {executionLogs.length > 0 && (
                                    <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-4">
                                        <h4 className="text-xs font-medium text-slate-500 mb-3">آخر العمليات</h4>
                                        <div className="space-y-2">
                                            {executionLogs.slice(0, 3).map(log => (
                                                <div key={log.id} className="flex items-center justify-between text-sm">
                                                    <span className={log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                                                        {log.status === 'success' ? '✓' : '✗'} {log.action}
                                                    </span>
                                                    <span className="text-slate-600 text-xs">
                                                        {log.timestamp.toLocaleTimeString('ar-SA')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="mt-0">
                    <ExecutionHistory logs={executionLogs} onClear={() => setExecutionLogs([])} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: 'slate' | 'emerald' | 'rose' | 'amber' }) {
    const colors = {
        slate: 'text-slate-400 border-slate-700 bg-slate-900/50',
        emerald: 'text-emerald-400 border-emerald-800/50 bg-emerald-950/30',
        rose: 'text-rose-400 border-rose-800/50 bg-rose-950/30',
        amber: 'text-amber-400 border-amber-800/50 bg-amber-950/30',
    }
    return (
        <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border", colors[color])}>
            {icon}
            <div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="text-lg font-bold">{value}</div>
            </div>
        </div>
    )
}

function SectionHeader({ icon, title, badge, actions }: { icon: React.ReactNode, title: string, badge?: string, actions?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-slate-400">{icon}</span>
                <h2 className="text-lg font-bold text-white">{title}</h2>
                {badge && (
                    <Badge variant="outline" className="border-emerald-700 text-emerald-400 text-[10px]">{badge}</Badge>
                )}
            </div>
            {actions}
        </div>
    )
}
