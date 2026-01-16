
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function resetAndVerify() {
    const identityNumber = '2321034111'
    const newPassword = '123456'

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update
    await prisma.employee.update({
        where: { identityNumber },
        data: { password: hashedPassword }
    })
    console.log(`Password reset for ${identityNumber} to ${newPassword}`)

    // Verify
    const emp = await prisma.employee.findUnique({
        where: { identityNumber }
    })

    const isValid = await bcrypt.compare(newPassword, emp.password)
    console.log('Login verification:', isValid ? 'SUCCESS' : 'FAILED')
}

resetAndVerify()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
