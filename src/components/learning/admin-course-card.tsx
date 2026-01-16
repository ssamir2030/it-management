'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    MoreVertical,
    PlayCircle,
    Clock,
    Trash2,
    Edit,
    Eye,
    EyeOff
} from "lucide-react"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { deleteCourse, toggleCoursePublish } from "@/app/actions/learning"

interface AdminCourseCardProps {
    course: {
        id: string
        title: string
        category: string
        imageUrl?: string | null
        isPublished: boolean
        duration: number | null
        _count: {
            lessons: number
        }
    }
}

export function AdminCourseCard({ course }: AdminCourseCardProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.')) return

        setLoading(true)
        const result = await deleteCourse(course.id)
        if (result.success) {
            toast({
                title: "تم الحذف بنجاح",
                description: "تم حذف الدورة التدريبية نهائياً",
                variant: "destructive"
            })
        } else {
            toast({
                title: "فشل الحذف",
                description: result.error,
                variant: "destructive"
            })
        }
        setLoading(false)
    }

    const handleTogglePublish = async () => {
        setLoading(true)
        const newStatus = !course.isPublished
        const result = await toggleCoursePublish(course.id, newStatus)

        if (result.success) {
            toast({
                title: newStatus ? "تم النشر" : "تم إلغاء النشر",
                description: newStatus
                    ? "أصبحت الدورة مرئية للموظفين الآن"
                    : "تم إخفاء الدورة عن الموظفين",
            })
        } else {
            toast({
                title: "فشل التحديث",
                description: result.error,
                variant: "destructive"
            })
        }
        setLoading(false)
    }

    return (
        <Card className={`overflow-hidden hover:shadow-lg transition-all group ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative">
                {course.imageUrl && (
                    <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                )}
                <div className="absolute top-3 right-3">
                    <Badge
                        variant={course.isPublished ? "default" : "secondary"}
                        className={course.isPublished ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                        {course.isPublished ? "منشور" : "مسودة"}
                    </Badge>
                </div>
            </div>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="line-clamp-1 mb-1">{course.title}</CardTitle>
                        <CardDescription>{course.category}</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Link href={`/admin/courses/${course.id}/edit`}>
                                <DropdownMenuItem className="cursor-pointer">
                                    <Edit className="w-4 h-4 ml-2" />
                                    تعديل
                                </DropdownMenuItem>
                            </Link>

                            <DropdownMenuItem onClick={handleTogglePublish} className="cursor-pointer">
                                {course.isPublished ? (
                                    <>
                                        <EyeOff className="w-4 h-4 ml-2" />
                                        إلغاء النشر
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4 ml-2" />
                                        نشر الدورة
                                    </>
                                )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <PlayCircle className="h-4 w-4" />
                        <span>{course._count.lessons} دروس</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration || 0} دقيقة</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
