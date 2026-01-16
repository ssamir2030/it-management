const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const prisma = new PrismaClient()

const SALT_ROUNDS = 10

async function main() {
    console.log('🔐 Starting password generation for employees...')

    try {
        // جلب جميع الموظفين الذين ليس لديهم كلمة مرور
        const employees = await prisma.employee.findMany({
            where: {
                OR: [
                    { password: null },
                    { password: '' }
                ]
            },
            select: {
                id: true,
                name: true,
                identityNumber: true,
                email: true
            }
        })

        if (employees.length === 0) {
            console.log('✅ All employees already have passwords!')
            return
        }

        console.log(`Found ${employees.length} employees without passwords`)

        const employeePasswords = []

        for (const employee of employees) {
            // استخدام آخر 4 أرقام من رقم الهوية ككلمة مرور مبدئية
            const defaultPassword = employee.identityNumber.slice(-4)
            const hashedPassword = await bcrypt.hash(defaultPassword, SALT_ROUNDS)

            await prisma.employee.update({
                where: { id: employee.id },
                data: { password: hashedPassword }
            })

            employeePasswords.push({
                name: employee.name,
                identityNumber: employee.identityNumber,
                email: employee.email,
                password: defaultPassword
            })

            console.log(`✓ Generated password for: ${employee.name}`)
        }

        console.log('\n' + '='.repeat(70))
        console.log('✅ Password generation completed successfully!')
        console.log('='.repeat(70))
        console.log('\n📋 EMPLOYEE CREDENTIALS (SAVE THIS SECURELY):')
        console.log('='.repeat(70))

        employeePasswords.forEach((emp, index) => {
            console.log(`\n${index + 1}. الموظف: ${emp.name}`)
            console.log(`   رقم الهوية: ${emp.identityNumber}`)
            console.log(`   كلمة المرور المبدئية: ${emp.password}`)
            console.log(`   البريد: ${emp.email}`)
        })

        console.log('\n' + '='.repeat(70))
        console.log('⚠️  تنبيه أمني:')
        console.log('   - يجب على كل موظف تغيير كلمة المرور عند أول تسجيل دخول')
        console.log('   - كلمات المرور المبدئية هي آخر 4 أرقام من رقم الهوية')
        console.log('   - احفظ هذه المعلومات في مكان آمن')
        console.log('='.repeat(70))

    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
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
