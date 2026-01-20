import { NextResponse } from 'next/server'

export async function POST() {
    // For JWT-based auth, logout is handled client-side
    // Just return success
    return NextResponse.json({ success: true, message: 'تم تسجيل الخروج' })
}
