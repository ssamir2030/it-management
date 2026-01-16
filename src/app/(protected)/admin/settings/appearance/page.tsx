export const dynamic = 'force-dynamic';

import { getSession } from "@/lib/simple-auth"
import { hasPermission } from "@/lib/rbac"
import AppearanceView from "@/components/admin/settings/appearance-view"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function AppearancePage() {
    const session = await getSession()

    // Check permissions
    const canManage = session?.role ? hasPermission(session.role as string, 'manage_settings') : false
    const canView = session?.role ? hasPermission(session.role as string, 'view_settings') : false

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
        <AppearanceView
            readOnly={!canManage}
        />
    )
}
