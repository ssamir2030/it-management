
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting category migration...')

    // 1. Create Main Categories if they don't exist
    const mainCategories = [
        { nameAr: 'أجهزة تقنية', nameEn: 'Technical Devices', type: 'IT' },
        { nameAr: 'أثاث مكتبي', nameEn: 'Office Furniture', type: 'FURNITURE' },
        { nameAr: 'أجهزة كهربائية', nameEn: 'Electrical Appliances', type: 'GENERAL' },
        { nameAr: 'أخرى', nameEn: 'Other', type: 'OTHER' }
    ]

    const mainCategoryMap = new Map()

    for (const cat of mainCategories) {
        // Check if exists either as main or sub (to avoid dups if run multiple times)
        let existing = await prisma.assetCategory.findFirst({
            where: { nameEn: cat.nameEn, parentId: null }
        })

        if (!existing) {
            // Create it
            existing = await prisma.assetCategory.create({
                data: {
                    nameAr: cat.nameAr,
                    nameEn: cat.nameEn,
                    type: cat.type
                }
            })
            console.log(`Created Main Category: ${cat.nameEn}`)
        } else {
            console.log(`Found Main Category: ${cat.nameEn}`)
        }
        mainCategoryMap.set(cat.type, existing.id)
    }

    // 2. Map existing sub-categories to these parents
    // Define mapping rules: nameEn -> Parent Type
    const subCategoryMapping: Record<string, string> = {
        'Laptop': 'IT',
        'Desktop': 'IT',
        'Server': 'IT',
        'Monitor': 'IT',
        'Printer': 'IT',
        'Phone': 'IT',
        'Tablet': 'IT',
        'Network Device': 'IT',
        'Furniture': 'FURNITURE', // Map old "Furniture" category to be a child of "Office Furniture" or rename usage?
        // "Furniture" category might effectively duplicate the main category concept. 
        // Let's decide: If we have a category named "Furniture", let's move it under "Office Furniture" as "General Furniture" or just leave it.
        // Better yet, for this specific request:
        // User wants: Main: Office Furniture -> Sub: Desk, Chair etc.
        // If we only have generic "Furniture" category, let's keep it as is for now but put it under Main: Office Furniture
    }

    const allCategories = await prisma.assetCategory.findMany({
        where: { parentId: null } // Only process those that are currently roots
    })

    for (const cat of allCategories) {
        // Skip if it is one of our new main categories
        if (Array.from(mainCategoryMap.values()).includes(cat.id)) continue;

        let targetParentType = 'OTHER';

        // Simple heuristic mapping
        if (['Laptop', 'Desktop', 'Server', 'Monitor', 'Printer', 'Phone', 'Tablet', 'Network Device', 'Projector', 'Scanner'].some(k => cat.nameEn.includes(k))) {
            targetParentType = 'IT';
        } else if (['Chair', 'Desk', 'Table', 'Cabinet', 'Furniture'].some(k => cat.nameEn.includes(k) || cat.type === 'FURNITURE')) {
            targetParentType = 'FURNITURE';
        }

        const parentId = mainCategoryMap.get(targetParentType);

        if (parentId) {
            await prisma.assetCategory.update({
                where: { id: cat.id },
                data: { parentId }
            })
            console.log(`Moved ${cat.nameEn} under ${targetParentType}`)
        }
    }

    console.log('Migration completed.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
