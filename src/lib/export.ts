import * as XLSX from 'xlsx'

/**
 * Export Utilities for Tables
 * وظائف تصدير البيانات إلى Excel و CSV
 */

export interface ExportColumn {
  key: string
  label: string
  format?: (value: any) => string
}

/**
 * تصدير بيانات إلى Excel
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
) {
  // تحضير البيانات
  const exportData = data.map(row => {
    const formattedRow: Record<string, any> = {}
    columns.forEach(col => {
      const value = row[col.key]
      formattedRow[col.label] = col.format ? col.format(value) : value
    })
    return formattedRow
  })

  // إنشاء workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)

  // تعيين عرض الأعمدة
  const colWidths = columns.map(col => ({
    wch: Math.max(col.label.length, 15)
  }))
  ws['!cols'] = colWidths

  // إضافة worksheet إلى workbook
  XLSX.utils.book_append_sheet(wb, ws, 'البيانات')

  // حفظ الملف
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * تصدير بيانات إلى CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
) {
  // تحضير البيانات
  const exportData = data.map(row => {
    const formattedRow: Record<string, any> = {}
    columns.forEach(col => {
      const value = row[col.key]
      formattedRow[col.label] = col.format ? col.format(value) : value
    })
    return formattedRow
  })

  // إنشاء workbook
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)
  XLSX.utils.book_append_sheet(wb, ws, 'البيانات')

  // حفظ كـ CSV
  XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' })
}

/**
 * تنسيق التاريخ للتصدير
 */
export function formatDateForExport(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ar-SA')
}

/**
 * تنسيق القيمة Boolean
 */
export function formatBooleanForExport(value: boolean | null): string {
  if (value === null) return ''
  return value ? 'نعم' : 'لا'
}

/**
 * تنسيق الأرقام
 */
export function formatNumberForExport(value: number | null): string {
  if (value === null) return ''
  return value.toLocaleString('ar-SA')
}

/**
 * Assets Export Configuration
 */
export const assetsExportColumns: ExportColumn[] = [
  { key: 'tag', label: 'رقم الأصل' },
  { key: 'name', label: 'اسم الأصل' },
  { key: 'type', label: 'النوع' },
  { key: 'serialNumber', label: 'الرقم التسلسلي' },
  { key: 'manufacturer', label: 'الشركة المصنعة' },
  { key: 'model', label: 'الموديل' },
  { key: 'status', label: 'الحالة' },
  {
    key: 'employee.name',
    label: 'الموظف',
    format: (val) => val || '-'
  },
  {
    key: 'location.name',
    label: 'الموقع',
    format: (val) => val || '-'
  },
  {
    key: 'purchaseDate',
    label: 'تاريخ الشراء',
    format: formatDateForExport
  },
  {
    key: 'warrantyExpiry',
    label: 'انتهاء الضمان',
    format: formatDateForExport
  },
  {
    key: 'createdAt',
    label: 'تاريخ الإضافة',
    format: formatDateForExport
  },
]

/**
 * Employees Export Configuration
 */
export const employeesExportColumns: ExportColumn[] = [
  { key: 'name', label: 'الاسم' },
  { key: 'identityNumber', label: 'رقم الهوية' },
  { key: 'email', label: 'البريد الإلكتروني' },
  { key: 'phone', label: 'الهاتف' },
  { key: 'jobTitle', label: 'المسمى الوظيفي' },
  {
    key: 'department.name',
    label: 'الإدارة',
    format: (val) => val || '-'
  },
  {
    key: 'location.name',
    label: 'الموقع',
    format: (val) => val || '-'
  },
  {
    key: '_count.assets',
    label: 'عدد الأصول',
    format: (val) => val?.toString() || '0'
  },
  {
    key: 'createdAt',
    label: 'تاريخ الإضافة',
    format: formatDateForExport
  },
]

/**
 * Helper لاستخراج قيمة nested
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((curr, prop) => curr?.[prop], obj)
}

/**
 * تحضير البيانات للتصدير (مع nested values)
 */
export function prepareDataForExport<T>(data: T[], columns: ExportColumn[]): any[] {
  return data.map(row => {
    const preparedRow: Record<string, any> = {}
    columns.forEach(col => {
      const value = getNestedValue(row, col.key)
      preparedRow[col.key] = value
    })
    return preparedRow
  })
}
