import { NextResponse } from 'next/server'
import { archivePastBookings } from '@/app/actions/admin-bookings'

export const dynamic = 'force-dynamic'

// This API can be called by a cron job to auto-archive past meetings
// Example: Call this endpoint daily at midnight

export async function GET(request: Request) {
    // Optional: Add secret key verification for security
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    // Basic protection - you can set this in environment variables
    const expectedSecret = process.env.CRON_SECRET || 'booking-cleanup-secret'

    if (secret !== expectedSecret) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const result = await archivePastBookings()

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: `تم أرشفة ${result.archivedCount} اجتماع منتهي`,
                archivedCount: result.archivedCount
            })
        } else {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Cron cleanup error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Also support POST for webhook-style triggers
export async function POST(request: Request) {
    return GET(request)
}
