
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- Checking Locations ---')
    const locations = await prisma.location.findMany()
    console.log(`Found ${locations.length} locations:`)
    locations.forEach(l => console.log(` - [${l.id}] ${l.name}`))

    console.log('\n--- Checking Categories (looking for potential mis-entry) ---')
    const categories = await prisma.assetCategory.findMany()
    console.log(`Found ${categories.length} categories:`)
    categories.forEach(c => console.log(` - [${c.type}] ${c.nameAr} / ${c.nameEn}`))

    // Also check Department just in case
    console.log('\n--- Checking Departments ---')
    const depts = await prisma.department.findMany()
    console.log(`Found ${depts.length} departments:`)
    depts.forEach(d => console.log(` - ${d.name}`))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
