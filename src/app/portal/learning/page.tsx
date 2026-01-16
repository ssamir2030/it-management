'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { getCourses } from '@/app/actions/learning'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { BookOpen, Award, PlayCircle, Clock, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default function LearningPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            setLoading(true)
            const res = await getCourses()
            if (res.success && res.data) {
                setCourses(res.data)
            }
            setLoading(false)
        }
        load()
    }, [])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            <div className="container mx-auto px-4 py-8">
                <PremiumPageHeader
                    title="مركز التعلم والتوعية"
                    description="طور مهاراتك ومعرفتك بالأمن السيبراني والتقنيات"
                    icon={BookOpen}
                    rightContent={
                        <div className="flex items-center gap-3">
                            <Link href="/portal/dashboard">
                                <Button variant="ghost" className="gap-2 text-white hover:bg-white/20">
                                    <ArrowRight className="h-4 w-4" />
                                    العودة للرئيسية
                                </Button>
                            </Link>
                            <Link href="/portal/learning/certificates/new">
                                <Button className="gap-2 bg-white text-blue-600 hover:bg-blue-50 border-0">
                                    <Plus className="h-4 w-4" />
                                    إضافة شهادة
                                </Button>
                            </Link>
                            <Link href="/portal/learning/report">
                                <Button variant="outline" className="gap-2 bg-white/10 text-white hover:bg-white/20 border-white/20 hover:text-white">
                                    <Award className="h-4 w-4" />
                                    سجل المهادات
                                </Button>
                            </Link>
                        </div>
                    }
                />

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-semibold mb-2">لا توجد دورات متاحة حالياً</h3>
                        <p className="text-gray-500">سيتم إضافة دورات تدريبية قريباً، يرجى التحقق لاحقاً.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-md group">
                                <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                                    {course.imageUrl ? (
                                        <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <BookOpen className="h-16 w-16 text-white/30" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-white/90 text-blue-700 hover:bg-white">
                                            {course.category}
                                        </Badge>
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1 group-hover:text-blue-600 transition-colors">
                                        {course.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                                        {course.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <PlayCircle className="h-4 w-4" />
                                            <span>{course._count?.lessons || 0} دروس</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{course.duration || 60} دقيقة</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-gray-50 dark:bg-slate-800/50">
                                    <Link href={`/portal/learning/${course.id}`} className="w-full">
                                        <Button className="w-full">
                                            ابدأ التعلم
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
