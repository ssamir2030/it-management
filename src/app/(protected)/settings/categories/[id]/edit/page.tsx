"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { CategoryForm } from '@/components/settings/category-form'
import { getAssetCategories as getCategories, getCategoryById } from '@/app/actions/categories-v2'
import { Tags, ArrowRight, Loader2 } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditCategoryPage() {
    const params = useParams()
    const id = params?.id as string

    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<any[]>([])
    const [category, setCategory] = useState<any>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                const [categoriesRes, categoryRes] = await Promise.all([
                    getCategories(),
                    getCategoryById(id)
                ])
                setCategories(categoriesRes.data || [])
                if (categoryRes.success && categoryRes.data) {
                    setCategory(categoryRes.data)
                } else {
                    setError(true)
                }
            } catch {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        if (id) loadData()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !category) {
        return <div className="p-8 text-center text-red-500">التصنيف غير موجود</div>
    }

    return (
        <div className="space-y-8">
            <PremiumPageHeader
                title="تعديل تصنيف"
                description={`تعديل بيانات التصنيف: ${category.nameAr}`}
                icon={Tags}
                backLink="/settings/categories"
                backText="العودة للتصنيفات"
            />

            <div className="pb-20">
                <div className="bg-card rounded-xl border shadow-sm p-8">
                    <div className="mb-8 border-b pb-6">
                        <h2 className="text-2xl font-bold text-primary">بيانات التصنيف</h2>
                        <p className="text-muted-foreground mt-2">
                            تعديل تفاصيل التصنيف الحالي
                        </p>
                    </div>

                    <CategoryForm category={category} categories={categories} />
                </div>
            </div>
        </div>
    )
}
