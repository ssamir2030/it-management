export const dynamic = 'force-dynamic';

import { getNetworkDevice } from "@/app/actions/network"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Server, Network, Shield, Info, ArrowRight, Edit, ExternalLink } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function NetworkDeviceDetailsPage({ params }: { params: { id: string } }) {
    const { data: device } = await getNetworkDevice(params.id)

    if (!device) {
        notFound()
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            case 'OFFLINE': return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            case 'MAINTENANCE': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    return (
        <div className="w-full py-10 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/network">
                        <Button variant="outline" size="icon">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            {device.name}
                            <Badge variant="secondary" className={getStatusColor(device.status)}>
                                {device.status}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">{device.type} - {device.model}</p>
                    </div>
                </div>
                <Link href={`/network/${device.id}/edit`}>
                    <Button className="gap-2">
                        <Edit className="h-4 w-4" />
                        تعديل البيانات
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* General Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Server className="h-5 w-5 text-blue-500" />
                            معلومات الجهاز
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">النوع:</span>
                                <span className="font-medium">{device.type}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">الماركة:</span>
                                <span className="font-medium">{device.brand || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">الموديل:</span>
                                <span className="font-medium">{device.model || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">الرقم التسلسلي:</span>
                                <span className="font-medium font-mono">{device.serialNumber || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">الموقع:</span>
                                <span className="font-medium">{device.location?.name || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">تاريخ التركيب:</span>
                                <span className="font-medium">
                                    {device.installationDate ? new Date(device.installationDate).toLocaleDateString('en-GB') : "-"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Network Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Network className="h-5 w-5 text-orange-500" />
                            تفاصيل الشبكة
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="col-span-2">
                                <span className="text-muted-foreground block">IP Address:</span>
                                <span className="font-mono font-bold text-lg">{device.ipAddress || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">MAC Address:</span>
                                <span className="font-mono">{device.macAddress || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">VLAN:</span>
                                <span className="font-medium">{device.vlan || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Gateway:</span>
                                <span className="font-mono">{device.gateway || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">Subnet:</span>
                                <span className="font-mono">{device.subnetMask || "-"}</span>
                            </div>
                        </div>
                        {device.managementUrl && (
                            <div className="pt-2">
                                <a href={device.managementUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="w-full gap-2">
                                        <ExternalLink className="h-4 w-4" />
                                        فتح صفحة الإدارة
                                    </Button>
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Access Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5 text-red-500" />
                            بيانات الدخول
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">Username:</span>
                                <span className="font-mono font-medium">{device.username || "-"}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block">SSH Port:</span>
                                <span className="font-mono">{device.sshPort}</span>
                            </div>
                            <div className="col-span-2 p-3 bg-muted rounded-md">
                                <span className="text-muted-foreground block text-xs mb-1">Password:</span>
                                <div className="font-mono text-sm blur-sm hover:blur-none transition-all cursor-pointer select-all">
                                    {device.password || "No Password"}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-1 text-right">حرك الماوس للإظهار</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Other Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Info className="h-5 w-5 text-purple-500" />
                            معلومات إضافية
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="text-muted-foreground block">Firmware Version:</span>
                                <span className="font-medium">{device.firmwareVersion || "-"}</span>
                            </div>
                            {device.notes && (
                                <div>
                                    <span className="text-muted-foreground block mb-1">ملاحظات:</span>
                                    <p className="text-gray-700 bg-muted/50 p-3 rounded-md whitespace-pre-wrap">
                                        {device.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
