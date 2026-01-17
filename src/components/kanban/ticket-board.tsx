'use client'

import { useState, useMemo } from "react"
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable"
import { BoardColumn } from "./board-column"
import { TicketCard } from "./ticket-card"
import { updateRequestStatus } from "@/app/actions/requests"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface TicketBoardProps {
    requests: any[]
}

const COLUMNS = [
    { id: "PENDING", title: "قيد الانتظار", color: "yellow" },
    { id: "IN_PROGRESS", title: "جار التنفيذ", color: "blue" },
    { id: "COMPLETED", title: "مكتمل", color: "green" },
    { id: "REJECTED", title: "مرفوض", color: "red" }
]

export function TicketBoard({ requests: initialRequests }: TicketBoardProps) {
    const router = useRouter()
    const [requests, setRequests] = useState(initialRequests)
    const [activeId, setActiveId] = useState<string | null>(null)

    // Derived state for columns
    const columns = useMemo(() => {
        const cols: Record<string, any[]> = {
            PENDING: [],
            IN_PROGRESS: [],
            COMPLETED: [],
            REJECTED: [],
        }

        requests.forEach(req => {
            if (cols[req.status]) {
                cols[req.status].push(req)
            } else {
                // Return to pending if status is unknown
                cols['PENDING'].push(req)
            }
        })
        return cols
    }, [requests])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function onDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string)
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event
        if (!over) return

        const activeId = active.id
        const overId = over.id

        if (activeId === overId) return

        // Check if dropping over a column
        const isActiveTask = active.data.current?.type === "Ticket"
        const isOverColumn = over.data.current?.type === "Column"

        // Handle moving between columns
        if (isActiveTask && isOverColumn) {
            // Logic handled in onDragEnd predominantly for status change
        }
    }

    async function onDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        const activeTask = requests.find(r => r.id === activeId)
        if (!activeTask) return

        let newStatus = activeTask.status

        // Determine new status
        if (COLUMNS.find(c => c.id === overId)) {
            // Dropped directly on a column
            newStatus = overId
        } else {
            // Dropped on another task
            const overTask = requests.find(r => r.id === overId)
            if (overTask) {
                newStatus = overTask.status
            }
        }

        if (newStatus !== activeTask.status) {
            // Optimistic Update
            setRequests(prev => prev.map(r =>
                r.id === activeId ? { ...r, status: newStatus } : r
            ))

            // Server Action
            toast.promise(
                (async () => {
                    const result = await updateRequestStatus(activeId, newStatus, "مسؤول", "تم تحديث الحالة عبر لوحة المهام")
                    if (!result.success) {
                        throw new Error(result.error)
                    }
                    return result
                })(),
                {
                    loading: 'جاري تحديث الحالة...',
                    success: () => {
                        router.refresh()
                        return 'تم تحديث الحالة بنجاح'
                    },
                    error: (err: any) => {
                        console.error("FULL ERROR OBJECT:", err);
                        // Revert on error
                        setRequests(initialRequests)
                        return `خطأ: ${err.message || 'فشل غير معروف'}`
                    }
                }
            )
        }
    }

    const activeTask = activeId ? requests.find(r => r.id === activeId) : null

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 min-h-[calc(100vh-200px)]">
                {COLUMNS.map(col => (
                    <BoardColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        requests={columns[col.id] || []}
                        color={col.color}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? <TicketCard request={activeTask} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    )
}
