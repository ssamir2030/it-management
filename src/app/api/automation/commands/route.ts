import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Force dynamic to prevent build-time execution
export const dynamic = 'force-dynamic'

// GET - Agent polls for pending commands using AgentKey
export async function GET(req: NextRequest) {
    try {
        const agentKey = req.nextUrl.searchParams.get('agentKey')

        if (!agentKey) {
            return NextResponse.json({ error: "agentKey required" }, { status: 400 })
        }

        console.log(`[Commands] Agent polling: ${agentKey.substring(0, 8)}...`)

        // Find pending commands for this agent
        const commands = await prisma.agentCommand.findMany({
            where: {
                deviceId: agentKey,
                status: "PENDING"
            },
            orderBy: { createdAt: 'asc' },
            take: 10
        })

        console.log(`[Commands] Found ${commands.length} pending commands`)

        // Mark them as SENT
        if (commands.length > 0) {
            await prisma.agentCommand.updateMany({
                where: {
                    id: { in: commands.map((c: typeof commands[0]) => c.id) }
                },
                data: {
                    status: "SENT",
                    sentAt: new Date()
                }
            })
        }

        const response = {
            success: true,
            commands: commands.map((c: typeof commands[0]) => ({
                id: c.id,
                command: c.command
            }))
        }

        if (commands.length > 0) {
            console.log(`[Commands] Sending to agent:`, JSON.stringify(response))
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error("[Commands] Error:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// POST - Agent submits command result
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { commandId, success, result, error } = body

        if (!commandId) {
            return NextResponse.json({ error: "commandId required" }, { status: 400 })
        }

        console.log(`[Commands] Result received for ${commandId}: ${success ? 'SUCCESS' : 'FAILED'}`)

        await prisma.agentCommand.update({
            where: { id: commandId },
            data: {
                status: success ? "COMPLETED" : "FAILED",
                result: result || null,
                errorMessage: error || null,
                completedAt: new Date()
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("[Commands] Error updating:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
