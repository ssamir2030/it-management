"use client"

import { useState, useEffect } from "react"
import { requestAgentScreenshot, getCommandResult, setAgentPollingInterval } from "@/app/actions/automation-agents"
import { Monitor, RefreshCw, Loader2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"

export default function ScreenViewer({ deviceId }: { deviceId: string }) {
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const [autoRefresh, setAutoRefresh] = useState(false)

    const fetchScreenshot = async () => {
        setLoading(true)
        try {
            const res = await requestAgentScreenshot(deviceId)
            if (!res.success || !res.commandId) {
                console.error("Failed to request screenshot", res.error)
                setLoading(false)
                return
            }

            // Poll for result
            let attempts = 0
            const maxAttempts = 20

            const pollInterval = setInterval(async () => {
                attempts++
                const resultRes = await getCommandResult(res.commandId!)

                if (resultRes.success && resultRes.status === 'COMPLETED') {
                    clearInterval(pollInterval)
                    if (resultRes.result) {
                        setImageSrc(`data:image/jpeg;base64,${resultRes.result}`)
                        setLastUpdate(new Date())
                    }
                    setLoading(false)
                } else if (resultRes.status === 'FAILED') {
                    clearInterval(pollInterval)
                    console.error("Screenshot failed", resultRes.error)
                    setLoading(false)
                } else if (attempts >= maxAttempts) {
                    clearInterval(pollInterval)
                    console.error("Timeout waiting for screenshot")
                    setLoading(false)
                }
            }, 1000)

        } catch (error) {
            console.error("Error fetching screenshot", error)
            setLoading(false)
        }
    }

    // Auto Refresh Logic
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (autoRefresh) {
            fetchScreenshot() // Immediate fetch
            interval = setInterval(fetchScreenshot, 5000) // Every 5s
        }
        return () => clearInterval(interval)
    }, [autoRefresh])

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={fetchScreenshot}
                        disabled={loading || autoRefresh}
                        className="gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Capture Screen
                    </Button>

                    <Button
                        variant={autoRefresh ? "destructive" : "outline"}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className="gap-2"
                    >
                        {autoRefresh ? "Stop Live" : "Go Live (5s)"}
                    </Button>
                </div>

                {lastUpdate && (
                    <span className="text-xs text-muted-foreground">
                        Last update: {lastUpdate.toLocaleTimeString()}
                    </span>
                )}
            </div>

            <div className="relative w-full aspect-video bg-black/90 rounded-lg flex items-center justify-center overflow-hidden border shadow-inner">
                {!imageSrc && !loading && (
                    <div className="text-muted-foreground flex flex-col items-center gap-2">
                        <Monitor className="h-12 w-12 opacity-20" />
                        <p>No screenshot captured</p>
                    </div>
                )}

                {loading && !imageSrc && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                )}

                {imageSrc && (
                    <div className="relative group w-full h-full">
                        <img
                            src={imageSrc}
                            alt="Remote Screen"
                            className="w-full h-full object-contain"
                        />

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/50 text-white hover:bg-black/70">
                                        <Maximize2 className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[90vw] h-[90vh] p-0 border-0 bg-transparent flex items-center justify-center">
                                    <img
                                        src={imageSrc}
                                        alt="Remote Screen Full"
                                        className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
