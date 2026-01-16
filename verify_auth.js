
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function verifyHash() {
    const identityNumber = '2321034111'
    const passwordAttempt = '123456'

    const emp = await prisma.employee.findUnique({
        where: { identityNumber }
    })

    if (!emp) {
        console.log('User not found')
        return
    }

    console.log('User found:', emp.name)
    console.log('Stored Hash:', emp.password)

    const isValid = await bcrypt.compare(passwordAttempt, emp.password)
    console.log(`Comparing '${passwordAttempt}' against hash...`)
    console.log('Result:', isValid)
}

verifyHash()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
