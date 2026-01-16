'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2 } from 'lucide-react'
import { cancelRequest } from '@/app/actions/employee-portal'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CancelRequestButtonProps {
    requestId: string
}

export function CancelRequestButton({ requestId }: CancelRequestButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState('')
    const [open, setOpen] = useState(false)

    async function handleCancel() {
        setLoading(true)

        const result = await cancelRequest(requestId, reason)

        if (result.success) {
            toast.success('تم إلغاء الطلب بنجاح')
            setOpen(false)
            router.refresh()
        } else {
            toast.error(result.error || 'فشل في إلغاء الطلب')
        }

        setLoading(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
                >
                    <XCircle className="h-4 w-4" />
                    إلغاء الطلب
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد من إلغاء الطلب؟</AlertDialogTitle>
                    <AlertDialogDescription>
                        لن يتم تنفيذ هذا الطلب بعد الإلغاء. يمكنك ذكر سبب الإلغاء (اختياري).
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4">
                    <Label htmlFor="reason" className="mb-2 block">سبب الإلغاء (اختياري)</Label>
                    <Textarea
                        id="reason"
                        placeholder="لماذا تريد إلغاء الطلب؟"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="resize-none"
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>تراجع</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleCancel()
                        }}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                جاري الإلغاء...
                            </>
                        ) : (
                            'تأكيد الإلغاء'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
