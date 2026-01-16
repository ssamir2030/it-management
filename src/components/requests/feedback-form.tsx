'use client'

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface FeedbackFormProps {
    requestId: string
    onSubmit: (rating: number, feedback: string) => Promise<{ success: boolean; error?: string }>
}

export function FeedbackForm({ requestId, onSubmit }: FeedbackFormProps) {
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [feedback, setFeedback] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (rating === 0) {
            toast.error("الرجاء اختيار تقييم")
            return
        }

        setLoading(true)
        try {
            const result = await onSubmit(rating, feedback)

            if (result.success) {
                toast.success("شكراً لتقييمك! رأيك يساعدنا على التحسين")
                setSubmitted(true)
            } else {
                toast.error(result.error || "فشل إرسال التقييم")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <Card className="border-green-200 bg-green-50">
                <CardHeader>
                    <CardTitle className="text-green-800">تم إرسال تقييمك بنجاح</CardTitle>
                    <CardDescription>شكراً لمساعدتنا في تحسين خدماتنا</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
                <CardTitle className="text-amber-900">كيف كانت تجربتك مع الخدمة؟</CardTitle>
                <CardDescription>نود سماع رأيك لتحسين جودة خدماتنا</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-base">التقييم *</Label>
                        <div className="flex gap-2 justify-center py-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`h-10 w-10 transition-colors ${star <= (hoveredRating || rating)
                                                ? 'fill-amber-400 text-amber-400'
                                                : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="text-center">
                            <span className="text-sm text-muted-foreground">
                                {rating === 0 && "اختر تقييمك"}
                                {rating === 1 && "سيء جداً 😞"}
                                {rating === 2 && "سيء 😕"}
                                {rating === 3 && "مقبول 😐"}
                                {rating === 4 && "جيد 😊"}
                                {rating === 5 && "ممتاز 🌟"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="feedback">ملاحظات إضافية (اختياري)</Label>
                        <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="شاركنا رأيك أو أي ملاحظات تود إضافتها..."
                            className="min-h-[120px] bg-white"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || rating === 0}
                        className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                        {loading ? "جاري الإرسال..." : "إرسال التقييم"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
