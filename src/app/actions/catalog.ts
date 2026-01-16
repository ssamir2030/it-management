'use server'

import { prisma } from '@/lib/prisma'
import { PRINTER_CATALOG } from '@/lib/constants/printer-catalog'

export async function getPrinterCatalog() {
    try {
        const items = await prisma.printerCatalogItem.findMany({
            include: {
                children: {
                    include: {
                        children: true
                    }
                }
            }
        })

        // If DB is empty, seed it with static data
        if (items.length === 0) {
            console.log('Seeding printer catalog...')
            await seedCatalog()
            return await getPrinterCatalog()
        }

        // Transform DB structure back to UI expectation
        // We need to group by Device Type (PRINTER/COPIER) -> Brands -> Models -> Toners
        const printers = items.filter(i => i.type === 'BRAND' && i.deviceType === 'PRINTER').map(transformBrand)
        const copiers = items.filter(i => i.type === 'BRAND' && i.deviceType === 'COPIER').map(transformBrand)

        return {
            PRINTER: printers,
            COPIER: copiers
        }

    } catch (error) {
        console.error('Failed to get catalog from DB, falling back to static:', error)
        // Fallback to static catalog if DB fails (e.g. migration/client issues)
        return PRINTER_CATALOG
    }
}

function transformBrand(brand: any) {
    return {
        id: brand.id,
        name: brand.name,
        models: brand.children.map((model: any) => ({
            id: model.id,
            name: model.name,
            code: model.code || '',
            toners: model.children.map((toner: any) => ({
                id: toner.id,
                name: toner.name,
                code: toner.code || '',
                color: toner.color || 'Black'
            }))
        }))
    }
}

async function seedCatalog() {
    // Seed Printers
    for (const brand of PRINTER_CATALOG.PRINTER) {
        await createBrandHierarchy(brand, 'PRINTER')
    }
    // Seed Copiers
    for (const brand of PRINTER_CATALOG.COPIER) {
        await createBrandHierarchy(brand, 'COPIER')
    }
}

async function createBrandHierarchy(brand: any, deviceType: string) {
    const brandRecord = await prisma.printerCatalogItem.create({
        data: {
            type: 'BRAND',
            name: brand.name,
            deviceType
        }
    })

    for (const model of brand.models) {
        const modelRecord = await prisma.printerCatalogItem.create({
            data: {
                type: 'MODEL',
                name: model.name,
                code: model.code,
                parentId: brandRecord.id
            }
        })

        for (const toner of model.toners) {
            await prisma.printerCatalogItem.create({
                data: {
                    type: 'TONER',
                    name: toner.name,
                    code: toner.code,
                    color: toner.color,
                    parentId: modelRecord.id
                }
            })
        }
    }
}

export async function learnNewInput(data: {
    deviceType: 'PRINTER' | 'COPIER',
    brandName: string,
    modelName: string,
    inkName: string
}) {
    try {
        // 1. Find or Create Brand
        let brand = await prisma.printerCatalogItem.findFirst({
            where: {
                type: 'BRAND',
                name: data.brandName,
                deviceType: data.deviceType as any
            }
        })

        if (!brand) {
            brand = await prisma.printerCatalogItem.create({
                data: {
                    type: 'BRAND',
                    name: data.brandName,
                    deviceType: data.deviceType
                }
            })
        }

        // 2. Find or Create Model
        let model = await prisma.printerCatalogItem.findFirst({
            where: {
                type: 'MODEL',
                name: data.modelName,
                parentId: brand.id
            }
        })

        if (!model) {
            model = await prisma.printerCatalogItem.create({
                data: {
                    type: 'MODEL',
                    name: data.modelName,
                    code: 'USER-ADDED',
                    parentId: brand.id
                }
            })
        }

        // 3. Find or Create Toner
        // We only add the toner if it definitely doesn't exist
        const toner = await prisma.printerCatalogItem.findFirst({
            where: {
                type: 'TONER',
                name: data.inkName,
                parentId: model.id
            }
        })

        if (!toner) {
            await prisma.printerCatalogItem.create({
                data: {
                    type: 'TONER',
                    name: data.inkName,
                    code: 'USER-ADDED',
                    color: 'Black', // Default assumptions for user inputs
                    parentId: model.id
                }
            })
        }

        return { success: true }
    } catch (e) {
        console.error('Failed to learn new input:', e)
        return { success: false }
    }
}
