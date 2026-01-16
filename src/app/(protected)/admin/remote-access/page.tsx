"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react"
import { getRemoteAgents, createRemoteSession, syncAgentStatus } from "@/app/actions/remote-access"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Monitor, Wifi, WifiOff, RefreshCw, Layout, Server, ArrowUpRight, Search, Laptop, Loader2, Globe, ShieldCheck, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function RemoteAccessPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [dwAgents, setDwAgents] = useState<any[]>([])
    const [otherAssets, setOtherAssets] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [connectingId, setConnectingId] = useState<string | null>(null)
    const [syncingId, setSyncingId] = useState<string | null>(null)

    const fetchData = async () => {
        setIsLoading(true)
        const result = await getRemoteAgents()
        if (result.success && result.data) {
            setDwAgents(result.data.registeredAgents)
            setOtherAssets(result.data.otherConnectableAssets || [])
        } else {
            toast.error("فشل جلب بيانات الأجهزة")
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleConnectDW = async (assetId: string) => {
        setConnectingId(assetId)
        try {
            const result = await createRemoteSession(assetId, "Direct Connect")
            if (result.success && result.data) {
                window.open(result.data.url, '_blank')
                toast.success("تم فتح جلسة الاتصال")
            } else {
                toast.error(result.error || "فشل الاتصال")
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الاتصال")
        } finally {
            setConnectingId(null)
        }
    }

    const handleSyncStatus = async (agentId: string) => {
        setSyncingId(agentId)
        const result = await syncAgentStatus(agentId)
        if (result.success) {
            toast.success("تم تحديث الحالة")
            fetchData() // Refresh to show new status
        } else {
            toast.error(result.error)
        }
        setSyncingId(null)
    }

    const downloadRdpFile = (ip: string) => {
        const content = `full address:s:${ip}\nprompt for credentials:i:1\nnegotiate security layer:i:1`
        const blob = new Blob([content], { type: 'application/x-rdp' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `connect-${ip}.rdp`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success("تم تحميل ملف الاتصال (RDP)", { description: "قم بفتح الملف لبدء الاتصال." })
    }

    // Merge and filter
    const allItems = [
        ...dwAgents.map(a => ({ ...a, source: 'DWService' })),
        ...otherAssets.map(a => ({ ...a, source: 'Direct', asset: a }))
    ].filter(item =>
        item.asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.asset.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.asset.ipAddress && item.asset.ipAddress.includes(searchQuery)) ||
        (item.asset.anydeskId && item.asset.anydeskId.includes(searchQuery)) ||
        (item.asset.dwServiceId && item.asset.dwServiceId.includes(searchQuery)) ||
        (item.asset.employee?.name && item.asset.employee.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    const onlineCount = dwAgents.filter(a => a.state === 'online').length
    const totalCount = allItems.length

    return (
        <div className="flex flex-col gap-6 p-6">
            <PremiumPageHeader
                title="بوابة الوصول عن بعد"
                description="لوحة تحكم مركزية للاتصال بالأجهزة والدعم الفني عن بعد"
                icon={Layout}
                stats={[
                    { label: "إجمالي الأجهزة", value: totalCount, icon: Monitor },
                    { label: "متصل الآن (DW)", value: onlineCount, icon: Wifi, color: "text-emerald-500" },
                ]}
            />

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث باسم الجهاز، الرمز، الموظف، IP، AnyDesk، أو DW ID..."
                        className="pr-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" onClick={fetchData} disabled={isLoading}>
                    <RefreshCw className={cn("h-4 w-4 ml-2", isLoading && "animate-spin")} />
                    تحديث القائمة
                </Button>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {allItems.map((item) => (
                        <motion.div
                            key={item.source === 'DWService' ? item.id : item.asset.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <Card className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-all duration-300 relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/50">
                                {/* Top colored bar */}
                                <div className={cn(
                                    "h-1.5 w-full absolute top-0 left-0",
                                    item.state === 'online' ? "bg-emerald-500" :
                                        item.source === 'Direct' ? "bg-blue-500" : "bg-gray-300 dark:bg-slate-700"
                                )} />

                                <div className="p-5 space-y-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3 items-center">
                                            <div className={cn(
                                                "p-2.5 rounded-xl shadow-inner",
                                                item.source === 'DWService' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" :
                                                    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                            )}>
                                                {item.asset.type === 'LAPTOP' ? <Laptop className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base line-clamp-1" title={item.asset.name}>{item.asset.name}</h3>
                                                <p className="text-xs text-muted-foreground font-mono">{item.asset.tag}</p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        {item.source === 'DWService' ? (
                                            <Badge variant="outline" className={cn(
                                                "gap-1.5 px-2.5 py-1",
                                                item.state === 'online'
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                                    : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:border-slate-700"
                                            )}>
                                                <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", item.state === 'online' ? "bg-emerald-500" : "bg-gray-400")} />
                                                {item.state === 'online' ? 'متصل' : 'غير متصل'}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="gap-1.5">
                                                <Server className="h-3 w-3" />
                                                Direct
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg border">
                                            <span className="text-muted-foreground block mb-1">المستخدم</span>
                                            <span className="font-medium truncate block" title={item.asset.employee?.name}>{item.asset.employee?.name || '-'}</span>
                                        </div>
                                        <div className="bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg border">
                                            <span className="text-muted-foreground block mb-1">IP Address</span>
                                            <span className="font-medium font-mono truncate block" title={item.asset.ipAddress}>{item.asset.ipAddress || '-'}</span>
                                        </div>
                                    </div>

                                    {/* IDs Badges - Moved relative to avoid overlap */}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {item.asset.dwServiceId && (
                                            <Badge variant="outline" className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30">
                                                DW ID: {item.asset.dwServiceId}
                                            </Badge>
                                        )}
                                        {item.asset.anydeskId && (
                                            <Badge variant="outline" className="text-[10px] font-mono text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30">
                                                AnyDesk: {item.asset.anydeskId}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {item.source === 'DWService' && item.state === 'online' && (
                                            <Button
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                                                onClick={() => handleConnectDW(item.assetId)}
                                                disabled={connectingId === item.assetId}
                                            >
                                                {connectingId === item.assetId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                                ) : (
                                                    <Globe className="h-4 w-4 ml-2" />
                                                )}
                                                اتصال ويب
                                            </Button>
                                        )}

                                        {/* Manual DWService Button */}
                                        {item.asset.dwServiceId && item.source !== 'DWService' && (
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(item.asset.dwServiceId)
                                                    window.open('https://www.dwservice.net/', '_blank')
                                                    toast.success("تم نسخ المعرف وفتح موقع DWService")
                                                }}
                                            >
                                                <Globe className="h-4 w-4 ml-2" />
                                                فتح DWService
                                            </Button>
                                        )}

                                        {item.asset.ipAddress && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20">
                                                        <Monitor className="h-4 w-4 ml-2" />
                                                        اتصال مباشر
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => downloadRdpFile(item.asset.ipAddress)}>
                                                        <Monitor className="h-4 w-4 ml-2 text-blue-500" />
                                                        اتصال RDP
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => window.open(`vnc://${item.asset.ipAddress}`)}>
                                                        <Layout className="h-4 w-4 ml-2 text-orange-500" />
                                                        اتصال VNC
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}

                                        {item.asset.anydeskId && (
                                            <Button variant="ghost" className="px-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20" onClick={() => window.open(`anydesk:${item.asset.anydeskId}`)}>
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Button>
                                        )}

                                        {item.source === 'DWService' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleSyncStatus(item.id)}
                                                disabled={syncingId === item.id}
                                                className="shrink-0"
                                            >
                                                <RefreshCw className={cn("h-4 w-4 text-muted-foreground", syncingId === item.id && "animate-spin")} />
                                            </Button>
                                        )}
                                    </div>

                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {allItems.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center text-muted-foreground bg-accent/20 rounded-2xl border border-dashed">
                        <Monitor className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">لا توجد أجهزة متاحة للوصول عن بعد</h3>
                        <p>تأكد من تسجيل الأجهزة في DWService أو إضافة عناوين IP/AnyDesk لهذه الأجهزة</p>
                    </div>
                )}
            </div>
        </div>
    )
}
