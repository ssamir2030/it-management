const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyLogin() {
    console.log('\n--- Login Verification ---');
    const email = 'admin@system.com';
    const passwordToCheck = 'password';

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.error(`❌ User ${email} NOT found in database!`);
            console.log('Creating admin user...');

            const hashedPassword = await bcrypt.hash(passwordToCheck, 10);
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'ADMIN',
                    name: 'System Admin'
                }
            });
            console.log('✅ Admin user created successfully!');
            console.log('Email: admin@system.com');
            console.log('Password: password');
            return;
        }

        console.log(`✅ User found: ${user.email} (Role: ${user.role})`);

        if (!user.password) {
            console.error('❌ User has NO password hash stored!');
            console.log('Setting password...');
            const hashedPassword = await bcrypt.hash(passwordToCheck, 10);
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });
            console.log('✅ Password set successfully!');
            return;
        }

        const isMatch = await bcrypt.compare(passwordToCheck, user.password);

        if (isMatch) {
            console.log(`✅ Password verification SUCCESSFUL for '${passwordToCheck}'`);
            console.log('✅ Login should work with:');
            console.log('   Email: admin@system.com');
            console.log('   Password: password');
        } else {
            console.error(`❌ Password verification FAILED for '${passwordToCheck}'`);
            console.log('Resetting password to "password"...');
            const hashedPassword = await bcrypt.hash(passwordToCheck, 10);
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });
            console.log('✅ Password has been reset to "password".');
            console.log('✅ Try logging in with:');
            console.log('   Email: admin@system.com');
            console.log('   Password: password');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyLogin();
