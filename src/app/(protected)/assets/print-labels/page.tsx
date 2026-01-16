'use client'

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getAssets } from '@/app/actions/assets'
import QRCodeStyling from 'qr-code-styling'
import { Suspense } from 'react'


import Barcode from 'react-barcode'


function PrintLabelsContent() {
    const searchParams = useSearchParams()
    const ids = searchParams.get('ids')?.split(',') || []
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAssets() {
            if (ids.length === 0) {
                setLoading(false)
                return
            }
            const result = await getAssets()
            if (result.success && result.data) {
                const filtered = result.data.filter((a: any) => ids.includes(a.id))
                setAssets(filtered)
            }
            setLoading(false)
        }
        fetchAssets()
    }, [ids])

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">جاري تحميل الملصقات...</div>
    }


    return (
        <div className="min-h-screen bg-slate-900 p-8 font-sans print:bg-white print:p-0">
            {/* No-Print Controls */}
            <div className="print:hidden mb-8 mx-auto max-w-4xl flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-xl text-white">
                <div className="flex items-center gap-4">
                    <Link href="/assets">
                        <Button variant="outline" size="sm" className="gap-2 bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:text-white">
                            <ArrowLeft className="h-4 w-4" />
                            عودة للأصول
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">طباعة الملصقات</h1>
                        <p className="text-sm text-slate-400">معاينة {assets.length} ملصق (70mm × 40mm)</p>
                    </div>
                </div>
                <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
                    <Printer className="h-4 w-4" />
                    طباعة الآن
                </Button>
            </div>

            {/* Labels Grid - Preview Mode (Centered Sheets) */}
            <div className="max-w-[210mm] mx-auto print:max-w-none print:w-full" dir="rtl">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
                    
                    @media print {
                        @page {
                            size: 70mm 40mm;
                            margin: 0;
                        }
                        body {
                            background: white !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .print-container {
                            display: block !important;
                            width: 100% !important;
                        }
                    }
                    
                    /* Custom Font for Labels */
                    .label-font {
                        font-family: 'Cairo', sans-serif !important;
                    }
                `}</style>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:block print:gap-0 print:space-y-0 justify-items-center">
                    {assets.map((asset) => (
                        <div
                            key={asset.id}
                            className="bg-white border-[2px] border-black rounded-[0.8rem] p-1 flex flex-col justify-between shadow-sm overflow-hidden relative box-border print:break-inside-avoid text-black print:text-black label-font"
                            style={{
                                width: '70mm',
                                height: '40mm',
                                margin: '0',
                                pageBreakInside: 'avoid',
                                color: 'black',
                                backgroundColor: 'white'
                            }}
                        >
                            {/* 1. Top Header */}
                            <div className="text-center pb-0 border-b-[1.5px] border-black w-full">
                                <h1 className="text-[10px] font-extrabold leading-tight text-black m-0 p-0 block w-full whitespace-nowrap">
                                    الجمعية الخيرية لتحفيظ القرآن الكريم بتبوك
                                </h1>
                            </div>

                            {/* 2. Info Bar (Dept - Type - Name) */}
                            <div className="flex justify-between items-center text-[9px] font-bold border-b-0 border-black py-0.5 px-0.5 text-black w-full leading-tight">
                                <div className="text-right flex-1 pl-1 truncate">
                                    {asset.employee?.department?.name || 'تقنية المعلومات'}
                                </div>
                                <div className="text-center flex-shrink-0 px-1 min-w-[50px]">
                                    {(() => {
                                        const type = (asset.type || '').trim().toUpperCase();
                                        const map: Record<string, string> = {
                                            'SERVER': 'خادم',
                                            'COMPUTER': 'حاسب آلي',
                                            'DESKTOP': 'حاسب آلي',
                                            'PC': 'حاسب آلي',
                                            'LAPTOP': 'لابتوب',
                                            'PRINTER': 'طابعة',
                                            'SCANNER': 'ماسح ضوئي',
                                            'NETWORK_DEVICE': 'جهاز شبكة',
                                            'ACCESS_POINT': 'نقطة وصول',
                                            'TABLET': 'جهاز لوحي'
                                        };
                                        if (type === 'COMPUTER' || type === 'PC') return 'حاسب آلي';
                                        return map[type] || type || 'جهاز';
                                    })()}
                                </div>
                                <div className="text-left flex-1 truncate pr-1">
                                    {asset.employee?.name || 'مستودع الأصول'}
                                </div>
                            </div>

                            {/* 3. Main Asset Name (Centered, Large) */}
                            <div className="flex-1 flex flex-col items-center justify-center -mt-0.5">
                                <h2 className="text-[14px] font-black uppercase tracking-wider text-black m-0 p-0 dir-ltr font-sans leading-none pt-0.5">
                                    {asset.name}
                                </h2>

                                {/* 4. Barcode (Centered) */}
                                <div className="w-full flex justify-center scale-x-105 origin-center overflow-hidden h-[18px]">
                                    <Barcode
                                        value={asset.tag}
                                        width={1.5}
                                        height={25}
                                        fontSize={0}
                                        margin={0}
                                        displayValue={false}
                                        background="transparent"
                                        lineColor="#000000"
                                    />
                                </div>
                            </div>

                            {/* 5. Footer (Line + Tag/Date) */}
                            <div className="border-t-[1.5px] border-black pt-0.5 mt-auto w-full">
                                <div className="flex justify-between items-center text-[9px] font-bold text-black px-0.5 leading-none">
                                    <div className="font-sans dir-ltr tracking-wider font-extrabold flex-1">
                                        {asset.tag}
                                    </div>
                                    {asset.serialNumber && (
                                        <div className="font-sans dir-ltr font-normal text-[8px] flex-1 text-center truncate px-1">
                                            SN: {asset.serialNumber}
                                        </div>
                                    )}
                                    <div className="font-sans dir-ltr tracking-wider font-extrabold flex-1 text-left">
                                        {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


export default function PrintLabelsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
            <PrintLabelsContent />
        </Suspense>
    )
}
