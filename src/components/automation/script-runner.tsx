"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Terminal, Loader2, Trash2 } from "lucide-react"
import { runPowerShellScript } from "@/app/actions/automation-agents"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ScriptRunnerProps {
    selectedAgentIds: string[]
}

const PRESETS = [
    { id: 'ping', name: 'Ping Google DNS', code: 'Test-Connection 8.8.8.8 -Count 4' },
    { id: 'disk', name: 'Check Disk Space', code: 'Get-PSDrive -PSProvider FileSystem' },
    { id: 'services', name: 'List Running Services', code: 'Get-Service | Where-Object {$_.Status -eq "Running"}' },
    { id: 'restart', name: 'Restart Print Spooler', code: 'Restart-Service Spooler -Force' },
]

export default function ScriptRunner({ selectedAgentIds }: ScriptRunnerProps) {
    const [script, setScript] = useState('')
    const [executing, setExecuting] = useState(false)
    const [logs, setLogs] = useState<{ time: string, msg: string, type: 'info' | 'success' | 'error' }[]>([])

    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev])
    }

    const handleRun = async () => {
        if (!script.trim()) {
            toast.error("يرجى كتابة الأمر أولاً")
            return
        }
        if (selectedAgentIds.length === 0) {
            toast.error("يرجى اختيار جهاز واحد على الأقل")
            return
        }

        setExecuting(true)
        addLog(`Preparing to execute on ${selectedAgentIds.length} agents...`, 'info')

        try {
            const res = await runPowerShellScript(selectedAgentIds, script)
            if (res.success) {
                addLog(res.message || "Execution successful", 'success')
                toast.success("تم إرسال الأوامر بنجاح")
            } else {
                addLog(`Error: ${res.error}`, 'error')
                toast.error("حدث خطأ")
            }
        } catch (err) {
            addLog("System Error", 'error')
        } finally {
            setExecuting(false)
        }
    }

    return (
        <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    <span className="font-mono text-xs font-bold text-slate-300">PowerShell</span>
                </div>

                <Select onValueChange={(val) => setScript(PRESETS.find(p => p.id === val)?.code || '')}>
                    <SelectTrigger className="w-[160px] h-7 bg-slate-800 border-slate-700 text-xs">
                        <SelectValue placeholder="قوالب جاهزة" />
                    </SelectTrigger>
                    <SelectContent>
                        {PRESETS.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Editor Area */}
            <div className="p-3">
                <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Write your PowerShell script here..."
                    className="w-full h-32 resize-none bg-slate-950 border-slate-700 text-slate-300 font-mono text-sm focus-visible:ring-1 focus-visible:ring-sky-500"
                    spellCheck={false}
                    dir="ltr"
                />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between p-3 bg-slate-800/30 border-t border-slate-700">
                <div className="text-xs text-slate-500">
                    {selectedAgentIds.length === 0 ? (
                        <span className="text-amber-400">⚠ اختر جهازاً أولاً</span>
                    ) : (
                        <span className="text-emerald-400">✓ {selectedAgentIds.length} جهاز محدد</span>
                    )}
                </div>

                <Button
                    onClick={handleRun}
                    disabled={executing || !script.trim() || selectedAgentIds.length === 0}
                    size="sm"
                    className={cn(
                        "bg-sky-600 hover:bg-sky-500 text-white",
                        (selectedAgentIds.length === 0 || !script.trim()) && "opacity-50"
                    )}
                >
                    {executing ? (
                        <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : (
                        <Play className="w-4 h-4 ml-2 fill-current" />
                    )}
                    {executing ? 'جاري التنفيذ...' : 'تشغيل'}
                </Button>
            </div>

            {/* Logs Console */}
            <div className="bg-black border-t border-slate-800">
                <div className="px-3 py-1.5 bg-slate-900/80 text-[10px] text-slate-500 font-mono flex justify-between items-center border-b border-slate-800">
                    <span>OUTPUT LOG</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:text-red-400 hover:bg-transparent"
                        onClick={() => setLogs([])}
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
                <div className="h-24 overflow-y-auto p-2 font-mono text-xs" dir="ltr">
                    {logs.length === 0 ? (
                        <div className="text-slate-600 italic">Waiting for execution...</div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="mb-1 flex gap-2">
                                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                                <span className={cn(
                                    log.type === 'error' ? 'text-red-400' :
                                        log.type === 'success' ? 'text-emerald-400' :
                                            'text-slate-300'
                                )}>
                                    {log.type === 'success' && '✓ '}
                                    {log.type === 'error' && '✗ '}
                                    {log.msg}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
