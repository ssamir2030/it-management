export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/simple-auth"
import { getUsers } from "@/app/actions/users"
import { UserRole, hasPermission } from "@/lib/rbac"
import { redirect } from "next/navigation"
import { UsersTable } from "@/components/admin/users-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default async function UsersPage() {
    const session = await getSession()

    // Temporarily disabled permission check
    // if (!session?.role || !hasPermission(session.role, 'manage_users')) {
    //     redirect('/admin/dashboard')
    // }

    const result = await getUsers()
    const users = result.success && result.data ? result.data : []

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                title="إدارة المستخدمين"
                description="إدارة حسابات الموظفين والصلاحيات"
                icon={Users}
                rightContent={
                    <Link href="/admin/users/new">
                        <Button className="gap-2 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                            <Plus className="h-5 w-5" />
                            إضافة مستخدم جديد
                        </Button>
                    </Link>
                }
            />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-700" />
                        قائمة المستخدمين والصلاحيات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <UsersTable users={users} currentUserId={(session?.id as string) || ''} currentUserRole={(session?.role as string) || 'VIEWER'} />
                </CardContent>
            </Card>
        </div>
    )
}
