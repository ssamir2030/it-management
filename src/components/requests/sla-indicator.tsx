'use client'

import { AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SLAIndicatorProps {
    expectedCompletionDate: Date | string | null
    status: string
    priority: string
}

export function SLAIndicator({ expectedCompletionDate, status, priority }: SLAIndicatorProps) {
    if (!expectedCompletionDate || status === 'COMPLETED' || status === 'CANCELLED') {
        return null
    }

    const dueDate = new Date(expectedCompletionDate)
    const now = new Date()
    const timeRemaining = dueDate.getTime() - now.getTime()
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))
    const isOverdue = timeRemaining < 0
    const isNearDue = timeRemaining > 0 && hoursRemaining <= 4

    const formatTimeRemaining = () => {
        if (isOverdue) {
            const hoursOverdue = Math.abs(hoursRemaining)
            if (hoursOverdue < 24) {
                return `متأخر ${hoursOverdue} ساعة`
            } else {
                const daysOverdue = Math.floor(hoursOverdue / 24)
                return `متأخر ${daysOverdue} يوم`
            }
        } else if (hoursRemaining < 24) {
            return `${hoursRemaining} ساعة متبقية`
        } else {
            const daysRemaining = Math.floor(hoursRemaining / 24)
            return `${daysRemaining} يوم متبقي`
        }
    }

    const getIndicatorStyles = () => {
        if (isOverdue) {
            return {
                icon: AlertCircle,
                color: 'bg-red-100 text-red-700 border-red-300',
                label: 'متأخر',
                iconColor: 'text-red-600'
            }
        } else if (isNearDue) {
            return {
                icon: Clock,
                color: 'bg-amber-100 text-amber-700 border-amber-300',
                label: 'عاجل',
                iconColor: 'text-amber-600'
            }
        } else {
            return {
                icon: CheckCircle2,
                color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
                label: 'في الوقت',
                iconColor: 'text-emerald-600'
            }
        }
    }

    const indicator = getIndicatorStyles()
    const Icon = indicator.icon

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={`${indicator.color} border`}>
                        <Icon className={`w-3 h-3 ml-1 ${indicator.iconColor}`} />
                        {indicator.label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="text-sm">
                        <p className="font-semibold">{formatTimeRemaining()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            موعد الإنجاز: {dueDate.toLocaleString('ar-EG', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                            })}
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
