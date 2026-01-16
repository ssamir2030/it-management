
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
    console.log('Testing Prisma Connection...')
    try {
        const users = await prisma.user.findMany({
            include: {
                permissions: {
                    include: {
                        permission: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        })
        console.log(`Found ${users.length} users`)

        const perms = await prisma.screenPermission.findMany()
        console.log(`Found ${perms.length} permissions`)

        console.log('SUCCESS: Logic is sound.')
    } catch (error) {
        console.error('FAILURE:', error)
    } finally {
        await prisma.$disconnect()
    }
}

test()
