
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const lastCommand = await prisma.agentCommand.findFirst({
        orderBy: { createdAt: 'desc' },
        take: 1
    });
    console.log('Last Command:', lastCommand);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
