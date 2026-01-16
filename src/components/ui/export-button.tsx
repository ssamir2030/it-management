import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from './button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

interface ExportButtonProps {
  onExportExcel: () => void
  onExportCSV: () => void
  isLoading?: boolean
  disabled?: boolean
}

export function ExportButton({
  onExportExcel,
  onExportCSV,
  isLoading = false,
  disabled = false,
}: ExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="default"
          disabled={disabled || isLoading}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isLoading ? 'جاري التصدير...' : 'تصدير'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportExcel} className="gap-2">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          <span>تصدير Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportCSV} className="gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span>تصدير CSV (.csv)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
