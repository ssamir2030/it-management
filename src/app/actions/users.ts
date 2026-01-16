"use server"

import { getSession } from "@/lib/simple-auth"
import prisma from "@/lib/prisma"
import { UserRole, hasPermission } from "@/lib/rbac"
import { revalidatePath } from "next/cache"
import { hashPassword } from "@/lib/password"

export async function getUsers() {
    const session = await getSession()

    try {
        const users = await prisma.user.findMany({
            where: {
                deletedAt: null
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true
            }
        })
        return { success: true, data: users }
    } catch (error) {
        return { success: false, error: "Failed to fetch users" }
    }
}

export async function getDeletedUsers() {
    const session = await getSession()

    if (!session?.role || (!hasPermission(session.role as string, 'manage_users') && !hasPermission(session.role as string, 'view_users'))) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                NOT: { deletedAt: null }
            },
            orderBy: { deletedAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                deletedAt: true,
                deletedBy: true
            }
        })
        return { success: true, data: users }
    } catch (error) {
        return { success: false, error: "Failed to fetch deleted users" }
    }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
    const session = await getSession()

    if (!session?.role || !hasPermission(session.role as string, 'manage_users')) {
        return { success: false, error: "Unauthorized" }
    }

    // Prevent changing own role to lose access
    // Prevent changing own role to lose access
    // if (userId === session?.id) {
    //    return { success: false, error: "لا يمكنك تغيير صلاحياتك الخاصة" }
    // }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        })

        revalidatePath('/admin/users')
        revalidatePath('/admin/settings/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update role" }
    }
}

export async function deleteUser(userId: string) {
    const session = await getSession()

    if (userId === session?.id) {
        return { success: false, error: "لا يمكنك حذف حسابك الخاص" }
    }

    try {
        // Soft delete
        await prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date(),
                deletedBy: session?.name || 'Unknown'
            }
        })

        revalidatePath('/admin/users')
        revalidatePath('/admin/settings/users')
        revalidatePath('/admin/settings/deleted-users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete user" }
    }
}

export async function restoreUser(userId: string) {
    const session = await getSession()

    if (!session?.role || !hasPermission(session.role as string, 'manage_users')) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: null,
                deletedBy: null
            }
        })

        revalidatePath('/admin/users')
        revalidatePath('/admin/settings/users')
        revalidatePath('/admin/settings/deleted-users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to restore user" }
    }
}

export async function permanentlyDeleteUser(userId: string) {
    const session = await getSession()

    if (!session?.role || !hasPermission(session.role as string, 'manage_users')) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        })

        revalidatePath('/admin/settings/deleted-users')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete user permanently" }
    }
}

export async function createUser(data: any) {
    const session = await getSession()

    if (!session?.role || !hasPermission(session.role as string, 'manage_users')) {
        return { success: false, error: "Unauthorized" }
    }

    const { name, email, password, role } = data

    if (!name || !email || !password || !role) {
        return { success: false, error: "جميع الحقول مطلوبة" }
    }

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { success: false, error: "البريد الإلكتروني مستخدم بالفعل" }
        }

        // Hash password
        // dynamic import removed
        const hashedPassword = await hashPassword(password)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            }
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Create user error:", error)
        console.error("Create user error:", error)
        return { success: false, error: "فشل إنشاء المستخدم: " + (error as Error).message }
    }
}

export async function resetUserPassword(userId: string, newPassword: string) {
    const session = await getSession()

    if (!session?.role || !hasPermission(session.role as string, 'manage_users')) {
        return { success: false, error: "Unauthorized" }
    }

    if (!newPassword || newPassword.length < 6) {
        return { success: false, error: "كلمة المرور يجب أن تكون 6 خانات على الأقل" }
    }

    try {
        const { hashPassword } = await import("@/lib/password")
        const hashedPassword = await hashPassword(newPassword)

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: "فشل تغيير كلمة المرور" }
    }
}
