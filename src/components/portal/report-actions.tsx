'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Image as ImageIcon, FileDown, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

interface ReportActionsProps {
    elementId?: string
    variant?: 'top' | 'bottom'
}

export function ReportActions({ elementId = 'custody-report', variant = 'top' }: ReportActionsProps) {
    const [isExporting, setIsExporting] = useState<string | null>(null)

    const handleSaveImage = async () => {
        const element = document.getElementById(elementId)
        if (!element) return

        setIsExporting('image')
        try {
            // Optimization for high quality
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })

            const link = document.createElement('a')
            link.download = `custody-report-${new Date().getTime()}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
            toast.success('تم حفظ التقرير كصورة بنجاح')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('حدث خطأ أثناء تصدير الصورة')
        } finally {
            setIsExporting(null)
        }
    }

    const handleDownloadPDF = async () => {
        const element = document.getElementById(elementId)
        if (!element) return

        setIsExporting('pdf')
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgProps = pdf.getImageProperties(imgData)
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`custody-report-${new Date().getTime()}.pdf`)
            toast.success('تم تحميل ملف PDF بنجاح')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('حدث خطأ أثناء تصدير PDF')
        } finally {
            setIsExporting(null)
        }
    }

    if (variant === 'bottom') {
        return (
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 p-6 rounded-2xl bg-slate-50/50 border border-slate-100 no-print">
                <Button
                    onClick={handleSaveImage}
                    disabled={!!isExporting}
                    className="bg-[#f59e0b] hover:bg-[#d97706] text-white px-8 py-6 rounded-xl shadow-lg shadow-orange-500/20 transform transition hover:-translate-y-1 flex items-center gap-3 text-lg font-black"
                >
                    {isExporting === 'image' ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
                    حفظ كصورة
                </Button>

                <Button
                    onClick={handleDownloadPDF}
                    disabled={!!isExporting}
                    className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white px-8 py-6 rounded-xl shadow-lg shadow-blue-500/20 transform transition hover:-translate-y-1 flex items-center gap-3 text-lg font-black"
                >
                    {isExporting === 'pdf' ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileDown className="h-6 w-6" />}
                    تحميل PDF
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-wrap items-center gap-4 no-print">
            <Button
                variant="outline"
                size="lg"
                onClick={() => window.print()}
                className="gap-2 border-2 hover:bg-slate-50 font-bold"
            >
                <Printer className="h-5 w-5" />
                طباعة سريعة
            </Button>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <Button
                variant="ghost"
                className="gap-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 font-bold"
                onClick={handleSaveImage}
                disabled={!!isExporting}
            >
                {isExporting === 'image' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                حفظ كصورة
            </Button>

            <Button
                variant="ghost"
                className="gap-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-bold"
                onClick={handleDownloadPDF}
                disabled={!!isExporting}
            >
                {isExporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                تصدير PDF
            </Button>
        </div>
    )
}
