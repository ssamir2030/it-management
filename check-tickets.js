
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Checking tickets in database...')
    try {
        const count = await prisma.ticket.count()
        console.log(`Total tickets: ${count}`)

        if (count > 0) {
            const tickets = await prisma.ticket.findMany({
                take: 5,
                include: { createdBy: true }
            })
            console.log('Sample tickets:', JSON.stringify(tickets, null, 2))
        }

        const users = await prisma.user.findMany({
            select: { id: true, name: true, role: true, email: true }
        })
        console.log('Users:', JSON.stringify(users, null, 2))

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
