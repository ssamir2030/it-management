
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const packages = await prisma.softwarePackage.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(packages)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const json = await request.json()
        const pkg = await prisma.softwarePackage.create({
            data: {
                name: json.name,
                version: json.version,
                downloadUrl: json.downloadUrl,
                silentArgs: json.silentArgs,
                description: json.description,
                isSystemAgent: json.isSystemAgent || false
            }
        })
        return NextResponse.json(pkg)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
    }
}
