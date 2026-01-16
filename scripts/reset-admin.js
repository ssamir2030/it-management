const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
    const email = 'admin@system.com';
    const newPassword = 'password'; // Simple password for testing

    console.log(`Resetting password for ${email}...`);

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                name: 'System Admin'
            },
            create: {
                email,
                password: hashedPassword,
                role: 'ADMIN',
                name: 'System Admin'
            }
        });

        console.log('✅ Password reset successfully!');
        console.log('----------------------------------------');
        console.log('Email:    ' + email);
        console.log('Password: ' + newPassword);
        console.log('----------------------------------------');
        console.log('Please try logging in with these credentials.');

    } catch (error) {
        console.error('❌ Error resetting password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPassword();
