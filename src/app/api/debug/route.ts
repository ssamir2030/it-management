import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Check Env Vars
        const secret = process.env.NEXTAUTH_SECRET ? "Loaded" : "Missing"
        const url = process.env.NEXTAUTH_URL

        // Check DB Connection
        const userCount = await prisma.user.count()

        return NextResponse.json({
            status: 'ok',
            env: {
                NEXTAUTH_SECRET: secret,
                NEXTAUTH_URL: url
            },
            db: {
                connected: true,
                userCount
            }
        })
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
