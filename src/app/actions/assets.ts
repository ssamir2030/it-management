'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { logAction } from "@/lib/audit"

export async function getAssets() {
    try {
        const assets = await prisma.asset.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                employee: {
                    select: {
                        name: true
                    }
                }
            }
        })
        return { success: true, data: assets }
    } catch (error) {
        console.error("Error fetching assets:", error)
        return { success: false, error: "Failed to fetch assets" }
    }
}

export async function getAssetCategories() {
    try {
        const categories = await prisma.assetCategory.findMany({
            orderBy: { nameEn: 'asc' }
        })
        return { success: true, data: categories }
    } catch (error) {
        console.error("Error fetching categories:", error)
        return { success: false, data: [] }
    }
}

export async function createAsset(formData: FormData) {
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const tag = formData.get("tag") as string
    const serialNumber = formData.get("serialNumber") as string
    const model = formData.get("model") as string
    const manufacturer = formData.get("manufacturer") as string
    const status = formData.get("status") as string
    const employeeId = formData.get("employeeId") as string
    const inventoryItemId = formData.get("inventoryItemId") as string
    const categoryId = formData.get("categoryId") as string

    // Lifecycle Fields
    const purchaseDate = formData.get("purchaseDate") ? new Date(formData.get("purchaseDate") as string) : null
    const warrantyExpiry = formData.get("warrantyExpiry") ? new Date(formData.get("warrantyExpiry") as string) : null

    // Validation
    if (!name || !tag) {
        return { success: false, error: "الاسم ورقم الأصل (Tag) حقول مطلوبة" }
    }

    try {
        // 1. Check if Tag exists
        const existingAsset = await prisma.asset.findUnique({
            where: { tag }
        })

        if (existingAsset) {
            return { success: false, error: "رقم الأصل (Tag) موجود مسبقاً" }
        }

        // 2. Handle Inventory Deduction (if selected)
        if (inventoryItemId) {
            const inventoryItem = await prisma.inventoryItem.findUnique({
                where: { id: inventoryItemId }
            })

            if (!inventoryItem || inventoryItem.quantity < 1) {
                return { success: false, error: "الكمية غير متوفرة في المستودع" }
            }

            await prisma.inventoryItem.update({
                where: { id: inventoryItemId },
                data: { quantity: { decrement: 1 } }
            })
        }

        // 3. Create Asset
        const asset = await prisma.asset.create({
            data: {
                name,
                type: type || 'OTHER', // Fallback if type not provided directly
                tag,
                serialNumber,
                model,
                manufacturer,
                status: employeeId ? "ASSIGNED" : (status || "AVAILABLE"),
                employeeId: employeeId || null,
                categoryId: categoryId || null,
                ipAddress: (formData.get("ipAddress") as string) || null,
                anydeskId: (formData.get("anydeskId") as string) || null,
                dwServiceId: (formData.get("dwServiceId") as string) || null,
                purchaseDate,
                warrantyExpiry,
            }
        })

        // 4. Create Custody Record (if employee selected)
        if (employeeId) {
            await prisma.custodyItem.create({
                data: {
                    name: asset.name,
                    description: `Asset Tag: ${asset.tag} - Serial: ${asset.serialNumber || 'N/A'}`,
                    employeeId: employeeId,
                    assetId: asset.id,
                    categoryId: categoryId || null,
                    assignedDate: new Date(),
                }
            })
        }

        // Audit Log
        await logAction({
            action: 'CREATE',
            entityType: 'ASSET',
            entityId: asset.id,
            entityName: asset.name,
            changes: { tag, type, model, status: asset.status, categoryId }
        })

        revalidatePath("/assets")
        revalidatePath("/inventory")
        revalidatePath("/custody")

        return { success: true, assetId: asset.id, asset }

    } catch (error) {
        console.error("Error creating asset:", error)
        return { success: false, error: "حدث خطأ أثناء حفظ الأصل" }
    }
}

export async function getEmployeesList() {
    return await prisma.employee.findMany({
        select: {
            id: true,
            name: true,
            department: {
                select: {
                    name: true
                }
            }
        },
        orderBy: { name: 'asc' }
    })
}

export async function getInventoryItemsList() {
    return await prisma.inventoryItem.findMany({
        where: { quantity: { gt: 0 } },
        select: { id: true, name: true, model: true, manufacturer: true, quantity: true, category: true },
        orderBy: { name: 'asc' }
    })
}

export async function deleteAsset(id: string) {
    try {
        const deletedAsset = await prisma.asset.delete({
            where: { id },
            include: {
                remoteAgent: true // Include this to get agent info if needed
            }
        })

        // Reset Discovered Device status if it exists
        // Match by Serial Number (most reliable) then MAC (if stored) or IP
        // We'll try Serial first as it's the strongest link
        if (deletedAsset.serialNumber) {
            const discovered = await prisma.discoveredDevice.findMany({
                where: {
                    details: {
                        contains: deletedAsset.serialNumber
                    }
                }
            })

            // If found by serial in details JSON
            for (const d of discovered) {
                await prisma.discoveredDevice.update({
                    where: { id: d.id },
                    data: { status: 'AGENT_CONNECTED' } // Assume if it had serial, it likely had agent or deep scan
                })
            }
        }

        // Also try matching by IP as fallback if no serial
        if (deletedAsset.ipAddress) {
            await prisma.discoveredDevice.updateMany({
                where: {
                    ipAddress: deletedAsset.ipAddress,
                    status: 'ADDED'
                },
                data: { status: 'NEW' } // Reset to NEW if just IP match
            })
        }

        await logAction({
            action: 'DELETE',
            entityType: 'ASSET',
            entityId: id,
            entityName: deletedAsset.name
        })

        revalidatePath("/assets")
        revalidatePath("/dashboard")
        revalidatePath("/admin/discovery") // Refresh discovery list
        return { success: true }
    } catch (error) {
        console.error("Error deleting asset:", error)
        return { success: false, error: "فشل حذف الأصل" }
    }
}

export async function getAsset(id: string) {
    try {
        const asset = await prisma.asset.findUnique({
            where: { id },
            include: {
                employee: true,
                location: true
            }
        })
        return { success: true, data: asset }
    } catch (error) {
        console.error("Error fetching asset:", error)
        return { success: false, error: "فشل جلب بيانات الأصل" }
    }
}

export async function updateAsset(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const tag = formData.get("tag") as string
    const serialNumber = formData.get("serialNumber") as string
    const model = formData.get("model") as string
    const manufacturer = formData.get("manufacturer") as string
    const status = formData.get("status") as string
    const employeeId = formData.get("employeeId") as string
    const ipAddress = formData.get("ipAddress") as string
    const anydeskId = formData.get("anydeskId") as string
    const dwServiceId = formData.get("dwServiceId") as string
    const categoryId = formData.get("categoryId") as string

    // Lifecycle Fields
    const purchaseDate = formData.get("purchaseDate") ? new Date(formData.get("purchaseDate") as string) : null
    const warrantyExpiry = formData.get("warrantyExpiry") ? new Date(formData.get("warrantyExpiry") as string) : null

    try {
        // 1. Get current asset state to check for changes
        const currentAsset = await prisma.asset.findUnique({
            where: { id },
            select: { employeeId: true, name: true, tag: true, serialNumber: true, categoryId: true, type: true, status: true }
        })

        // Normalize employeeId
        const validEmployeeId = (employeeId === "none" || !employeeId) ? null : employeeId

        const updatedAsset = await prisma.asset.update({
            where: { id },
            data: {
                name,
                type: type || currentAsset?.type || 'OTHER',
                tag,
                manufacturer,
                model,
                serialNumber,
                status: validEmployeeId ? "ASSIGNED" : (status || "AVAILABLE"),
                employeeId: validEmployeeId,
                categoryId: categoryId || null,
                ipAddress: ipAddress || null,
                anydeskId: anydeskId || null,
                dwServiceId: dwServiceId || null,
                purchaseDate,
                warrantyExpiry,
            }
        })

        // 2. Ensure Custody Record exists if employee is assigned
        if (validEmployeeId) {
            // Check if there is already an active custody record for this asset and employee
            const activeCustody = await prisma.custodyItem.findFirst({
                where: {
                    assetId: id,
                    employeeId: validEmployeeId,
                    returnDate: null
                }
            })

            if (!activeCustody) {
                await prisma.custodyItem.create({
                    data: {
                        name: name,
                        description: `Assigned via Update - Asset Tag: ${tag} - Serial: ${serialNumber || 'N/A'}`,
                        employeeId: validEmployeeId,
                        assetId: id,
                        categoryId: categoryId || null,
                        assignedDate: new Date(),
                    }
                })
            }
        }

        // Determine Action Type
        let action: 'UPDATE' | 'ASSIGN' | 'RETURN' = 'UPDATE'
        if (validEmployeeId && !currentAsset?.employeeId) {
            action = 'ASSIGN'
        } else if (!validEmployeeId && currentAsset?.employeeId) {
            action = 'RETURN'
        } else if (validEmployeeId && currentAsset?.employeeId && validEmployeeId !== currentAsset.employeeId) {
            action = 'ASSIGN' // Re-assigned to someone else
        }

        await logAction({
            action,
            entityType: 'ASSET',
            entityId: id,
            entityName: name,
            changes: {
                status,
                employeeId: validEmployeeId,
                categoryId,
                oldCategory: currentAsset?.categoryId,
                oldEmployee: currentAsset?.employeeId,
                oldStatus: currentAsset?.status
            }
        })

        revalidatePath("/assets")
        revalidatePath(`/assets/${id}`)
        revalidatePath("/custody")
        return { success: true }
    } catch (error) {
        console.error("Error updating asset:", error)
        return { success: false, error: "فشل تحديث الأصل" }
    }
}

export async function getAssetsForSelect() {
    try {
        const assets = await prisma.asset.findMany({
            select: {
                id: true,
                name: true,
                tag: true
            },
            orderBy: { name: 'asc' }
        })
        return { success: true, data: assets }
    } catch (error) {
        console.error("Error fetching assets for select:", error)
        return { success: false, data: [] }
    }
}
export async function searchAssets(query: string) {
    if (!query || query.length < 2) return { success: true, data: [] }
    try {
        const assets = await prisma.asset.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { tag: { contains: query } },
                    { serialNumber: { contains: query } }
                ]
            },
            take: 5,
            select: {
                id: true,
                name: true,
                tag: true,
                type: true
            }
        })
        return { success: true, data: assets }
    } catch (error) {
        console.error("Error searching assets:", error)
        return { success: false, data: [] }
    }
}

export async function getAvailableAssets() {
    try {
        const assets = await prisma.asset.findMany({
            where: {
                status: {
                    in: ['AVAILABLE', 'IN_STORE']
                }
            },
            select: {
                id: true,
                name: true,
                tag: true,
                status: true,
                model: true
            },
            orderBy: { name: 'asc' }
        })
        return { success: true, data: assets }
    } catch (error) {
        console.error("Error fetching available assets:", error)
        return { success: false, data: [] }
    }
}
