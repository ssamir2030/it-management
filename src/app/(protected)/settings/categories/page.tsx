"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { CategoryManager } from '@/components/settings/category-manager'
import { getAssetCategories } from '@/app/actions/categories-v2'
import { Tags, ArrowRight, Loader2 } from "lucide-react"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function CategoriesSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
        async function loadData() {
            try {
                // Call the original action name to avoid alias issues
                const res = await getAssetCategories()
                if (!res.success) {
                    console.error("Categories load failed:", res.error)
                    toast.error("فشل تحميل التصنيفات: " + res.error)
                }
                setCategories(res.data || [])
            } catch (err) {
                console.error("Categories unexpected error:", err)
                toast.error("حدث خطأ غير متوقع")
            } finally {
                setLoading(false)
            }
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
        <div className="space-y-6 p-6 pb-20">
            <PremiumPageHeader
                title="إعدادات التصنيفات"
                description="إدارة تصنيفات الأصول والأنواع المتاحة في النظام"
                icon={Tags}
                backLink="/settings"
                backText="الإعدادات"
            />

            <div className="w-full">
                <CategoryManager initialCategories={categories} />
            </div>
        </div>
    )
}
