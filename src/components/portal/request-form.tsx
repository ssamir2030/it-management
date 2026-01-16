"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createEmployeeRequest } from "@/app/actions/employee-portal"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send } from "lucide-react"

interface RequestFormProps {
    type: string
    title: string
    description: string
    icon: React.ReactNode
}

export function RequestForm({ type, title, description, icon }: RequestFormProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [details, setDetails] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    async function handleSubmit() {
        if (!details.trim()) return

        setIsLoading(true)
        const result = await createEmployeeRequest(type, details)
        setIsLoading(false)

        if (result.success) {
            toast({
                title: "تم إرسال الطلب بنجاح",
                description: "سيتم مراجعة طلبك من قبل الفريق المختص",
            })
            setIsOpen(false)
            setDetails("")
        } else {
            toast({
                title: "فشل الإرسال",
                description: result.error,
                variant: "destructive",
            })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md group">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-muted p-3 rounded-full mb-2 group-hover:bg-primary/10 transition-colors">
                            {icon}
                        </div>
                        <CardTitle className="text-lg">{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center pb-6">
                        <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                            تقديم طلب
                        </Button>
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="flex items-center gap-2">
                        {icon}
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        يرجى توضيح تفاصيل الطلب ليتمكن الفريق من مساعدتك بشكل أفضل.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="details" className="text-right block">التفاصيل</Label>
                        <Textarea
                            id="details"
                            placeholder="اكتب تفاصيل طلبك هنا..."
                            className="min-h-[100px]"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:justify-start">
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading || !details.trim()} className="gap-2">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        إرسال الطلب
                    </Button>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        إلغاء
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
