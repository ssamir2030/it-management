'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Megaphone, Trash2, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { getAllAnnouncements, toggleAnnouncementStatus, deleteAnnouncement } from '@/app/actions/announcements'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import Link from 'next/link'

import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<any[]>([])

    useEffect(() => {
        loadAnnouncements()
    }, [])

    async function loadAnnouncements() {
        const res = await getAllAnnouncements()
        if (res.success) {
            setAnnouncements(res.data || [])
        }
    }

    async function handleToggleStatus(id: string, currentStatus: boolean) {
        const res = await toggleAnnouncementStatus(id, !currentStatus)
        if (res.success) {
            toast.success('تم تحديث الحالة')
            loadAnnouncements()
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('هل أنت متأكد من الحذف؟')) return
        const res = await deleteAnnouncement(id)
        if (res.success) {
            toast.success('تم الحذف بنجاح')
            loadAnnouncements()
        }
    }

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'INFO': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">معلومات</Badge>
            case 'WARNING': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">تنبيه</Badge>
            case 'MAINTENANCE': return <Badge variant="secondary" className="bg-purple-100 text-purple-800">صيانة</Badge>
            case 'CRITICAL': return <Badge variant="secondary" className="bg-red-100 text-red-800">هام جداً</Badge>
            default: return <Badge variant="outline">{type}</Badge>
        }
    }

    return (
        <div className="space-y-6 pb-20" dir="rtl">
            <PremiumPageHeader
                title="إدارة الإعلانات والتنبيهات"
                description="نشر تنبيهات للموظفين في البوابة"
                icon={Megaphone}
                rightContent={
                    <Link href="/admin/announcements/new">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            إعلان جديد
                        </Button>
                    </Link>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>الإعلانات الحالية</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>العنوان</TableHead>
                                <TableHead>النوع</TableHead>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>إجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {announcements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        لا توجد إعلانات حالياً
                                    </TableCell>
                                </TableRow>
                            ) : (
                                announcements.map((ann) => (
                                    <TableRow key={ann.id}>
                                        <TableCell>
                                            <div className="font-medium">{ann.title}</div>
                                            <div className="text-sm text-muted-foreground truncate max-w-[300px]">{ann.content}</div>
                                        </TableCell>
                                        <TableCell>{getTypeBadge(ann.type)}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {format(new Date(ann.startDate), 'dd MMM yyyy', { locale: ar })}
                                            </div>
                                            {ann.endDate && (
                                                <div className="text-xs text-muted-foreground">
                                                    إلى: {format(new Date(ann.endDate), 'dd MMM yyyy', { locale: ar })}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={ann.isActive}
                                                onCheckedChange={() => handleToggleStatus(ann.id, ann.isActive)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Link href={`/admin/announcements/${ann.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="hover:bg-blue-50 text-blue-600">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(ann.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
