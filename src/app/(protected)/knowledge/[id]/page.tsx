export const dynamic = 'force-dynamic';

import { getArticle } from "@/app/actions/knowledge"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ChevronRight, Clock, User, Share2, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function ArticlePage({ params }: { params: { id: string } }) {
    const { data: article } = await getArticle(params.id)

    if (!article) {
        notFound()
    }

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-muted-foreground mb-6">
                <Link href="/knowledge" className="hover:text-primary">قاعدة المعرفة</Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-foreground">{article.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-6">
                    <div>
                        <Badge className="mb-4">{article.category.nameAr}</Badge>
                        <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">{article.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground border-b pb-6">
                            <div className="flex items-center">
                                <User className="h-4 w-4 ml-2" />
                                الإدارة
                            </div>
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 ml-2" />
                                {new Date(article.createdAt).toLocaleDateString('ar-EG')}
                            </div>
                            <div className="mr-auto">
                                {article.views} مشاهدة
                            </div>
                        </div>
                    </div>

                    <article className="prose prose-lg dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed">
                            {article.content}
                        </div>
                    </article>

                    <div className="border-t pt-8 mt-8">
                        <h3 className="font-semibold mb-4">هل كان هذا المقال مفيداً؟</h3>
                        <div className="flex gap-4">
                            <Button variant="outline" className="gap-2">
                                <ThumbsUp className="h-4 w-4" />
                                نعم، شكراً
                            </Button>
                            <Button variant="outline">لا</Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 bg-muted/50">
                        <h3 className="font-semibold mb-4">إجراءات</h3>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full justify-start">
                                <Share2 className="h-4 w-4 ml-2" />
                                مشاركة المقال
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                طباعة
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold mb-4">مقالات ذات صلة</h3>
                        <div className="space-y-4">
                            {/* Placeholder for related articles */}
                            <div className="text-sm text-muted-foreground">
                                لا يوجد مقالات ذات صلة حالياً.
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
