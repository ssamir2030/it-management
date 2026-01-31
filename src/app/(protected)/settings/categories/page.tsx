"use client"


import { useState, useEffect } from 'react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { CategoryManager } from '@/components/settings/category-manager'
import { LocationManager } from '@/components/settings/location-manager'
import { getAssetCategories } from '@/app/actions/categories-v2'
import { getLocations } from '@/app/actions/locations'
import { Tags, Loader2 } from "lucide-react"
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SystemVariablesPage() {
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState<any[]>([])
    const [locations, setLocations] = useState<any[]>([])

    useEffect(() => {
        async function loadData() {
            try {
                const [catsRes, locsRes] = await Promise.all([
                    getAssetCategories(),
                    getLocations()
                ])

                if (!catsRes.success) console.error("Categories load failed:", catsRes.error)
                if (!locsRes.success) console.error("Locations load failed")

                setCategories(catsRes.data || [])
                setLocations(locsRes.data || [])
            } catch (err) {
                console.error("Data load unexpected error:", err)
                toast.error("حدث خطأ غير متوقع أثناء تحميل البيانات")
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
                title="متغيرات النظام"
                description="إدارة القوائم المنسدلة: التصنيفات، المواقع، وغيرها"
                icon={Tags}
                backLink="/settings"
                backText="الإعدادات"
            />

            <Tabs defaultValue="main" className="w-full space-y-6">
                <TabsList className="w-full justify-start h-12 bg-card border p-1 rounded-xl gap-2">
                    <TabsTrigger
                        value="main"
                        className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 rounded-lg text-base"
                    >
                        التصنيفات الرئيسية
                    </TabsTrigger>
                    <TabsTrigger
                        value="sub"
                        className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 rounded-lg text-base"
                    >
                        التصنيفات الفرعية
                    </TabsTrigger>
                    <TabsTrigger
                        value="locations"
                        className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-10 rounded-lg text-base"
                    >
                        المواقع الجغرافية
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="main" className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <CategoryManager initialCategories={categories} mode="main" />
                </TabsContent>

                <TabsContent value="sub" className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <CategoryManager initialCategories={categories} mode="sub" />
                </TabsContent>

                <TabsContent value="locations" className="animate-in fade-in slide-in-from-top-2 duration-500">
                    <LocationManager initialLocations={locations} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
