'use client'

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trash2, ShieldAlert } from "lucide-react"
import { restoreUser, permanentlyDeleteUser } from "@/app/actions/users"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface DeletedUser {
    id: string
    name: string | null
    email: string | null
    role: string
    image: string | null
    deletedAt: Date | null
    deletedBy: string | null
}

interface DeletedUsersTableProps {
    users: DeletedUser[]
}

export function DeletedUsersTable({ users }: DeletedUsersTableProps) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleRestore = async (userId: string) => {
        setLoading(userId)
        try {
            const result = await restoreUser(userId)
            if (result.success) {
                toast.success("تم استعادة المستخدم بنجاح")
                router.refresh()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الاستعادة")
        } finally {
            setLoading(null)
        }
    }

    const handlePermanentDelete = async (userId: string) => {
        setLoading(userId)
        try {
            const result = await permanentlyDeleteUser(userId)
            if (result.success) {
                toast.success("تم حذف المستخدم نهائياً")
                router.refresh()
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الحذف")
        } finally {
            setLoading(null)
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">تاريخ الحذف</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            لا يوجد مستخدمين محذوفين
                        </TableCell>
                    </TableRow>
                ) : (
                    users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.image || ""} />
                                        <AvatarFallback>{user.name?.[0] || "?"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline">{user.role}</Badge>
                            </TableCell>
                            <TableCell>
                                <div className="text-sm">
                                    {user.deletedAt && new Date(user.deletedAt).toLocaleDateString('ar-EG')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    بواسطة: {user.deletedBy || 'غير معروف'}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                        onClick={() => handleRestore(user.id)}
                                        disabled={loading === user.id}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        استعادة
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                disabled={loading === user.id}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                حذف نهائي
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                                                    <ShieldAlert className="h-5 w-5" />
                                                    تحذير: حذف نهائي
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    هل أنت متأكد من رغبتك في حذف هذا المستخدم نهائياً؟
                                                    <br />
                                                    <span className="font-bold text-red-500 block mt-2">
                                                        لا يمكن التراجع عن هذا الإجراء وسيتم فقدان جميع بيانات المستخدم.
                                                    </span>
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handlePermanentDelete(user.id)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    حذف نهائي
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}
