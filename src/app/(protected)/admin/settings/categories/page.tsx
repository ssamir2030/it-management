export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/simple-auth"
import { hasPermission } from "@/lib/rbac"
import CategoriesView from "@/components/admin/settings/categories-view"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function CategoriesPage() {
    const session = await getSession()

    // Check permissions
    const canManage = session?.role ? hasPermission(session.role as string, 'manage_settings') : false
    const canView = session?.role ? hasPermission(session.role as string, 'view_settings') || hasPermission(session.role as string, 'view_inventory') : false

    // If neither view nor manage (although Viewer has view_inventory/view_settings), show error
    // Viewer role has 'view_inventory' and 'view_settings' (recently added).

    if (!canView && !canManage) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>
                        ليس لديك صلاحية للوصول إلى هذه الصفحة
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <CategoriesView
            readOnly={!canManage}
        />
    )
}
