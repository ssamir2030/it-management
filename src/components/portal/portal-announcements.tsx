'use client'

import { useEffect, useState } from 'react'
import { getActiveAnnouncements } from '@/app/actions/announcements'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, AlertTriangle, ShieldAlert, Hammer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PortalAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [hiddenIds, setHiddenIds] = useState<string[]>([])

    useEffect(() => {
        // Load hidden announcements from session storage
        const hidden = sessionStorage.getItem('hiddenAnnouncements')
        if (hidden) setHiddenIds(JSON.parse(hidden))

        async function load() {
            const res = await getActiveAnnouncements()
            if (res.success) {
                setAnnouncements(res.data || [])
            }
        }
        load()
    }, [])

    function dismiss(id: string) {
        const newHidden = [...hiddenIds, id]
        setHiddenIds(newHidden)
        sessionStorage.setItem('hiddenAnnouncements', JSON.stringify(newHidden))
    }

    const visibleAnnouncements = announcements.filter(a => !hiddenIds.includes(a.id))

    if (visibleAnnouncements.length === 0) return null

    const getStyles = (type: string) => {
        switch (type) {
            case 'WARNING': return { border: 'border-l-4 border-l-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: AlertTriangle, color: 'text-yellow-800 dark:text-yellow-200', iconColor: 'text-yellow-600' }
            case 'CRITICAL': return { border: 'border-l-4 border-l-red-600', bg: 'bg-red-50 dark:bg-red-900/20', icon: ShieldAlert, color: 'text-red-800 dark:text-red-200', iconColor: 'text-red-600' }
            case 'MAINTENANCE': return { border: 'border-l-4 border-l-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: Hammer, color: 'text-purple-800 dark:text-purple-200', iconColor: 'text-purple-600' }
            default: return { border: 'border-l-4 border-l-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Info, color: 'text-blue-800 dark:text-blue-200', iconColor: 'text-blue-600' }
        }
    }

    return (
        <div className="container mx-auto px-4 mt-6 space-y-4">
            {visibleAnnouncements.map((ann) => {
                const style = getStyles(ann.type)
                const Icon = style.icon

                return (
                    <div
                        key={ann.id}
                        className={`rounded-lg p-4 shadow-sm flex items-start gap-4 relative animate-in slide-in-from-top-2 ${style.bg} ${style.border}`}
                    >
                        <Icon className={`h-5 w-5 mt-0.5 ${style.iconColor}`} />
                        <div className="flex-1">
                            <h4 className={`font-bold ${style.color}`}>{ann.title}</h4>
                            <p className={`text-sm mt-1 opacity-90 ${style.color}`}>{ann.content}</p>
                        </div>
                        <button
                            onClick={() => dismiss(ann.id)}
                            className={`absolute top-4 left-4 p-1 rounded-full hover:bg-black/5 transition-colors ${style.iconColor}`}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
