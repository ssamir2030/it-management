'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Search, Plus, CheckCircle2, Monitor, Wifi, Server, Eye, Download } from "lucide-react"
import { scanNetworkRange, getDiscoveredDevices, convertToAsset } from "@/app/actions/network-scanner"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { DeviceDetailsSheet } from "./device-details-sheet"

export function NetworkDiscoveryClient() {
    const [rangeStart, setRangeStart] = useState("192.168.1.1")
    const [rangeEnd, setRangeEnd] = useState("192.168.1.50")
    const [isScanning, setIsScanning] = useState(false)
    const [devices, setDevices] = useState<any[]>([])

    // Asset Import State
    const [selectedDevice, setSelectedDevice] = useState<any>(null)
    const [assetForm, setAssetForm] = useState({ name: '', tag: '', type: 'COMPUTER' })
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Details Sheet State
    const [detailsDevice, setDetailsDevice] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    useEffect(() => {
        loadDevices()
    }, [])

    const loadDevices = async () => {
        const result = await getDiscoveredDevices()
        setDevices(result)
    }

    const handleScan = async () => {
        setIsScanning(true)
        toast.info("جاري الفحص...", { description: "قد تستغرق العملية بضع دقائق حسب حجم النطاق." })

        try {
            const result = await scanNetworkRange(rangeStart, rangeEnd)
            if (result.success) {
                toast.success(`تم الفحص بنجاح!`, { description: `تم العثور على أجهزة نشطة.` })
                loadDevices()
            } else {
                toast.error("خطأ في الفحص", { description: result.error })
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setIsScanning(false)
        }
    }

    const handleImport = async () => {
        if (!selectedDevice || !assetForm.name || !assetForm.tag) return

        const result = await convertToAsset(selectedDevice.id, {
            name: assetForm.name,
            tag: assetForm.tag,
            type: assetForm.type,
            ipAddress: selectedDevice.ipAddress,
            locationId: null, // Should be selected or default
            status: 'AVAILABLE'
        })

        if (result.success) {
            toast.success("تمت الإضافة بنجاح")
            setIsDialogOpen(false)
            setAssetForm({ name: '', tag: '', type: 'COMPUTER' })
            loadDevices() // Refresh status
        } else {
            toast.error("فشل في الإضافة", { description: result.error })
        }
    }

    const openDetails = (device: any) => {
        setDetailsDevice(device)
        setIsDetailsOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Scan Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wifi className="h-5 w-5 text-blue-500" />
                        نطاق الفحص
                    </CardTitle>
                    <CardDescription>حدد نطاق IP للبحث عن الأجهزة (بحد أقصى 255 عنوان في المرة الواحدة)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid w-full gap-2">
                            <Label htmlFor="start">بداية النطاق</Label>
                            <Input
                                id="start"
                                value={rangeStart}
                                onChange={(e) => setRangeStart(e.target.value)}
                                placeholder="192.168.1.1"
                                className="font-mono text-left"
                                dir="ltr"
                            />
                        </div>
                        <div className="grid w-full gap-2">
                            <Label htmlFor="end">نهاية النطاق</Label>
                            <Input
                                id="end"
                                value={rangeEnd}
                                onChange={(e) => setRangeEnd(e.target.value)}
                                placeholder="192.168.1.50"
                                className="font-mono text-left"
                                dir="ltr"
                            />
                        </div>
                        <Button
                            onClick={handleScan}
                            disabled={isScanning}
                            className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
                        >
                            {isScanning ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Search className="h-4 w-4 ml-2" />}
                            {isScanning ? "جاري الفحص..." : "بدء الفحص"}
                        </Button>
                    </div>


                    <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button variant="outline" asChild className="gap-2">
                            <a href="/agent.ps1" download="agent.ps1">
                                <Download className="h-4 w-4" />
                                تحميل ملف العميل (Agent Script)
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-purple-500" />
                        نتائج الفحص
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">عنوان IP</TableHead>
                                    <TableHead className="text-right">اسم الجهاز (Hostname)</TableHead>
                                    <TableHead className="text-right">الحالة</TableHead>
                                    <TableHead className="text-right">آخر ظهور</TableHead>
                                    <TableHead className="text-right">المنافذ</TableHead>
                                    <TableHead className="text-right">الإجراء</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            لا توجد أجهزة مكتشفة بعد. ابدأ الفحص أعلاه.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    devices.map((device) => (
                                        <TableRow key={device.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => openDetails(device)}>
                                            <TableCell className="font-mono font-medium ltr:text-left">{device.ipAddress}</TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {device.hostname ? (
                                                    <span className="flex items-center gap-2 text-blue-600 font-bold">
                                                        <Monitor className="h-3 w-3" />
                                                        {device.hostname}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground italic">غير معروف</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {device.status === 'NEW' ? (
                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 ">جديد</Badge>
                                                ) : device.status === 'ADDED' ? (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                        <CheckCircle2 className="h-3 w-3 ml-1" />
                                                        مضاف
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">{device.status}</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(device.lastSeen).toLocaleString('ar-SA')}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm font-mono text-xs">
                                                {device.details ? JSON.parse(device.details).port : '-'}
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => openDetails(device)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {device.status === 'NEW' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedDevice(device)
                                                                setAssetForm(prev => ({
                                                                    ...prev,
                                                                    tag: `AST-${Math.floor(Math.random() * 10000)}`,
                                                                    name: device.hostname || `Device ${device.ipAddress}`
                                                                }))
                                                                setIsDialogOpen(true)
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4 ml-1" />
                                                            إضافة
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Asset Import Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إضافة جهاز مكتشف</DialogTitle>
                        <CardDescription>تحويل {selectedDevice?.ipAddress} إلى أصل في المخزون</CardDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>اسم الجهاز</Label>
                            <Input
                                value={assetForm.name}
                                onChange={(e) => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="مثال: طابعة الدور الأول"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>رقم الأصل (Tag)</Label>
                            <Input
                                value={assetForm.tag}
                                onChange={(e) => setAssetForm(prev => ({ ...prev, tag: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>النوع</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={assetForm.type}
                                onChange={(e) => setAssetForm(prev => ({ ...prev, type: e.target.value }))}
                            >
                                <option value="COMPUTER">حاسوب</option>
                                <option value="PRINTER">طابعة</option>
                                <option value="SERVER">سيرفر</option>
                                <option value="NETWORK_DEVICE">جهاز شبكة</option>
                                <option value="OTHER">أخرى</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleImport}>تأكيد الإضافة</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeviceDetailsSheet
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                device={detailsDevice}
                onAddToInventory={(device) => {
                    setSelectedDevice(device)
                    setAssetForm(prev => ({
                        ...prev,
                        tag: `AST-${Math.floor(Math.random() * 10000)}`,
                        name: device.hostname || `Device ${device.ipAddress}`
                    }))
                    setIsDialogOpen(true)
                }}
            />
        </div >
    )
}
