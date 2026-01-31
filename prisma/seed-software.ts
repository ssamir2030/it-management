
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding software packages...')

    const packages = [
        {
            name: 'Veyon Service (Client)',
            version: '4.9.0',
            downloadUrl: 'https://github.com/veyon/veyon/releases/download/v4.9.0/veyon-4.9.0.0-win64-setup.exe',
            silentArgs: '/S /NoMaster /ClearConfig',
            description: 'Lab management and monitoring service for client computers.',
            isSystemAgent: true,
        },
        {
            name: 'OCS Inventory Agent',
            version: '2.10.0',
            downloadUrl: 'https://github.com/OCSInventory-NG/WindowsAgent/releases/download/2.10.0.0/OCS-Windows-Agent-Setup-x64.exe',
            silentArgs: '/S /NOSPLASH /NO_START_MENU /SERVER=__SERVER_URL__',
            description: 'Asset discovery agent for hardware and software inventory.',
            isSystemAgent: true,
        },
        {
            name: 'DWService Agent',
            version: 'Latest',
            downloadUrl: 'https://www.dwservice.net/download/dwagent_x86.exe',
            silentArgs: '-silent -install',
            description: 'Remote access agent for internet-based control.',
            isSystemAgent: false,
        }
    ]

    for (const pkg of packages) {
        await prisma.softwarePackage.create({
            data: {
                id: crypto.randomUUID(),
                ...pkg,
                updatedAt: new Date()
            },
        })
        console.log(`Created package: ${pkg.name}`)
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
