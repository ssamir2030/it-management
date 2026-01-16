'use client'
import { Monitor, CheckCircle2, AlertTriangle, AlertCircle, Cpu, HardDrive, Calendar, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Device { id: string; name: string; type: string; tag: string; healthScore: number; healthStatus: 'GOOD' | 'FAIR' | 'POOR'; issues: string[]; purchaseDate?: string; warrantyExpiry?: string; technicalDetails?: { ram?: string; storage?: string; processor?: string } }

export function DeviceHealthClient({ devices }: { devices: Device[] }) {
    const getHealthColor = (status: string) => {
        if (status === 'GOOD') return 'text-green-600'
        if (status === 'FAIR') return 'text-yellow-600'
        return 'text-red-600'
    }
    const getHealthBadge = (status: string) => {
        const styles: Record<string, string> = { GOOD: 'bg-green-100 text-green-700', FAIR: 'bg-yellow-100 text-yellow-700', POOR: 'bg-red-100 text-red-700' }
        const labels: Record<string, string> = { GOOD: 'ممتاز', FAIR: 'متوسط', POOR: 'يحتاج اهتمام' }
        return <Badge className={styles[status]}>{labels[status]}</Badge>
    }

    return (
        <div className="space-y-6">
            <div><h1 className="text-3xl font-bold">أجهزتي</h1><p className="text-muted-foreground">تفاصيل وحالة الأجهزة المخصصة لك</p></div>
            {devices.length === 0 ? <Card><CardContent className="py-12 text-center"><Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-lg font-medium">لا توجد أجهزة مخصصة لك</p></CardContent></Card> :
                <div className="grid gap-6">{devices.map(device => (
                    <Card key={device.id} className={device.healthStatus === 'POOR' ? 'border-red-200' : device.healthStatus === 'FAIR' ? 'border-yellow-200' : ''}>
                        <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-3"><Monitor className="h-6 w-6" />{device.name}</CardTitle>{getHealthBadge(device.healthStatus)}</div></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4"><div className="flex-1"><div className="flex justify-between mb-2"><span className="text-sm text-muted-foreground">حالة الجهاز</span><span className={`font-bold ${getHealthColor(device.healthStatus)}`}>{device.healthScore}%</span></div><Progress value={device.healthScore} className={`h-3 ${device.healthStatus === 'GOOD' ? '[&>div]:bg-green-500' : device.healthStatus === 'FAIR' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`} /></div></div>
                            {device.issues.length > 0 && <div className="bg-yellow-50 rounded-lg p-4"><h4 className="font-medium flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-yellow-600" />ملاحظات</h4><ul className="space-y-1">{device.issues.map((issue, i) => <li key={i} className="text-sm text-yellow-700">• {issue}</li>)}</ul></div>}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2"><Badge variant="outline" className="font-mono">{device.tag}</Badge></div>
                                {device.technicalDetails?.ram && <div className="flex items-center gap-2 text-sm"><Cpu className="h-4 w-4 text-muted-foreground" /><span>RAM: {device.technicalDetails.ram}</span></div>}
                                {device.technicalDetails?.storage && <div className="flex items-center gap-2 text-sm"><HardDrive className="h-4 w-4 text-muted-foreground" /><span>Storage: {device.technicalDetails.storage}</span></div>}
                                {device.warrantyExpiry && <div className="flex items-center gap-2 text-sm"><Shield className="h-4 w-4 text-muted-foreground" /><span>الضمان: {new Date(device.warrantyExpiry) > new Date() ? 'ساري' : 'منتهي'}</span></div>}
                            </div>
                        </CardContent>
                    </Card>
                ))}</div>}
        </div>
    )
}
