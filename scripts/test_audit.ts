
import { logAction } from '../src/lib/logger'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('📝 Testing Audit Log System...')

    // 0. Get a real user ID to satisfy Foreign Key constraint
    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@system.com' }
    })

    if (!adminUser) {
        console.error('❌ Admin user not found. Please run seed first.')
        process.exit(1)
    }

    // 1. Create a log entry
    await logAction({
        userId: adminUser.id,
        userName: adminUser.name || 'System Admin',
        action: 'CREATE',
        entity: 'ASSET',
        entityId: 'TEST-LOG-100',
        details: { note: 'Manual verification of audit system' }
    })

    // 2. Verify it exists in DB
    const log = await prisma.systemLog.findFirst({
        orderBy: { createdAt: 'desc' },
        where: { entityId: 'TEST-LOG-100' }
    })

    if (log) {
        console.log('✅ Audit Log verified successfully!')
        console.log(`   - Action: ${log.action}`)
        console.log(`   - Entity: ${log.entity}`)
        console.log(`   - User: ${log.userId}`)
        console.log(`   - Time: ${log.createdAt}`)
    } else {
        console.error('❌ Failed to verify log entry in database.')
    }
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
