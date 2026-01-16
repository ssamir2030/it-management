"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/simple-auth"
import { revalidatePath } from "next/cache"
import { PERMISSIONS, UserRole, hasPermission } from "@/lib/rbac"

// Define the static permissions list to sync with DB
const DEFINED_PERMISSIONS = [
    { code: 'view_dashboard', name: 'عرض لوحة المعلومات', category: 'General' },
    { code: 'manage_requests', name: 'إدارة الطلبات', category: 'Requests' },
    { code: 'view_requests', name: 'عرض الطلبات', category: 'Requests' },
    { code: 'update_request_status', name: 'تحديث حالة الطلبات', category: 'Requests' },
    { code: 'manage_inventory', name: 'إدارة المخزون', category: 'Inventory' },
    { code: 'view_inventory', name: 'عرض المخزون', category: 'Inventory' },
    { code: 'update_inventory', name: 'تحديث المخزون', category: 'Inventory' },
    { code: 'manage_employees', name: 'إدارة الموظفين', category: 'Employees' },
    { code: 'view_employees', name: 'عرض الموظفين', category: 'Employees' },
    { code: 'view_reports', name: 'عرض التقارير', category: 'Reports' },
    { code: 'manage_users', name: 'إدارة المستخدمين', category: 'Admin' },
    { code: 'manage_settings', name: 'إعدادات النظام', category: 'Admin' },
]

export async function syncPermissions() {
    // Ensure all defined permissions exist in the DB
    for (const perm of DEFINED_PERMISSIONS) {
        await prisma.screenPermission.upsert({
            where: { code: perm.code },
            update: { name: perm.name, category: perm.category },
            create: {
                code: perm.code,
                name: perm.name,
                category: perm.category,
                description: `System permission for ${perm.code}`
            }
        })
    }
}

export async function getAllPermissions() {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        // Sync first to ensure we have data (lazy seed)
        await syncPermissions()

        const permissions = await prisma.screenPermission.findMany({
            orderBy: { category: 'asc' }
        })
        return { success: true, data: permissions }
    } catch (error) {
        console.error("Failed to fetch permissions", error)
        return { success: false, error: "Failed to fetch permissions" }
    }
}

export async function getUserPermissions(userId: string) {
    const session = await getSession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const userPermissions = await prisma.userPermission.findMany({
            where: { userId },
            include: { permission: true }
        })
        return { success: true, data: userPermissions }
    } catch (error) {
        return { success: false, error: "Failed to fetch user permissions" }
    }
}

export async function grantPermission(userId: string, permissionCode: string) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_users')) return { success: false, error: "Unauthorized" }

    try {
        // Find permission ID from Code
        const permission = await prisma.screenPermission.findUnique({
            where: { code: permissionCode }
        })

        if (!permission) return { success: false, error: "Permission not found" }

        await prisma.userPermission.create({
            data: {
                userId,
                permissionId: permission.id,
                grantedBy: session.name
            }
        })

        revalidatePath('/admin/settings/permissions')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to grant permission" }
    }
}

export async function revokePermission(userId: string, permissionCode: string) {
    const session = await getSession()
    if (!session?.role || !hasPermission(session.role as string, 'manage_users')) return { success: false, error: "Unauthorized" }

    try {
        const permission = await prisma.screenPermission.findUnique({
            where: { code: permissionCode }
        })

        if (!permission) return { success: false, error: "Permission not found" }

        await prisma.userPermission.deleteMany({
            where: {
                userId,
                permissionId: permission.id
            }
        })

        revalidatePath('/admin/settings/permissions')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to revoke permission" }
    }
}
