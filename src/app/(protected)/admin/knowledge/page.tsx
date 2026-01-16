export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getArticles, getCategories } from '@/app/actions/knowledge'
import { Button } from '@/components/ui/button'
import { Plus, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { ArticlesList } from '@/components/knowledge/articles-list'
import { CategoriesList } from '@/components/knowledge/categories-list'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default async function KnowledgeBasePage() {
    const { data: articles } = await getArticles()
    const { data: categories } = await getCategories()

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="قاعدة المعرفة"
                description="إدارة المقالات والتصنيفات والشروحات"
                icon={BookOpen}
                rightContent={
                    <Link href="/admin/knowledge/new">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            مقال جديد
                        </Button>
                    </Link>
                }
            />

            <Tabs defaultValue="articles" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="articles">المقالات</TabsTrigger>
                    <TabsTrigger value="categories">التصنيفات</TabsTrigger>
                </TabsList>

                <TabsContent value="articles" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>المقالات المنشورة</CardTitle>
                            <CardDescription>قائمة بجميع المقالات والشروحات في النظام</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ArticlesList articles={articles || []} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>تصنيفات المعرفة</CardTitle>
                            <CardDescription>إدارة الأقسام والمواضيع الرئيسية</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CategoriesList categories={categories || []} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
