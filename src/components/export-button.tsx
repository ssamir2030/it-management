'use client'

import { useState } from 'react'
import { Download, FileSpreadsheet, FileText, Printer, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface ExportButtonProps {
    data: any[]
    filename: string
    title?: string
}

export function ExportButton({ data, filename, title = 'تصدير البيانات' }: ExportButtonProps) {
    const [loading, setLoading] = useState(false)

    const exportToExcel = () => {
        try {
            setLoading(true)

            // Create workbook and worksheet
            const ws = XLSX.utils.json_to_sheet(data)
            const wb = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(wb, ws, 'Data')

            // Auto-size columns
            const colWidths = Object.keys(data[0] || {}).map(key => ({
                wch: Math.max(
                    key.length,
                    ...data.map(row => String(row[key] || '').length)
                )
            }))
            ws['!cols'] = colWidths

            // Export
            XLSX.writeFile(wb, `${filename}_${Date.now()}.xlsx`)
            toast.success('تم تصدير الملف بنجاح')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('فشل التصدير')
        } finally {
            setLoading(false)
        }
    }

    const exportToCSV = () => {
        try {
            setLoading(true)

            const ws = XLSX.utils.json_to_sheet(data)
            const csv = XLSX.utils.sheet_to_csv(ws)

            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `${filename}_${Date.now()}.csv`
            link.click()

            toast.success('تم تصدير الملف بنجاح')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('فشل التصدير')
        } finally {
            setLoading(false)
        }
    }

    const print = () => {
        try {
            // Create printable content
            const printWindow = window.open('', '', 'height=600,width=800')
            if (!printWindow) {
                toast.error('يرجى السماح بالنوافذ المنبثقة')
                return
            }

            const table = `
                <html dir="rtl">
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: 'Arial', sans-serif; padding: 20px; }
                        h1 { color: #333; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                        th { background-color: #4f46e5; color: white; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        @media print {
                            body { margin: 0; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <p>تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</p>
                    <table>
                        <thead>
                            <tr>
                                ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(row => `
                                <tr>
                                    ${Object.values(row).map(val => `<td>${val}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
                </html>
            `

            printWindow.document.write(table)
            printWindow.document.close()
            toast.success('جاري الطباعة...')
        } catch (error) {
            console.error('Print error:', error)
            toast.error('فشل الطباعة')
        }
    }

    if (data.length === 0) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={loading}>
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                        <Download className="h-4 w-4 ml-2" />
                    )}
                    تصدير
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>تصدير كـ</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
                    <FileSpreadsheet className="ml-2 h-4 w-4 text-green-600" />
                    <span>Excel (.xlsx)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                    <FileText className="ml-2 h-4 w-4 text-blue-600" />
                    <span>CSV (.csv)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={print} className="cursor-pointer">
                    <Printer className="ml-2 h-4 w-4 text-gray-600" />
                    <span>طباعة</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
