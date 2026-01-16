export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, MoreVertical, PlayCircle, Clock, Users } from "lucide-react"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { AdminCourseCard } from "@/components/learning/admin-course-card"

export default async function CoursesAdminPage() {
    const courses = await prisma.course.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: {
                select: { lessons: true }
            }
        }
    })

    return (
        <div className="space-y-6 pb-20">
            <PremiumPageHeader
                title="الدورات التدريبية"
                description="إدارة المحتوى التعليمي والدورات التدريبية للموظفين"
                icon={BookOpen}
                rightContent={
                    <Link href="/admin/courses/new">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4 ml-2" />
                            دورة جديدة
                        </Button>
                    </Link>
                }
            />

            {courses.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-10">
                        <div className="p-4 rounded-full bg-blue-50 mb-4">
                            <BookOpen className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">لا توجد دورات تدريبية</h3>
                        <p className="text-muted-foreground mb-4 text-center max-w-sm">
                            لم يتم إضافة أي دورات تدريبية بعد. ابدأ بإضافة الدورة الأولى لتمكين الموظفين من التعلم.
                        </p>
                        <Link href="/admin/courses/new">
                            <Button variant="outline">إضافة دورة جديدة</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <AdminCourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    )
}

