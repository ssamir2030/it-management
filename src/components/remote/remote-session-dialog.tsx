"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { endRemoteSession } from "@/app/actions/remote-access"
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Monitor, X } from "lucide-react"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

interface RemoteSessionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sessionId: string
    sessionUrl: string
    deviceName: string
}

export function RemoteSessionDialog({
    open,
    onOpenChange,
    sessionId,
    sessionUrl,
    deviceName
}: RemoteSessionDialogProps) {
    const router = useRouter()
    const [ending, setEnding] = useState(false)

    async function handleEndSession() {
        setEnding(true)
        const result = await endRemoteSession(sessionId)

        if (result.success) {
            onOpenChange(false)
            router.refresh()
        } else {
            alert(result.error)
        }

        setEnding(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 gap-0 bg-slate-50 dark:bg-slate-950 overflow-hidden" dir="rtl">
                <div className="w-full h-full overflow-y-auto flex flex-col">
                    <div className="w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-6 h-full">
                        <PremiumPageHeader
                            title={`جلسة وصول عن بعد - ${deviceName}`}
                            description="يتم الاتصال بالجهاز عبر DWService. يمكنك التحكم في سطح المكتب مباشرة."
                            icon={Monitor}
                            rightContent={
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        إخفاء النافذة
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="lg"
                                        onClick={handleEndSession}
                                        disabled={ending}
                                        className="gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        {ending ? 'جاري الإنهاء...' : 'إنهاء الجلسة'}
                                    </Button>
                                </div>
                            }
                        />

                        <div className="flex-1 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-black/5 dark:bg-black/20 overflow-hidden shadow-2xl relative flex flex-col">
                            {/* IFrame للجلسة */}
                            <iframe
                                src={sessionUrl}
                                className="flex-1 w-full h-full border-0 bg-white"
                                title={`Remote session for ${deviceName}`}
                                allow="clipboard-read; clipboard-write; fullscreen"
                                allowFullScreen
                            />

                            {/* معلومات الجلسة */}
                            <div className="bg-white dark:bg-slate-900 border-t p-3 flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                                        متصل
                                    </Badge>
                                    <span>معرف الجلسة: <code className="bg-muted px-2 py-0.5 rounded font-mono select-all">{sessionId}</code></span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1"><span className="text-green-500">🔒</span> اتصال آمن (TLS 1.3)</span>
                                    <span className="flex items-center gap-1">⚡ نقل مباشر</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
