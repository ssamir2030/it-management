export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { FileBarChart } from 'lucide-react'
import { ReportGenerator } from '@/components/reports/report-generator'

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="مركز التقارير"
                description="تحليل البيانات وتصدير التقارير المالية والإدارية"
                icon={FileBarChart}
            />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2">
                    <ReportGenerator />
                </div>

                {/* Stats or Info Cards could go here */}
                <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">ملاحظات التصدير</h3>
                        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-2 list-disc list-inside">
                            <li>يمكنك تصدير البيانات بصيغة Excel للتحليل المتقدم.</li>
                            <li>صيغة PDF مناسبة للطباعة والمشاركة الرسمية.</li>
                            <li>يتم تحديث البيانات في الوقت الفعلي عند طلب التقرير.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
