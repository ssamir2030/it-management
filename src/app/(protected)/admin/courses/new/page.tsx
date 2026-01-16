export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { CourseForm } from "@/components/learning/course-form"
import { BookPlus } from "lucide-react"

export default function NewCoursePage() {
    return (
        <div className="space-y-6 pb-20">
            <PremiumPageHeader
                title="إضافة دورة جديدة"
                description="أدخِل تفاصيل الدورة التدريبية"
                icon={BookPlus}
            />
            <CourseForm />
        </div>
    )
}
