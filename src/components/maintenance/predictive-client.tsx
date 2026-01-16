'use client'
import { AlertTriangle, CheckCircle2, AlertCircle, Monitor, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Prediction { assetId: string; assetName: string; assetTag: string; employeeName: string; riskScore: number; riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'; recommendations: string[] }

export function PredictiveMaintenanceClient({ predictions }: { predictions: Prediction[] }) {
    const highRisk = predictions.filter(p => p.riskLevel === 'HIGH').length
    const mediumRisk = predictions.filter(p => p.riskLevel === 'MEDIUM').length
    const lowRisk = predictions.filter(p => p.riskLevel === 'LOW').length

    const getRiskBadge = (level: string) => {
        const styles: Record<string, string> = { HIGH: 'bg-red-100 text-red-700', MEDIUM: 'bg-yellow-100 text-yellow-700', LOW: 'bg-green-100 text-green-700' }
        const labels: Record<string, string> = { HIGH: 'خطورة عالية', MEDIUM: 'متوسط', LOW: 'منخفض' }
        return <Badge className={styles[level]}>{labels[level]}</Badge>
    }

    return (
        <div className="w-full content-spacing py-6">
            <PremiumPageHeader title="الصيانة التنبؤية" description="تحليل ذكي للتنبؤ بأعطال الأجهزة" icon={Activity} />
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-slate-500/20 rounded-xl"><Monitor className="h-6 w-6" /></div><div><p className="text-sm text-muted-foreground">إجمالي</p><p className="text-3xl font-bold">{predictions.length}</p></div></div></CardContent></Card>
                <Card className="border-red-200 bg-red-50/50"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-red-500/20 rounded-xl"><AlertTriangle className="h-6 w-6 text-red-600" /></div><div><p className="text-sm text-muted-foreground">خطورة عالية</p><p className="text-3xl font-bold text-red-600">{highRisk}</p></div></div></CardContent></Card>
                <Card className="border-yellow-200 bg-yellow-50/50"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-yellow-500/20 rounded-xl"><AlertCircle className="h-6 w-6 text-yellow-600" /></div><div><p className="text-sm text-muted-foreground">متوسط</p><p className="text-3xl font-bold text-yellow-600">{mediumRisk}</p></div></div></CardContent></Card>
                <Card className="border-green-200 bg-green-50/50"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-green-500/20 rounded-xl"><CheckCircle2 className="h-6 w-6 text-green-600" /></div><div><p className="text-sm text-muted-foreground">منخفض</p><p className="text-3xl font-bold text-green-600">{lowRisk}</p></div></div></CardContent></Card>
            </div>
            <Card><CardHeader><CardTitle>الأجهزة التي تحتاج اهتمام</CardTitle></CardHeader><CardContent>
                <Table><TableHeader><TableRow><TableHead>الجهاز</TableHead><TableHead>Tag</TableHead><TableHead>الموظف</TableHead><TableHead>الخطورة</TableHead><TableHead>نسبة الخطر</TableHead><TableHead>التوصيات</TableHead></TableRow></TableHeader>
                    <TableBody>{predictions.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-12"><CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" /><p className="text-lg font-medium">جميع الأجهزة في حالة ممتازة!</p></TableCell></TableRow> : predictions.map(p => <TableRow key={p.assetId}><TableCell><div className="flex items-center gap-2">{p.riskLevel === 'HIGH' ? <AlertTriangle className="h-5 w-5 text-red-500" /> : p.riskLevel === 'MEDIUM' ? <AlertCircle className="h-5 w-5 text-yellow-500" /> : <CheckCircle2 className="h-5 w-5 text-green-500" />}<span className="font-medium">{p.assetName}</span></div></TableCell><TableCell><Badge variant="outline" className="font-mono">{p.assetTag}</Badge></TableCell><TableCell>{p.employeeName}</TableCell><TableCell>{getRiskBadge(p.riskLevel)}</TableCell><TableCell><div className="flex items-center gap-2 w-32"><Progress value={p.riskScore} className={`h-2 ${p.riskLevel === 'HIGH' ? '[&>div]:bg-red-500' : p.riskLevel === 'MEDIUM' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`} /><span className="text-sm font-medium">{p.riskScore}%</span></div></TableCell><TableCell><ul className="text-sm space-y-1">{p.recommendations.map((r, i) => <li key={i} className="text-muted-foreground">• {r}</li>)}</ul></TableCell></TableRow>)}</TableBody></Table>
            </CardContent></Card>
        </div>
    )
}
