'use client'

// import { useSession } from "next-auth/react" // Removed - using simple auth
import { hasPermission, UserRole } from "@/lib/rbac"

interface RoleGuardProps {
    children: React.ReactNode
    permission?: string
    roles?: UserRole[]
    fallback?: React.ReactNode
}

export function RoleGuard({ children, permission, roles, fallback = null }: RoleGuardProps) {
    // Temporarily allow all - TODO: implement client-side session check
    return <>{children}</>

    // const { data: session } = useSession()
    // const userRole = session?.user?.role

    // if (!userRole) return <>{fallback}</>

    // // Check by specific roles
    // if (roles && roles.length > 0) {
    //     if (roles.includes(userRole as UserRole)) {
    //         return <>{children}</>
    //     }
    // }

    // // Check by permission
    // if (permission) {
    //     if (hasPermission(userRole, permission)) {
    //         return <>{children}</>
    //     }
    // }

    // // If no specific checks, just require auth (which is handled by parent usually)
    // if (!permission && !roles) {
    //     return <>{children}</>
    // }

    // return <>{fallback}</>
}
