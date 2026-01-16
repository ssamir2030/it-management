const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = 'admin@system.com' // البريد الإلكتروني للمدير الحالي

    console.log(`Updating role for user: ${email}...`)

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            console.error('User not found!')
            // Try to find ANY user to make admin if specific email not found
            const firstUser = await prisma.user.findFirst()
            if (firstUser) {
                console.log(`Updating first found user: ${firstUser.email}`)
                await prisma.user.update({
                    where: { id: firstUser.id },
                    data: { role: 'SUPER_ADMIN' },
                })
                console.log('Successfully updated role to SUPER_ADMIN')
            } else {
                console.error('No users found in database.')
            }
            return
        }

        await prisma.user.update({
            where: { email },
            data: { role: 'SUPER_ADMIN' },
        })

        console.log('Successfully updated role to SUPER_ADMIN')
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
