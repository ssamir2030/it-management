"use client"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { ArchiveRestore, Trash2, ShieldAlert, UserX, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getDeletedUsers, restoreUser, permanentlyDeleteUser } from "@/app/actions/users"
import { UserRole, ROLE_LABELS } from "@/lib/rbac"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type DeletedUser = {
    id: string
    name: string | null
    email: string | null
    role: string
    image: string | null
    deletedAt: Date | null
    deletedBy: string | null
}

interface DeletedUsersViewProps {
    canManageUsers: boolean
}

export default function DeletedUsersView({ canManageUsers }: DeletedUsersViewProps) {
    const [users, setUsers] = useState<DeletedUser[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDeletedUsers = async () => {
        setLoading(true)
        const result = await getDeletedUsers()
        if (result.success && result.data) {
            setUsers(result.data)
        } else {
            toast.error("فشل في جلب المستخدمين المحذوفين")
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchDeletedUsers()
    }, [])

    const handleRestore = async (id: string) => {
        toast.promise(restoreUser(id), {
            loading: 'جاري استعادة المستخدم...',
            success: () => {
                fetchDeletedUsers()
                return 'تم استعادة المستخدم بنجاح'
            },
            error: 'حدث خطأ أثناء الاستعادة'
        })
    }

    const handlePermanentDelete = async (id: string) => {
        toast.promise(permanentlyDeleteUser(id), {
            loading: 'جاري الحذف النهائي...',
            success: () => {
                fetchDeletedUsers()
                return 'تم حذف المستخدم نهائياً'
            },
            error: 'حدث خطأ أثناء الحذف'
        })
    }

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                backLink="/admin/settings"
                backText="الإعدادات"
                title="المستخدمين المحذوفين"
                description="إدارة المستخدمين الذين تم حذفهم من النظام، يمكنك استعادتهم أو حذفهم نهائياً"
                icon={ArchiveRestore}
            />

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>الأرشيف</CardTitle>
                            <CardDescription>قائمة بجميع الحسابات المحذوفة مؤقتاً</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchDeletedUsers} disabled={loading}>
                            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
                            تحديث
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {users.length === 0 && !loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <UserX className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>لا يوجد مستخدمين محذوفين في الأرشيف</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">المستخدم</TableHead>
                                    <TableHead className="text-right">الدور</TableHead>
                                    <TableHead className="text-right">تاريخ الحذف</TableHead>
                                    <TableHead className="text-right">حذف بواسطة</TableHead>
                                    <TableHead className="text-center">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.image || undefined} alt={user.name || ''} />
                                                <AvatarFallback>{user.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === UserRole.SUPER_ADMIN ? 'destructive' : 'secondary'}>
                                                {ROLE_LABELS[user.role as UserRole] || user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString('ar-SA') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">{user.deletedBy || 'غير معروف'}</span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-green-500/20 hover:bg-green-500/10 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    onClick={() => handleRestore(user.id)}
                                                    disabled={!canManageUsers}
                                                    title={!canManageUsers ? "ليس لديك صلاحية الاستعادة" : ""}
                                                >
                                                    <ArchiveRestore className="w-4 h-4 ml-1" />
                                                    استعادة
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 border-red-500/20 hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            disabled={!canManageUsers}
                                                            title={!canManageUsers ? "ليس لديك صلاحية الحذف" : ""}
                                                        >
                                                            <Trash2 className="w-4 h-4 ml-1" />
                                                            حذف نهائي
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    {canManageUsers && (
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                                                    <ShieldAlert className="w-5 h-5" />
                                                                    تحذير أمني
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    هل أنت متأكد من حذف المستخدم <b>{user.name}</b> نهائياً؟
                                                                    <br />
                                                                    لا يمكن التراجع عن هذا الإجراء، وسيتم فقدان جميع البيانات المرتبطة بهذا الحساب.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handlePermanentDelete(user.id)}
                                                                    className="bg-destructive hover:bg-destructive/90"
                                                                >
                                                                    حذف نهائي
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    )}
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
