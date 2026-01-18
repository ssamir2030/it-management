import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const trialEnabled = process.env.TRIAL_MODE === 'true'
    const expiryDateStr = process.env.TRIAL_EXPIRY_DATE

    if (!trialEnabled || !expiryDateStr) {
        return NextResponse.json({
            trialEnabled: false,
            daysRemaining: -1,
            expiryDate: null
        })
    }

    const expiryDate = new Date(expiryDateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expiryDate.setHours(23, 59, 59, 999)

    const timeDiff = expiryDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

    return NextResponse.json({
        trialEnabled: true,
        daysRemaining,
        expiryDate: expiryDateStr,
        isExpired: daysRemaining < 0
    })
}
