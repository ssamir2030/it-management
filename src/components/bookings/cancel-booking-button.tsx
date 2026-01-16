'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2 } from 'lucide-react'
import { cancelRoomBooking } from '@/app/actions/room-bookings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface CancelBookingButtonProps {
    bookingId: string
}

export function CancelBookingButton({ bookingId }: CancelBookingButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleCancel() {
        setLoading(true)

        const result = await cancelRoomBooking(bookingId)

        if (result.success) {
            toast.success('تم إلغاء الحجز بنجاح')
            router.refresh()
        } else {
            toast.error(result.error || 'فشل في إلغاء الحجز')
        }

        setLoading(false)
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري الإلغاء...
                        </>
                    ) : (
                        <>
                            <XCircle className="ml-2 h-4 w-4" />
                            إلغاء الحجز
                        </>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد من إلغاء الحجز؟</AlertDialogTitle>
                    <AlertDialogDescription>
                        لن تتمكن من التراجع عن هذا الإجراء. سيتم إلغاء الحجز نهائياً.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>العودة</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        نعم، إلغاء الحجز
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
