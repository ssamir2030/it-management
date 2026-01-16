const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function changePassword() {
    const email = 'admin@system.com';
    const newPassword = '123456';

    console.log('🔐 Changing admin password to: 123456');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    console.log('✅ Password changed successfully!');
    console.log('');
    console.log('New login credentials:');
    console.log('  Email:    admin@system.com');
    console.log('  Password: 123456');
    console.log('');

    await prisma.$disconnect();
}

changePassword();
