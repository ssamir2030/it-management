export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { getServiceItems, getServiceCategories } from '@/app/actions/services'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Clock, Check, PackageOpen, Layers } from "lucide-react"
import { RequestServiceDialog } from '@/components/services/request-service-dialog'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

async function ServiceCatalog() {
    const { data: items } = await getServiceItems()
    const { data: categories } = await getServiceCategories()

    const hasContent = categories && categories.length > 0 && items && items.length > 0;

    const stats = [
        { label: "إجمالي الخدمات", value: items?.length || 0, icon: Layers },
        { label: "التصنيفات", value: categories?.length || 0, icon: ClipboardList }
    ]

    return (
        <div className="space-y-8">
            <PremiumPageHeader
                title="دليل الخدمات الرقمية"
                description="تصفح كتالوج الخدمات، اطلب الصلاحيات والأجهزة، وتتبع طلباتك بسهولة"
                icon={Layers}
                stats={stats}
            />

            {/* Empty State */}
            {!hasContent && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed">
                    <div className="p-6 rounded-full bg-muted/50">
                        <PackageOpen className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">لا توجد خدمات متاحة حالياً</h3>
                    <p className="text-muted-foreground max-w-sm">
                        لم يتم إضافة أي خدمات أو تصنيفات في الدليل بعد. يرجى مراجعة مدير النظام.
                    </p>
                </div>
            )}

            {/* Categories & Items */}
            {hasContent && (
                <section className="space-y-12">
                    {categories?.map((cat: any) => {
                        const categoryItems = items?.filter((item: any) => item.categoryId === cat.id) || []

                        if (categoryItems.length === 0) return null

                        return (
                            <div key={cat.id} className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                        <ClipboardList className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        {cat.nameAr}
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categoryItems.map((item: any) => (
                                        <div key={item.id} className="group relative h-full">
                                            <Card className="h-full hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50">
                                                <CardContent className="p-6 flex flex-col h-full">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                                                            <ClipboardList className="w-6 h-6" />
                                                        </div>
                                                        {!item.approvalRequired ? (
                                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-0">
                                                                <Check className="w-3 h-3 mr-1" />
                                                                تلقائي
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-amber-600 bg-amber-500/10 border-amber-200/50">
                                                                يتطلب موافقة
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                                                        {item.nameAr}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                                                        {item.description || 'تقديم طلب للحصول على هذه الخدمة'}
                                                    </p>

                                                    <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                                                        <div className="flex items-center text-xs text-muted-foreground gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{item.slaHours} ساعة</span>
                                                        </div>
                                                        <RequestServiceDialog service={item} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </section>
            )}
        </div>
    )
}

export default function PortalServicesPage() {
    return (
        <Suspense fallback={<div className="text-center py-20">جاري تحميل دليل الخدمات...</div>}>
            <ServiceCatalog />
        </Suspense>
    )
}
