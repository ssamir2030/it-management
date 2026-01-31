
import { GET } from '../src/app/api/integrations/veyon/directory/route'

async function main() {
    console.log('🧪 Testing Veyon Directory Endpoint Integration...')

    try {
        // Invoke the API handler directly
        const response = await GET()

        if (!response.ok) {
            console.error('❌ API returned error status:', response.status)
            process.exit(1)
        }

        const data = await response.json()

        console.log('✅ API Call Successful!')
        console.log('📂 Response Data Structure:')
        console.log(JSON.stringify(data, null, 2))

        // Basic validation
        if (data.format === 'VeyonNetworkDirectory' && Array.isArray(data.data)) {
            console.log('\n✅ Validation Passed: Format matches Veyon specification.')
        } else {
            console.error('\n❌ Validation Failed: Unexpected format.')
        }

    } catch (error) {
        console.error('❌ Test Failed:', error)
    }
}

main()
