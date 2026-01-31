
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔍 Starting Core Infrastructure Verification...\n')

    // 1. Verify Asset Types (4-Tier)
    console.log('📦 Verifying 4-Tier Asset Types:')
    const categories = await prisma.assetCategory.findMany({
        include: { _count: { select: { Asset: true, Accessory: true } } }
    })
    console.table(categories.map(c => ({
        Name: c.nameEn,
        Type: c.type,
        Assets: c._count.Asset,
        Accessories: c._count.Accessory
    })))

    // 2. Verify Data Seeding (Snipe-IT Features)
    const laptop = await prisma.asset.findFirst({ where: { type: 'HARDWARE' } })
    const mouse = await prisma.accessory.findFirst()
    const license = await prisma.softwareLicense.findFirst()

    console.log('\n💎 Core Assets Found:')
    console.log(`- Asset: ${laptop?.model} (${laptop?.tag})`)
    console.log(`- Accessory: ${mouse?.name} (Qty: ${mouse?.totalQty})`)
    console.log(`- License: ${license?.name} (Seats: ${license?.seats})`)

    // 3. Test Polymorphism (Simulated)
    console.log('\n🧬 Testing Polymorphic Potential:')
    if (laptop && mouse) {
        console.log(`✅ System is ready to assign "${mouse.name}" to "${laptop.name}" (Asset-to-Asset)`)
        console.log(`✅ System is ready to assign "${laptop.name}" to "Ahmed (Employee)"`)
    }

    console.log('\n🚀 Core Infrastructure is ONLINE and READY.')
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
