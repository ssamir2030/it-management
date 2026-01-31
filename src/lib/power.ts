

import dgram from 'dgram'
import { exec } from 'child_process'
import util from 'util'
import prisma from "@/lib/prisma"

const execPromise = util.promisify(exec)

/**
 * PowerService: Handles power state of remote assets.
 * Integrates native WoL (Wake-on-LAN), Agent Command Queue, and legacy Veyon CLI.
 */
export class PowerService {

    /**
     * Sends a Magic Packet to wake up a computer (Wake-on-LAN).
     */
    static async wakeUp(macAddress: string, broadcastAddress: string = '255.255.255.255'): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const mac = macAddress.replace(/[:\-\.]/g, '')
                if (mac.length !== 12) throw new Error('Invalid MAC address format')

                const magicPacket = Buffer.alloc(102)

                // Header: 6 bytes of 0xFF
                for (let i = 0; i < 6; i++) {
                    magicPacket[i] = 0xff
                }

                // Payload: MAC address repeated 16 times
                const macBuffer = Buffer.from(mac, 'hex')
                for (let i = 0; i < 16; i++) {
                    macBuffer.fill(macBuffer, i * 6, (i + 1) * 6)
                    for (let j = 0; j < 6; j++) {
                        magicPacket[6 + i * 6 + j] = macBuffer[j]
                    }
                }

                const socket = dgram.createSocket('udp4')
                socket.on('error', (err) => {
                    socket.close()
                    reject(err)
                })

                socket.send(magicPacket, 0, magicPacket.length, 9, broadcastAddress, (err) => {
                    socket.close()
                    if (err) reject(err)
                    else {
                        console.log(`[PowerService] WoL packet sent to ${macAddress}`)
                        resolve(true)
                    }
                })
            } catch (error) {
                console.error('[PowerService] WoL Error:', error)
                reject(error)
            }
        })
    }


    /**
     * Shuts down a remote computer.
     */
    static async shutdown(target: string): Promise<boolean> {
        // Try Agent first using PowerShell command directly (fallback to Invoke-Expression in agent)
        if (await this.queueAgentCommand(target, 'Stop-Computer -Force')) return true;
        // Fallback to Veyon
        return await this.executeVeyonCommand('power shutdown', target)
    }

    /**
     * Reboots a remote computer.
     */
    static async reboot(target: string): Promise<boolean> {
        if (await this.queueAgentCommand(target, 'Restart-Computer -Force')) return true;
        return await this.executeVeyonCommand('power reboot', target)
    }

    /**
     * Locks the remote screen.
     */
    static async lock(target: string): Promise<boolean> {
        if (await this.queueAgentCommand(target, 'LOCK')) return true;
        return await this.executeVeyonCommand('feature start screen-lock', target)
    }

    /**
     * Unlocks the remote screen.
     */
    static async unlock(target: string): Promise<boolean> {
        // Agent does not support unlock yet (security restriction)
        return await this.executeVeyonCommand('feature stop screen-lock', target)
    }

    /**
     * Logs off the current user.
     */
    static async logoff(target: string): Promise<boolean> {
        if (await this.queueAgentCommand(target, 'LOGOFF')) return true;
        return await this.executeVeyonCommand('power logoff', target) // Veyon CLI check needed for exact command
    }

    /**
     * Opens a URL on the remote computer.
     */
    static async openUrl(target: string, url: string): Promise<boolean> {
        // Agent regex: ^OPEN_URL (.*)
        if (await this.queueAgentCommand(target, 'OPEN_URL', url)) return true;
        return false;
    }

    /**
     * Sends a text message to the remote computer.
     */
    static async sendMessage(target: string, message: string): Promise<boolean> {
        // Agent regex: ^MESSAGE (.*)
        if (await this.queueAgentCommand(target, 'MESSAGE', message)) return true;

        // Fallback to Windows 'msg' command
        try {
            const cmd = `msg * /server:${target} "${message}"`
            await execPromise(cmd, { timeout: 5000 })
            return true
        } catch (e) {
            console.error('[PowerService] msg command failed, trying Veyon...', e)
            return await this.executeVeyonCommand('feature start text-message', target)
        }
    }

    /**
     * Kills a process by ID or Name.
     */
    static async killProcess(target: string, processIdOrName: string): Promise<boolean> {
        // We can send raw PowerShell to Stop-Process
        // Or if agent has a handler? No, agent doesn't have KILL_PROCESS handler in the viewed code.
        // It falls back to Invoke-Expression.
        // So we send: Stop-Process -Name "processName" -Force or Stop-Process -Id 123 -Force

        let cmd = '';
        if (/^\d+$/.test(processIdOrName)) {
            cmd = `Stop-Process -Id ${processIdOrName} -Force`
        } else {
            cmd = `Stop-Process -Name "${processIdOrName}" -Force`
        }

        if (await this.queueAgentCommand(target, cmd)) return true;
        return false;
    }

    /**
     * Launches an application on the remote computer.
     */
    static async launchApp(target: string, appPath: string): Promise<boolean> {
        // Agent regex: ^LAUNCH_APP (.*)
        if (await this.queueAgentCommand(target, 'LAUNCH_APP', appPath)) return true;
        return false;
    }

    /**
     * Requests a screenshot from the remote computer.
     */
    static async requestScreenshot(target: string): Promise<boolean> {
        if (await this.queueAgentCommand(target, 'GET_SCREENSHOT')) return true;
        // Fallback or Veyon screenshot? Veyon has 'feature start screenshot'?
        // Veyon Master usually does this via its proprietary protocol, not CLI easily.
        return false;
    }



    // --- Private Helpers ---

    /**
     * Attempts to queue a command for the Agent.
     * Returns true if successful (device found & command queued), false otherwise.
     */
    private static async queueAgentCommand(target: string, command: string, params: string = ''): Promise<boolean> {
        try {
            // Find device by IP or Hostname (Target acts as either)
            // We prioritize matching agentKey devices
            const device = await prisma.discoveredDevice.findFirst({
                where: {
                    OR: [
                        { ipAddress: target },
                        { hostname: { equals: target, mode: 'insensitive' } }
                    ],
                    agentKey: { not: null } // Must have an agent
                }
            });

            if (!device || !device.agentKey) return false;

            // Agent expects space separation for keywords like OPEN_URL <url>
            // For raw commands (Stop-Computer), we just send the command.
            const fullCommand = params ? `${command} ${params}` : command;

            await prisma.agentCommand.create({
                data: {
                    deviceId: device.id,
                    command: fullCommand,
                    status: 'PENDING'
                }
            });

            console.log(`[PowerService] Agent command queued for ${target}: ${fullCommand}`);
            return true;

        } catch (error) {
            console.error('[PowerService] Failed to queue agent command:', error);
            return false;
        }
    }

    /**
     * Internal helper to execute Veyon commands safely
     */
    private static async executeVeyonCommand(command: string, target: string): Promise<boolean> {
        try {
            console.log(`[PowerService] Executing Veyon: ${command} on ${target}`)

            const veyonPath = process.env.VEYON_CLI_PATH
            const isSimulation = !veyonPath || veyonPath === 'mock'

            if (isSimulation) {
                console.log('⚡ [SIMULATION] Command would run:', `veyon-cli ${command} ${target}`)
                await new Promise(r => setTimeout(r, 800))
                return true
            }

            const cmd = `${veyonPath} ${command} ${target}`
            const { stdout, stderr } = await execPromise(cmd, { timeout: 10000 })

            if (stderr) console.warn('[PowerService] Veyon Stderr:', stderr)
            return true

        } catch (error) {
            console.error('[PowerService] Veyon Execution Failed:', error)
            return false
        }
    }
}

