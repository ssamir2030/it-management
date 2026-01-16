'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'
import { AVAILABLE_SERVICES, ServiceCategory, ServiceItem } from '@/lib/constants/available-services'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ServiceCatalog() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<ServiceCategory>('ALL')

    const filteredServices = AVAILABLE_SERVICES.filter(service => {
        const matchesCategory = activeCategory === 'ALL' || service.category === activeCategory
        const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const categories: { id: ServiceCategory; label: string }[] = [
        { id: 'ALL', label: 'الكل' },
        { id: 'HARDWARE', label: 'أجهزة ومعدات' },
        { id: 'SOFTWARE', label: 'برامج وأنظمة' },
        { id: 'ACCESS', label: 'صلاحيات ودخول' },
        { id: 'SUPPORT', label: 'دعم فني' },
    ]

    return (
        <div className="space-y-8">
            {/* Search Hero */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="ماذا تحتاج اليوم؟ (مثال: لابتوب، طابعة، بريد...)"
                        className="h-12 pr-12 text-lg shadow-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                            activeCategory === cat.id
                                ? "bg-blue-600 text-white shadow-md scale-105"
                                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        )}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredServices.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link href={service.href}>
                                <Card className="h-full p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-100 dark:border-slate-800 group cursor-pointer relative overflow-hidden bg-white/70 dark:bg-slate-800/40 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800/60">
                                    {/* Gradient Decoration */}
                                    <div className={cn("absolute top-0 right-0 w-full h-1", service.color)} />

                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn("p-3 rounded-2xl text-white shadow-md group-hover:scale-110 transition-transform duration-300", service.color)}>
                                            <service.icon className="h-6 w-6" />
                                        </div>
                                        {service.popular && (
                                            <div className="flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold px-2 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                شائع
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                        {service.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed min-h-[40px]">
                                        {service.description}
                                    </p>

                                    <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                        طلب الآن
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredServices.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>لا توجد خدمات تطابق بحثك</p>
                </div>
            )}
        </div>
    )
}
