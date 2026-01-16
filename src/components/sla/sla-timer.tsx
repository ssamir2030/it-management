'use client'

import { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SLATimerProps {
    breachTime: Date | string
    status: string
    completedAt?: Date | string | null
    className?: string
}

export function SLATimer({ breachTime, status, completedAt, className }: SLATimerProps) {
    const [timeLeft, setTimeLeft] = useState<string>('')
    const [isBreached, setIsBreached] = useState(false)

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date()
            const breach = new Date(breachTime)
            const completed = completedAt ? new Date(completedAt) : null

            // If ticket is completed
            if (status === 'COMPLETED' || status === 'REJECTED' || status === 'CANCELLED') {
                if (completed) {
                    if (completed > breach) {
                        setIsBreached(true)
                        setTimeLeft(`تم التجاوز بمقدار ${formatDuration(completed.getTime() - breach.getTime())}`)
                    } else {
                        setIsBreached(false)
                        setTimeLeft(`تم الحل خلال ${formatDuration(breach.getTime() - completed.getTime())} قبل الموعد`)
                    }
                } else {
                    setIsBreached(false)
                    setTimeLeft('مغلق')
                }
                return
            }

            // If ticket is active
            const diff = breach.getTime() - now.getTime()

            if (diff < 0) {
                setIsBreached(true)
                setTimeLeft(`متأخر منذ ${formatDuration(Math.abs(diff))}`)
            } else {
                setIsBreached(false)
                setTimeLeft(formatDuration(diff))
            }
        }

        calculateTime()
        const timer = setInterval(calculateTime, 60000) // Update every minute

        return () => clearInterval(timer)
    }, [breachTime, status, completedAt])

    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60))
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

        if (hours > 24) {
            const days = Math.floor(hours / 24)
            return `${days} يوم و ${hours % 24} ساعة`
        }

        return `${hours} ساعة و ${minutes} دقيقة`
    }

    if (status === 'CANCELLED') return null

    return (
        <div className={cn("flex items-center gap-2 font-medium text-sm", className)}>
            {status === 'COMPLETED' ? (
                <Badge variant={isBreached ? "destructive" : "default"} className={cn("gap-1", isBreached ? "bg-red-100 text-red-700 hover:bg-red-100" : "bg-green-100 text-green-700 hover:bg-green-100")}>
                    {isBreached ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    {isBreached ? "تم تجاوز SLA" : "ضمن SLA"}
                </Badge>
            ) : (
                <Badge variant={isBreached ? "destructive" : "outline"} className={cn("gap-1 transition-colors",
                    isBreached ? "animate-pulse" : "bg-blue-50 text-blue-700 border-blue-200"
                )}>
                    {isBreached ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {isBreached ? "متأخر: " : "المتبقي: "}
                    <span dir="ltr">{timeLeft}</span>
                </Badge>
            )}
        </div>
    )
}
