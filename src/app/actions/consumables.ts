'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/simple-auth'

// -- Categories --

export async function getConsumableCategories() {
    try {
        const categories = await prisma.consumableCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { consumables: true }
                }
            }
        })
        return { success: true, data: categories }
    } catch (error) {
        console.error('Error fetching categories:', error)
        return { success: false, error: 'Failed to fetch categories' }
    }
}

export async function createConsumableCategory(name: string, description?: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }

        const category = await prisma.consumableCategory.create({
            data: { name, description }
        })

        revalidatePath('/admin/consumables')
        return { success: true, data: category }
    } catch (error) {
        return { success: false, error: 'Failed to create category' }
    }
}

// -- Consumables --

export async function getConsumables(filters?: { categoryId?: string, search?: string }) {
    try {
        const where: any = {}

        if (filters?.categoryId && filters.categoryId !== 'all') {
            where.categoryId = filters.categoryId
        }

        if (filters?.search) {
            where.name = { contains: filters.search }
        }

        const consumables = await prisma.consumable.findMany({
            where,
            include: {
                category: true
            },
            orderBy: { name: 'asc' }
        })

        return { success: true, data: consumables }
    } catch (error) {
        return { success: false, error: 'Failed to fetch consumables' }
    }
}

export async function createConsumable(data: {
    name: string,
    categoryId: string,
    minQuantity?: number,
    description?: string
}) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }

        const consumable = await prisma.consumable.create({
            data: {
                name: data.name,
                categoryId: data.categoryId,
                minQuantity: data.minQuantity || 5, // Default threshold
                description: data.description,
                quantity: 0 // Start with 0, must be restocked
            }
        })

        revalidatePath('/admin/consumables')
        return { success: true, data: consumable }
    } catch (error) {
        return { success: false, error: 'Failed to create consumable' }
    }
}

// -- Transactions --

export async function restockConsumable(id: string, quantity: number, notes?: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }

        // Atomic transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update stock
            const updated = await tx.consumable.update({
                where: { id },
                data: { quantity: { increment: quantity } }
            })

            // 2. Log transaction
            await tx.consumableTransaction.create({
                data: {
                    consumableId: id,
                    type: 'IN',
                    quantity: quantity,
                    notes,
                    // Optionally link to admin who did it? Schema doesn't have userId yet, keeping simple
                }
            })

            return updated
        })

        revalidatePath('/admin/consumables')
        return { success: true, data: result }
    } catch (error) {
        console.error("Restock error:", error)
        return { success: false, error: 'Restock failed' }
    }
}

export async function checkoutConsumable(id: string, employeeId: string, quantity: number, notes?: string) {
    try {
        const session = await getSession()
        if (!session) return { success: false, error: 'Unauthorized' }

        return await prisma.$transaction(async (tx) => {
            // Check stock first
            const current = await tx.consumable.findUnique({ where: { id } })
            if (!current || current.quantity < quantity) {
                throw new Error('Insufficient stock')
            }

            // 1. Deduct stock
            const updated = await tx.consumable.update({
                where: { id },
                data: { quantity: { decrement: quantity } }
            })

            // 2. Log transaction
            await tx.consumableTransaction.create({
                data: {
                    consumableId: id,
                    employeeId,
                    type: 'OUT',
                    quantity,
                    notes
                }
            })

            return { success: true, data: updated }
        })
    } catch (error: any) {
        console.error("Checkout error:", error)
        return { success: false, error: error.message || 'Checkout failed' }
    }
}

export async function getLowStockStats() {
    try {
        // Fetch all consumables and filter in application layer 
        // (Prisma doesn't support comparing two columns in 'where' clause easily without raw query)
        const allConsumables = await prisma.consumable.findMany({
            include: { category: true }
        })

        const lowStock = allConsumables.filter(item => item.quantity <= item.minQuantity)

        return { success: true, data: lowStock }
    } catch (error) {
        console.error("Error fetching low stock stats:", error)
        return { success: false, data: [] }
    }
}

export async function getConsumableTransactions() {
    try {
        const transactions = await prisma.consumableTransaction.findMany({
            include: {
                consumable: { include: { category: true } },
                employee: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return { success: true, data: transactions }
    } catch (error) {
        return { success: false, error: "Failed to fetch transactions" }
    }
}

export async function getConsumableStats() {
    try {
        const [totalConsumables, allConsumables] = await Promise.all([
            prisma.consumable.count(),
            prisma.consumable.findMany({
                select: { quantity: true, minQuantity: true }
            })
        ])

        const lowStockCount = allConsumables.filter(item => item.quantity <= item.minQuantity).length

        return {
            success: true,
            data: {
                totalConsumables,
                lowStockCount
            }
        }
    } catch (error) {
        return { success: false, data: { totalConsumables: 0, lowStockCount: 0 } }
    }
}
