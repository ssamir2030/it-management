"use client"

import { Button } from "@/components/ui/button"
import { FileDown, FileSpreadsheet } from "lucide-react"

interface ExportButtonsProps {
    onExportPDF: () => void
    onExportExcel: () => void
    disabled?: boolean
}

export function ExportButtons({ onExportPDF, onExportExcel, disabled }: ExportButtonsProps) {
    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={onExportPDF}
                disabled={disabled}
                className="gap-2"
            >
                <FileDown className="h-4 w-4" />
                تصدير PDF
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onExportExcel}
                disabled={disabled}
                className="gap-2"
            >
                <FileSpreadsheet className="h-4 w-4" />
                تصدير Excel
            </Button>
        </div>
    )
}
