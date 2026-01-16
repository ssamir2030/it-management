const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuthFlow() {
    console.log('================================');
    console.log('🔐 Testing Complete Auth Flow');
    console.log('================================\n');

    const email = 'admin@system.com';
    const passwordInput = 'password';

    // Step 1: Find user
    console.log('Step 1: Finding user in database...');
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.error('❌ User NOT found!');
        return;
    }

    console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasPassword: !!user.password
    });

    // Step 2: Test password
    if (!user.password) {
        console.error('❌ User has no password!');
        return;
    }

    console.log('\nStep 2: Testing password comparison...');
    console.log('Input password:', passwordInput);
    console.log('Stored hash length:', user.password.length);
    console.log('Hash starts with:', user.password.substring(0, 10));

    // Test 1: Direct comparison
    const match1 = await bcrypt.compare(passwordInput, user.password);
    console.log('Direct bcrypt.compare:', match1 ? '✅ MATCH' : '❌ NO MATCH');

    // Test 2: Try different variations
    const variations = [
        'password',
        'Password',
        'PASSWORD',
        'password ',
        ' password'
    ];

    console.log('\nStep 3: Testing password variations...');
    for (const variation of variations) {
        const match = await bcrypt.compare(variation, user.password);
        console.log(`  "${variation}": ${match ? '✅' : '❌'}`);
    }

    // Step 4: Create new hash and compare
    console.log('\nStep 4: Creating fresh hash and comparing...');
    const freshHash = await bcrypt.hash(passwordInput, 10);
    const freshMatch = await bcrypt.compare(passwordInput, freshHash);
    console.log('Fresh hash comparison:', freshMatch ? '✅ MATCH' : '❌ NO MATCH');

    // Step 5: Check if hash is valid bcrypt
    const bcryptRegex = /^\$2[ayb]\$.{56}$/;
    const isValidBcrypt = bcryptRegex.test(user.password);
    console.log('Stored hash is valid bcrypt format:', isValidBcrypt ? '✅ YES' : '❌ NO');

    // Final recommendation
    console.log('\n================================');
    if (match1) {
        console.log('✅ PASSWORD WORKS IN DIRECT TEST');
        console.log('The issue might be in NextAuth configuration or FormData parsing.');
    } else {
        console.log('❌ PASSWORD DOES NOT MATCH');
        console.log('Resetting password now...');
        const newHash = await bcrypt.hash('password', 10);
        await prisma.user.update({
            where: { email },
            data: { password: newHash }
        });
        console.log('✅ Password has been reset. Try logging in again.');
    }
    console.log('================================\n');

    await prisma.$disconnect();
}

testAuthFlow().catch(console.error);
