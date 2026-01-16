'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Users, MapPin, Package, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const quickActions = [
    {
        title: 'إضافة أصل',
        icon: Plus,
        href: '/assets/new',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        title: 'طلب جديد',
        icon: FileText,
        href: '/requests/new',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        title: 'موظف جديد',
        icon: Users,
        href: '/employees/new',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        title: 'موقع جديد',
        icon: MapPin,
        href: '/locations/new',
        gradient: 'from-orange-500 to-red-500',
    },
    {
        title: 'مخزون',
        icon: Package,
        href: '/inventory',
        gradient: 'from-indigo-500 to-purple-500',
    },
    {
        title: 'تقارير',
        icon: Zap,
        href: '/admin/reports',
        gradient: 'from-yellow-500 to-orange-500',
    },
]

export function QuickActions() {
    return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <CardTitle className="text-xl font-bold">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link href={action.href}>
                                <Button
                                    variant="outline"
                                    className="w-full h-auto flex flex-col items-center gap-2 p-4 hover:shadow-lg transition-all group border-2 hover:border-primary"
                                >
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} group-hover:scale-110 transition-transform`}>
                                        <action.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xs font-semibold text-center">{action.title}</span>
                                </Button>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
