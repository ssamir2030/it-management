import { getLowStockItems } from "@/app/actions/inventory"
import { AlertTriangle, ArrowLeft, Package } from "lucide-react"
import Link from "next/link"

export async function InventoryAlerts() {
    const { data: lowStockItems } = await getLowStockItems()

    if (!lowStockItems || lowStockItems.length === 0) {
        return null
    }

    return (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-amber-900 dark:text-amber-400 flex items-center justify-between">
                        <span>تنبيهات المخزون</span>
                        <span className="text-xs bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                            {lowStockItems.length} منتجات
                        </span>
                    </h3>

                    <div className="mt-3 space-y-2">
                        {lowStockItems.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm bg-white/50 dark:bg-black/20 p-2 rounded">
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-amber-700/70" />
                                    <span className="font-medium text-amber-900 dark:text-amber-300">{item.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-amber-700">
                                        المتبقي: <span className="font-bold text-red-600">{(item as any).quantity || 0}</span>
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        (الحد الأدنى: {(item as any).minQuantity || 0})
                                    </span>
                                </div>
                            </div>
                        ))}

                        {lowStockItems.length > 3 && (
                            <p className="text-xs text-amber-700 text-center pt-1">
                                و {lowStockItems.length - 3} أصناف أخرى...
                            </p>
                        )}
                    </div>

                    <div className="mt-3 flex justify-end">
                        <Link
                            href="/admin/inventory"
                            className="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1 hover:underline"
                        >
                            إدارة المخزون
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
