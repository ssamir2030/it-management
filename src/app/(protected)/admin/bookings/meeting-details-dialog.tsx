'use client'

import { useState } from 'react'
import { Video, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { updateBookingMeetingDetails } from '@/app/actions/admin-bookings'
import { toast } from 'sonner'

interface BookingMeetingDetailsDialogProps {
    booking: any
}

export function BookingMeetingDetailsDialog({ booking }: BookingMeetingDetailsDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [url, setUrl] = useState(booking.onlineMeetingUrl || '')
    const [meetingId, setMeetingId] = useState(booking.onlineMeetingId || '')
    const [password, setPassword] = useState(booking.onlineMeetingPassword || '')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const result = await updateBookingMeetingDetails(booking.id, {
            onlineMeetingUrl: url,
            onlineMeetingId: meetingId,
            onlineMeetingPassword: password,
        })

        if (result.success) {
            toast.success('تم تحديث تفاصيل الاجتماع بنجاح')
            setOpen(false)
        } else {
            toast.error('فشل في تحديث التفاصيل')
        }

        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Video className="h-4 w-4" />
                    {booking.onlineMeetingUrl ? 'تعديل الرابط' : 'إضافة رابط'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>تفاصيل الاجتماع الأونلاين</DialogTitle>
                    <DialogDescription>
                        أضف رابط الاجتماع وتفاصيل الدخول للموظف.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="url">رابط الاجتماع</Label>
                        <Input
                            id="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="meetingId">Meeting ID</Label>
                        <Input
                            id="meetingId"
                            value={meetingId}
                            onChange={(e) => setMeetingId(e.target.value)}
                            placeholder="Optional"
                            dir="ltr"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Optional"
                            dir="ltr"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 ml-2" />
                                    حفظ التفاصيل
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
