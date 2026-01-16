"use client"

import { useState } from "react"
import Link from "next/link"
import { UserRole, ROLE_LABELS } from "@/lib/rbac"
import { updateUserRole, deleteUser, resetUserPassword } from "@/app/actions/users"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2, Shield, ShieldAlert, ShieldCheck, Eye, User as UserIcon, Loader2, KeyRound } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
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

interface User {
    id: string
    name: string | null
    email: string | null
    role: string
    image: string | null
    createdAt: Date
}


interface UsersTableProps {
    users: User[]
    currentUserId: string
    currentUserRole: string
}

export function UsersTable({ users, currentUserId, currentUserRole }: UsersTableProps) {
    const [updating, setUpdating] = useState<string | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [resettingPassword, setResettingPassword] = useState<string | null>(null)
    const [newPassword, setNewPassword] = useState("")
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

    // Check if user has permission to manage users
    const canManageUsers = currentUserRole === UserRole.SUPER_ADMIN || currentUserRole === UserRole.IT_MANAGER

    const handleResetPassword = async () => {
        if (!resettingPassword || !newPassword) return

        try {
            const result = await resetUserPassword(resettingPassword, newPassword)
            if (result.success) {
                toast.success("تم تغيير كلمة المرور بنجاح 🔐")
                setIsResetDialogOpen(false)
                setNewPassword("")
                setResettingPassword(null)
            } else {
                toast.error(result.error || "فشل تغيير كلمة المرور")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        }
    }

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        setUpdating(userId)
        try {
            const result = await updateUserRole(userId, newRole)
            if (result.success) {
                toast.success("تم تحديث الصلاحيات بنجاح ✨")
            } else {
                toast.error(result.error || "فشل تحديث الصلاحيات")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setUpdating(null)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        setDeleting(userId)
        try {
            const result = await deleteUser(userId)
            if (result.success) {
                toast.success("تم حذف المستخدم بنجاح 🗑️")
            } else {
                toast.error(result.error || "فشل حذف المستخدم")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setDeleting(null)
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case UserRole.SUPER_ADMIN:
                return (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 px-3 py-1 gap-1 shadow-sm">
                        <ShieldAlert className="h-3 w-3" />
                        {ROLE_LABELS[role as UserRole]}
                    </Badge>
                )
            case UserRole.IT_MANAGER:
                return (
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 px-3 py-1 gap-1 shadow-sm">
                        <ShieldCheck className="h-3 w-3" />
                        {ROLE_LABELS[role as UserRole]}
                    </Badge>
                )
            case UserRole.IT_SUPPORT:
                return (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 px-3 py-1 gap-1 shadow-sm">
                        <Shield className="h-3 w-3" />
                        {ROLE_LABELS[role as UserRole]}
                    </Badge>
                )
            case UserRole.VIEWER:
                return (
                    <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200 px-3 py-1 gap-1 shadow-sm">
                        <Eye className="h-3 w-3" />
                        {ROLE_LABELS[role as UserRole]}
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="gap-1">
                        <UserIcon className="h-3 w-3" />
                        {role}
                    </Badge>
                )
        }
    }

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="text-right py-4 font-bold text-primary">المستخدم</TableHead>
                        <TableHead className="text-right py-4 font-bold text-primary">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right py-4 font-bold text-primary">الدور الحالي</TableHead>
                        <TableHead className="text-right py-4 font-bold text-primary">تغيير الصلاحيات</TableHead>
                        <TableHead className="text-right py-4 font-bold text-primary">تاريخ الانضمام</TableHead>
                        <TableHead className="text-center py-4 font-bold text-primary">إجراءات</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium py-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm ring-2 ring-muted/20">
                                        <AvatarImage src={user.image || undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {user.name?.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground/90">{user.name}</span>
                                        {user.id === currentUserId && (
                                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded w-fit">
                                                (أنت)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-mono text-sm">{user.email}</TableCell>
                            <TableCell>
                                {getRoleBadge(user.role)}
                            </TableCell>
                            <TableCell>
                                <Select
                                    disabled={!canManageUsers || user.id === currentUserId || updating === user.id}
                                    defaultValue={user.role}
                                    onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                                >
                                    <SelectTrigger className="w-[180px] h-8 text-xs bg-background/50 border-muted-foreground/20 focus:ring-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(UserRole).map((role) => (
                                            <SelectItem key={role} value={role} className="text-right flex-row-reverse text-xs">
                                                {ROLE_LABELS[role]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {new Date(user.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </TableCell>
                            <TableCell className="text-center">
                                <TooltipProvider>
                                    <div className="flex items-center justify-center gap-1">
                                        {/* أيقونة الصلاحيات */}
                                        {canManageUsers && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Dialog open={isResetDialogOpen && resettingPassword === user.id} onOpenChange={(open) => {
                                                        setIsResetDialogOpen(open)
                                                        if (open) setResettingPassword(user.id)
                                                        else {
                                                            setResettingPassword(null)
                                                            setNewPassword("")
                                                        }
                                                    }}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                                onClick={() => setResettingPassword(user.id)}
                                                            >
                                                                <KeyRound className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>تغيير كلمة المرور</DialogTitle>
                                                                <DialogDescription>
                                                                    قم بتعيين كلمة مرور جديدة للمستخدم <strong>{user.name}</strong>
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="grid gap-4 py-4">
                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                    <Label htmlFor="new-password" className="text-right">
                                                                        كلمة المرور الجديدة
                                                                    </Label>
                                                                    <Input
                                                                        id="new-password"
                                                                        type="text"
                                                                        value={newPassword}
                                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                                        className="col-span-3"
                                                                        dir="ltr"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button onClick={handleResetPassword} disabled={!newPassword || newPassword.length < 6}>
                                                                    حفظ التغييرات
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>تغيير كلمة المرور</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}

                                        {/* أيقونة الحذف */}
                                        {canManageUsers && user.id !== currentUserId && (
                                            <AlertDialog>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                disabled={deleting === user.id}
                                                            >
                                                                {deleting === user.id ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>حذف المستخدم</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                                <AlertDialogContent dir="rtl">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>هل أنت متأكد تماماً؟</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            سيتم حذف حساب المستخدم <strong>{user.name}</strong> نهائياً. لا يمكن التراجع عن هذا الإجراء.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            حذف المستخدم
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

