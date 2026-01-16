import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Monitor, Cpu, HardDrive, Hash, Layers, Fingerprint, CalendarClock, Wifi, Plus, FolderOpen } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FileManager from "@/components/admin/discovery/file-manager"
import ScreenViewer from "@/components/admin/discovery/screen-viewer"

interface DeviceDetails {
    id: string;
    hostname?: string;
    ipAddress: string;
    macAddress?: string;
    os?: string;
    processor?: string;
    ram?: string;
    deviceId?: string;
    productId?: string;
    systemType?: string;
    lastSeen: Date;
    details?: string;
    status?: string;
}

interface DeviceDetailsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    device: DeviceDetails | null;
    onAddToInventory?: (device: any) => void;
}

export function DeviceDetailsSheet({ open, onOpenChange, device, onAddToInventory }: DeviceDetailsSheetProps) {
    if (!device) return null;

    const detailsJson = device.details ? JSON.parse(device.details) : {};
    const macAddress = device.macAddress || detailsJson.mac || 'Unknown';

    // Mock data if missing
    const mockData = {
        fullDeviceName: device.hostname ? `${device.hostname}.domain.local` : '-',
        processor: detailsJson.processor || "Requires Agent / WMI Access",
        ram: detailsJson.ram || "Requires Agent",
        deviceId: detailsJson.deviceId || "-",
        productId: detailsJson.productId || "-",
        systemType: detailsJson.systemType || "-",
        penTouch: "No pen or touch input is available for this display",
        os: detailsJson.os || "Windows (Detected)"
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto z-[200]" style={{ zIndex: 200 }}>
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-3 text-2xl">
                        <Monitor className="h-8 w-8 text-blue-600" />
                        {device.hostname || device.ipAddress}
                    </SheetTitle>
                    <SheetDescription>
                        {mockData.fullDeviceName}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Header Spec Summary */}
                    <div className="flex gap-4 p-4 bg-secondary/20 rounded-xl border">
                        <div className="flex-1 text-center border-r border-border/50">
                            <Cpu className="h-5 w-5 mx-auto mb-2 text-primary" />
                            <p className="text-xs text-muted-foreground">Processor</p>
                            <p className="font-bold text-sm truncate px-1" title={mockData.processor}>
                                {detailsJson.processor ? detailsJson.processor.split(' ').slice(0, 2).join(' ') : '-'}
                            </p>
                        </div>
                        <div className="flex-1 text-center border-r border-border/50">
                            <Layers className="h-5 w-5 mx-auto mb-2 text-primary" />
                            <p className="text-xs text-muted-foreground">RAM</p>
                            <p className="font-bold text-sm">
                                {detailsJson.ram || '-'}
                            </p>
                        </div>
                        <div className="flex-1 text-center">
                            <HardDrive className="h-5 w-5 mx-auto mb-2 text-primary" />
                            <p className="text-xs text-muted-foreground">OS</p>
                            <p className="font-bold text-sm">
                                {detailsJson.os || 'Windows'}
                            </p>
                        </div>
                    </div>

                    {/* Detailed Specifications List */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Fingerprint className="h-5 w-5 text-purple-500" />
                            Device Specifications
                        </h3>
                        <div className="space-y-0 text-sm border rounded-lg overflow-hidden">
                            <div className="grid grid-cols-3 p-3 bg-secondary/5 border-b hover:bg-secondary/10 transition-colors">
                                <span className="font-medium text-muted-foreground">Device name</span>
                                <span className="col-span-2 font-mono">{device.hostname || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-card border-b hover:bg-secondary/10 transition-colors">
                                <span className="font-medium text-muted-foreground">Full device name</span>
                                <span className="col-span-2 font-mono">{mockData.fullDeviceName}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-secondary/5 border-b hover:bg-secondary/10 transition-colors">
                                <span className="font-medium text-muted-foreground">Processor</span>
                                <span className="col-span-2">{mockData.processor}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-card border-b hover:bg-secondary/10 transition-colors">
                                <span className="font-medium text-muted-foreground">Installed RAM</span>
                                <span className="col-span-2">{mockData.ram}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-secondary/5 border-b hover:bg-secondary/10 transition-colors">
                                <span className="font-medium text-muted-foreground">Serial Number</span>
                                <span className="col-span-2 font-mono text-xs font-bold text-blue-600">{detailsJson.serial || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-card border-b hover:bg-secondary/10 transition-colors">
                                <span className="font-medium text-muted-foreground">Product ID</span>
                                <span className="col-span-2 font-mono text-xs">{mockData.productId}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-secondary/5 border-b hover:bg-secondary/10 transition-colors">
                                <span className="font-medium text-muted-foreground">System type</span>
                                <span className="col-span-2">{mockData.systemType}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-card border-b hover:bg-secondary/10 transition-colors">
                                <span className="font-medium text-muted-foreground">Logged In User</span>
                                <span className="col-span-2 font-mono text-blue-600 font-bold">{detailsJson.username || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-secondary/5 border-b hover:bg-secondary/10 transition-colors">
                                <span className="font-medium text-muted-foreground">Local Admins</span>
                                <span className="col-span-2 font-mono text-xs break-all">{detailsJson.localAdmins || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-secondary/5 border-b hover:bg-secondary/10 transition-colors">
                                <span className="font-medium text-muted-foreground">Pen and touch</span>
                                <span className="col-span-2">{mockData.penTouch}</span>
                            </div>
                        </div>
                    </div>

                    {/* Storage Info */}
                    {detailsJson.disks && detailsJson.disks.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <HardDrive className="h-5 w-5 text-amber-500" />
                                Storage
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {detailsJson.disks.map((disk: any, idx: number) => (
                                    <div key={idx} className="p-4 border rounded-xl bg-card">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-lg">{disk.drive}</span>
                                            <Badge variant="outline">{disk.size} Total</Badge>
                                        </div>
                                        <div className="w-full bg-secondary h-2.5 rounded-full mb-1">
                                            <div
                                                className="bg-green-500 h-2.5 rounded-full"
                                                style={{ width: `${100 - (parseFloat(disk.free) / parseFloat(disk.size) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-muted-foreground text-right">{disk.free} Free</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Network Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Wifi className="h-5 w-5 text-blue-500" />
                            Network Information
                        </h3>
                        <div className="space-y-0 text-sm border rounded-lg overflow-hidden">
                            <div className="grid grid-cols-3 p-3 bg-secondary/5 border-b">
                                <span className="font-medium text-muted-foreground">IP Address</span>
                                <span className="col-span-2 font-mono">{device.ipAddress}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-card border-b">
                                <span className="font-medium text-muted-foreground">MAC Address</span>
                                <span className="col-span-2 font-mono">{macAddress}</span>
                            </div>
                            <div className="grid grid-cols-3 p-3 bg-secondary/5">
                                <span className="font-medium text-muted-foreground">Last Seen</span>
                                <span className="col-span-2">{new Date(device.lastSeen).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer about Agent */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg flex gap-3 text-sm text-amber-800 dark:text-amber-200">
                        <div className="shrink-0 mt-0.5">⚠️</div>
                        <div>
                            <p className="font-bold">Missing Real-time Data?</p>
                            <p>Hardware specifications (RAM, CPU) are currently estimated. To pull live WMI data, please configure the <span className="underline cursor-pointer font-medium">Windows Agent service</span>.</p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    {onAddToInventory && device.status !== 'ADDED' && (
                        <div className="pt-4 border-t mt-6 flex justify-end">
                            <Button
                                onClick={() => {
                                    onAddToInventory(device)
                                    onOpenChange(false)
                                }}
                                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                إضافة إلى الأصول وتعيين عهدة
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
