
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Testing License Fetching...');
    try {
        const licenses = await prisma.softwareLicense.findMany({
            include: {
                _count: {
                    select: { assets: true }
                }
            }
        })
        console.log('✅ Success! Found ' + licenses.length + ' licenses.');
        console.log('Schema is correctly synced.');
    } catch (error) {
        console.error('❌ Error fetching licenses:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect()
    }
}

main()
