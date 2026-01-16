"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { CategoryForm } from '@/components/settings/category-form'
import { getAssetCategories as getCategories } from '@/app/actions/categories-v2'
import { Tags, ArrowRight, Loader2 } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewCategoryPage() {
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
        async function loadData() {
            const { data } = await getCategories()
            setCategories(data || [])
            setLoading(false)
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <PremiumPageHeader
                title="إضافة تصنيف جديد"
                description="إضافة تصنيف جديد للأصول (رئيسي أو فرعي)"
                icon={Tags}
                backLink="/settings/categories"
                backText="العودة للتصنيفات"
            />

            <div className="pb-20">
                <div className="bg-card rounded-xl border shadow-sm p-8">
                    <div className="mb-8 border-b pb-6">
                        <h2 className="text-2xl font-bold text-primary">بيانات التصنيف</h2>
                        <p className="text-muted-foreground mt-2">
                            أدخل بيانات التصنيف الجديد وحدد نوعه وتبعيته
                        </p>
                    </div>

                    <CategoryForm categories={categories} />
                </div>
            </div>
        </div>
    )
}
