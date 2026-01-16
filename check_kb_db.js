
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const userCount = await prisma.user.count()
        const articleCount = await prisma.article.count()
        const categoryCount = await prisma.articleCategory.count()

        console.log(`Users: ${userCount}`)
        console.log(`Articles: ${articleCount}`)
        console.log(`Categories: ${categoryCount}`)

        if (userCount > 0) {
            const firstUser = await prisma.user.findFirst()
            console.log(`First User: ${JSON.stringify(firstUser)}`)
        }

        if (categoryCount > 0) {
            const categories = await prisma.articleCategory.findMany()
            console.log(`Categories: ${JSON.stringify(categories)}`)
        }

    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
