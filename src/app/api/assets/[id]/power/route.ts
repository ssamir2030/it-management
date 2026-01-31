
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PowerService } from '@/lib/power'
import { logAction } from '@/lib/logger'

const prisma = new PrismaClient()

// POST /api/assets/[id]/power
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { action, message, url, app, process: processName } = await request.json()
        const idOrIp = params.id

        // 1. Fetch Asset Details - Try by ID first, then by IP Address
        let asset = await prisma.asset.findUnique({
            where: { id: idOrIp },
            include: { technicalDetails: true }
        })

        // If not found by ID, try finding by IP Address (for Veyon integration)
        if (!asset) {
            asset = await prisma.asset.findFirst({
                where: { ipAddress: idOrIp },
                include: { technicalDetails: true }
            })
        }

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
        }

        // 2. Determine Target (IP or Hostname)
        // Prefer IP, fallback to Computer Name
        const target = asset.ipAddress || asset.technicalDetails?.computerName

        if (!target && action !== 'WAKE') {
            return NextResponse.json({ error: 'Asset has no IP or Hostname' }, { status: 400 })
        }

        let success = false
        let details = ''

        // 3. Execute Action via PowerService
        // PowerService handles the choice between Agent (priority) and Veyon (legacy)

        switch (action) {
            case 'WAKE':
                if (!asset.macAddress) return NextResponse.json({ error: 'MAC Required' }, { status: 400 })
                success = await PowerService.wakeUp(asset.macAddress)
                details = 'WoL Packet Sent'
                break;

            case 'SHUTDOWN':
                success = await PowerService.shutdown(target!);
                details = 'Shutdown command sent';
                break;

            case 'REBOOT':
                success = await PowerService.reboot(target!);
                details = 'Reboot command sent';
                break;

            case 'LOCK':
                success = await PowerService.lock(target!);
                details = 'Lock command sent';
                break;

            case 'UNLOCK':
                success = await PowerService.unlock(target!);
                details = 'Unlock command sent';
                break;

            case 'LOGOFF':
                success = await PowerService.logoff(target!);
                details = 'Logoff command sent';
                break;

            case 'MESSAGE':
                if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })
                success = await PowerService.sendMessage(target!, message);
                details = 'Message sent';
                break;

            case 'OPEN_URL':
                if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })
                success = await PowerService.openUrl(target!, url);
                details = 'Open URL command sent';
                break;

            case 'LAUNCH_APP':
                if (!app) return NextResponse.json({ error: 'App path required' }, { status: 400 })
                success = await PowerService.launchApp(target!, app);
                details = 'Launch App command sent';
                break;

            case 'SCREENSHOT':
                success = await PowerService.requestScreenshot(target!);
                details = 'Screenshot requested. Check Command Queue.';
                break;

            case 'KILL_PROCESS':
                if (!processName) return NextResponse.json({ error: 'Process name required' }, { status: 400 })
                success = await PowerService.killProcess(target!, processName);
                details = 'Kill process command sent';
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        // 4. Log Action
        await logAction({
            userId: 'api-user',
            userName: 'API User',
            action: 'UPDATE',
            entity: 'ASSET',
            entityId: asset.id,
            details: { powerAction: action, success, message: details }
        })

        if (success) {
            return NextResponse.json({ success: true, message: details })
        } else {
            return NextResponse.json({ success: false, message: 'Command failed or Agent/Veyon unreachable' }, { status: 500 })
        }

    } catch (error) {
        console.error('[API_POWER] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
