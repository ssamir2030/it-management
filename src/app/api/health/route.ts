import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        server: 'IT Asset Manager',
        version: '2.5.0',
        timestamp: new Date().toISOString()
    })
}

// HEAD request for Agent health check
export async function HEAD() {
    return new NextResponse(null, { status: 200 })
}
