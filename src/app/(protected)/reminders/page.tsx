export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getReminders, getOverdueReminders } from '@/app/actions/reminders'
import { Bell, CheckCircle, Clock, Plus, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ar } from 'date-fns/locale'

const reminderTypeLabels = {
    WARRANTY_EXPIRY: 'انتهاء ضمان',
    MAINTENANCE_DUE: 'صيانة دورية',
    CONTRACT_RENEWAL: 'تجديد عقد',
    LICENSE_RENEWAL: 'تجديد ترخيص',
    CUSTOM: 'تذكير مخصص'
}

const priorityColors = {
    LOW: 'bg-blue-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-red-500'
}

const priorityLabels = {
    LOW: 'منخفضة',
    MEDIUM: 'متوسط ة',
    HIGH: 'عالية'
}

async function RemindersList() {
    const [remindersResult, overdueResult] = await Promise.all([
        getReminders({ completed: false }),
        getOverdueReminders()
    ])

    const reminders = remindersResult.success ? remindersResult.data : []
    const overdue = overdueResult.success ? overdueResult.data : []

    if (!reminders || reminders.length === 0) {
        return (
            <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">لا توجد تذكيرات</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Overdue Section */}
            {overdue && overdue.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
                        <div className="p-2 rounded-xl bg-red-500/10 ring-1 ring-red-500/20">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        متأخرة ({overdue.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {overdue.map((reminder: any) => (
                            <Card key={reminder.id} className="group border-0 shadow-lg bg-black/40 backdrop-blur-xl ring-1 ring-red-500/30 overflow-hidden hover:ring-red-500/50 transition-all duration-300">
                                <div className="absolute top-0 right-0 w-1.5 h-full bg-red-500" />
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="destructive" className="rounded-md">متأخر</Badge>
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {format(new Date(reminder.dueDate), 'dd/MM/yyyy')}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-lg text-white group-hover:text-red-400 transition-colors">
                                                {reminder.title}
                                            </h4>

                                            {reminder.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {reminder.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                                        <Badge variant="outline" className="bg-white/5 border-white/10">
                                            {reminderTypeLabels[reminder.type as keyof typeof reminderTypeLabels]}
                                        </Badge>
                                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 -mr-2">
                                            <CheckCircle className="h-4 w-4 ml-2" />
                                            إنهاء
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Reminders */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white/90">
                    <div className="p-2 rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
                        <Bell className="h-5 w-5 text-indigo-400" />
                    </div>
                    التذكيرات النشطة
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reminders.filter((r: any) => !overdue?.find((o: any) => o.id === r.id)).map((reminder: any) => {
                        const priorityColor = priorityColors[reminder.priority as keyof typeof priorityColors]
                        const borderColor = priorityColor.replace('bg-', 'border-')

                        return (
                            <Card key={reminder.id} className="group border-0 shadow-lg bg-black/20 backdrop-blur-lg ring-1 ring-white/10 hover:bg-black/40 hover:ring-white/20 transition-all duration-300">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className={`h-12 w-12 rounded-2xl ${priorityColor} bg-opacity-10 ring-1 ring-inset ring-white/10 flex items-center justify-center shrink-0`}>
                                            <Bell className={`h-6 w-6 ${priorityColor.replace('bg-', 'text-')}`} />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <Badge variant="outline" className={`text-[10px] h-5 ${priorityColor.replace('bg-', 'text-')} bg-transparent border-current opacity-70`}>
                                                    {priorityLabels[reminder.priority as keyof typeof priorityLabels]}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(reminder.dueDate), {
                                                        addSuffix: true,
                                                        locale: ar
                                                    })}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-base text-white mt-2 mb-1 group-hover:text-indigo-400 transition-colors">
                                                {reminder.title}
                                            </h4>

                                            {reminder.description && (
                                                <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-3">
                                                    {reminder.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="bg-black/40 text-[10px] text-muted-foreground font-normal">
                                                        {reminderTypeLabels[reminder.type as keyof typeof reminderTypeLabels]}
                                                    </Badge>
                                                    {reminder.assignedTo && (
                                                        <Badge variant="secondary" className="bg-black/40 text-[10px] text-muted-foreground font-normal">
                                                            {reminder.assignedTo.name}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-emerald-500/20 hover:text-emerald-400">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { NewReminderDialog } from "@/components/reminders/new-reminder-dialog"

export default async function RemindersPage() {
    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="التذكيرات والمهام"
                description="إدارة التذكيرات والمهام المهمة"
                icon={Bell}
                rightContent={<NewReminderDialog />}
            />

            <Suspense fallback={
                <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-muted-foreground mt-4">جاري التحميل...</p>
                </div>
            }>
                <RemindersList />
            </Suspense>
        </div>
    )
}
