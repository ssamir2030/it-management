/**
 * سكريبت عرض جميع المستخدمين (الأدمن)
 * 
 * الاستخدام:
 * npx ts-node scripts/list-admins.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            deletedAt: true
        },
        orderBy: { createdAt: 'desc' }
    })

    console.log('\n📋 قائمة مستخدمي النظام (Admin):\n')
    console.log('─'.repeat(80))

    users.forEach((user, index) => {
        const status = !user.deletedAt ? '🟢 نشط' : '🔴 محذوف'
        console.log(`${index + 1}. ${user.name}`)
        console.log(`   البريد: ${user.email}`)
        console.log(`   الدور: ${user.role}`)
        console.log(`   الحالة: ${status}`)
        console.log(`   ID: ${user.id}`)
        console.log('─'.repeat(80))
    })

    console.log(`\nإجمالي المستخدمين: ${users.length}`)
}

main()
    .catch((e) => {
        console.error('❌ خطأ:', e.message)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
