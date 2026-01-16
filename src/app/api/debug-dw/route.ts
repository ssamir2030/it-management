import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
    const DW_API_KEY = process.env.DW_API_KEY || ''
    const DW_API_SECRET = process.env.DW_API_SECRET || ''

    const debugInfo: Record<string, unknown> = {
        env: {
            DW_API_KEY_EXISTS: !!DW_API_KEY,
            DW_API_KEY_LEN: DW_API_KEY.length,
            DW_API_KEY_PREFIX: DW_API_KEY.substring(0, 4) + '***',
            DW_API_SECRET_EXISTS: !!DW_API_SECRET,
            DW_API_SECRET_LEN: DW_API_SECRET.length,
            DW_API_SECRET_PREFIX: DW_API_SECRET.substring(0, 4) + '***',
            NODE_ENV: process.env.NODE_ENV
        },
        time: {
            serverTime: new Date().toISOString(),
            timestampMs: Date.now().toString(),
            timestampSec: Math.floor(Date.now() / 1000).toString()
        }
    }

    try {
        const curtime = Date.now().toString()
        const signature = crypto
            .createHmac('sha1', DW_API_SECRET)
            .update(curtime)
            .digest('base64')

        const headerValue = `HM1 ${DW_API_KEY}:${signature}:${curtime}`

        debugInfo.auth = {
            curtime,
            signature,
            headerValue
        }

        const response = await fetch('https://www.apiremoteaccess.com/en/api/json/agents', {
            method: 'GET',
            headers: {
                'X-DW-Authorization': headerValue,
                'Content-Type': 'application/json'
            }
        })

        debugInfo.apiResponse = {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: await response.text()
        }

    } catch (error: unknown) {
        if (error instanceof Error) {
            debugInfo.error = {
                message: error.message,
                stack: error.stack
            }
        } else {
            debugInfo.error = {
                message: String(error)
            }
        }
    }

    return NextResponse.json(debugInfo, { status: 200 })
}
