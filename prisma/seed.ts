import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. Create Admin User
    const password = await hash('123456', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@system.com' },
        update: {},
        create: {
            email: 'admin@system.com',
            name: 'مدير النظام',
            password,
            role: 'ADMIN',
        },
    })
    console.log('Created Admin User:', admin.email)

    // 2. Create Departments
    const departments = ['تقنية المعلومات', 'الموارد البشرية', 'المالية', 'المبيعات', 'الإدارة العليا']
    for (const dept of departments) {
        await prisma.department.upsert({
            where: { name: dept },
            update: {},
            create: { name: dept, description: `قسم ${dept}` },
        })
    }
    console.log('Created Departments')

    // 3. Create Locations
    const locations = ['المقر الرئيسي', 'فرع الرياض', 'فرع جدة', 'فرع الدمام']
    for (const loc of locations) {
        const existing = await prisma.location.findFirst({ where: { name: loc } })
        if (!existing) {
            await prisma.location.create({
                data: { name: loc, address: 'المملكة العربية السعودية' },
            })
        }
    }
    console.log('Created Locations')

    // 4. Create Suppliers
    const suppliers = await prisma.supplier.createMany({
        data: [
            { name: 'Jarir Bookstore', email: 'b2b@jarir.com', phone: '920000000' },
            { name: 'Extra Stores', email: 'sales@extra.com' },
            { name: 'Microsoft Arabia', email: 'support@microsoft.com' },
        ],
        skipDuplicates: true,
    })
    console.log('Created Suppliers')
    const supplier = await prisma.supplier.findFirst()

    // 5. Create Asset Categories (4-Tier Structure)
    const laptopCat = await prisma.assetCategory.create({
        data: { id: crypto.randomUUID(), nameAr: 'أجهزة لابتوب', nameEn: 'Laptops', type: 'IT', prefix: 'LAP', updatedAt: new Date() }
    })
    const mouseCat = await prisma.assetCategory.create({
        data: { id: crypto.randomUUID(), nameAr: 'إكسسوارات', nameEn: 'Accessories', type: 'ACCESSORY', updatedAt: new Date() }
    })
    const softwareCat = await prisma.assetCategory.create({
        data: { id: crypto.randomUUID(), nameAr: 'برامج تشغيل', nameEn: 'Operating Systems', type: 'LICENSE', updatedAt: new Date() }
    })

    // 6. Create Assets (The "Snipe-IT" Core)
    const location = await prisma.location.findFirst()
    await prisma.asset.create({
        data: {
            id: crypto.randomUUID(),
            name: 'HP EliteBook G8',
            tag: 'LAP-1001',
            type: 'HARDWARE',
            status: 'AVAILABLE',
            serialNumber: '5CD12345X',
            model: 'EliteBook 840 G8',
            manufacturer: 'HP',
            locationId: location?.id,
            categoryId: laptopCat.id,
            price: 4500,
            purchaseDate: new Date(),
            updatedAt: new Date()
        }
    })

    // 7. Create Accessories (Quantitative)
    await prisma.accessory.create({
        data: {
            id: crypto.randomUUID(),
            name: 'Logitech Wireless Mouse M185',
            totalQty: 50,
            remainingQty: 50,
            minQty: 10,
            manufacturer: 'Logitech',
            categoryId: mouseCat.id,
            locationId: location?.id,
            supplierId: supplier?.id,
            cost: 45,
            updatedAt: new Date()
        }
    })

    // 8. Create Licenses (Seats)
    await prisma.softwareLicense.create({
        data: {
            id: crypto.randomUUID(),
            name: 'Windows 11 Pro',
            key: 'XXXX-YYYY-ZZZZ-AAAA',
            type: 'PERPETUAL',
            seats: 100,
            usedSeats: 0,
            cost: 800,
            supplierId: supplier?.id,
            updatedAt: new Date()
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
