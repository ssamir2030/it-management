'use client'

import { useState } from 'react'
import { Check, X, Shield, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { togglePermission } from '@/app/actions/admin-permissions'
import { toast } from 'sonner'

interface PermissionManagerProps {
    users: any[]
    allPermissions: any[]
}

export function PermissionManager({ users, allPermissions }: PermissionManagerProps) {
    const [searchTerm, setSearchTerm] = useState('')

    // Group permissions by category
    const permissionsByCategory = allPermissions.reduce((acc: any, perm: any) => {
        if (!acc[perm.category]) acc[perm.category] = []
        acc[perm.category].push(perm)
        return acc
    }, {})

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggle = async (userId: string, permissionId: string, currentStatus: boolean) => {
        try {
            const res = await togglePermission(userId, permissionId, !currentStatus)
            if (res.success) {
                toast.success(currentStatus ? "تم سحب الصلاحية" : "تم منح الصلاحية")
            } else {
                toast.error("فشل التحديث")
            }
        } catch (err) {
            toast.error("حدث خطأ")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث عن مستخدم..."
                        className="pr-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-6">
                {filteredUsers.map(user => (
                    <Card key={user.id} className="overflow-hidden">
                        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-4">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={user.image} />
                                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-base">{user.name}</CardTitle>
                                    <CardDescription>{user.email}</CardDescription>
                                </div>
                                <div className="mr-auto">
                                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {Object.entries(permissionsByCategory).map(([category, perms]: [string, any]) => (
                                <div key={category} className="p-4 border-b last:border-0">
                                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase flex items-center gap-2">
                                        <Shield className="h-3 w-3" />
                                        {category}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {perms.map((perm: any) => {
                                            const hasPermission = user.permissions.some((p: any) => p.permissionId === perm.id)
                                            return (
                                                <div key={perm.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                                    <div className="space-y-0.5">
                                                        <label className="text-sm font-medium cursor-pointer" htmlFor={`${user.id}-${perm.id}`}>
                                                            {perm.name}
                                                        </label>
                                                        <p className="text-[10px] text-muted-foreground">{perm.description}</p>
                                                    </div>
                                                    <Switch
                                                        id={`${user.id}-${perm.id}`}
                                                        checked={hasPermission}
                                                        onCheckedChange={() => handleToggle(user.id, perm.id, hasPermission)}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
