'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ChevronDown, Plus, Archive, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createOperationalPlan, closePlanYear } from "@/app/actions/operational-plan"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PlanYear {
    id: string
    year: number
    status: string
}

interface PlanYearSelectorProps {
    currentYear: number
    allPlans: PlanYear[]
}

export function PlanYearSelector({ currentYear, allPlans }: PlanYearSelectorProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showCloseDialog, setShowCloseDialog] = useState(false)

    const currentPlan = allPlans.find(p => p.year === currentYear)
    const isClosed = currentPlan?.status === 'CLOSED'

    const handleYearChange = (year: number) => {
        router.push(`/admin/operational-plan?year=${year}`)
    }

    const handleCreateNextYear = async () => {
        try {
            setLoading(true)
            const nextYear = currentYear + 1 // Or find max year + 1
            // Actually, simpler to just always suggest next year relative to *current view* or *max existing*?
            // Let's simple ask user or just do next valid?
            // For now, let's auto-create the next year relative to the max year in the system to avoid gaps?
            // Or just next year from NOW?
            // Let's default to (Max Year in DB) + 1.
            const maxYear = Math.max(...allPlans.map(p => p.year), new Date().getFullYear())
            const newYear = maxYear + 1

            const result = await createOperationalPlan(newYear, `الخطة التشغيلية ${newYear}`)
            if (result.success) {
                toast.success(`تم إنشاء خطة عام ${newYear} بنجاح`)
                router.push(`/admin/operational-plan?year=${newYear}`)
            } else {
                toast.error(result.error)
            }
        } catch (err) {
            toast.error("حدث خطأ أثناء إنشاء الخطة")
        } finally {
            setLoading(false)
        }
    }

    const handleClosePlan = async () => {
        if (!currentPlan) return
        try {
            setLoading(true)
            const result = await closePlanYear(currentPlan.id)
            if (result.success) {
                toast.success(`تم إغلاق خطة عام ${currentYear} بنجاح`)
                router.refresh()
            } else {
                toast.error(result.error)
            }
        } catch (err) {
            toast.error("حدث خطأ أثناء إغلاق الخطة")
        } finally {
            setLoading(false)
            setShowCloseDialog(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 min-w-[140px] justify-between bg-white dark:bg-slate-950">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{currentYear}</span>
                                {isClosed && <span className="text-xs text-red-500 font-medium">(مغلق)</span>}
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuLabel>السنة المالية</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {allPlans.map((plan) => (
                            <DropdownMenuItem
                                key={plan.id}
                                onClick={() => handleYearChange(plan.year)}
                                className="justify-between"
                            >
                                <span>{plan.year}</span>
                                {plan.year === currentYear && <Check className="h-4 w-4 text-primary" />}
                                {plan.status === 'CLOSED' && plan.year !== currentYear && <span className="text-xs text-muted-foreground">(مغلق)</span>}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleCreateNextYear} disabled={loading}>
                            <Plus className="h-4 w-4 ml-2" />
                            <span>إنشاء سنة جديدة</span>
                        </DropdownMenuItem>
                        {!isClosed && currentPlan && (
                            <DropdownMenuItem
                                onClick={() => setShowCloseDialog(true)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                                <Archive className="h-4 w-4 ml-2" />
                                <span>إغلاق السنة الحالية</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>إغلاق السنة المالية {currentYear}؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            لا يمكن التراجع عن هذا الإجراء. سيتم أرشفة جميع المشاريع والأنشطة ولن تتمكن من تعديلها بعد ذلك.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleClosePlan()
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                            تأكيد الإغلاق
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
