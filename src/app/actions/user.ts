'use server'

import { auth } from '@/auth'

export async function getCurrentUser() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        return {
            success: true,
            data: {
                id: session.user.id,
                name: session.user.name || 'مستخدم',
                email: session.user.email,
                role: session.user.role
            }
        }
    } catch (error) {
        console.error('Error in getCurrentUser:', error)
        return { success: false, error: 'خطأ في جلب معلومات المستخدم' }
    }
}
