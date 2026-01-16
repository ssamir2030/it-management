export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { getServiceItems, getServiceCategories } from '@/app/actions/services'
import { Button } from '@/components/ui/button'
import { Plus, Layers, Tags } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceItemsList } from '@/components/services/service-items-list'
import { ServiceCategoriesList } from '@/components/services/service-categories-list'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'

export default async function ServicesPage() {
    const { data: items } = await getServiceItems()
    const { data: categories } = await getServiceCategories()

    const stats = [
        { label: "إجمالي الخدمات", value: items?.length || 0, icon: Layers },
        { label: "التصنيفات", value: categories?.length || 0, icon: Tags }
    ]

    return (
        <div className="space-y-6" dir="rtl">
            <PremiumPageHeader
                title="دليل الخدمات"
                description="إدارة خدمات تقنية المعلومات والطلبات"
                icon={Layers}
                stats={stats}
                rightContent={
                    <Link href="/admin/services/new">
                        <Button className="gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/40 hover-scale transition-all">
                            <Plus className="h-4 w-4" />
                            خدمة جديدة
                        </Button>
                    </Link>
                }
            />

            <Tabs defaultValue="items" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="items">الخدمات</TabsTrigger>
                    <TabsTrigger value="categories">التصنيفات</TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>قائمة الخدمات</CardTitle>
                                <CardDescription>الخدمات المتاحة في البوابة</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ServiceItemsList items={items || []} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>تصنيفات الخدمات</CardTitle>
                            <CardDescription>هيكلة دليل الخدمات</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ServiceCategoriesList categories={categories || []} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
