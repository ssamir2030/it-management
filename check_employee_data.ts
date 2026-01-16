import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const employees = await prisma.employee.findMany({
        select: {
            name: true,
            identityNumber: true,
            phone: true
        }
    })
    console.log("Employees found:", employees)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
