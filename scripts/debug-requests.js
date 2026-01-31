
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking latest completed consumable requests...");
    const requests = await prisma.employeeRequest.findMany({
        where: {
            type: 'CONSUMABLE',
            status: 'COMPLETED'
        },
        orderBy: {
            completedAt: 'desc'
        },
        take: 10
    });

    for (const req of requests) {
        console.log(`ID: ${req.id}`);
        console.log(`Subject: ${req.subject}`);
        console.log(`Details: ${req.details?.substring(0, 200)}...`);
        console.log("-------------------");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
