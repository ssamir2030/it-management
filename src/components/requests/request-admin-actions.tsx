'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateRequestStatus, assignRequest } from '@/app/actions/requests'
import { getAvailableAssets } from '@/app/actions/assets'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle, PlayCircle, UserPlus, MessageSquare } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface RequestAdminActionsProps {
    requestId: string
    currentStatus: string
    assignedTo?: string | null
    requestType?: string
}

export function RequestAdminActions({ requestId, currentStatus, assignedTo, requestType }: RequestAdminActionsProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [note, setNote] = useState('')
    const [assignee, setAssignee] = useState(assignedTo || '')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [actionType, setActionType] = useState<'REJECT' | 'COMPLETE' | 'UPDATE' | null>(null)
    const [availableAssets, setAvailableAssets] = useState<any[]>([])
    const [selectedAssetId, setSelectedAssetId] = useState<string>('')

    const isHardwareRequest = requestType === 'HARDWARE' || requestType === 'NEW_DEVICE'

    async function fetchAssets() {
        if (isHardwareRequest && actionType === 'COMPLETE') {
            const result = await getAvailableAssets()
            if (result.success) {
                setAvailableAssets(result.data)
            }
        }
    }

    async function handleStatusUpdate(status: string) {
        setLoading(true)
        const result = await updateRequestStatus(
            requestId,
            status,
            "المسؤول",
            note,
            selectedAssetId || undefined
        )

        if (result.success) {
            toast.success('تم تحديث حالة الطلب بنجاح')
            setIsDialogOpen(false)
            setNote('')
            router.refresh()
        } else {
            toast.error('فشل تحديث الحالة')
        }
        setLoading(false)
    }

    async function handleAssign() {
        if (!assignee.trim()) return

        setLoading(true)
        const result = await assignRequest(requestId, assignee)

        if (result.success) {
            toast.success('تم تعيين المسؤول بنجاح')
            router.refresh()
        } else {
            toast.error('فشل تعيين المسؤول')
        }
        setLoading(false)
    }

    const openDialog = (type: 'REJECT' | 'COMPLETE' | 'UPDATE') => {
        setActionType(type)
        setIsDialogOpen(true)
        if (type === 'COMPLETE' && isHardwareRequest) {
            getAvailableAssets().then((res: { success: boolean; data: any[] }) => {
                if (res.success) setAvailableAssets(res.data)
            })
        }
    }

    return (
        <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {currentStatus === 'PENDING' && (
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                            onClick={() => handleStatusUpdate('IN_PROGRESS')}
                            disabled={loading}
                        >
                            <PlayCircle className="h-4 w-4" />
                            بدء التنفيذ
                        </Button>
                    )}

                    {currentStatus === 'IN_PROGRESS' && (
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 gap-2"
                            onClick={() => openDialog('COMPLETE')}
                            disabled={loading}
                        >
                            <CheckCircle className="h-4 w-4" />
                            إكمال الطلب
                        </Button>
                    )}

                    {currentStatus !== 'REJECTED' && currentStatus !== 'COMPLETED' && currentStatus !== 'CANCELLED' && (
                        <Button
                            variant="destructive"
                            className="w-full gap-2"
                            onClick={() => openDialog('REJECT')}
                            disabled={loading}
                        >
                            <XCircle className="h-4 w-4" />
                            رفض الطلب
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => openDialog('UPDATE')}
                        disabled={loading}
                    >
                        <MessageSquare className="h-4 w-4" />
                        إضافة ملاحظة / تحديث
                    </Button>
                </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">تعيين مسؤول</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <Label>اسم الموظف المسؤول</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="اسم الموظف..."
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                            />
                            <Button size="icon" onClick={handleAssign} disabled={loading}>
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'REJECT' && 'رفض الطلب'}
                            {actionType === 'COMPLETE' && 'إكمال الطلب'}
                            {actionType === 'UPDATE' && 'تحديث الطلب'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'REJECT' && 'الرجاء ذكر سبب الرفض (سيظهر للموظف).'}
                            {actionType === 'COMPLETE' && 'يمكنك إضافة ملاحظات ختامية.'}
                            {actionType === 'UPDATE' && 'أضف ملاحظة أو تحديث للـ Timeline.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>الملاحظات</Label>
                            <Textarea
                                placeholder="اكتب هنا..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        {actionType === 'COMPLETE' && isHardwareRequest && (
                            <div className="space-y-2 pt-2 border-t">
                                <Label className="text-blue-600">تعيين جهاز (اختياري)</Label>
                                <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر جهاز لتسليمه..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableAssets.map(asset => (
                                            <SelectItem key={asset.id} value={asset.id}>
                                                {asset.name} ({asset.tag}) - {asset.model || 'Unknown'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    عند اختيار جهاز، سيتم تعيينه للموظف تلقائياً وإضافته لعهدته.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                        <Button
                            className={actionType === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : ''}
                            onClick={() => {
                                if (actionType === 'REJECT') handleStatusUpdate('REJECTED')
                                else if (actionType === 'COMPLETE') handleStatusUpdate('COMPLETED')
                                else if (actionType === 'UPDATE') handleStatusUpdate(currentStatus)
                            }}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            تأكيد
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
