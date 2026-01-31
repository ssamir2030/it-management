export const dynamic = 'force-dynamic';

import { getCurrentEmployee } from "@/app/actions/employee-portal"
import { redirect } from "next/navigation"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Box, Shield, PackageX, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function CustodyPage() {
    const employee = await getCurrentEmployee()
    if (!employee) redirect("/portal/login")

    // Combine assets and custodyItems
    // Note: The structure might differ slightly, so we map them to a common interface if needed
    // For now, we assume they have similar enough properties or we handle checks
    const allCustody = [...employee.assets, ...employee.custodyItems]

    return (
        <div className="min-h-screen bg-gray-50/50" dir="rtl">
            <main className="container mx-auto px-4 py-8 space-y-8">
                <PremiumPageHeader
                    title="العهد والممتلكات"
                    description="قائمة بجميع الأجهزة والمعدات المسجلة في عهدتك"
                    icon={Shield}
                    rightContent={
                        <div className="flex items-center gap-3">
                            <Link href="/portal/dashboard">
                                <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                    <ArrowRight className="h-4 w-4" />
                                    العودة للرئيسية
                                </Button>
                            </Link>
                            {allCustody.length > 0 && (
                                <Link href="/portal/custody/return">
                                    <Button className="gap-2 bg-amber-600 hover:bg-amber-700 text-white border-0">
                                        <PackageX className="h-4 w-4" />
                                        طلب إرجاع عهدة
                                    </Button>
                                </Link>
                            )}
                        </div>
                    }
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {allCustody.length === 0 ? (
                        <Card className="col-span-full py-12 text-center">
                            <CardContent className="text-muted-foreground">
                                لا توجد عهد مسجلة باسمك حالياً
                            </CardContent>
                        </Card>
                    ) : (
                        allCustody.map((item: any) => (
                            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-700">
                                <CardHeader className="bg-gradient-to-br from-slate-50 to-white border-b pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-blue-100 rounded-xl">
                                            <Box className="h-6 w-6 text-blue-700" />
                                        </div>
                                        <Badge variant="outline" className="bg-white">
                                            {item.asset?.tag || item.tag || "بدون كود"}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-4 text-xl">{item.name || item.model || "جهاز غير معروف"}</CardTitle>
                                    <CardDescription>{item.type || "جهاز"}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">تاريخ الاستلام:</span>
                                        <span className="font-medium">
                                            {new Date(item.assignedDate || item.createdAt).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                    {item.serialNumber && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">الرقم التسلسلي:</span>
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{item.serialNumber}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">الحالة:</span>
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                            نشط
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}
