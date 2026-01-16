export const dynamic = 'force-dynamic';

import { getCategories, getArticleById } from "@/app/actions/knowledge-base"
import { EnhancedPageHeader } from "@/components/ui/enhanced-page-header"
import { BookOpen } from "lucide-react"
import { ArticleForm } from "../../article-form"
import { notFound } from "next/navigation"

export default async function EditArticlePage({ params }: { params: { id: string } }) {
    const [categoriesRes, articleRes] = await Promise.all([
        getCategories(),
        getArticleById(params.id)
    ])

    if (!articleRes.success || !articleRes.data) {
        notFound()
    }

    const categories = (categoriesRes.success && categoriesRes.data) ? categoriesRes.data : []
    const article = articleRes.data

    return (
        <div className="space-y-6">
            <EnhancedPageHeader
                title="تعديل المقال"
                description={`تعديل المقال: ${article.title}`}
                icon={BookOpen}
                iconBgGradient="from-emerald-500 to-teal-600"
                titleGradient="from-emerald-600 to-teal-800"
            />

            <div className="bg-white rounded-lg border shadow-sm p-6">
                <ArticleForm categories={categories} article={article} />
            </div>
        </div>
    )
}
