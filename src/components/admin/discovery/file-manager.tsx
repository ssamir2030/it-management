"use client"

import { useState, useEffect } from "react"
import { listAgentFiles, getCommandResult, setAgentPollingInterval, downloadAgentFile } from "@/app/actions/automation-agents"
import { Folder, File, HardDrive, ChevronRight, Loader2, ArrowUp, RefreshCw, Download, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface FileItem {
    name: string
    path: string
    type: "file" | "folder" | "drive"
    size: string
    modified: string
}

export default function FileManager({ deviceId }: { deviceId: string }) {
    const [currentPath, setCurrentPath] = useState("ROOT")
    const [items, setItems] = useState<FileItem[]>([])
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<string[]>([])
    const [downloading, setDownloading] = useState<string | null>(null)

    const fetchFiles = async (path: string) => {
        setLoading(true)
        setItems([]) // Clear current items while loading

        try {
            // 1. Send Command
            const res = await listAgentFiles(deviceId, path)
            if (!res.success || !res.commandId) {
                console.error("Failed to send LS command", res.error)
                setLoading(false)
                return
            }

            // 2. Poll for Result
            let attempts = 0
            const maxAttempts = 20 // 20 * 500ms = 10 sec timeout

            const pollInterval = setInterval(async () => {
                attempts++
                const resultRes = await getCommandResult(res.commandId!)

                if (resultRes.success && resultRes.status === 'COMPLETED') {
                    clearInterval(pollInterval)
                    try {
                        const fileList = JSON.parse(resultRes.result || '[]')
                        // Sort: Folders first, then Files
                        const sorted = fileList.sort((a: FileItem, b: FileItem) => {
                            if (a.type === b.type) return a.name.localeCompare(b.name)
                            return a.type === 'folder' || a.type === 'drive' ? -1 : 1
                        })
                        setItems(sorted)
                        setCurrentPath(path)
                    } catch (e) {
                        console.error("Failed to parse file list JSON", e)
                    }
                    setLoading(false)
                } else if (resultRes.status === 'FAILED') {
                    clearInterval(pollInterval)
                    console.error("Command failed", resultRes.error)
                    setLoading(false)
                } else if (attempts >= maxAttempts) {
                    clearInterval(pollInterval)
                    console.error("Timeout waiting for file list")
                    setLoading(false)
                }
            }, 500)

        } catch (error) {
            console.error("Error fetching files", error)
            setLoading(false)
        }
    }

    const handleDownload = async (e: React.MouseEvent, item: FileItem) => {
        e.stopPropagation()
        setDownloading(item.path)

        try {
            const res = await downloadAgentFile(deviceId, item.path)
            if (!res.success || !res.commandId) {
                alert("Failed to start download")
                setDownloading(null)
                return
            }

            // Poll for result
            let attempts = 0
            const maxAttempts = 60 // 30 sec for download
            const pollInterval = setInterval(async () => {
                attempts++
                const resultRes = await getCommandResult(res.commandId!)

                if (resultRes.success && resultRes.status === 'COMPLETED') {
                    clearInterval(pollInterval)
                    setDownloading(null)

                    if (resultRes.result) {
                        // Create download link from Base64
                        const link = document.createElement("a")
                        link.href = `data:application/octet-stream;base64,${resultRes.result}`
                        link.download = item.name
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                    }
                } else if (resultRes.status === 'FAILED') {
                    clearInterval(pollInterval)
                    alert(`Download failed: ${resultRes.error}`)
                    setDownloading(null)
                } else if (attempts >= maxAttempts) {
                    clearInterval(pollInterval)
                    alert("Download timed out")
                    setDownloading(null)
                }
            }, 500)

        } catch (error) {
            console.error("Download error", error)
            setDownloading(null)
        }
    }

    // Initial load
    useEffect(() => {
        // Boost polling to 3s when opening file manager to ensure fast response
        setAgentPollingInterval(deviceId, 3)
        fetchFiles("ROOT")

        // Cleanup: Reset polling to 30s when closing component
        return () => {
            setAgentPollingInterval(deviceId, 30) // Optional: Reset to slow polling
        }
    }, [deviceId])

    const handleNavigate = (item: FileItem) => {
        if (item.type === 'folder' || item.type === 'drive') {
            setHistory(prev => [...prev, currentPath])
            fetchFiles(item.path)
        }
    }

    const handleBack = () => {
        if (history.length === 0) return
        const prevPath = history[history.length - 1]
        setHistory(prev => prev.slice(0, -1))
        fetchFiles(prevPath)
    }

    return (
        <div className="flex flex-col h-[500px]">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-2 p-2 border-b bg-muted/30">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    disabled={history.length === 0 || loading}
                    className="h-8 w-8"
                >
                    <ArrowUp className="h-4 w-4" />
                </Button>

                <div className="flex-1 px-2 py-1 bg-background border rounded text-sm font-mono truncate" dir="ltr">
                    {currentPath === "ROOT" ? "This PC" : currentPath}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fetchFiles(currentPath)}
                    disabled={loading}
                    className="h-8 w-8"
                >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </div>

            {/* File List */}
            <ScrollArea className="flex-1 bg-background">
                <div className="p-1">
                    {loading && items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm">Fetching files from remote agent...</p>
                        </div>
                    )}

                    {!loading && items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <p>Empty folder or access denied.</p>
                        </div>
                    )}

                    <div className="space-y-0.5">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleNavigate(item)}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-accent/50 group transition-colors",
                                    (item.type === 'folder' || item.type === 'drive') ? "text-foreground" : "text-muted-foreground"
                                )}
                            >
                                <div className="shrink-0">
                                    {item.type === 'drive' && <HardDrive className="h-5 w-5 text-slate-500" />}
                                    {item.type === 'folder' && <Folder className="h-5 w-5 text-amber-400 fill-amber-400/20" />}
                                    {item.type === 'file' && <File className="h-5 w-5 text-slate-400" />}
                                </div>

                                <div className="flex-1 min-w-0 grid grid-cols-12 gap-4">
                                    <div className="col-span-12 sm:col-span-7 font-medium truncate text-sm" dir="ltr">
                                        {item.name}
                                    </div>
                                    <div className="hidden sm:block col-span-3 text-xs text-muted-foreground text-right">
                                        {item.modified}
                                    </div>
                                    <div className="hidden sm:block col-span-2 text-xs text-muted-foreground text-right font-mono">
                                        {item.size}
                                    </div>
                                </div>

                                {item.type === 'file' && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleDownload(e, item)}
                                        disabled={!!downloading}
                                    >
                                        {downloading === item.path ? (
                                            <Loader className="h-3 w-3 animate-spin text-blue-500" />
                                        ) : (
                                            <Download className="h-3 w-3" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
