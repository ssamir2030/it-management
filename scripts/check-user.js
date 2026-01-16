const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkUser() {
    const email = process.argv[2] || 'qtdeccan@gmail.com'

    console.log(`\n🔍 Checking user: ${email}\n`)

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                password: true,
                createdAt: true
            }
        })

        if (!user) {
            console.log('❌ User NOT FOUND in database!')
            console.log('\nTry running:')
            console.log('  npx prisma studio')
            console.log('\nTo view all users in the database.')
            return
        }

        console.log('✅ User found!')
        console.log('─'.repeat(50))
        console.log('ID:', user.id)
        console.log('Name:', user.name)
        console.log('Email:', user.email)
        console.log('Role:', user.role)
        console.log('Created:', user.createdAt)
        console.log('Has Password:', user.password ? 'YES ✅' : 'NO ❌')

        if (user.password) {
            console.log('Password Hash:', user.password.substring(0, 20) + '...')

            // Test password
            const testPassword = process.argv[3]
            if (testPassword) {
                console.log('\n🔑 Testing password...')
                const match = await bcrypt.compare(testPassword, user.password)
                if (match) {
                    console.log('✅ Password MATCHES!')
                } else {
                    console.log('❌ Password DOES NOT MATCH!')
                }
            } else {
                console.log('\nTo test a password, run:')
                console.log(`  node scripts/check-user.js ${email} <password>`)
            }
        }
        console.log('─'.repeat(50))
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUser()
