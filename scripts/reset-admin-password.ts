/**
 * سكريبت إعادة ضبط كلمة مرور الأدمن
 * 
 * الاستخدام:
 * npx ts-node scripts/reset-admin-password.ts <email> <new-password>
 * 
 * مثال:
 * npx ts-node scripts/reset-admin-password.ts admin@example.com MyNewPassword123
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    const newPassword = process.argv[3]

    if (!email || !newPassword) {
        console.log('❌ الاستخدام: npx ts-node scripts/reset-admin-password.ts <email> <new-password>')
        console.log('   مثال: npx ts-node scripts/reset-admin-password.ts admin@example.com MyNewPassword123')
        process.exit(1)
    }

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log(`❌ لم يتم العثور على مستخدم بالبريد: ${email}`)
        process.exit(1)
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // تحديث كلمة المرور
    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    })

    console.log(`✅ تم تحديث كلمة مرور المستخدم: ${user.name} (${email})`)
    console.log(`   كلمة المرور الجديدة: ${newPassword}`)
}

main()
    .catch((e) => {
        console.error('❌ خطأ:', e.message)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
