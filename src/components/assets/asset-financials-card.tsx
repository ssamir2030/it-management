'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingDown, Calendar, AlertCircle } from "lucide-react"
import { calculateStraightLineDepreciation } from "@/lib/depreciation"

interface AssetFinancialsCardProps {
    price: number | null
    salvageValue: number | null
    lifespan: number | null
    purchaseDate: Date | null
}

export function AssetFinancialsCard({ price, salvageValue, lifespan, purchaseDate }: AssetFinancialsCardProps) {
    const data = useMemo(() => {
        return calculateStraightLineDepreciation(
            price || 0,
            salvageValue || 0,
            lifespan || 36,
            purchaseDate ? new Date(purchaseDate) : null
        )
    }, [price, salvageValue, lifespan, purchaseDate])

    if (!price || price <= 0) {
        return (
            <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-3 border-b">
                    <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        القيمة المالية
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <p className="text-sm">لم يتم تسجيل سعر الشراء لهذا الأصل.</p>
                </CardContent>
            </Card>
        )
    }

    const depreciationPercentage = Math.min(100, Math.round(((data.initialPrice - data.currentValue) / (data.initialPrice - data.salvageValue)) * 100)) || 0

    return (
        <Card className="border-0 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-3 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    القيمة والإهلاك
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">سعر الشراء</span>
                        <p className="text-lg font-bold">{data.initialPrice.toLocaleString()} SAR</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">القيمة الحالية (تقديري)</span>
                        <p className={`text-lg font-bold ${data.currentValue <= data.salvageValue ? 'text-red-500' : 'text-green-600'}`}>
                            {data.currentValue.toLocaleString()} SAR
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span>نسبة الإهلاك</span>
                        <span>{Math.round((data.ageMonths / data.lifespanMonths) * 100)}% من العمر الافتراضي</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${data.isFullyDepreciated ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, (data.ageMonths / data.lifespanMonths) * 100)}%` }}
                        />
                    </div>
                </div>

                <div className="pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingDown className="h-4 w-4" />
                        <span>-{data.monthlyRate.toFixed(2)} SAR / شهر</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{data.lifespanMonths} شهر (العمر)</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
