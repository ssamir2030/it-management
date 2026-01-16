export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/simple-auth"
import { hasPermission, UserRole } from "@/lib/rbac"
import { redirect } from "next/navigation"
import NewUserForm from "@/components/admin/users/new-user-form"

export default async function NewUserPage() {
    const session = await getSession()

    // Explicit Check: Only Super Admin and IT Manager can create users
    const canManageUsers = session?.role === UserRole.SUPER_ADMIN || session?.role === UserRole.IT_MANAGER

    if (!canManageUsers) {
        redirect('/admin/settings/users')
    }

    return <NewUserForm />
}
