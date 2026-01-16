"use client"

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { KeyRound, Shield, Check, X, ShieldAlert, Plus, User as UserIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PERMISSIONS, UserRole, ROLE_LABELS } from "@/lib/rbac"
import { useEffect, useState } from "react"
import { getAllPermissions, getUserPermissions, grantPermission, revokePermission } from "@/app/actions/permissions"
import { getUsers } from "@/app/actions/users"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type ScreenPermission = {
    id: string
    code: string
    name: string
    category: string
}

type User = {
    id: string
    name: string | null
    email: string | null
    role: string
    image: string | null
}

interface PermissionsViewProps {
    readOnly: boolean
}

export default function PermissionsView({ readOnly }: PermissionsViewProps) {
    const [allPermissions, setAllPermissions] = useState<ScreenPermission[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [selectedUser, setSelectedUser] = useState<string>("")
    const [userPermissions, setUserPermissions] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadInitialData = async () => {
            const [permsRes, usersRes] = await Promise.all([
                getAllPermissions(),
                getUsers()
            ])

            if (permsRes.success && permsRes.data) setAllPermissions(permsRes.data)
            if (usersRes.success && usersRes.data) setUsers(usersRes.data)

            setLoading(false)
        }
        loadInitialData()
    }, [])

    useEffect(() => {
        if (selectedUser) {
            loadUserPermissions(selectedUser)
        } else {
            setUserPermissions([])
        }
    }, [selectedUser])

    const loadUserPermissions = async (userId: string) => {
        const res = await getUserPermissions(userId)
        if (res.success && res.data) {
            // Extract permission codes
            setUserPermissions(res.data.map((p: any) => p.permission.code))
        }
    }

    const handleGrant = async (code: string) => {
        if (readOnly) return
        if (!selectedUser) return
        toast.promise(grantPermission(selectedUser, code), {
            loading: 'جاري منح الصلاحية...',
            success: () => {
                loadUserPermissions(selectedUser)
                return 'تم منح الصلاحية بنجاح'
            },
            error: 'فشل منح الصلاحية'
        })
    }

    const handleRevoke = async (code: string) => {
        if (readOnly) return
        if (!selectedUser) return
        toast.promise(revokePermission(selectedUser, code), {
            loading: 'جاري سحب الصلاحية...',
            success: () => {
                loadUserPermissions(selectedUser)
                return 'تم سحب الصلاحية بنجاح'
            },
            error: 'فشل سحب الصلاحية'
        })
    }

    // Group permissions by category for the matrix
    const categories = Array.from(new Set(allPermissions.map(p => p.category)))
    const roles = [UserRole.IT_MANAGER, UserRole.IT_SUPPORT, UserRole.VIEWER]

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                backLink="/admin/settings"
                backText="الإعدادات"
                title="إدارة الصلاحيات"
                description="تحديد مستويات الوصول والأدوار وتخصيص الصلاحيات للمستخدمين"
                icon={KeyRound}
            />

            {readOnly && (
                <Alert variant="default" className="bg-muted border-primary/20">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>وضع المشاهدة فقط</AlertTitle>
                    <AlertDescription>
                        يمكنك الاطلاع على مصفوفة الصلاحيات وصلاحيات المستخدمين، لكن لا يمكنك تعديلها.
                    </AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="matrix" className="w-full" dir="rtl">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="matrix">مصفوفة الأدوار</TabsTrigger>
                    <TabsTrigger value="custom">صلاحيات المستخدمين</TabsTrigger>
                </TabsList>

                {/* TAB 1: ROLE MATRIX */}
                <TabsContent value="matrix" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>مصفوفة صلاحيات النظام</CardTitle>
                            <CardDescription>عرض الصلاحيات الافتراضية لكل دور وظيفي في النظام</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table className="border rounded-lg">
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="text-right w-[300px]">الصلاحية / القسم</TableHead>
                                        {roles.map(role => (
                                            <TableHead key={role} className="text-center">
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {ROLE_LABELS[role]}
                                                </Badge>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map(category => (
                                        <>
                                            <TableRow key={category} className="bg-muted/20">
                                                <TableCell colSpan={4} className="font-bold text-primary py-2 text-xs uppercase tracking-wider">
                                                    {category}
                                                </TableCell>
                                            </TableRow>
                                            {allPermissions.filter(p => p.category === category).map(perm => (
                                                <TableRow key={perm.id} className="hover:bg-muted/5">
                                                    <TableCell className="font-medium text-sm">
                                                        {perm.name}
                                                        <span className="block text-xs text-muted-foreground font-mono mt-0.5">{perm.code}</span>
                                                    </TableCell>
                                                    {roles.map(role => {
                                                        const hasPerm = (PERMISSIONS[role] as readonly string[])?.includes(perm.code) || (PERMISSIONS[role] as readonly string[])?.includes('*')
                                                        return (
                                                            <TableCell key={role} className="text-center">
                                                                {hasPerm ? (
                                                                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                                                                ) : (
                                                                    <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                                                                )}
                                                            </TableCell>
                                                        )
                                                    })}
                                                </TableRow>
                                            ))}
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: CUSTOM USER PERMISSIONS */}
                <TabsContent value="custom" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-[300px_1fr]" dir="rtl">
                        {/* User Selection */}
                        <Card className="h-fit">
                            <CardHeader>
                                <CardTitle className="text-lg">اختيار المستخدم</CardTitle>
                                <CardDescription>اختر مستخدم لتعديل صلاحياته</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="بحث عن مستخدم..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(user => (
                                            <SelectItem key={user.id} value={user.id}>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={user.image || undefined} />
                                                        <AvatarFallback className="text-[10px]">{user.name?.slice(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{user.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {selectedUser && (
                                    <div className="mt-6 p-4 border rounded-lg bg-muted/20">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <UserIcon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-bold">{users.find(u => u.id === selectedUser)?.name}</div>
                                                <div className="text-xs text-muted-foreground">{users.find(u => u.id === selectedUser)?.email}</div>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="w-full justify-center mt-2">
                                            الدور: {users.find(u => u.id === selectedUser)?.role}
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Permissions Editor */}
                        <Card>
                            <CardHeader>
                                <CardTitle>تعديل الصلاحيات الإضافية</CardTitle>
                                <CardDescription>
                                    يمكنك منح صلاحيات إضافية لهذا المستخدم، مستقلة عن صلاحيات دوره الأساسي.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {!selectedUser ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>الرجاء اختيار مستخدم للبدء</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {categories.map(category => (
                                            <div key={category} className="space-y-3">
                                                <h3 className="font-bold text-sm text-muted-foreground uppercase">{category}</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {allPermissions.filter(p => p.category === category).map(perm => {
                                                        const userRole = users.find(u => u.id === selectedUser)?.role as UserRole
                                                        const roleHasPerm = (PERMISSIONS[userRole] as readonly string[])?.includes(perm.code) || (PERMISSIONS[userRole] as readonly string[])?.includes('*')
                                                        const isGranted = userPermissions.includes(perm.code)

                                                        return (
                                                            <div
                                                                key={perm.id}
                                                                className={`
                                                                    flex items-center justify-between p-3 rounded-lg border transition-colors
                                                                    ${roleHasPerm ? 'bg-muted/30 opacity-70 cursor-not-allowed' : 'bg-card hover:border-primary/50'}
                                                                    ${isGranted ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}
                                                                `}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`
                                                                        w-2 h-2 rounded-full
                                                                        ${roleHasPerm ? 'bg-gray-400' : isGranted ? 'bg-green-500' : 'bg-red-200'}
                                                                    `} />
                                                                    <div className="space-y-0.5">
                                                                        <div className="text-sm font-medium">{perm.name}</div>
                                                                        <div className="text-[10px] text-muted-foreground font-mono">{perm.code}</div>
                                                                    </div>
                                                                </div>

                                                                {roleHasPerm ? (
                                                                    <Badge variant="outline" className="font-normal text-[10px] bg-muted">مفعل بالدور</Badge>
                                                                ) : readOnly ? (
                                                                    <div className="text-xs text-muted-foreground">للمشاهدة فقط</div>
                                                                ) : isGranted ? (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => handleRevoke(perm.code)}
                                                                    >
                                                                        سحب
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-7 text-primary hover:bg-primary/10"
                                                                        onClick={() => handleGrant(perm.code)}
                                                                    >
                                                                        <Plus className="w-4 h-4 ml-1" />
                                                                        منح
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
