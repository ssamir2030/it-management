const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        await prisma.$connect()
        console.log('Successfully connected to database')
        const userCount = await prisma.user.count()
        console.log('User count:', userCount)
    } catch (error) {
        console.error('Error connecting to database:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
