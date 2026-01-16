'use client'

import { useState, useRef, useEffect } from 'react'
import { QrCode, Download, Printer, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import QRCodeStyling from 'qr-code-styling'
import { toast } from 'sonner'

interface QRCodeGeneratorProps {
    data: string
    name: string
    description?: string
    department?: string
    assetTag?: string
    employeeName?: string
    assetType?: string
}

export function QRCodeGenerator({
    data,
    name,
    description,
    department,
    assetTag,
    employeeName,
    assetType
}: QRCodeGeneratorProps) {
    const [open, setOpen] = useState(false)
    const qrRef = useRef<HTMLDivElement>(null)
    const qrCode = useRef<QRCodeStyling | null>(null)

    useEffect(() => {
        if (open && qrRef.current) {
            if (!qrCode.current) {
                qrCode.current = new QRCodeStyling({
                    width: 250,
                    height: 250,
                    type: 'svg',
                    data,
                    image: '/logo.png',
                    dotsOptions: {
                        color: '#000000',
                        type: 'square'
                    },
                    backgroundOptions: {
                        color: '#ffffff',
                    },
                    imageOptions: {
                        crossOrigin: 'anonymous',
                        margin: 5
                    }
                })
            }
            qrRef.current.innerHTML = ''
            qrCode.current.append(qrRef.current)
        }
    }, [open, data])

    const handleDownload = async () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // High resolution for large printing
        const width = 800
        const height = 600
        canvas.width = width
        canvas.height = height

        // White background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)

        // Border
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 8
        ctx.strokeRect(10, 10, width - 20, height - 20)

        // Text settings
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // 1. Organization Name (Top)
        ctx.font = 'bold 36px Arial'
        ctx.fillText('إدارة أصول تقنية المعلومات', width / 2, 60)

        // Separator Line
        ctx.beginPath()
        ctx.moveTo(40, 90)
        ctx.lineTo(width - 40, 90)
        ctx.lineWidth = 2
        ctx.stroke()

        // 2. Department
        if (department) {
            ctx.font = 'bold 28px Arial'
            ctx.fillText(`الإدارة: ${department}`, width / 2, 130)
        }

        // 3. Asset Name
        ctx.font = '900 48px Arial'
        ctx.fillText(name, width / 2, 190)

        // 4. Asset Type
        if (assetType) {
            ctx.font = 'bold 24px Arial'
            ctx.fillText(`النوع: ${assetType}`, width / 2, 240)
        }

        // 5. Employee Name
        if (employeeName) {
            ctx.font = 'bold 24px Arial'
            ctx.fillText(`الموظف: ${employeeName}`, width / 2, 280)
        }

        // 6. QR Code
        if (qrCode.current) {
            const rawData = await qrCode.current.getRawData('png')
            if (rawData) {
                const blob = rawData as Blob
                const img = new Image()
                img.src = URL.createObjectURL(blob)
                await new Promise((resolve) => {
                    img.onload = () => {
                        const qrSize = 220
                        const qrY = 310
                        ctx.drawImage(img, (width - qrSize) / 2, qrY, qrSize, qrSize)
                        resolve(null)
                    }
                })
            }
        }

        // 7. Asset Tag (Barcode Text)
        const bottomY = height - 40
        ctx.font = 'bold 40px Monospace'
        // Draw background for tag
        const tagText = assetTag || data
        const textWidth = ctx.measureText(tagText).width
        ctx.fillStyle = '#000000'
        ctx.fillRect((width - textWidth) / 2 - 20, bottomY - 25, textWidth + 40, 50)

        ctx.fillStyle = '#ffffff'
        ctx.fillText(tagText, width / 2, bottomY)

        // Download
        const link = document.createElement('a')
        link.download = `Sticker_${name.replace(/\s+/g, '_')}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        toast.success('تم تحميل الملصق عالي الدقة')
    }

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=800,width=1000')
        if (!printWindow) {
            toast.error('يرجى السماح بالنوافذ المنبثقة')
            return
        }

        const qrImage = qrRef.current?.querySelector('svg')?.outerHTML || ''

        const printContent = `
            <html dir="rtl">
            <head>
                <title>Asset Label - ${name}</title>
                <style>
                    @page {
                        size: auto;
                        margin: 0;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background: #f0f0f0;
                    }
                    .sticker {
                        width: 100mm; /* Larger width */
                        height: 70mm; /* Larger height */
                        background: white;
                        border: 3px solid black;
                        padding: 15px;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                        text-align: center;
                        position: relative;
                    }
                    .header {
                        font-size: 18px;
                        font-weight: bold;
                        border-bottom: 2px solid #000;
                        width: 100%;
                        padding-bottom: 8px;
                        margin-bottom: 10px;
                    }
                    .info-row {
                        font-size: 16px;
                        font-weight: bold;
                        margin: 2px 0;
                    }
                    .asset-name {
                        font-size: 28px;
                        font-weight: 900;
                        margin: 10px 0;
                    }
                    .qr-wrapper {
                        width: 120px;
                        height: 120px;
                        margin: 5px 0;
                    }
                    .qr-wrapper svg {
                        width: 100%;
                        height: 100%;
                    }
                    .footer {
                        font-family: monospace;
                        font-size: 24px;
                        font-weight: bold;
                        margin-top: 10px;
                        background: #000;
                        color: #fff;
                        padding: 5px 20px;
                        border-radius: 6px;
                        width: fit-content;
                    }
                    @media print {
                        body { background: white; }
                        .sticker {
                            border: 2px solid black;
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="sticker">
                    <div class="header">إدارة أصول تقنية المعلومات</div>
                    
                    ${department ? `<div class="info-row">الإدارة: ${department}</div>` : ''}
                    
                    <div class="asset-name">${name}</div>
                    
                    <div style="display: flex; gap: 20px; justify-content: center; width: 100%;">
                        ${assetType ? `<div class="info-row">النوع: ${assetType}</div>` : ''}
                        ${employeeName ? `<div class="info-row">| الموظف: ${employeeName}</div>` : ''}
                    </div>

                    <div class="qr-wrapper">
                        ${qrImage}
                    </div>
                    
                    <div class="footer">${assetTag || data}</div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `

        printWindow.document.write(printContent)
        printWindow.document.close()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 ml-2" />
                    QR Code
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[100vw] w-full h-[100vh] p-0 gap-0 bg-slate-50 dark:bg-slate-950 overflow-hidden" dir="rtl">
                <div className="w-full h-full overflow-y-auto">
                    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-6">
                        <PremiumPageHeader
                            title="ملصق الأصل (طباعة كبيرة)"
                            description="معاينة وطباعة ملصق الأصل بجميع التفاصيل"
                            icon={QrCode}
                            rightContent={
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={() => setOpen(false)}
                                    className="text-muted-foreground hover:bg-slate-200/50 gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    إغلاق
                                </Button>
                            }
                        />

                        <Card className="card-elevated border-t-4 border-t-primary/20">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Printer className="h-5 w-5 text-primary" />
                                    معاينة الطباعة
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-8 py-8">
                                <div className="border-4 border-black p-6 w-[400px] h-[300px] flex flex-col items-center justify-between bg-white shadow-2xl transform scale-100 hover:scale-105 transition-transform duration-300">
                                    <div className="text-lg font-bold border-b-2 border-black w-full text-center pb-2">
                                        إدارة أصول تقنية المعلومات
                                    </div>

                                    {department && (
                                        <div className="text-sm font-bold text-gray-800">الإدارة: {department}</div>
                                    )}

                                    <div className="text-2xl font-black truncate max-w-full px-2">{name}</div>

                                    <div className="flex gap-2 text-xs font-bold text-gray-600">
                                        {assetType && <span>{assetType}</span>}
                                        {employeeName && <span>| {employeeName}</span>}
                                    </div>

                                    <div className="w-24 h-24 flex items-center justify-center">
                                        <div ref={qrRef} />
                                    </div>

                                    <div className="text-xl font-mono font-bold bg-black text-white px-4 py-1 rounded">
                                        {assetTag || data}
                                    </div>
                                </div>

                                <div className="flex gap-4 w-full max-w-md">
                                    <Button onClick={handleDownload} className="flex-1 h-12 text-lg shadow-lg">
                                        <Download className="h-5 w-5 ml-2" />
                                        تحميل صورة عالية الدقة
                                    </Button>
                                    <Button onClick={handlePrint} variant="outline" className="flex-1 h-12 text-lg border-2">
                                        <Printer className="h-5 w-5 ml-2" />
                                        طباعة
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
