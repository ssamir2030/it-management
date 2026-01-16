
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
    { nameEn: 'Laptop', nameAr: 'لابتوب', type: 'IT' },
    { nameEn: 'Desktop', nameAr: 'كمبيوتر مكتبي', type: 'IT' },
    { nameEn: 'Server', nameAr: 'خادم', type: 'IT' },
    { nameEn: 'Monitor', nameAr: 'شاشة', type: 'IT' },
    { nameEn: 'Printer', nameAr: 'طابعة', type: 'IT' },
    { nameEn: 'Phone', nameAr: 'هاتف', type: 'IT' },
    { nameEn: 'Tablet', nameAr: 'جهاز لوحي', type: 'IT' },
    { nameEn: 'Network Device', nameAr: 'جهاز شبكة', type: 'IT' },
    { nameEn: 'Furniture', nameAr: 'أثاث', type: 'FURNITURE' },
    { nameEn: 'Other', nameAr: 'أخرى', type: 'OTHER' },
]

async function main() {
    console.log('Start seeding categories...')

    for (const cat of categories) {
        const existing = await prisma.assetCategory.findFirst({
            where: { nameEn: cat.nameEn }
        })

        if (!existing) {
            await prisma.assetCategory.create({
                data: {
                    nameEn: cat.nameEn,
                    nameAr: cat.nameAr,
                    type: cat.type
                }
            })
            console.log(`Created category: ${cat.nameEn}`)
        } else {
            console.log(`Category already exists: ${cat.nameEn}`)
        }
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
