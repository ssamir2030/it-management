
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const count = await prisma.inventoryItem.count()
    console.log(`Current inventory count: ${count}`)

    if (count === 0) {
        console.log('Seeding initial inventory items...')
        await prisma.inventoryItem.create({
            data: {
                name: 'HP EliteBook 840 G8',
                category: 'Laptops',
                manufacturer: 'HP',
                model: 'G8',
                quantity: 10,
                minQuantity: 2,
                serialNumber: '5CG1234567'
            }
        })
        console.log('Created HP EliteBook 840 G8')

        await prisma.inventoryItem.create({
            data: {
                name: 'Dell Monitor 24"',
                category: 'Monitors',
                manufacturer: 'Dell',
                model: 'P2419H',
                quantity: 5,
                minQuantity: 1
            }
        })
        console.log('Created Dell Monitor 24"')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
