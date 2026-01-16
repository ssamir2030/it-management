'use client'

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User } from "lucide-react"

interface TicketCardProps {
    request: any
    isOverlay?: boolean
}

export function TicketCard({ request, isOverlay }: TicketCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: request.id,
        data: {
            type: "Ticket",
            request,
        },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-slate-100 rounded-lg h-[150px] border-2 border-dashed border-slate-300"
            />
        )
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50'
            case 'HIGH': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/50'
            case 'NORMAL': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50'
            case 'LOW': return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800'
            default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800'
        }
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isOverlay ? "shadow-xl rotate-2" : ""
                }`}
        >
            <CardHeader className="p-3 pb-0 space-y-0">
                <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-sm line-clamp-2 leading-tight">
                        {request.subject || "بدون عنوان"}
                    </span>
                    <Badge variant="outline" className={`text-[10px] px-1 h-5 ${getPriorityColor(request.priority)}`}>
                        {request.priority === 'URGENT' ? 'عاجل' :
                            request.priority === 'HIGH' ? 'مهم' :
                                request.priority === 'NORMAL' ? 'عادي' : 'منخفض'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-2 space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2 h-8">
                    {request.details || "لا توجد تفاصيل"}
                </p>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t mt-1">
                    <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate max-w-[80px]">{request.employee.name.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(request.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
