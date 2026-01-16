export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { getRemoteAgents, getActiveSessions, getSessionHistory } from "@/app/actions/remote-access"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Monitor, Wifi, Clock, Activity, MonitorPlay } from "lucide-react"
import Link from "next/link"

export default async function RemoteAccessPage() {
    const agentsResult = await getRemoteAgents()
    const { data: activeSessions } = await getActiveSessions()
    const { data: recentSessions } = await getSessionHistory(20)

    // Extract agents from the result structure
    const agents = agentsResult.success && agentsResult.data ? agentsResult.data.registeredAgents : []

    const getStateaBadge = (state: string) => {
        switch (state) {
            case 'online': return <Badge variant="default" className="bg-green-500">متصل</Badge>
            case 'offline': return <Badge variant="outline">غير متصل</Badge>
            case 'WAITING_INSTALL': return <Badge variant="default" className="bg-yellow-500">بانتظار التثبيت</Badge>
            default: return <Badge variant="outline">{state}</Badge>
        }
    }

    const onlineCount = agents?.filter((a: any) => a.state === 'online').length || 0
    const offlineCount = agents?.filter((a: any) => a.state === 'offline').length || 0
    const waitingCount = agents?.filter((a: any) => a.state === 'WAITING_INSTALL').length || 0

    return (
        <div className="w-full py-6 space-y-6">
            <PremiumPageHeader
                title="الوصول عن بعد (Remote Access)"
                description="إدارة الوصول عن بعد للأجهزة عبر DWService"
                icon={MonitorPlay}
                stats={[
                    { label: "إجمالي الأجهزة", value: agents?.length || 0, icon: Monitor },
                    { label: "متصل الآن", value: onlineCount, icon: Wifi },
                    { label: "جلسات نشطة", value: activeSessions?.length || 0, icon: Activity },
                    { label: "بانتظار التثبيت", value: waitingCount, icon: Clock },
                ]}
            />

            {/* Active Sessions */}
            {activeSessions && activeSessions.length > 0 && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>الجلسات النشطة</CardTitle>
                        <CardDescription>جلسات الوصول عن بعد قيد التشغيل</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>الجهاز</TableHead>
                                    <TableHead>الموظف</TableHead>
                                    <TableHead>بدأت في</TableHead>
                                    <TableHead>الغرض</TableHead>
                                    <TableHead>المدة</TableHead>
                                    <TableHead className="text-left">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {activeSessions.map((session) => {
                                    const duration = Math.floor(
                                        (new Date().getTime() - new Date(session.startTime).getTime()) / 60000
                                    )
                                    return (
                                        <TableRow key={session.id}>
                                            <TableCell className="font-medium">
                                                {session.agent.asset.name}
                                            </TableCell>
                                            <TableCell>{session.agent.asset.employee?.name || '-'}</TableCell>
                                            <TableCell>{new Date(session.startTime).toLocaleTimeString('ar-EG')}</TableCell>
                                            <TableCell>{session.purpose}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{duration} دقيقة</Badge>
                                            </TableCell>
                                            <TableCell className="text-left">
                                                <Link href={`/remote-access/session/${session.id}`} className="text-blue-500 hover:underline">
                                                    عرض
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Registered Devices */}
            <Card>
                <CardHeader>
                    <CardTitle>الأجهزة المسجلة</CardTitle>
                    <CardDescription>
                        عرض {agents?.length || 0} جهاز
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>الجهاز</TableHead>
                                <TableHead>الموظف</TableHead>
                                <TableHead>نظام التشغيل</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>آخر اتصال</TableHead>
                                <TableHead className="text-left">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agents?.map((agent) => (
                                <TableRow key={agent.id}>
                                    <TableCell className="font-medium">
                                        {agent.asset.name}
                                        <br />
                                        <span className="text-xs text-muted-foreground">{agent.asset.tag}</span>
                                    </TableCell>
                                    <TableCell>{agent.asset.employee?.name || '-'}</TableCell>
                                    <TableCell>{agent.osType || agent.state === 'WAITING_INSTALL' ? 'N/A' : '-'}</TableCell>
                                    <TableCell>{getStateaBadge(agent.state)}</TableCell>
                                    <TableCell>
                                        {agent.lastOnline
                                            ? new Date(agent.lastOnline).toLocaleString('ar-EG')
                                            : '-'
                                        }
                                    </TableCell>
                                    <TableCell className="text-left">
                                        <Link href={`/remote-access/agent/${agent.id}`} className="text-blue-500 hover:underline">
                                            إدارة
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!agents || agents.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        لا توجد أجهزة مسجلة. قم بتسجيل الأجهزة من صفحة الأصول.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

