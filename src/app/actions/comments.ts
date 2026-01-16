'use server'

import prisma from '@/lib/prisma'
import { getSession } from '@/lib/simple-auth'
import { revalidatePath } from 'next/cache'

export async function createComment(
    entityType: string,
    entityId: string,
    content: string
) {
    try {
        const session = await getSession()

        if (!session?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                entityType,
                entityId,
                authorId: session.id as string,
                authorType: session.role === 'ADMIN' ? 'USER' : 'EMPLOYEE',
                authorName: (session.name as string) || 'Anonymous'
            }
        })

        revalidatePath(`/${entityType.toLowerCase()}/${entityId}`)
        return { success: true, data: comment }
    } catch (error) {
        console.error('Error creating comment:', error)
        return { success: false, error: 'Failed to create comment' }
    }
}

export async function getComments(entityType: string, entityId: string) {
    try {
        const comments = await prisma.comment.findMany({
            where: {
                entityType,
                entityId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return { success: true, data: comments }
    } catch (error) {
        console.error('Error fetching comments:', error)
        return { success: false, error: 'Failed to fetch comments' }
    }
}

export async function updateComment(commentId: string, content: string) {
    try {
        const session = await getSession()

        if (!session?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        // Check ownership
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        })

        if (!comment || comment.authorId !== session.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const updated = await prisma.comment.update({
            where: { id: commentId },
            data: {
                content
            }
        })

        return { success: true, data: updated }
    } catch (error) {
        console.error('Error updating comment:', error)
        return { success: false, error: 'Failed to update comment' }
    }
}

export async function deleteComment(commentId: string) {
    try {
        const session = await getSession()

        if (!session?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        // Check ownership
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        })

        if (!comment || comment.authorId !== session.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.comment.delete({
            where: { id: commentId }
        })

        return { success: true }
    } catch (error) {
        console.error('Error deleting comment:', error)
        return { success: false, error: 'Failed to delete comment' }
    }
}
