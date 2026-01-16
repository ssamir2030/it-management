import crypto from 'crypto'

const DW_API_URL = 'https://www.apiremoteaccess.com/en/api/json'
const DW_API_KEY = process.env.DW_API_KEY || ''
const DW_API_SECRET = process.env.DW_API_SECRET || ''

export interface DWAgent {
    id: string
    name: string
    description?: string
    state: string // 'waiting installation' | 'online' | 'offline'
    os_type: string
    install_code: string
    supported_apps: string[]
}

export interface DWSession {
    id: string
    url: string
    agent_id: string
    app: string
}

// توليد Authorization Header
function generateAuth(method: string, path: string) {
    if (!DW_API_KEY || !DW_API_SECRET) {
        console.error("❌ DWService API Key or Secret is MISSING in environment variables!")
    } else {
        console.log(`🔑 Generating Auth for DWService: Key=${DW_API_KEY.substring(0, 4)}***, Secret=${DW_API_SECRET.substring(0, 4)}***`)
    }

    const curtime = Date.now().toString()
    // Signature is HMAC-SHA1 of curtime using the Secret
    const signature = crypto
        .createHmac('sha1', DW_API_SECRET)
        .update(curtime)
        .digest('base64')

    const headerValue = `HM1 ${DW_API_KEY}:${signature}:${curtime}`
    console.log(`📝 Generated Header: ${headerValue}`)

    return {
        'X-DW-Authorization': headerValue,
        'Content-Type': 'application/json'
    }
}

export class DWServiceClient {
    // إنشاء Agent جديد
    async createAgent(name: string, description?: string): Promise<DWAgent> {
        try {
            const path = '/agents'
            const headers = generateAuth('POST', path)

            const response = await fetch(`${DW_API_URL}${path}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name, description })
            })

            if (!response.ok) {
                const errorBody = await response.text()
                console.error(`DWService API Error (${response.status}):`, errorBody)
                throw new Error(`DWService API error: ${response.status} ${response.statusText} - ${errorBody}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error creating DWService agent:', error)
            throw error
        }
    }

    // جلب معلومات Agent
    async getAgent(agentId: string): Promise<DWAgent> {
        try {
            const path = `/agents/${agentId}`
            const headers = generateAuth('GET', path)

            const response = await fetch(`${DW_API_URL}${path}`, {
                method: 'GET',
                headers
            })

            if (!response.ok) {
                const errorBody = await response.text()
                console.error(`DWService API Error (${response.status}):`, errorBody)
                throw new Error(`DWService API error: ${response.status} ${response.statusText} - ${errorBody}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error fetching DWService agent:', error)
            throw error
        }
    }

    // إنشاء جلسة جديدة
    async createSession(agentId: string, app: string = 'screen'): Promise<DWSession> {
        try {
            const path = '/sessions'
            const headers = generateAuth('POST', path)

            const response = await fetch(`${DW_API_URL}${path}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    agent_id: agentId,
                    app
                })
            })

            if (!response.ok) {
                const errorBody = await response.text()
                console.error(`DWService API Error (${response.status}):`, errorBody)
                throw new Error(`DWService API error: ${response.status} ${response.statusText} - ${errorBody}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error creating DWService session:', error)
            throw error
        }
    }

    // إنهاء جلسة
    async destroySession(sessionId: string): Promise<void> {
        try {
            const path = `/sessions/${sessionId}`
            const headers = generateAuth('DELETE', path)

            const response = await fetch(`${DW_API_URL}${path}`, {
                method: 'DELETE',
                headers
            })

            if (!response.ok) {
                const errorBody = await response.text()
                console.error(`DWService API Error (${response.status}):`, errorBody)
                throw new Error(`DWService API error: ${response.status} ${response.statusText} - ${errorBody}`)
            }
        } catch (error) {
            console.error('Error destroying DWService session:', error)
            throw error
        }
    }

    // جلب جميع Agents
    async listAgents(): Promise<DWAgent[]> {
        try {
            const path = '/agents'
            const headers = generateAuth('GET', path)

            const response = await fetch(`${DW_API_URL}${path}`, {
                method: 'GET',
                headers
            })

            if (!response.ok) {
                const errorBody = await response.text()
                console.error(`DWService API Error (${response.status}):`, errorBody)
                throw new Error(`DWService API error: ${response.status} ${response.statusText} - ${errorBody}`)
            }

            const data = await response.json()
            return data.agents || []
        } catch (error) {
            console.error('Error listing DWService agents:', error)
            throw error
        }
    }

    // تحديث Agent
    async updateAgent(agentId: string, data: Partial<{ name: string; description: string }>): Promise<DWAgent> {
        try {
            const path = `/agents/${agentId}`
            const headers = generateAuth('PUT', path)

            const response = await fetch(`${DW_API_URL}${path}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errorBody = await response.text()
                console.error(`DWService API Error (${response.status}):`, errorBody)
                throw new Error(`DWService API error: ${response.status} ${response.statusText} - ${errorBody}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error updating DWService agent:', error)
            throw error
        }
    }

    // حذف Agent
    async deleteAgent(agentId: string): Promise<void> {
        try {
            const path = `/agents/${agentId}`
            const headers = generateAuth('DELETE', path)

            const response = await fetch(`${DW_API_URL}${path}`, {
                method: 'DELETE',
                headers
            })

            if (!response.ok) {
                const errorBody = await response.text()
                console.error(`DWService API Error (${response.status}):`, errorBody)
                throw new Error(`DWService API error: ${response.status} ${response.statusText} - ${errorBody}`)
            }
        } catch (error) {
            console.error('Error deleting DWService agent:', error)
            throw error
        }
    }
}

// مثيل واحد من الكلاس
export const dwServiceClient = new DWServiceClient()
