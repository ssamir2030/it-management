
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkEmployees() {
    const employees = await prisma.employee.findMany({
        select: {
            id: true,
            name: true,
            identityNumber: true,
            password: true
        }
    })

    console.log('Employees found:', employees.length)
    employees.forEach(emp => {
        console.log(`- Name: ${emp.name}, ID: ${emp.identityNumber}, Has Password: ${!!emp.password}`)
    })
}

checkEmployees()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
