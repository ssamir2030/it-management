export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/simple-auth"
import { getUsers } from "@/app/actions/users"
import { UsersTable } from "@/components/admin/users-table"
import { AddUserDialog } from "@/components/admin/add-user-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus, UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { UserRole } from "@/lib/rbac"

export default async function UsersPage() {
    const session = await getSession()

    const result = await getUsers()
    const users = result.success && result.data ? result.data : []

    const canManageUsers = session?.role === UserRole.SUPER_ADMIN || session?.role === UserRole.IT_MANAGER || session?.role === 'ADMIN'

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                backLink="/admin/settings"
                backText="الإعدادات"
                title="إدارة المستخدمين"
                description="إدارة حسابات المسؤولين والصلاحيات"
                icon={Users}
                rightContent={
                    <div className="flex gap-2">
                        {canManageUsers && (
                            <>
                                <Link href="/admin/users/onboarding">
                                    <Button className="gap-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg">
                                        <UserPlus className="h-5 w-5" />
                                        معالج الموظف الجديد
                                    </Button>
                                </Link>
                                <Link href="/settings/users/new">
                                    <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg">
                                        <UserPlus className="h-5 w-5" />
                                        إضافة مستخدم جديد
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                }
            />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-700" />
                        قائمة المستخدمين
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <UsersTable users={users} currentUserId={(session?.id as string) || ''} currentUserRole={(session?.role as string) || ''} />
                </CardContent>
            </Card>
        </div>
    )
}
