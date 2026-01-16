// @ts-nocheck
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const devices = await prisma.discoveredDevice.findMany({
        orderBy: { lastSeen: 'desc' },
        take: 3
    })

    console.log("Found", devices.length, "devices.")
    devices.forEach(d => {
        console.log("------------------------------------------------")
        console.log(`Hostname: ${d.hostname} | IP: ${d.ipAddress}`)
        console.log(`Status: ${d.status}`)
        // Parse details safely
        let details = {}
        try {
            details = JSON.parse(d.details)
        } catch (e) {
            console.log("Error parsing details JSON")
        }
        console.log("Logged User:", details.username)
        console.log("Local Admins:", details.localAdmins)
        console.log("Full Details Keys:", Object.keys(details))
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
