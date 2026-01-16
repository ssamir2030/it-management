'use client'

import { useEffect, useState } from 'react'
import { getActiveAnnouncements } from "@/app/actions/announcements"
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Info, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface Announcement {
    id: string
    title: string
    content: string
    type: 'INFO' | 'WARNING' | 'DANGER' | 'SUCCESS'
}

export function AnnouncementBanner() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const result = await getActiveAnnouncements()
            if (result.success && result.data) {
                setAnnouncements(result.data as any)
            }
        }
        fetchAnnouncements()
    }, [])

    const visibleAnnouncements = announcements.filter(a => !hiddenIds.has(a.id))

    if (visibleAnnouncements.length === 0) return null

    const getIcon = (type: string) => {
        switch (type) {
            case 'DANGER': return <AlertCircle className="h-4 w-4" />
            case 'WARNING': return <AlertTriangle className="h-4 w-4" />
            case 'SUCCESS': return <CheckCircle className="h-4 w-4" />
            default: return <Info className="h-4 w-4" />
        }
    }

    const getVariantStyles = (type: string) => {
        switch (type) {
            case 'DANGER': return "border-red-500/50 text-red-900 dark:text-red-200 bg-red-50 dark:bg-red-900/10 [&>svg]:text-red-600"
            case 'WARNING': return "border-amber-500/50 text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/10 [&>svg]:text-amber-600"
            case 'SUCCESS': return "border-green-500/50 text-green-900 dark:text-green-200 bg-green-50 dark:bg-green-900/10 [&>svg]:text-green-600"
            default: return "border-blue-500/50 text-blue-900 dark:text-blue-200 bg-blue-50 dark:bg-blue-900/10 [&>svg]:text-blue-600"
        }
    }

    return (
        <div className="space-y-3 mb-6">
            <AnimatePresence>
                {visibleAnnouncements.map((announcement) => (
                    <motion.div
                        key={announcement.id}
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Alert className={getVariantStyles(announcement.type)}>
                            <div className="flex items-start gap-2">
                                <div className="mt-1 shrink-0">
                                    {getIcon(announcement.type)}
                                </div>
                                <div className="flex-1">
                                    <AlertTitle className="font-bold flex items-center justify-between">
                                        {announcement.title}
                                    </AlertTitle>
                                    <AlertDescription className="mt-1 leading-relaxed opacity-90 text-sm whitespace-pre-wrap">
                                        {announcement.content}
                                    </AlertDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 -mt-1 -ml-2 opacity-50 hover:opacity-100 hover:bg-black/5"
                                    onClick={() => setHiddenIds(prev => new Set(prev).add(announcement.id))}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        </Alert>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
