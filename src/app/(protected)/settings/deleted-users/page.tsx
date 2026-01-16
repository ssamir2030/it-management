export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/simple-auth"
import { hasPermission } from "@/lib/rbac"
import DeletedUsersView from "@/components/admin/deleted-users-view"

export default async function DeletedUsersPage() {
    const session = await getSession()

    const canManageUsers = session?.role ? hasPermission(session.role as string, 'manage_users') : false

    return <DeletedUsersView canManageUsers={canManageUsers} />
}
