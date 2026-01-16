'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { motion } from 'framer-motion'

interface Activity {
    id: string
    type: 'success' | 'warning' | 'info'
    title: string
    description: string
    time: string
}

interface ActivityFeedProps {
    activities: Activity[]
}

const activityConfig = {
    success: {
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-950',
        borderColor: 'border-green-200 dark:border-green-900',
    },
    warning: {
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-950',
        borderColor: 'border-orange-200 dark:border-orange-900',
    },
    info: {
        icon: Info,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-950',
        borderColor: 'border-blue-200 dark:border-blue-900',
    },
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <CardTitle className="text-xl font-bold">آخر الأنشطة</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity, index) => {
                        const config = activityConfig[activity.type]
                        const Icon = config.icon

                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={`flex gap-3 p-3 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-md transition-shadow`}
                            >
                                <div className={`flex-shrink-0 ${config.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm">{activity.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{activity.time}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
