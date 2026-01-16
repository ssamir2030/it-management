'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/simple-auth"

export async function togglePermission(userId: string, permissionId: string, grant: boolean) {
    try {
        const session = await getSession()

        // Ensure session exists
        if (!session) {
            return { success: false, error: "Unauthorized" }
        }

        if (grant) {
            await prisma.userPermission.create({
                data: {
                    userId,
                    permissionId,
                    grantedBy: session.id as string
                }
            })
        } else {
            await prisma.userPermission.deleteMany({
                where: {
                    userId,
                    permissionId
                }
            })
        }

        revalidatePath('/admin/settings/permissions')
        return { success: true }
    } catch (error) {
        console.error("TOGGLE PERMISSION ERROR:", error)
        return { success: false, error: "Failed to update permission" }
    }
}
