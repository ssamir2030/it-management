
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Monitor, Power, PowerOff, RefreshCw, Layers, ScreenShare, RotateCw, Lock, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

type VeyonComputer = {
    id?: string
    name: string
    hostAddress: string
    macAddress: string
    type: string
}

type VeyonRoom = {
    name: string
    type: string
    computers: VeyonComputer[]
}

type VeyonDirectory = {
    format: string
    data: VeyonRoom[]
}

export function VeyonController() {
    const [directory, setDirectory] = useState<VeyonDirectory | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [currentAction, setCurrentAction] = useState<{ type: string, targetId: string, title: string } | null>(null)
    const [inputValue, setInputValue] = useState('')

    const fetchDirectory = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/integrations/veyon/directory')
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setDirectory(data)
            toast.success('تم تحديث حالة الأجهزة')
        } catch (error) {
            console.error('Failed to fetch Veyon Directory:', error)
            toast.error('فشل في تحميل الدليل')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDirectory()
    }, [])

    const executeCommand = async (host: string, action: string, payload: any = {}) => {
        const idForLoad = `${host}-${action}`
        setActionLoading(idForLoad)
        try {
            const targetId = host || 'unknown'
            const res = await fetch(`/api/assets/${targetId}/power`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...payload })
            })

            const result = await res.json()
            if (!res.ok) throw new Error(result.error || 'فشلت العملية')

            // Handle specific results like Screenshot
            if (action === 'SCREENSHOT' && result.success && result.message) {
                // Open screenshot in new window or modal (For now simple new tab with base64)
                // Or better: show in a dialog. For simplicity v1:
                const win = window.open();
                if (win) win.document.write(`<img src="data:image/jpeg;base64,${result.message}" style="max-width:100%"/>`);
            } else {
                toast.success(result.message || 'تم تنفيذ الأمر بنجاح')
            }
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setActionLoading(null)
            setDialogOpen(false)
            setInputValue('')
        }
    }

    const openActionDialog = (host: string, actionType: 'MESSAGE' | 'OPEN_URL' | 'LAUNCH_APP' | 'KILL_PROCESS', title: string) => {
        setCurrentAction({ type: actionType, targetId: host, title })
        setInputValue('')
        setDialogOpen(true)
    }

    const handleDialogSubmit = () => {
        if (!currentAction) return
        if (!inputValue.trim()) {
            toast.error('الرجاء إدخال قيمة')
            return
        }

        const payload: any = {}
        if (currentAction.type === 'MESSAGE') payload.message = inputValue
        if (currentAction.type === 'OPEN_URL') payload.url = inputValue
        if (currentAction.type === 'LAUNCH_APP') payload.app = inputValue
        if (currentAction.type === 'KILL_PROCESS') payload.process = inputValue

        executeCommand(currentAction.targetId, currentAction.type, payload)
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <RefreshCw className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">جاري الاتصال بـ Veyon Gateway...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            <PremiumPageHeader
                title="التحكم عن بعد (Veyon)"
                description="مركز التحكم الشامل في الأجهزة والمعامل."
                icon={ScreenShare}
                rightContent={
                    <Button onClick={fetchDirectory} size="sm" className="gap-2 bg-white/10 hover:bg-white/20 text-white border-none">
                        <RefreshCw className="h-4 w-4" />
                        تحديث الحالة
                    </Button>
                }
            />

            {directory?.data.map((room) => (
                <Card key={room.name} className="overflow-hidden border-t-4 border-t-primary shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-muted/30 pb-4 border-b">
                        <CardTitle className="flex justify-between items-center text-lg">
                            <span className="flex items-center gap-2">
                                <Layers className="h-5 w-5 text-muted-foreground" />
                                {room.name}
                            </span>
                            <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5">
                                {room.computers.length} أجهزة
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {room.computers.map((pc) => (
                                <div key={pc.hostAddress} className="group relative bg-card border rounded-xl p-4 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2.5 bg-primary/10 rounded-full group-hover:scale-110 transition-transform">
                                            <Monitor className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex items-center gap-1.5 direction-ltr">
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 animate-pulse" title="متصل" />
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-card-foreground truncate mb-1" title={pc.name}>
                                        {pc.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-mono mb-5 truncate dir-ltr text-right">
                                        {pc.hostAddress}
                                    </p>

                                    <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                                        {/* Power Controls */}
                                        <Button
                                            size="icon" variant="ghost" className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-600"
                                            title="تشغيل" onClick={() => executeCommand(pc.hostAddress, 'WAKE')}>
                                            <Power className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                                            title="إيقاف تشغيل" onClick={() => {
                                                if (confirm('هل أنت متأكد من إيقاف تشغيل الجهاز؟')) executeCommand(pc.hostAddress, 'SHUTDOWN')
                                            }}>
                                            <PowerOff className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon" variant="ghost" className="h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
                                            title="إعادة تشغيل" onClick={() => {
                                                if (confirm('هل أنت متأكد من إعادة تشغيل الجهاز؟')) executeCommand(pc.hostAddress, 'REBOOT')
                                            }}>
                                            <RotateCw className="h-4 w-4" />
                                        </Button>

                                        {/* Advanced Menu */}
                                        <div className="relative group/menu">
                                            <Button size="icon" variant="secondary" className="h-8 w-8">
                                                <Layers className="h-4 w-4" />
                                            </Button>

                                            {/* Custom Dropdown (Simple CSS Hover) */}
                                            <div className="absolute left-0 bottom-full mb-2 w-48 bg-popover border rounded-md shadow-lg hidden group-hover/menu:block z-50 p-1">
                                                <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">التحكم</div>
                                                <button onClick={() => executeCommand(pc.hostAddress, 'LOCK')} className="w-full text-right px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2">
                                                    <Lock className="h-3 w-3" /> قفل الشاشة
                                                </button>
                                                <button onClick={() => executeCommand(pc.hostAddress, 'LOGOFF')} className="w-full text-right px-2 py-1.5 text-sm hover:bg-accent rounded-sm flex items-center gap-2">
                                                    <PowerOff className="h-3 w-3" /> تسجيل خروج
                                                </button>
                                                <div className="my-1 border-t" />
                                                <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">تفاعل</div>
                                                <button onClick={() => openActionDialog(pc.hostAddress, 'MESSAGE', 'إرسال رسالة')} className="w-full text-right px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                                                    💬 إرسال رسالة نصية
                                                </button>
                                                <button onClick={() => openActionDialog(pc.hostAddress, 'OPEN_URL', 'فتح رابط')} className="w-full text-right px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                                                    🌐 فتح موقع إلكتروني
                                                </button>
                                                <button onClick={() => openActionDialog(pc.hostAddress, 'LAUNCH_APP', 'تشغيل برنامج')} className="w-full text-right px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                                                    🚀 تشغيل تطبيق
                                                </button>
                                                <button onClick={() => openActionDialog(pc.hostAddress, 'KILL_PROCESS', 'إنهاء عملية')} className="w-full text-right px-2 py-1.5 text-sm hover:bg-accent text-red-600 hover:bg-red-50 rounded-sm">
                                                    💀 إنهاء عملية
                                                </button>
                                                <div className="my-1 border-t" />
                                                <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">شاشة</div>

                                                <button onClick={() => executeCommand(pc.hostAddress, 'SCREENSHOT')} className="w-full text-right px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                                                    📸 لقطة شاشة
                                                </button>
                                                <button onClick={() => window.open(`vnc://${pc.hostAddress}`, '_blank')} className="w-full text-right px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                                                    👁️ Veyon VNC Viewer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {directory?.data.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
                    <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold">لا توجد أجهزة مضافة</h3>
                </div>
            )}

            {/* Action Dialog */}
            {dialogOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-background border rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">{currentAction?.title}</h3>
                        <input
                            autoFocus
                            type="text"
                            className="w-full p-2 border rounded-md mb-4 bg-background"
                            placeholder={
                                currentAction?.type === 'OPEN_URL' ? 'https://example.com' :
                                    currentAction?.type === 'LAUNCH_APP' ? 'notepad.exe' :
                                        'اكتب رسالتك هنا...'
                            }
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleDialogSubmit()}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
                            <Button onClick={handleDialogSubmit} disabled={!!actionLoading}>
                                {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'تنفيذ'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
