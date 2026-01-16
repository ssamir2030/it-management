"use client"

import { useState } from "react"
import { AgentDto } from "@/app/actions/automation-agents"
import { runPowerShellScript } from "@/app/actions/automation-agents"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
    Laptop,
    Cpu,
    HardDrive,
    Wifi,
    WifiOff,
    User,
    Shield,
    Clock,
    RotateCcw,
    RefreshCw,
    Lock,
    LogOut,
    Power,
    Trash2,
    Download,
    Settings,
    FileText,
    Users,
    Terminal,
    Loader2,
    X,
    Copy,
    ExternalLink,
    FolderOpen,
    Monitor
} from "lucide-react"
import FileManager from "@/components/admin/discovery/file-manager"
import ScreenViewer from "@/components/admin/discovery/screen-viewer"

interface AgentDetailsSheetProps {
    agent: AgentDto | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

const DEVICE_ACTIONS = [
    {
        id: 'restart',
        name: 'إعادة التشغيل',
        icon: RotateCcw,
        color: 'text-orange-400 hover:bg-orange-950/50',
        script: 'Restart-Computer -Force',
        confirm: true,
        dangerous: true
    },
    {
        id: 'gpupdate',
        name: 'تحديث GP',
        icon: RefreshCw,
        color: 'text-blue-400 hover:bg-blue-950/50',
        script: 'gpupdate /force',
    },
    {
        id: 'lock',
        name: 'قفل الجهاز',
        icon: Lock,
        color: 'text-amber-400 hover:bg-amber-950/50',
        script: 'rundll32.exe user32.dll,LockWorkStation',
        confirm: true
    },
    {
        id: 'logoff',
        name: 'تسجيل خروج',
        icon: LogOut,
        color: 'text-rose-400 hover:bg-rose-950/50',
        script: 'logoff',
        confirm: true
    },
    {
        id: 'shutdown',
        name: 'إيقاف التشغيل',
        icon: Power,
        color: 'text-red-500 hover:bg-red-950/50',
        script: 'Stop-Computer -Force',
        confirm: true,
        dangerous: true
    },
    {
        id: 'cleardns',
        name: 'مسح DNS',
        icon: Wifi,
        color: 'text-cyan-400 hover:bg-cyan-950/50',
        script: 'Clear-DnsClientCache; ipconfig /flushdns',
    },
    {
        id: 'cleartemp',
        name: 'مسح الملفات المؤقتة',
        icon: Trash2,
        color: 'text-slate-400 hover:bg-slate-800/50',
        script: 'Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue',
    },
]

const INFO_ACTIONS = [
    {
        id: 'diskspace',
        name: 'مساحة الأقراص',
        icon: HardDrive,
        script: 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{N="Used(GB)";E={[math]::Round($_.Used/1GB,2)}}, @{N="Free(GB)";E={[math]::Round($_.Free/1GB,2)}}',
    },
    {
        id: 'defender',
        name: 'حالة Defender',
        icon: Shield,
        script: 'Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, AntivirusSignatureLastUpdated',
    },
    {
        id: 'installedapps',
        name: 'البرامج المثبتة',
        icon: Download,
        script: 'Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayVersion, Publisher | Where-Object { $_.DisplayName } | Sort-Object DisplayName',
    },
    {
        id: 'localadmins',
        name: 'المسؤولين المحليين',
        icon: Users,
        script: 'Get-LocalGroupMember -Group "Administrators" | Select-Object Name, ObjectClass',
    },
    {
        id: 'services',
        name: 'الخدمات النشطة',
        icon: Settings,
        script: 'Get-Service | Where-Object {$_.Status -eq "Running"} | Select-Object Name, DisplayName | Sort-Object DisplayName',
    },
    {
        id: 'eventlog',
        name: 'أحداث النظام',
        icon: FileText,
        script: 'Get-EventLog -LogName System -Newest 20 -EntryType Error,Warning | Select-Object TimeGenerated, EntryType, Source, Message',
    },
]

export default function AgentDetailsSheet({ agent, open, onOpenChange }: AgentDetailsSheetProps) {
    const [executing, setExecuting] = useState<string | null>(null)
    const [confirmAction, setConfirmAction] = useState<string | null>(null)
    const [actionResults, setActionResults] = useState<{ id: string, result: string }[]>([])

    if (!agent) return null

    const isOnline = agent.status === 'AGENT_CONNECTED' ||
        (new Date().getTime() - new Date(agent.lastSeen).getTime() < 5 * 60 * 1000)

    const details = agent.details || {}

    const handleAction = async (action: typeof DEVICE_ACTIONS[0]) => {
        if (action.confirm && confirmAction !== action.id) {
            setConfirmAction(action.id)
            toast.warning(`اضغط مرة أخرى للتأكيد: ${action.name}`)
            setTimeout(() => setConfirmAction(null), 3000)
            return
        }

        setExecuting(action.id)
        setConfirmAction(null)

        try {
            const res = await runPowerShellScript([agent.id], action.script)
            if (res.success) {
                toast.success(`تم تنفيذ: ${action.name}`)
            } else {
                toast.error(`فشل: ${action.name}`)
            }
        } catch (err) {
            toast.error("حدث خطأ في الاتصال")
        } finally {
            setExecuting(null)
        }
    }

    const handleInfoAction = async (action: typeof INFO_ACTIONS[0]) => {
        setExecuting(action.id)

        try {
            const res = await runPowerShellScript([agent.id], action.script)
            if (res.success) {
                toast.success(`تم جلب: ${action.name}`)
                setActionResults(prev => [
                    { id: action.id, result: res.message || 'تم التنفيذ بنجاح' },
                    ...prev.filter(r => r.id !== action.id)
                ])
            } else {
                toast.error(`فشل: ${action.name}`)
            }
        } catch (err) {
            toast.error("حدث خطأ في الاتصال")
        } finally {
            setExecuting(null)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("تم النسخ")
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="w-full sm:max-w-xl bg-slate-950 border-slate-800 p-0"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 bg-slate-900 border-b border-slate-800">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center",
                                    "bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10"
                                )}>
                                    <Laptop className="h-6 w-6 text-sky-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white" dir="ltr">
                                        {agent.hostname || 'Unknown Host'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded" dir="ltr">
                                            {agent.ipAddress || 'Unknown IP'}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
                                            onClick={() => copyToClipboard(agent.ipAddress || '')}
                                        >
                                            <Copy className="h-3 w-3 text-slate-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Badge className={cn(
                                "text-xs",
                                isOnline
                                    ? "bg-emerald-900/50 text-emerald-400 border-emerald-700"
                                    : "bg-rose-900/50 text-rose-400 border-rose-700"
                            )}>
                                {isOnline ? (
                                    <><Wifi className="h-3 w-3 ml-1" /> متصل</>
                                ) : (
                                    <><WifiOff className="h-3 w-3 ml-1" /> غير متصل</>
                                )}
                            </Badge>
                        </div>
                    </div>

                    {/* Content */}
                    <ScrollArea className="flex-1">
                        <Tabs defaultValue="info" className="p-4">
                            <TabsList className="w-full bg-slate-900 border border-slate-800">
                                <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-slate-800">
                                    المعلومات
                                </TabsTrigger>
                                <TabsTrigger value="files" className="flex-1 data-[state=active]:bg-slate-800 gap-2">
                                    <FolderOpen className="h-4 w-4" />
                                    الملفات
                                </TabsTrigger>
                                <TabsTrigger value="screen" className="flex-1 data-[state=active]:bg-slate-800 gap-2">
                                    <Monitor className="h-4 w-4" />
                                    الشاشة
                                </TabsTrigger>
                                <TabsTrigger value="actions" className="flex-1 data-[state=active]:bg-slate-800">
                                    الإجراءات
                                </TabsTrigger>
                                <TabsTrigger value="reports" className="flex-1 data-[state=active]:bg-slate-800">
                                    التقارير
                                </TabsTrigger>
                            </TabsList>

                            {/* Info Tab */}
                            <TabsContent value="info" className="mt-4 space-y-4">
                                {/* System Info */}
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">معلومات النظام</h3>

                                    <InfoRow
                                        icon={<Laptop className="h-4 w-4" />}
                                        label="نظام التشغيل"
                                        value={agent.os || details.os || 'غير معروف'}
                                    />
                                    <InfoRow
                                        icon={<Cpu className="h-4 w-4" />}
                                        label="المعالج"
                                        value={agent.cpu || details.processor || 'غير معروف'}
                                    />
                                    <InfoRow
                                        icon={<HardDrive className="h-4 w-4" />}
                                        label="الذاكرة"
                                        value={agent.ram || details.ram || 'غير معروف'}
                                    />
                                    <InfoRow
                                        icon={<Settings className="h-4 w-4" />}
                                        label="الشركة المصنعة"
                                        value={details.manufacturer || 'غير معروف'}
                                    />
                                    <InfoRow
                                        icon={<FileText className="h-4 w-4" />}
                                        label="الموديل"
                                        value={details.model || 'غير معروف'}
                                    />
                                    <InfoRow
                                        icon={<Shield className="h-4 w-4" />}
                                        label="الرقم التسلسلي"
                                        value={details.serial || 'غير معروف'}
                                    />
                                </div>

                                {/* User Info */}
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">معلومات المستخدم</h3>

                                    <InfoRow
                                        icon={<User className="h-4 w-4" />}
                                        label="المستخدم الحالي"
                                        value={details.username || 'غير معروف'}
                                    />
                                    <InfoRow
                                        icon={<Users className="h-4 w-4" />}
                                        label="المسؤولين المحليين"
                                        value={details.localAdmins || 'غير معروف'}
                                        multiline
                                    />
                                </div>

                                {/* Network Info */}
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">معلومات الشبكة</h3>

                                    <InfoRow
                                        icon={<Wifi className="h-4 w-4" />}
                                        label="عنوان IP"
                                        value={agent.ipAddress || 'Unknown'}
                                        copyable
                                        onCopy={() => copyToClipboard(agent.ipAddress || '')}
                                    />
                                    <InfoRow
                                        icon={<Settings className="h-4 w-4" />}
                                        label="عنوان MAC"
                                        value={details.mac || 'غير معروف'}
                                        copyable
                                        onCopy={() => copyToClipboard(details.mac || '')}
                                    />
                                </div>

                                {/* Disks */}
                                {details.disks && details.disks.length > 0 && (
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                        <h3 className="text-sm font-medium text-slate-400 mb-3">الأقراص</h3>
                                        <div className="space-y-2">
                                            {details.disks.map((disk: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-300 font-mono">{disk.drive}</span>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-slate-500">الحجم: {disk.size}</span>
                                                        <span className="text-emerald-400">متاح: {disk.free}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Last Seen */}
                                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        آخر اتصال
                                    </span>
                                    <span>{new Date(agent.lastSeen).toLocaleString('ar-SA')}</span>
                                </div>
                            </TabsContent>

                            {/* Files Tab */}
                            <TabsContent value="files" className="mt-4">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden min-h-[500px]">
                                    <FileManager deviceId={agent.id} />
                                </div>
                            </TabsContent>

                            {/* Screen Tab */}
                            <TabsContent value="screen" className="mt-4">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                                    <ScreenViewer deviceId={agent.id} />
                                </div>
                            </TabsContent>

                            {/* Actions Tab */}
                            <TabsContent value="actions" className="mt-4 space-y-4">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">إجراءات سريعة</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DEVICE_ACTIONS.map((action) => {
                                            const Icon = action.icon
                                            const isExecuting = executing === action.id
                                            const isConfirming = confirmAction === action.id

                                            return (
                                                <Button
                                                    key={action.id}
                                                    variant="outline"
                                                    onClick={() => handleAction(action)}
                                                    disabled={isExecuting || !isOnline}
                                                    className={cn(
                                                        "h-auto py-3 flex flex-col items-center gap-1.5 border-slate-700",
                                                        action.color,
                                                        isConfirming && "ring-2 ring-amber-500 animate-pulse",
                                                        !isOnline && "opacity-40"
                                                    )}
                                                >
                                                    {isExecuting ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <Icon className="h-5 w-5" />
                                                    )}
                                                    <span className="text-[10px] font-medium">{action.name}</span>
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {!isOnline && (
                                    <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-3 text-center">
                                        <p className="text-rose-400 text-sm">الجهاز غير متصل حالياً</p>
                                        <p className="text-rose-500 text-xs mt-1">لا يمكن تنفيذ الإجراءات</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Reports Tab */}
                            <TabsContent value="reports" className="mt-4 space-y-4">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">جلب التقارير</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {INFO_ACTIONS.map((action) => {
                                            const Icon = action.icon
                                            const isExecuting = executing === action.id

                                            return (
                                                <Button
                                                    key={action.id}
                                                    variant="outline"
                                                    onClick={() => handleInfoAction(action)}
                                                    disabled={isExecuting || !isOnline}
                                                    className={cn(
                                                        "h-auto py-3 flex flex-col items-center gap-1.5",
                                                        "border-slate-700 text-slate-400 hover:bg-slate-800/50",
                                                        !isOnline && "opacity-40"
                                                    )}
                                                >
                                                    {isExecuting ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <Icon className="h-5 w-5" />
                                                    )}
                                                    <span className="text-[10px] font-medium">{action.name}</span>
                                                </Button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {actionResults.length > 0 && (
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                        <h3 className="text-sm font-medium text-slate-400 mb-3">النتائج</h3>
                                        <div className="space-y-2">
                                            {actionResults.map((result, i) => (
                                                <div key={i} className="bg-black rounded-lg p-3 font-mono text-xs text-emerald-400" dir="ltr">
                                                    {result.result}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    )
}

function InfoRow({
    icon,
    label,
    value,
    multiline,
    copyable,
    onCopy
}: {
    icon: React.ReactNode
    label: string
    value: string
    multiline?: boolean
    copyable?: boolean
    onCopy?: () => void
}) {
    return (
        <div className={cn("flex gap-3", multiline ? "items-start" : "items-center")}>
            <div className="text-slate-500 shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-500">{label}</div>
                <div className={cn(
                    "text-sm text-slate-200 mt-0.5",
                    multiline ? "whitespace-pre-wrap" : "truncate"
                )} dir="ltr" title={value}>
                    {value}
                </div>
            </div>
            {copyable && onCopy && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={onCopy}
                >
                    <Copy className="h-3 w-3 text-slate-500" />
                </Button>
            )}
        </div>
    )
}
