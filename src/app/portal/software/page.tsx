export const dynamic = 'force-dynamic';

import { getSoftwareList } from "@/app/actions/software-catalog"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Package, Download, Shield, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SoftwareRequestButton } from "./software-request-button"

export default async function SoftwareCatalogPage() {
    const result = await getSoftwareList()
    const software = result.success ? result.data : []

    // Group software by category
    const categories = software?.reduce((acc: any, item: any) => {
        const cat = item.category || 'General'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(item)
        return acc
    }, {})

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900" dir="rtl">
            <main className="container mx-auto px-4 py-8 space-y-8">
                <PremiumPageHeader
                    title="دليل البرامج"
                    description="تصفح البرامج المعتمدة واطلب تثبيتها على جهازك"
                    icon={Package}
                    rightContent={
                        <Link href="/portal/dashboard">
                            <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4" />
                                العودة للرئيسية
                            </Button>
                        </Link>
                    }
                />

                {Object.keys(categories || {}).length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                            <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600">لا توجد برامج متاحة حالياً</h3>
                        <p className="text-muted-foreground">تواصل مع الدعم الفني لمزيد من المعلومات</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(categories || {}).map(([category, items]: [string, any]) => (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold text-foreground dark:text-gray-100">{category}</h2>
                                    <Badge variant="outline" className="text-sm dark:text-gray-300 dark:border-gray-600">
                                        {items.length} {items.length === 1 ? 'برنامج' : 'برامج'}
                                    </Badge>
                                </div>

                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {items.map((item: any) => (
                                        <Card key={item.id} className="hover:shadow-lg transition-all duration-300 group border-t-4 border-t-transparent hover:border-t-violet-500 dark:bg-slate-800 dark:border-slate-700">
                                            <CardHeader>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        {item.icon ? (
                                                            <img src={item.icon} alt={item.name} className="h-10 w-10 rounded" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-white" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <CardTitle className="text-lg group-hover:text-violet-700 transition-colors dark:text-gray-100 dark:group-hover:text-violet-400">
                                                                {item.name}
                                                            </CardTitle>
                                                            {item.version && (
                                                                <p className="text-xs text-muted-foreground dark:text-muted-foreground">الإصدار {item.version}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {item.requiresLicense && (
                                                        <Badge variant="secondary" className="text-xs gap-1">
                                                            <Shield className="h-3 w-3" />
                                                            مرخص
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <CardDescription className="text-sm line-clamp-2 min-h-[40px]">
                                                    {item.description || 'لا يوجد وصف'}
                                                </CardDescription>

                                                <SoftwareRequestButton
                                                    softwareId={item.id}
                                                    softwareName={item.name}
                                                />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
