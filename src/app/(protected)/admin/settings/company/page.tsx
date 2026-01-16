"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { getCompanyProfile } from "@/app/actions/system"
import CompanyForm from "@/components/admin/settings/company-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function CompanyProfilePage() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<any>(null)
    const [canManage, setCanManage] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                const result = await getCompanyProfile()
                if (result.success) {
                    setData(result.data)
                    // For now, allow management (role check can be done server-side in the action)
                    setCanManage(true)
                } else {
                    setError(result.error || "فشل في جلب البيانات")
                }
            } catch (err) {
                setError("حدث خطأ غير متوقع")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <CompanyForm
            initialData={data || {}}
            readOnly={!canManage}
        />
    )
}
