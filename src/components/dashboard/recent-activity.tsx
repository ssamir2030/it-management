'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Ticket, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { arSA } from "date-fns/locale"

interface RecentActivityProps {
    activities: {
        assets: any[]
        tickets: any[]
    }
}

export function RecentActivity({ activities }: RecentActivityProps) {
    // Merge and sort activities by date
    const allActivities = [
        ...activities.assets.map(a => ({
            type: 'asset',
            title: 'تم إضافة أصل جديد',
            description: `${a.name} (${a.type})`,
            date: new Date(a.createdAt),
            icon: Monitor,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/20'
        })),
        ...activities.tickets.map(t => ({
            type: 'ticket',
            title: 'تذكرة دعم فني جديدة',
            description: t.title,
            date: new Date(t.createdAt),
            icon: Ticket,
            color: 'text-orange-600',
            bg: 'bg-orange-100 dark:bg-orange-900/20'
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none shadow-md">
            <CardHeader>
                <CardTitle className="text-lg">النشاط الأخير</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {allActivities.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                            لا يوجد نشاطات حديثة
                        </div>
                    ) : (
                        allActivities.map((activity, index) => (
                            <div key={index} className="flex items-center">
                                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${activity.bg} ${activity.color}`}>
                                    <activity.icon className="h-5 w-5" />
                                </div>
                                <div className="mr-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {activity.description}
                                    </p>
                                </div>
                                <div className="mr-auto font-medium text-xs text-muted-foreground">
                                    {formatDistanceToNow(activity.date, { addSuffix: true, locale: arSA })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
