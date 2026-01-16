import { auth } from '../src/auth'

async function testAuth() {
    console.log('Testing auth()...')
    try {
        const session = await auth()
        console.log('✅ Auth successful')
        console.log('Session:', JSON.stringify(session, null, 2))
    } catch (error) {
        console.error('❌ Auth failed:', error)
    }
}

testAuth()
