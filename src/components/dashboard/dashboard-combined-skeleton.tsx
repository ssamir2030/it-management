import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import {
    HeroStatsSkeleton,
    QuickStatsSkeleton,
    PerformanceSkeleton,
    ChartsSkeleton,
    ActivitySkeleton
} from '@/components/dashboard/dashboard-skeletons'

export function DashboardCombinedSkeleton() {
    return (
        <div className="space-y-10 pb-12 min-h-screen">
            <DashboardHeader />

            <HeroStatsSkeleton />

            <QuickStatsSkeleton />

            <PerformanceSkeleton />

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 shadow-xl opacity-50">
                        <div className="h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-muted-foreground">التحليلات والرسوم البيانية</h2>
                        <p className="text-muted-foreground/50 text-base">جاري تحميل البيانات...</p>
                    </div>
                </div>
                <ChartsSkeleton />
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-700 to-gray-800 shadow-xl opacity-50">
                        <div className="h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-muted-foreground">النشاط الأخير</h2>
                        <p className="text-muted-foreground/50 text-base">جاري تحديث السجلات...</p>
                    </div>
                </div>
                <ActivitySkeleton />
            </div>
        </div>
    )
}
