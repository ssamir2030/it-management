'use client'

import { useState } from 'react'
import { Plus, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import {
    Laptop,
    Users,
    Package,
    Wrench,
    FileText,
    Shield,
    MapPin,
    Building2,
    Printer
} from 'lucide-react'

const QUICK_ACTIONS = [
    { icon: Laptop, label: 'إضافة أصل جديد', href: '/assets/new', color: 'text-blue-600' },
    { icon: Users, label: 'إضافة موظف', href: '/employees/new', color: 'text-green-600' },
    { icon: Package, label: 'إضافة عنصر للمستودع', href: '/inventory/new', color: 'text-purple-600' },
    { icon: Wrench, label: 'جدولة صيانة', href: '/admin/maintenance/new', color: 'text-orange-600' },
    { icon: FileText, label: 'مقال جديد', href: '/admin/knowledge/new', color: 'text-cyan-600' },
    { icon: Shield, label: 'مستخدم نظام جديد', href: '/admin/users/new', color: 'text-red-600' },
    { icon: MapPin, label: 'موقع جديد', href: '/locations/new', color: 'text-emerald-600' },
    { icon: Building2, label: 'إدارة جديدة', href: '/departments/new', color: 'text-indigo-600' },
    { icon: Printer, label: 'مادة استهلاكية', href: '/consumables/new', color: 'text-amber-600' },
]

export function QuickActionsMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="icon"
                >
                    <Zap className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 mb-2">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    إجراءات سريعة
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {QUICK_ACTIONS.map((action, index) => {
                    const Icon = action.icon
                    return (
                        <Link key={index} href={action.href}>
                            <DropdownMenuItem className="cursor-pointer py-3">
                                <Icon className={`h-4 w-4 ml-2 ${action.color}`} />
                                <span>{action.label}</span>
                            </DropdownMenuItem>
                        </Link>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
