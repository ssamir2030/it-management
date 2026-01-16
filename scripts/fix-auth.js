const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fullDiagnosticAndFix() {
    console.log('================================');
    console.log('🔧 Full Authentication Diagnostic & Fix');
    console.log('================================\n');

    // Step 1: Check .env file
    console.log('📋 Step 1: Checking .env file...');
    const envPath = path.join(__dirname, '..', '.env');

    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file NOT FOUND!');
        console.log('Please create a .env file with:');
        console.log('NEXTAUTH_SECRET="fc85293407923745902384902384092384902384902384"');
        console.log('NEXTAUTH_URL="http://localhost:4002"');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSecret = envContent.includes('NEXTAUTH_SECRET');
    const hasUrl = envContent.includes('NEXTAUTH_URL');

    if (hasSecret) {
        console.log('✅ NEXTAUTH_SECRET found in .env');
    } else {
        console.error('❌ NEXTAUTH_SECRET NOT FOUND in .env!');
        console.log('Add this line to .env:');
        console.log('NEXTAUTH_SECRET="fc85293407923745902384902384092384902384902384"');
    }

    if (hasUrl) {
        console.log('✅ NEXTAUTH_URL found in .env');
    } else {
        console.error('❌ NEXTAUTH_URL NOT FOUND in .env!');
        console.log('Add this line to .env:');
        console.log('NEXTAUTH_URL="http://localhost:4002"');
    }

    // Step 2: Test Database Connection
    console.log('\n📋 Step 2: Testing database connection...');
    try {
        await prisma.$connect();
        console.log('✅ Database connection successful');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }

    // Step 3: Check/Fix Admin User
    console.log('\n📋 Step 3: Checking admin user...');
    const email = 'admin@system.com';
    const password = 'password';

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log('⚠️  Admin user not found, creating...');
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'ADMIN',
                name: 'System Admin'
            }
        });
        console.log('✅ Admin user created!');
    } else {
        console.log('✅ Admin user exists');
    }

    // Step 4: Verify Password
    console.log('\n📋 Step 4: Verifying admin password...');

    if (!user.password) {
        console.log('⚠️  No password set, setting password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log('✅ Password set successfully!');
    } else {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            console.log('✅ Password is correct!');
        } else {
            console.log('⚠️  Password mismatch, updating...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });
            console.log('✅ Password updated successfully!');
        }
    }

    // Step 5: Final Summary
    console.log('\n================================');
    console.log('✅ ALL CHECKS COMPLETE!');
    console.log('================================');
    console.log('\n📝 Login Credentials:');
    console.log('   Email:    admin@system.com');
    console.log('   Password: password');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Stop the dev server if running (Ctrl+C)');
    console.log('   2. Delete .next folder: Remove-Item -Recurse -Force .next');
    console.log('   3. Start dev server: npm run dev');
    console.log('   4. Open: http://localhost:4002/login');
    console.log('   5. Login with the credentials above');
    console.log('\n💡 Tips:');
    console.log('   - Make sure you type the email correctly');
    console.log('   - Password is case-sensitive');
    console.log('   - Check browser console (F12) for errors');
    console.log('   - Check terminal for authentication logs');
    console.log('\n');

    await prisma.$disconnect();
}

fullDiagnosticAndFix().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
