'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/simple-auth'

export async function createDocument(data: {
    title: string,
    type: string,
    documentDate: Date,
    amount?: number,
    fileName: string,
    fileUrl: string,
    fileSize: number,
    fileType: string
}) {
    try {
        const session = await getSession()
        // Assuming basic auth check here, adjust role as needed
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const document = await prisma.document.create({
            data: {
                title: data.title,
                type: data.type,
                documentDate: data.documentDate,
                amount: data.amount || 0,
                fileName: data.fileName,
                fileUrl: data.fileUrl,
                fileSize: data.fileSize,
                mimeType: data.fileType,
                createdBy: (session.id as string) || 'system',
                status: 'ACTIVE'
            }
        })

        return { success: true, data: document }
    } catch (error) {
        console.error('Error creating document:', error)
        return { success: false, error: 'Failed to create document' }
    }
}

export async function getDocumentById(id: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }

        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                relatedEmployee: true,
                relatedAsset: true
            }
        })

        if (!document) return { success: false, error: 'Document not found' }

        return { success: true, data: document }
    } catch (error) {
        console.error('Error fetching document:', error)
        return { success: false, error: 'Failed to fetch document' }
    }
}

export async function getAllDocuments() {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }

        const documents = await prisma.document.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                relatedEmployee: true,
                relatedAsset: true
            }
        })

        return { success: true, data: documents }
    } catch (error) {
        console.error('Error fetching documents:', error)
        return { success: false, error: 'Failed to fetch documents' }
    }
}

export async function deleteDocument(id: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }

        await prisma.document.delete({
            where: { id }
        })

        revalidatePath('/documents')
        return { success: true }
    } catch (error) {
        console.error('Error deleting document:', error)
        return { success: false, error: 'Failed to delete document' }
    }
}

export async function updateDocument(id: string, data: {
    title: string,
    type: string,
    documentDate: Date,
    amount?: number,
    fileName?: string,
    fileUrl?: string,
    fileSize?: number,
    fileType?: string
}) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }

        // Construct update data
        const updateData: any = {
            title: data.title,
            type: data.type,
            documentDate: data.documentDate,
            amount: data.amount || 0,
        }

        // Only update file info if provided
        if (data.fileUrl) {
            updateData.fileName = data.fileName
            updateData.fileUrl = data.fileUrl
            updateData.fileSize = data.fileSize
            updateData.mimeType = data.fileType
        }

        const document = await prisma.document.update({
            where: { id },
            data: updateData
        })

        revalidatePath('/documents')
        revalidatePath(`/documents/${id}`)
        return { success: true, data: document }
    } catch (error) {
        console.error('Error updating document:', error)
        return { success: false, error: 'Failed to update document' }
    }
}
