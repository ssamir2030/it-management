'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Plus, ArrowRight, Tag, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { createReminder } from "@/app/actions/reminders"
import { toast } from "sonner"
import { ar } from "date-fns/locale"

const formSchema = z.object({
    title: z.string().min(2, "العنوان مطلوب"),
    description: z.string().optional(),
    type: z.enum(["WARRANTY_EXPIRY", "MAINTENANCE_DUE", "CONTRACT_RENEWAL", "LICENSE_RENEWAL", "CUSTOM"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    dueDate: z.date({
        required_error: "تاريخ الاستحقاق مطلوب",
    }),
})

import { useSidebar } from "@/hooks/use-sidebar"

export function NewReminderDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const { isOpen: isSidebarOpen } = useSidebar()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            type: "CUSTOM",
            priority: "MEDIUM",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setLoading(true)
            const result = await createReminder(values)

            if (result.success) {
                toast.success("تم إنشاء التذكير بنجاح")
                setOpen(false)
                form.reset()
            } else {
                toast.error(result.error || "فشل إنشاء التذكير")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen} modal={false}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    تذكير جديد
                </Button>
            </DialogTrigger>
            <DialogContent
                className={cn(
                    "fixed inset-0 z-[5] h-full max-w-none p-0 border-0 rounded-none sm:rounded-none translate-x-0 translate-y-0",
                    "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950",
                    "data-[state=open]:!zoom-in-100 data-[state=open]:!slide-in-from-left-0 data-[state=open]:!slide-in-from-top-0 data-[state=open]:!fade-in-0 data-[state=open]:duration-300",
                    "transition-all duration-300 ease-in-out",
                    isSidebarOpen ? "lg:pr-[280px]" : "lg:pr-[80px]" // Use Padding to allow background to move under sidebar
                )}
            >
                <div className="w-full h-full overflow-y-auto">
                    <div className="container mx-auto px-4 pt-24 pb-8">
                        <div className="w-full py-6 space-y-6 px-6">

                            <div className="flex-none">
                                <DialogHeader className="hidden">
                                    <DialogTitle>إضافة تذكير جديد</DialogTitle>
                                </DialogHeader>
                            </div>

                            <PremiumPageHeader
                                title="إضافة تذكير جديد"
                                description="أضف تفاصيل التذكير ليتم تنبيهك في الوقت المحدد"
                                icon={CalendarIcon}
                                rightContent={
                                    <Button variant="ghost" size="lg" onClick={() => setOpen(false)} className="text-white hover:bg-white/20 gap-2">
                                        <ArrowRight className="h-4 w-4" />
                                        إلغاء والعودة
                                    </Button>
                                }
                            />

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-slide-up stagger-1">
                                    <div className="grid gap-6 lg:grid-cols-2">
                                        {/* Right Card: Basic Info */}
                                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                                            <CardHeader className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-primary/10 p-2">
                                                        <Tag className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <CardTitle className="text-xl font-bold">بيانات التذكير</CardTitle>
                                                        <CardDescription className="text-base">المعلومات الأساسية للتذكير</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-5">
                                                <FormField
                                                    control={form.control}
                                                    name="title"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">العنوان</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="عنوان التذكير" className="h-12 text-base bg-slate-950/50 border-slate-800" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="type"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">النوع</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 text-base bg-slate-950/50 border-slate-800">
                                                                            <SelectValue placeholder="اختر النوع" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="CUSTOM">تذكير مخصص</SelectItem>
                                                                        <SelectItem value="WARRANTY_EXPIRY">انتهاء ضمان</SelectItem>
                                                                        <SelectItem value="MAINTENANCE_DUE">صيانة دورية</SelectItem>
                                                                        <SelectItem value="CONTRACT_RENEWAL">تجديد عقد</SelectItem>
                                                                        <SelectItem value="LICENSE_RENEWAL">تجديد ترخيص</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="priority"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base font-semibold">الأولوية</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger className="h-12 text-base bg-slate-950/50 border-slate-800">
                                                                            <SelectValue placeholder="اختر الأولوية" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="LOW">منخفضة</SelectItem>
                                                                        <SelectItem value="MEDIUM">متوسطة</SelectItem>
                                                                        <SelectItem value="HIGH">عالية</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Left Card: Timing & Details */}
                                        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                                            <CardHeader className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-primary/10 p-2">
                                                        <Clock className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <CardTitle className="text-xl font-bold">التوقيت والتفاصيل</CardTitle>
                                                        <CardDescription className="text-base">تحديد الموعد والوصف</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-5">
                                                <FormField
                                                    control={form.control}
                                                    name="dueDate"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel className="text-base font-semibold mb-1.5">تاريخ الاستحقاق</FormLabel>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant={"outline"}
                                                                            className={cn(
                                                                                "w-full h-12 pl-3 text-left font-normal bg-slate-950/50 border-slate-800",
                                                                                !field.value && "text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            {field.value ? (
                                                                                format(field.value, "PPP", { locale: ar })
                                                                            ) : (
                                                                                <span>اختر تاريخ</span>
                                                                            )}
                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0 z-[200]" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value}
                                                                        onSelect={field.onChange}
                                                                        disabled={(date) =>
                                                                            date < new Date(new Date().setHours(0, 0, 0, 0))
                                                                        }
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="description"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-base font-semibold">الوصف</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="تفاصيل إضافية عن التذكير..."
                                                                    className="resize-none min-h-[120px] bg-slate-950/50 border-slate-800"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="flex items-center justify-end pt-6">
                                        <Button type="submit" disabled={loading} size="lg" className="min-w-[200px] h-12 text-lg">
                                            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                            حفظ التذكير
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
