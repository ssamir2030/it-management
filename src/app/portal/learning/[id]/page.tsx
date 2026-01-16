export const dynamic = 'force-dynamic';

import { getCourseContent } from "@/app/actions/learning"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Clock, BookOpen, PlayCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CoursePlayerPage({ params }: { params: { id: string } }) {
    const { data } = await getCourseContent(params.id)

    if (!data || !data.course) {
        redirect('/portal/learning')
    }

    const { course } = data

    // Helper URLs for embed
    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('v=') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
        }
        return url; // Return as-is for other providers or if unable to parse (might be displayed in iframe directly)
    }

    const videoSrc = course.videoUrl ? getEmbedUrl(course.videoUrl) : null;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header / Navbar style */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/portal/learning">
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                <ArrowRight className="h-4 w-4 ml-2" />
                                عودة
                            </Button>
                        </Link>
                        <div className="h-6 w-px bg-slate-800" />
                        <h1 className="font-semibold text-lg line-clamp-1">{course.title}</h1>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {course.category}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Full Screen Focus */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Video / Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Video Player Container */}
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 relative group">
                            {videoSrc ? (
                                <iframe
                                    src={videoSrc}
                                    className="w-full h-full"
                                    allowFullScreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                                    <PlayCircle className="h-20 w-20 mb-4 opacity-50" />
                                    <p>لا يوجد محتوى فيديو متاح لهذه الدورة</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                            <h2 className="text-xl font-bold mb-4">عن الدورة</h2>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {course.description}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar / Lessons */}
                    <div className="space-y-6">
                        <Card className="bg-slate-900 border-slate-800 text-slate-200">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">مدة الدورة</span>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-400" />
                                        <span className="font-mono">{course.duration} دقيقة</span>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-800" />
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm text-slate-400">محتوى الدورة</h3>
                                    {/* If there were lessons, map them here. For now, it's a single video course. */}
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                        <PlayCircle className="h-4 w-4" />
                                        <span className="text-sm font-medium">الفيديو الرئيسي</span>
                                    </div>
                                    <p className="text-xs text-slate-500 text-center mt-4">
                                        بإكمالك لهذا الفيديو تكون قد أتممت متطلبات الدورة.
                                    </p>
                                </div>
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                    إتمام الدورة
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
