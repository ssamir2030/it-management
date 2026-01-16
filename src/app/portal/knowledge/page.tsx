export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { getArticles, getCategories } from '@/app/actions/knowledge'
import { Input } from "@/components/ui/input"
import { Search, BookOpen, ChevronRight, FileText } from "lucide-react"
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

async function KnowledgeHome() {
    const { data: categories } = await getCategories()
    const { data: recentArticles } = await getArticles()

    const publishedArticles = recentArticles?.filter((a: any) => a.isPublished).slice(0, 5) || []

    return (
        <div className="space-y-8">
            {/* Search Section */}
            {/* Search Section - Matches Dashboard/Services Design */}
            <section className="relative overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 dark:from-slate-900 dark:via-blue-900 dark:to-slate-800 p-10 text-white transition-all duration-500">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

                <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl font-black tracking-tight">كيف يمكننا مساعدتك اليوم؟</h1>
                    <p className="text-blue-50 text-lg">ابحث في قاعدة المعرفة عن حلول للمشاكل الشائعة</p>
                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-500" />
                        <Input
                            placeholder="ابحث عن مشكلة (مثال: الطابعة لا تعمل...)"
                            className="bg-white text-gray-900 pr-10 h-12 text-lg shadow-lg border-0 focus-visible:ring-blue-500 placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">تصفح حسب التصنيف</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories?.map((cat) => (
                        <Link href={`/portal/knowledge?cat=${cat.id}`} key={cat.id}>
                            <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full border-t-4 border-t-transparent hover:border-t-primary">
                                <CardContent className="p-6 space-y-3">
                                    <h3 className="font-bold text-lg">{cat.nameAr}</h3>
                                    <p className="text-muted-foreground text-sm line-clamp-2">
                                        {cat.description || 'تصفح المقالات المتعلقة بهذا القسم'}
                                    </p>
                                    <div className="flex items-center text-sm text-primary font-medium">
                                        <span>{cat._count?.articles || 0} مقال</span>
                                        <ChevronRight className="w-4 h-4 mr-auto" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Recent Articles */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">أحدث الشروحات</h2>
                </div>
                <div className="grid gap-4">
                    {publishedArticles.map((article: any) => (
                        <Link href={`/portal/knowledge/${article.id}`} key={article.id}>
                            <Card className="hover:bg-accent/50 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{article.title}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {article.category?.nameAr}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {publishedArticles.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-muted/30 rounded-3xl border-2 border-dashed">
                            <div className="p-4 rounded-full bg-muted/50">
                                <BookOpen className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold">لا توجد مقالات منشورة حالياً</h3>
                            <p className="text-muted-foreground max-w-sm">
                                قاعدة المعرفة قيد التحديث. يرجى التحقق لاحقاً أو التواصل مع الدعم الفني.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default function PortalKnowledgePage() {
    return (
        <Suspense fallback={<div className="text-center py-20">جاري التحميل...</div>}>
            <div className="container mx-auto px-4 py-6">
                <KnowledgeHome />
            </div>
        </Suspense>
    )
}
