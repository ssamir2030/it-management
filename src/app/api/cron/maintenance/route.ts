import { NextResponse } from 'next/server'
import { runMaintenanceScheduler } from '@/app/actions/run-scheduler'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    // Basic security check (Optional: verify a secret header)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const start = Date.now()
    const result = await runMaintenanceScheduler()
    const duration = Date.now() - start

    if (result.success) {
        return NextResponse.json({
            success: true,
            message: `Maintenance run completed. Created ${result.count} tickets.`,
            duration: `${duration}ms`
        })
    } else {
        return NextResponse.json({
            success: false,
            error: result.error
        }, { status: 500 })
    }
}
