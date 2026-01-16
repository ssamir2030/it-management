export const dynamic = 'force-dynamic';

import { getArticle, incrementArticleView } from '@/app/actions/knowledge'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Calendar, Bookmark, Share2, ThumbsUp } from "lucide-react"
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { notFound } from 'next/navigation'

export default async function ArticlePage({ params }: { params: { id: string } }) {
    const { data: article } = await getArticle(params.id)

    if (!article || !article.isPublished) {
        return notFound()
    }

    // Increment view count (server-side side effect)
    await incrementArticleView(article.id)

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <Link href="/portal/knowledge" className="hover:text-primary transition-colors">قاعدة المعرفة</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium truncate">{article.title}</span>
            </div>

            <article className="space-y-8 animate-fade-in">
                {/* Header */}
                <header className="space-y-4 border-b pb-8">
                    <div className="flex flex-wrap gap-2">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            {article.category.nameAr}
                        </Badge>
                        <span className="flex items-center text-sm text-muted-foreground gap-1 bg-muted px-3 py-1 rounded-full">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(article.createdAt), "d MMMM yyyy", { locale: ar })}
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-foreground">
                        {article.title}
                    </h1>
                </header>

                {/* Content */}
                <Card className="border-0 shadow-none bg-transparent">
                    <CardContent className="p-0 prose prose-lg dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 font-sans">
                            {article.content}
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback & Actions */}
                <div className="border-t pt-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <p className="font-semibold">هل كان هذا المقال مفيداً؟</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                                <ThumbsUp className="w-4 h-4" />
                                نعم
                            </Button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <Share2 className="w-4 h-4" />
                            مشاركة
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                            <Bookmark className="w-4 h-4" />
                            حفظ
                        </Button>
                    </div>
                </div>
            </article>
        </div>
    )
}
