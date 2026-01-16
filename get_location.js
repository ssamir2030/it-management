
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const location = await prisma.location.findFirst()
    console.log('Location ID:', location?.id)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
