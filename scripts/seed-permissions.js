
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PERMISSIONS = [
    { code: 'VIEW_DASHBOARD', name: 'عرض لوحة التحكم', category: 'DASHBOARD' },
    { code: 'MANAGE_ASSETS', name: 'إدارة الأصول', category: 'ASSETS' },
    { code: 'VIEW_REPORTS', name: 'عراض التقارير', category: 'REPORTS' },
    { code: 'MANAGE_USERS', name: 'إدارة المستخدمين', category: 'ADMIN' },
    { code: 'MANAGE_EMPLOYEES', name: 'إدارة الموظفين', category: 'HR' },
]

async function main() {
    console.log('Start seeding permissions...')

    for (const perm of PERMISSIONS) {
        await prisma.screenPermission.upsert({
            where: { code: perm.code },
            update: {},
            create: {
                code: perm.code,
                name: perm.name,
                category: perm.category,
                sortOrder: 1
            },
        })
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
