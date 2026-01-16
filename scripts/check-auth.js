const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

async function check() {
    console.log('--- Checking Environment ---');
    const envPath = path.join(__dirname, '..', '.env');

    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found!');
        return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            envVars[key] = value;
        }
    });

    // Check NEXTAUTH_SECRET
    if (envVars.NEXTAUTH_SECRET) {
        console.log(`✅ NEXTAUTH_SECRET is set (length: ${envVars.NEXTAUTH_SECRET.length})`);
    } else {
        console.error('❌ NEXTAUTH_SECRET is MISSING!');
    }

    // Check NEXTAUTH_URL
    if (envVars.NEXTAUTH_URL) {
        console.log(`✅ NEXTAUTH_URL is set to: ${envVars.NEXTAUTH_URL}`);
        if (!envVars.NEXTAUTH_URL.includes('4002')) {
            console.warn('⚠️ NEXTAUTH_URL does not match port 4002 (check package.json dev script)');
        }
    } else {
        console.error('❌ NEXTAUTH_URL is MISSING!');
    }

    // Check Database
    console.log('\n--- Checking Database Connection ---');
    const prisma = new PrismaClient();
    try {
        await prisma.$connect();
        console.log('✅ Database connection successful');

        const userCount = await prisma.user.count();
        console.log(`✅ Found ${userCount} users in the database`);

        // Check for admin user
        const admin = await prisma.user.findFirst({
            where: { email: 'admin@system.com' }
        });
        if (admin) {
            console.log('✅ Admin user found: admin@system.com');
            if (admin.password) {
                console.log('✅ Admin user has a password set');
            } else {
                console.warn('⚠️ Admin user has NO password set');
            }
        } else {
            console.warn('⚠️ Admin user (admin@system.com) NOT found');
        }

    } catch (e) {
        console.error('❌ Database connection failed:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
