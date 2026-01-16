'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateTicketStatus, assignTicket } from "@/app/actions/support"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

interface Technician {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: string
}

interface AdminTicketControlsProps {
    ticketId: string
    currentStatus: string
    currentPriority: string
    currentAssignedTo: string | null
    technicians: Technician[]
}

export function AdminTicketControls({
    ticketId,
    currentStatus,
    currentPriority,
    currentAssignedTo,
    technicians
}: AdminTicketControlsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(currentStatus)
    const [assignedTo, setAssignedTo] = useState(currentAssignedTo || "unassigned")

    async function handleSave() {
        setLoading(true)
        try {
            // Update Status
            if (status !== currentStatus) {
                const res = await updateTicketStatus(ticketId, status)
                if (!res.success) throw new Error(res.error)
            }

            // Update Assignment
            const newAssignedTo = assignedTo === "unassigned" ? null : assignedTo
            if (newAssignedTo !== currentAssignedTo) {
                const res = await assignTicket(ticketId, newAssignedTo)
                if (!res.success) throw new Error(res.error)
            }

            toast.success("تم تحديث التذكرة بنجاح")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ أثناء التحديث")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">إدارة التذكرة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                    <Label>الحالة</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="OPEN">مفتوحة</SelectItem>
                            <SelectItem value="IN_PROGRESS">جاري العمل</SelectItem>
                            <SelectItem value="RESOLVED">تم الحل</SelectItem>
                            <SelectItem value="CLOSED">مغلقة</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Assignment */}
                <div className="space-y-2">
                    <Label>تعيين إلى</Label>
                    <Select value={assignedTo} onValueChange={setAssignedTo}>
                        <SelectTrigger>
                            <SelectValue placeholder="اختر فني" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">غير مسند</SelectItem>
                            {technicians.map((tech) => (
                                <SelectItem key={tech.id} value={tech.id}>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={tech.image || undefined} />
                                            <AvatarFallback>{tech.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{tech.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    className="w-full gap-2"
                    onClick={handleSave}
                    disabled={loading || (status === currentStatus && (assignedTo === "unassigned" ? null : assignedTo) === currentAssignedTo)}
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    حفظ التغييرات
                </Button>
            </CardContent>
        </Card>
    )
}
