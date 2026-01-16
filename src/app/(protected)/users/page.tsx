export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation"

export default function UsersPage() {
    redirect('/admin/settings/users')
}
