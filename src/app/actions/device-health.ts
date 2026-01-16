'use server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function getEmployeeDeviceHealth(employeeId: string) {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { assets: { include: { technicalDetails: true } } }
        })
        if (!employee) return { success: false, error: 'الموظف غير موجود' }
        const devicesWithHealth = employee.assets.map(asset => {
            let healthScore = 100; const issues: string[] = []
            if (asset.purchaseDate) {
                const ageMonths = Math.floor((Date.now() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
                if (ageMonths > 48) { healthScore -= 30; issues.push('الجهاز قديم (أكثر من 4 سنوات)') }
                else if (ageMonths > 36) { healthScore -= 15; issues.push('يحتاج مراجعة (أكثر من 3 سنوات)') }
            }
            if (asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date()) { healthScore -= 10; issues.push('انتهى الضمان') }
            if (asset.technicalDetails?.ram) { const ramGB = parseInt(asset.technicalDetails.ram); if (ramGB < 8) { healthScore -= 20; issues.push('الرام أقل من 8GB') } }
            return { ...asset, healthScore: Math.max(0, healthScore), issues, healthStatus: (healthScore >= 80 ? 'GOOD' : healthScore >= 50 ? 'FAIR' : 'POOR') as 'GOOD' | 'FAIR' | 'POOR' }
        })
        return { success: true, data: devicesWithHealth }
    } catch (error) { console.error('Error:', error); return { success: false, error: 'فشل في جلب البيانات' } }
}

export async function getPredictiveMaintenanceReport() {
    try {
        const session = await auth()
        if (!session?.user || session.user.role !== 'ADMIN') return { success: false, error: 'غير مصرح' }
        const assets = await prisma.asset.findMany({ where: { deletedAt: null, status: { not: 'RETIRED' } }, include: { employee: { select: { id: true, name: true } }, technicalDetails: true } })
        const predictions = assets.map(asset => {
            let riskScore = 0; const recommendations: string[] = []
            if (asset.purchaseDate) {
                const ageMonths = Math.floor((Date.now() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
                if (ageMonths > 48) { riskScore += 40; recommendations.push('يُنصح باستبدال الجهاز') }
                else if (ageMonths > 36) { riskScore += 20; recommendations.push('جدولة صيانة وقائية') }
            }
            if (asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date()) { riskScore += 15; recommendations.push('تجديد الضمان') }
            if (asset.technicalDetails?.ram) { const ramGB = parseInt(asset.technicalDetails.ram); if (ramGB < 8) { riskScore += 25; recommendations.push('ترقية الرام') } }
            const riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW'
            return { assetId: asset.id, assetName: asset.name, assetTag: asset.tag, employeeName: asset.employee?.name || 'غير مخصص', riskScore: Math.min(100, riskScore), riskLevel, recommendations }
        }).filter(p => p.riskScore > 0).sort((a, b) => b.riskScore - a.riskScore)
        return { success: true, data: predictions }
    } catch (error) { console.error('Error:', error); return { success: false, error: 'فشل في جلب البيانات' } }
}
