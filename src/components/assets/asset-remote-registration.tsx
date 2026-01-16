"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Globe, Loader2, Monitor, CheckCircle, Copy, AlertCircle, RefreshCw, Power } from "lucide-react"
import { registerRemoteAgent, createRemoteSession, syncAgentStatus } from "@/app/actions/remote-access"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface AssetRemoteRegistrationProps {
    assetId: string
    assetName: string
    remoteAgent: any
}

export function AssetRemoteRegistration({ assetId, assetName, remoteAgent: initialAgent }: AssetRemoteRegistrationProps) {
    const [agent, setAgent] = useState<any>(initialAgent)
    const [isLoading, setIsLoading] = useState(false)
    const [installCode, setInstallCode] = useState<string | null>(initialAgent?.installCode || null)

    const handleRegister = async () => {
        setIsLoading(true)
        try {
            const result = await registerRemoteAgent(assetId)
            if (result.success && result.data) {
                setInstallCode(result.data.installCode)
                setAgent({
                    ...result.data,
                    state: 'waiting' // Initial state
                })
                toast.success("تم تفعيل خدمة الوصول عن بعد")
            } else {
                toast.error(result.error || "فشل التفعيل")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setIsLoading(false)
        }
    }

    const handleConnect = async () => {
        setIsLoading(true)
        try {
            // Check status first
            if (agent.state !== 'online') {
                const syncRes = await syncAgentStatus(agent.id)
                if (syncRes.success && syncRes.data?.state === 'online') {
                    setAgent((prev: any) => ({ ...prev, state: 'online' }))
                } else {
                    toast.error("الجهاز غير متصل حالياً")
                    setIsLoading(false)
                    return
                }
            }

            const result = await createRemoteSession(assetId, "Direct Connect from Asset Page")
            if (result.success && result.data) {
                window.open(result.data.url, '_blank')
                toast.success("تم فتح الجلسة")
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error("فشل الاتصال")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSync = async () => {
        if (!agent) return
        setIsLoading(true)
        try {
            const result = await syncAgentStatus(agent.id)
            if (result.success && result.data) {
                setAgent((prev: any) => ({ ...prev, state: result.data.state }))
                toast.success("تم تحديث الحالة")
            }
        } finally {
            setIsLoading(false)
        }
    }

    const copyCode = () => {
        if (installCode) {
            navigator.clipboard.writeText(installCode)
            toast.success("تم نسخ كود التثبيت")
        }
    }

    if (!agent && !installCode) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-indigo-600" />
                        الوصول عن بعد
                    </CardTitle>
                    <CardDescription>
                        تفعيل التحكم المباشر بهذا الجهاز عبر الويب
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        تفعيل الخدمة (Generate Agent)
                    </Button>
                </CardContent>
            </Card>
        )
    }

    // Waiting for installation
    if (agent && agent.state !== 'online' && installCode) {
        return (
            <Card className="border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/10">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                            <span>بانتظار التثبيت...</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleSync} disabled={isLoading}>
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-white dark:bg-slate-900 border border-indigo-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-indigo-600" />
                            كود التثبيت (Install Code)
                        </h4>
                        <div className="flex gap-2">
                            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-lg font-bold flex-1">
                                {installCode}
                            </code>
                            <Button size="icon" variant="outline" onClick={copyCode}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-2">
                        <p>1. قم بتحميل DWService Agent على الجهاز الهدف.</p>
                        <p>2. اختر "Install" وأدخل الكود أعلاه عند الطلب.</p>
                        <p>3. اضغط تحديث هنا بعد الانتهاء.</p>
                    </div>

                    <a href="https://www.dwservice.net/en/download.html" target="_blank" className="block">
                        <Button variant="outline" className="w-full">
                            تحميل البرنامج
                            <Globe className="ml-2 h-4 w-4" />
                        </Button>
                    </a>
                </CardContent>
            </Card>
        )
    }

    // Online & Ready
    return (
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/10">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle className="h-5 w-5" />
                        <span>متصل وجاهز</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Online</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                    onClick={handleConnect}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20"
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Power className="mr-2 h-4 w-4" />}
                    اتصال مباشر (Web Remote)
                </Button>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-4">
                    <div className="bg-white/50 p-2 rounded border">
                        <span className="block opacity-70">نظام التشغيل</span>
                        <span className="font-mono">{agent.osType || 'Unknown'}</span>
                    </div>
                    <div className="bg-white/50 p-2 rounded border">
                        <span className="block opacity-70">آخر ظهور</span>
                        <span>{agent.lastOnline ? new Date(agent.lastOnline).toLocaleTimeString('ar-EG') : 'الآن'}</span>
                    </div>
                </div>

                <Button variant="ghost" size="sm" onClick={handleSync} disabled={isLoading} className="w-full text-xs text-muted-foreground">
                    <RefreshCw className={`mr-2 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                    تحديث الحالة
                </Button>
            </CardContent>
        </Card>
    )
}
