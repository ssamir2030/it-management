"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { getCustodyItemForPrint } from "@/app/actions/barcode"
import { BarcodeLabel } from "@/components/barcode/barcode-label"
import { Loader2 } from "lucide-react"

interface PrintPageProps {
    params: {
        id: string
    }
}

export default function PrintPage({ params }: PrintPageProps) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function loadData() {
            try {
                const result = await getCustodyItemForPrint(params.id)
                if (result.success && result.data) {
                    setData(result.data)
                } else {
                    setError(true)
                }
            } catch {
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [params.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-red-500">العنصر غير موجود</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center print:block print:h-auto print:w-auto">
            <BarcodeLabel data={data} />
        </div>
    )
}
