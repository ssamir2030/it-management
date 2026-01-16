"use client"

import { Button } from "@/components/ui/button"
import {
    RotateCcw,
    Shield,
    HardDrive,
    RefreshCw,
    Lock,
    LogOut,
    Trash2,
    Download,
    Settings,
    Wifi,
    Power,
    FileText,
    Users,
    Loader2
} from "lucide-react"
import { useState } from "react"
import { runPowerShellScript } from "@/app/actions/automation-agents"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface QuickActionsProps {
    selectedAgentIds: string[]
    onActionComplete?: (action: string, result: any) => void
}

const QUICK_ACTIONS = [
    {
        id: 'restart',
        name: 'إعادة التشغيل',
        icon: RotateCcw,
        color: 'text-orange-400 bg-orange-950/50 border-orange-800/50 hover:bg-orange-900/50',
        script: 'Restart-Computer -Force',
        confirm: true,
        dangerous: true
    },
    {
        id: 'gpupdate',
        name: 'تحديث GP',
        icon: RefreshCw,
        color: 'text-blue-400 bg-blue-950/50 border-blue-800/50 hover:bg-blue-900/50',
        script: 'gpupdate /force',
        confirm: false
    },
    {
        id: 'diskspace',
        name: 'مساحة القرص',
        icon: HardDrive,
        color: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50 hover:bg-emerald-900/50',
        script: 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{N="Used(GB)";E={[math]::Round($_.Used/1GB,2)}}, @{N="Free(GB)";E={[math]::Round($_.Free/1GB,2)}}',
        confirm: false
    },
    {
        id: 'defender',
        name: 'حالة Defender',
        icon: Shield,
        color: 'text-green-400 bg-green-950/50 border-green-800/50 hover:bg-green-900/50',
        script: 'Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated',
        confirm: false
    },
    {
        id: 'lock',
        name: 'قفل الجهاز',
        icon: Lock,
        color: 'text-amber-400 bg-amber-950/50 border-amber-800/50 hover:bg-amber-900/50',
        script: 'rundll32.exe user32.dll,LockWorkStation',
        confirm: true
    },
    {
        id: 'logoff',
        name: 'تسجيل خروج',
        icon: LogOut,
        color: 'text-rose-400 bg-rose-950/50 border-rose-800/50 hover:bg-rose-900/50',
        script: 'logoff',
        confirm: true,
        dangerous: true
    },
    {
        id: 'cleardns',
        name: 'مسح DNS',
        icon: Wifi,
        color: 'text-cyan-400 bg-cyan-950/50 border-cyan-800/50 hover:bg-cyan-900/50',
        script: 'Clear-DnsClientCache; ipconfig /flushdns',
        confirm: false
    },
    {
        id: 'installedapps',
        name: 'البرامج المثبتة',
        icon: Download,
        color: 'text-purple-400 bg-purple-950/50 border-purple-800/50 hover:bg-purple-900/50',
        script: 'Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayVersion, Publisher | Where-Object { $_.DisplayName } | Sort-Object DisplayName',
        confirm: false
    },
    {
        id: 'localadmins',
        name: 'المسؤولين المحليين',
        icon: Users,
        color: 'text-indigo-400 bg-indigo-950/50 border-indigo-800/50 hover:bg-indigo-900/50',
        script: 'Get-LocalGroupMember -Group "Administrators" | Select-Object Name, ObjectClass',
        confirm: false
    },
    {
        id: 'services',
        name: 'الخدمات النشطة',
        icon: Settings,
        color: 'text-slate-400 bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50',
        script: 'Get-Service | Where-Object {$_.Status -eq "Running"} | Select-Object Name, DisplayName | Sort-Object DisplayName',
        confirm: false
    },
    {
        id: 'shutdown',
        name: 'إيقاف التشغيل',
        icon: Power,
        color: 'text-red-400 bg-red-950/50 border-red-800/50 hover:bg-red-900/50',
        script: 'Stop-Computer -Force',
        confirm: true,
        dangerous: true
    },
    {
        id: 'eventlog',
        name: 'أحداث النظام',
        icon: FileText,
        color: 'text-teal-400 bg-teal-950/50 border-teal-800/50 hover:bg-teal-900/50',
        script: 'Get-EventLog -LogName System -Newest 20 -EntryType Error,Warning | Select-Object TimeGenerated, EntryType, Source, Message',
        confirm: false
    },
]

export default function QuickActions({ selectedAgentIds, onActionComplete }: QuickActionsProps) {
    const [executing, setExecuting] = useState<string | null>(null)
    const [confirmAction, setConfirmAction] = useState<string | null>(null)

    const handleAction = async (action: typeof QUICK_ACTIONS[0]) => {
        if (selectedAgentIds.length === 0) {
            toast.error("يرجى اختيار جهاز واحد على الأقل")
            return
        }

        if (action.confirm && confirmAction !== action.id) {
            setConfirmAction(action.id)
            toast.warning(`اضغط مرة أخرى للتأكيد: ${action.name}`)
            setTimeout(() => setConfirmAction(null), 3000)
            return
        }

        setExecuting(action.id)
        setConfirmAction(null)

        try {
            const res = await runPowerShellScript(selectedAgentIds, action.script)
            if (res.success) {
                toast.success(`تم إرسال: ${action.name}`)
                onActionComplete?.(action.id, res)
            } else {
                toast.error(res.error || `فشل: ${action.name}`)
                onActionComplete?.(action.id, res)
            }
        } catch (err) {
            toast.error("حدث خطأ في الاتصال")
        } finally {
            setExecuting(null)
        }
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon
                const isExecuting = executing === action.id
                const isConfirming = confirmAction === action.id

                return (
                    <Button
                        key={action.id}
                        variant="outline"
                        onClick={() => handleAction(action)}
                        disabled={isExecuting || selectedAgentIds.length === 0}
                        className={cn(
                            "h-auto py-3 px-2 flex flex-col items-center gap-1.5 border transition-all",
                            action.color,
                            isConfirming && "ring-2 ring-amber-500 animate-pulse",
                            selectedAgentIds.length === 0 && "opacity-40"
                        )}
                    >
                        {isExecuting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Icon className="h-5 w-5" />
                        )}
                        <span className="text-[10px] font-medium leading-tight text-center">
                            {action.name}
                        </span>
                    </Button>
                )
            })}
        </div>
    )
}
