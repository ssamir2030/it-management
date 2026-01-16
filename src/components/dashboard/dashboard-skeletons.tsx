import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function HeroStatsSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="relative overflow-hidden border-0 shadow-xl h-[180px]">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <Skeleton className="h-12 w-12 rounded-2xl" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-32 mb-2" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function QuickStatsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-lg">
                    <CardContent className="p-4 text-center flex flex-col items-center">
                        <Skeleton className="h-6 w-6 mb-2 rounded-full" />
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-6 w-12" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function PerformanceSkeleton() {
    return (
        <Card className="border-0 shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-8 w-48" />
                </CardTitle>
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-3 p-4 rounded-xl border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-8 w-12" />
                        </div>
                        <Skeleton className="h-3 w-full rounded-full" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export function ChartsSkeleton() {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Pie Charts */}
            <Card className="col-span-1 border-0 shadow-xl">
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-48 w-48 rounded-full" />
                </CardContent>
            </Card>
            <Card className="col-span-1 border-0 shadow-xl">
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-48 w-48 rounded-full" />
                </CardContent>
            </Card>
            <Card className="col-span-1 border-0 shadow-xl">
                <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-48 w-48 rounded-full" />
                </CardContent>
            </Card>

            {/* Trend Chart */}
            <div className="lg:col-span-3">
                <Card className="border-0 shadow-xl">
                    <CardHeader>
                        <Skeleton className="h-6 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <Skeleton className="w-full h-full rounded-xl" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export function ActivitySkeleton() {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                        </CardTitle>
                        <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent className="pt-6 space-y-3">
                        {Array.from({ length: 5 }).map((_, j) => (
                            <div key={j} className="flex items-center gap-3 p-3 rounded-xl border">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
