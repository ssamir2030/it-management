export const dynamic = 'force-dynamic';

import Image from "next/image"
import Link from "next/link"
import { Plus, Search, BookOpen, Clock, Eye, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getArticles, getCategories, seedCategories } from "@/app/actions/knowledge"

export default async function KnowledgeBasePage({
    searchParams,
}: {
    searchParams: { q?: string; cat?: string }
}) {
    await seedCategories() // Ensure categories exist
    const { data: articles } = await getArticles(searchParams.q, searchParams.cat)
    const { data: categories } = await getCategories()

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Hero Section */}
            <div className="relative h-[300px] w-full rounded-xl overflow-hidden">
                <Image
                    src="/images/kb-header.png"
                    alt="Knowledge Base"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-slate-900/80 mix-blend-multiply" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">قاعدة المعرفة</h1>
                    <p className="text-lg text-gray-200 max-w-2xl mb-8">
                        ابحث في مئات المقالات، الأدلة، والحلول التقنية لمساعدتك في إنجاز عملك.
                    </p>

                    <div className="relative w-full max-w-xl">
                        <Search className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                        <form action="/knowledge">
                            <Input
                                name="q"
                                defaultValue={searchParams.q}
                                placeholder="كيف يمكنني إعادة تعيين كلمة المرور؟"
                                className="w-full pl-4 pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-300 backdrop-blur-sm focus-visible:ring-white/30 focus-visible:bg-white/20 transition-all rounded-full"
                            />
                        </form>
                    </div>
                </div>
            </div>

            {/* Categories & Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">التصنيفات</h3>
                        <Link href="/knowledge/new">
                            <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 ml-1" />
                                مقال جديد
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-1">
                        <Link href="/knowledge">
                            <Button
                                variant={!searchParams.cat ? "secondary" : "ghost"}
                                className="w-full justify-start font-normal"
                            >
                                <BookOpen className="h-4 w-4 ml-2" />
                                جميع المقالات
                            </Button>
                        </Link>
                        {categories?.map((cat) => (
                            <Link key={cat.id} href={`/knowledge?cat=${cat.id}`}>
                                <Button
                                    variant={searchParams.cat === cat.id ? "secondary" : "ghost"}
                                    className="w-full justify-start font-normal justify-between group"
                                >
                                    <span className="flex items-center">
                                        <ChevronRight className="h-3 w-3 ml-2 text-muted-foreground group-hover:text-primary transition-colors" />
                                        {cat.nameAr}
                                    </span>
                                    <Badge variant="secondary" className="text-xs font-normal">
                                        {cat._count.articles}
                                    </Badge>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Articles Grid */}
                <div className="lg:col-span-3">
                    <div className="grid gap-6 md:grid-cols-2">
                        {articles?.map((article) => (
                            <Link key={article.id} href={`/knowledge/${article.id}`} className="group">
                                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                                    <CardHeader>
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                {article.category.nameAr}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground flex items-center">
                                                <Clock className="h-3 w-3 ml-1" />
                                                {new Date(article.createdAt).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                        <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                            {article.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-sm line-clamp-3">
                                            {article.content.substring(0, 150)}...
                                        </p>
                                    </CardContent>
                                    <CardFooter className="border-t pt-4 text-xs text-muted-foreground flex justify-between">
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 rounded-full bg-gray-200 ml-2 overflow-hidden">
                                                {/* Avatar placeholder */}
                                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                                    A
                                                </div>
                                            </div>
                                            <span>الإدارة</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center">
                                                <Eye className="h-3 w-3 ml-1" />
                                                {article.views}
                                            </span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}

                        {articles?.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>لا يوجد مقالات تطابق بحثك.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
