"use client"

import { useEffect } from "react"
import Barcode from "react-barcode"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface BarcodeLabelProps {
    data: {
        companyName: string
        assetName: string
        assetTag: string
        serialNumber?: string
        assetType: string
        employeeName: string
        department: string
        date: Date
    }
}

export function BarcodeLabel({ data }: BarcodeLabelProps) {
    // Translation Logic
    const translateType = (type: string) => {
        const normalized = (type || '').trim().toUpperCase()
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
        }
        // Specific fallback if mapped value is missing but it's a known key
        if (normalized === 'COMPUTER' || normalized === 'PC') return 'حاسب آلي'

        return map[normalized] || type || 'جهاز'
    }

    return (
        <div className="flex flex-col items-center gap-8 bg-slate-900 min-h-screen p-8 print:bg-white print:p-0 print:min-h-0">
            <div className="print:hidden flex flex-col items-center gap-4 w-full max-w-md">
                <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm w-full text-center shadow-lg">
                    <p className="font-bold mb-2 text-lg">معاينة الطباعة</p>
                    <p className="text-slate-300">تأكد من إعداد حجم الورق في الطابعة ليكون (70mm x 40mm).</p>
                </div>
                <Button onClick={() => window.print()} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                    <Printer className="h-4 w-4" />
                    طباعة الملصق
                </Button>
            </div>

            <div className="print-container" dir="rtl">
                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
                    
                    @media print {
                        @page {
                            size: 70mm 40mm;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: white !important;
                        }
                        .print-container {
                            display: flex !important;
                            justify-content: center;
                            align-items: center;
                            width: 70mm;
                            height: 40mm;
                        }
                    }
                    
                    .label-font {
                        font-family: 'Cairo', sans-serif !important;
                    }
                `}</style>

                <div
                    className="bg-white border-[2px] border-black rounded-[0.5rem] p-1 flex flex-col justify-between shadow-none overflow-hidden relative box-border label-font text-black"
                    style={{
                        width: '70mm',
                        height: '40mm',
                        boxSizing: 'border-box'
                    }}
                >
                    {/* 1. Header */}
                    <div className="text-center pb-0 border-b-[1.5px] border-black w-full">
                        <h1 className="text-[10px] font-extrabold leading-tight text-black m-0 p-0 block w-full whitespace-nowrap">
                            الجمعية الخيرية لتحفيظ القرآن الكريم بتبوك
                        </h1>
                    </div>

                    {/* 2. Info Row */}
                    <div className="flex justify-between items-center text-[9px] font-bold border-b-0 border-black py-0.5 px-0.5 text-black w-full leading-tight">
                        <div className="text-right flex-1 pl-1 truncate">
                            {data.department || 'تقنية المعلومات'}
                        </div>
                        <div className="text-center flex-shrink-0 px-1 min-w-[50px]">
                            {translateType(data.assetType)}
                        </div>
                        <div className="text-left flex-1 truncate pr-1">
                            {data.employeeName}
                        </div>
                    </div>

                    {/* 3. Asset Name */}
                    <div className="flex-1 flex flex-col items-center justify-center -mt-0.5">
                        <h2 className="text-[14px] font-black uppercase tracking-wider text-black m-0 p-0 dir-ltr font-sans leading-none pt-0.5">
                            {data.assetName}
                        </h2>

                        {/* 4. Barcode */}
                        <div className="w-full flex justify-center scale-x-105 origin-center overflow-hidden h-[18px]">
                            <Barcode
                                value={data.assetTag}
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

                    {/* 5. Footer */}
                    <div className="border-t-[1.5px] border-black pt-0.5 mt-auto w-full">
                        <div className="flex justify-between items-center text-[9px] font-bold text-black px-0.5 leading-none">
                            <div className="font-sans dir-ltr tracking-wider font-extrabold flex-1">
                                {data.assetTag}
                            </div>
                            {data.serialNumber && (
                                <div className="font-sans dir-ltr font-normal text-[8px] flex-1 text-center truncate px-1">
                                    SN: {data.serialNumber}
                                </div>
                            )}
                            <div className="font-sans dir-ltr tracking-wider font-extrabold flex-1 text-left">
                                {data.date ? new Date(data.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
