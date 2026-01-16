'use client'

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useDroppable } from "@dnd-kit/core"
import { TicketCard } from "./ticket-card"
import { Badge } from "@/components/ui/badge"

interface BoardColumnProps {
    id: string
    title: string
    requests: any[]
    color?: string
}

export function BoardColumn({ id, title, requests, color = "slate" }: BoardColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: {
            type: "Column",
            columnId: id,
        },
    })

    const colorStyles = {
        yellow: "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500",
        blue: "bg-blue-100 dark:bg-blue-900/20 border-blue-500",
        green: "bg-green-100 dark:bg-green-900/20 border-green-500",
        red: "bg-red-100 dark:bg-red-900/20 border-red-500",
        slate: "bg-slate-100 dark:bg-slate-800 border-slate-500"
    }[color] || "bg-slate-100 dark:bg-slate-800 border-slate-500"

    return (
        <div className="flex flex-col h-full min-w-[280px] w-[300px]">
            {/* Header */}
            <div className={`p-3 rounded-t-lg flex items-center justify-between border-b-2 ${colorStyles}`}>
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">{title}</h3>
                <Badge variant="secondary" className="bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 text-xs shadow-sm">
                    {requests.length}
                </Badge>
            </div>

            {/* Content Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-2 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-lg border border-t-0 border-slate-200 dark:border-slate-800 min-h-[500px] transition-colors ${isOver ? "bg-slate-100 dark:bg-slate-800 ring-2 ring-blue-400 ring-inset" : ""
                    }`}
            >
                <SortableContext items={requests.map(r => r.id)} strategy={verticalListSortingStrategy}>
                    {requests.map((req) => (
                        <TicketCard key={req.id} request={req} />
                    ))}
                </SortableContext>

                {requests.length === 0 && (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-xs opacity-50 border-2 border-dashed border-slate-200 rounded-lg m-2">
                        لا توجد تذاكر
                    </div>
                )}
            </div>
        </div>
    )
}
