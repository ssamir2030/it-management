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
