'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getVisitors() {
    try {
        const visitors = await prisma.visitor.findMany({
            include: { visits: { take: 5, orderBy: { createdAt: 'desc' } } },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: visitors }
    } catch (error) {
        console.error('Error:', error)
        return { success: false, error: 'فشل في جلب البيانات' }
    }
}

export async function getActiveVisits() {
    try {
        const visits = await prisma.visit.findMany({
            where: { status: 'ACTIVE' },
            include: { visitor: true, host: true },
            orderBy: { checkIn: 'desc' }
        })
        return { success: true, data: visits }
    } catch (error) {
        console.error('Error:', error)
        return { success: false, error: 'فشل في جلب البيانات' }
    }
}

export async function getAllVisits(status?: string) {
    try {
        const visits = await prisma.visit.findMany({
            where: status ? { status } : {},
            include: { visitor: true, host: true },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: visits }
    } catch (error) {
        console.error('Error:', error)
        return { success: false, error: 'فشل في جلب البيانات' }
    }
}

export async function registerVisitor(data: {
    name: string; email?: string; phone?: string; company?: string;
    identityType?: string; identityNo?: string; hostId?: string; purpose?: string
}) {
    try {
        const visitor = await prisma.visitor.create({
            data: { name: data.name, email: data.email, phone: data.phone, company: data.company, identityType: data.identityType, identityNo: data.identityNo }
        })
        const visit = await prisma.visit.create({
            data: { visitorId: visitor.id, hostId: data.hostId, purpose: data.purpose, status: 'ACTIVE', checkIn: new Date(), badgeNumber: `V-${Date.now().toString().slice(-6)}` }
        })
        revalidatePath('/admin/visitors')
        return { success: true, data: { visitor, visit } }
    } catch (error) {
        console.error('Error:', error)
        return { success: false, error: 'فشل في تسجيل الزائر' }
    }
}

export async function checkOutVisitor(visitId: string) {
    try {
        const visit = await prisma.visit.update({
            where: { id: visitId },
            data: { status: 'COMPLETED', checkOut: new Date() }
        })
        revalidatePath('/admin/visitors')
        return { success: true, data: visit }
    } catch (error) {
        console.error('Error:', error)
        return { success: false, error: 'فشل في تسجيل الخروج' }
    }
}

export async function deleteVisit(visitId: string) {
    try {
        await prisma.visit.delete({ where: { id: visitId } })
        revalidatePath('/admin/visitors')
        return { success: true }
    } catch (error) {
        console.error('Error:', error)
        return { success: false, error: 'فشل في حذف الزيارة' }
    }
}

export async function updateVisit(visitId: string, data: { name: string; phone?: string; company?: string; purpose?: string }) {
    try {
        // First get the visit to know the visitor ID
        const visit = await prisma.visit.findUnique({ where: { id: visitId } })
        if (!visit) return { success: false, error: 'الزيارة غير موجودة' }

        // Update visitor data
        await prisma.visitor.update({
            where: { id: visit.visitorId },
            data: { name: data.name, phone: data.phone, company: data.company }
        })

        // Update visit purpose
        await prisma.visit.update({
            where: { id: visitId },
            data: { purpose: data.purpose }
        })

        revalidatePath('/admin/visitors')
        return { success: true }
    } catch (error) {
        console.error('Error:', error)
        return { success: false, error: 'فشل في تحديث البيانات' }
    }
}
