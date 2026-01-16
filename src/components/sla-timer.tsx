'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface SLATimerProps {
    breachTime: Date | string
    isBreached: boolean
    status: string
    compact?: boolean
}

export function SLATimer({ breachTime, isBreached, status, compact = false }: SLATimerProps) {
    const [timeRemaining, setTimeRemaining] = useState<number>(0)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const calculateTime = () => {
            const now = new Date()
            const breach = new Date(breachTime)
            const diff = breach.getTime() - now.getTime()
            setTimeRemaining(diff)
        }

        calculateTime()
        const interval = setInterval(calculateTime, 1000) // Update every second

        return () => clearInterval(interval)
    }, [breachTime])

    if (!mounted) {
        return <div className="h-6 w-24 bg-muted animate-pulse rounded" />
    }

    // Don't show timer for resolved/closed tickets
    if (status === 'RESOLVED' || status === 'CLOSED') {
        return (
            <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800">
                <CheckCircle className="h-3 w-3" />
                مكتملة
            </Badge>
        )
    }

    // Breached
    if (isBreached || timeRemaining < 0) {
        const overdueDuration = Math.abs(timeRemaining)
        const hours = Math.floor(overdueDuration / (1000 * 60 * 60))
        const minutes = Math.floor((overdueDuration % (1000 * 60 * 60)) / (1000 * 60))

        return (
            <Badge variant="destructive" className="gap-1 animate-pulse">
                <AlertTriangle className="h-3 w-3" />
                {compact ? 'متأخر' : `متأخر ${hours}س ${minutes}د`}
            </Badge>
        )
    }

    // Calculate remaining time
    const totalHours = Math.floor(timeRemaining / (1000 * 60 * 60))
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

    // Determine color based on time remaining
    let colorClass = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800'
    let icon = <CheckCircle className="h-3 w-3" />

    if (totalHours < 1) {
        // Less than 1 hour - critical (red)
        colorClass = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800 animate-pulse'
        icon = <AlertTriangle className="h-3 w-3" />
    } else if (totalHours < 4) {
        // Less than 4 hours - warning (yellow)
        colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800'
        icon = <Clock className="h-3 w-3" />
    }

    if (compact) {
        return (
            <Badge variant="outline" className={cn('gap-1 font-mono', colorClass)}>
                {icon}
                {totalHours}:{minutes.toString().padStart(2, '0')}
            </Badge>
        )
    }

    return (
        <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium', colorClass)}>
            {icon}
            <span className="font-mono">
                {totalHours > 0 && `${totalHours}س `}
                {minutes}د {seconds}ث
            </span>
        </div>
    )
}
