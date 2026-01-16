import * as XLSX from 'xlsx'

// Helper to create a styled workbook
const createWorkbook = () => {
    const workbook = XLSX.utils.book_new()
    workbook.Workbook = { Views: [{ RTL: true }] }
    return workbook
}

// Helper to create a stats sheet
const createStatsSheet = (title: string, stats: any) => {
    const statsData = [
        [title],
        ['التاريخ:', new Date().toLocaleDateString('ar-EG')],
        [],
        ['ملخص الإحصائيات'],
        ...Object.entries(stats).map(([key, value]) => [key, value]),
        []
    ]
    const sheet = XLSX.utils.aoa_to_sheet(statsData)
    sheet['!cols'] = [{ wch: 25 }, { wch: 35 }]
    sheet['!views'] = [{ rightToLeft: true }]
    return sheet
}

// ==================== تصدير تقرير الأصول إلى Excel ====================

export function exportAssetsToExcel(assets: any[], stats: any) {
    const workbook = createWorkbook()

    // Combined Data Sheet
    const data = [
        ['تقرير الأصول الشامل'],
        ['تاريخ التقرير:', new Date().toLocaleDateString('ar-EG')],
        [],
        ['ملخص سريع'],
        ['إجمالي الأصول:', stats.total],
        ['القيمة الإجمالية:', `${stats.totalValue.toLocaleString()} ريال`],
        ['متاحة:', stats.byStatus?.AVAILABLE || 0],
        ['مُعينة:', stats.byStatus?.ASSIGNED || 0],
        [],
        ['تفاصيل الأصول'],
        // Headers
        ['الاسم', 'النوع', 'المصنّع', 'الموديل', 'الحالة', 'السعر', 'تاريخ الشراء', 'الموقع', 'الموظف', 'الملاحظات'],
        // Data Rows
        ...assets.map(asset => [
            asset.name || '-',
            asset.type || '-',
            asset.manufacturer || '-',
            asset.model || '-',
            asset.status || '-',
            asset.price || 0,
            asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('ar-EG') : '-',
            asset.location?.name || '-',
            asset.employee?.name || '-',
            asset.notes || '-'
        ])
    ]

    const sheet = XLSX.utils.aoa_to_sheet(data)
    sheet['!cols'] = [
        { wch: 25 }, // الاسم
        { wch: 15 }, // النوع
        { wch: 15 }, // المصنع
        { wch: 15 }, // الموديل
        { wch: 15 }, // الحالة
        { wch: 12 }, // السعر
        { wch: 15 }, // تاريخ الشراء
        { wch: 15 }, // الموقع
        { wch: 20 }, // الموظف
        { wch: 30 }  // الملاحظات
    ]
    sheet['!views'] = [{ rightToLeft: true }]

    // Add merged cells for title
    sheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } } // Merge title across 4 columns
    ]

    XLSX.utils.book_append_sheet(workbook, sheet, 'تقرير الأصول')
    XLSX.writeFile(workbook, `assets-report-${Date.now()}.xlsx`)
}

// ==================== تصدير تقرير المخزون إلى Excel ====================

export function exportInventoryToExcel(items: any[], stats: any) {
    const workbook = createWorkbook()

    const data = [
        ['تقرير المخزون الشامل'],
        ['تاريخ التقرير:', new Date().toLocaleDateString('ar-EG')],
        [],
        ['ملخص سريع'],
        ['إجمالي العناصر:', stats.total],
        ['القيمة الإجمالية:', `${stats.totalValue.toLocaleString()} ريال`],
        ['عناصر ناقصة:', stats.lowStock],
        [],
        ['تفاصيل المخزون'],
        // Headers
        ['الاسم', 'الفئة', 'الكمية', 'الحد الأدنى', 'سعر الوحدة', 'القيمة الإجمالية', 'الحالة', 'الموقع', 'الملاحظات'],
        // Data Rows
        ...items.map(item => [
            item.name || '-',
            item.category || '-',
            item.quantity,
            item.minQuantity,
            item.unitPrice || 0,
            (item.unitPrice || 0) * item.quantity,
            item.quantity <= item.minQuantity ? 'ناقص' : 'متوفر',
            item.location || '-',
            item.notes || '-'
        ])
    ]

    const sheet = XLSX.utils.aoa_to_sheet(data)
    sheet['!cols'] = [
        { wch: 25 }, // الاسم
        { wch: 15 }, // الفئة
        { wch: 10 }, // الكمية
        { wch: 10 }, // الحد الأدنى
        { wch: 12 }, // سعر الوحدة
        { wch: 15 }, // القيمة الإجمالية
        { wch: 10 }, // الحالة
        { wch: 15 }, // الموقع
        { wch: 30 }  // الملاحظات
    ]
    sheet['!views'] = [{ rightToLeft: true }]
    sheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }]

    XLSX.utils.book_append_sheet(workbook, sheet, 'تقرير المخزون')
    XLSX.writeFile(workbook, `inventory-report-${Date.now()}.xlsx`)
}

// ==================== تصدير تقرير الموظفين إلى Excel ====================

export function exportEmployeesToExcel(employees: any[], stats: any) {
    const workbook = createWorkbook()

    const data = [
        ['تقرير الموظفين الشامل'],
        ['تاريخ التقرير:', new Date().toLocaleDateString('ar-EG')],
        [],
        ['ملخص سريع'],
        ['إجمالي الموظفين:', stats.total],
        ['لديهم أصول:', stats.withAssets],
        [],
        ['تفاصيل الموظفين'],
        // Headers
        ['الاسم', 'رقم الهوية', 'البريد الإلكتروني', 'الهاتف', 'المسمى الوظيفي', 'القسم', 'الموقع', 'عدد الأصول', 'تاريخ الإضافة'],
        // Data Rows
        ...employees.map(emp => [
            emp.name || '-',
            emp.identityNumber || '-',
            emp.email || '-',
            emp.phone || '-',
            emp.jobTitle || '-',
            emp.department || '-',
            emp.location?.name || '-',
            emp._count?.assets || 0,
            new Date(emp.createdAt).toLocaleDateString('ar-EG')
        ])
    ]

    const sheet = XLSX.utils.aoa_to_sheet(data)
    sheet['!cols'] = [
        { wch: 25 }, // الاسم
        { wch: 15 }, // رقم الهوية
        { wch: 25 }, // البريد
        { wch: 15 }, // الهاتف
        { wch: 20 }, // المسمى
        { wch: 15 }, // القسم
        { wch: 15 }, // الموقع
        { wch: 10 }, // عدد الأصول
        { wch: 15 }  // التاريخ
    ]
    sheet['!views'] = [{ rightToLeft: true }]
    sheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }]

    XLSX.utils.book_append_sheet(workbook, sheet, 'تقرير الموظفين')
    XLSX.writeFile(workbook, `employees-report-${Date.now()}.xlsx`)
}

// ==================== تصدير تقرير العهد إلى Excel ====================

export function exportCustodyToExcel(custodyItems: any[], stats: any) {
    const workbook = createWorkbook()

    const data = [
        ['تقرير العهد الشامل'],
        ['تاريخ التقرير:', new Date().toLocaleDateString('ar-EG')],
        [],
        ['ملخص سريع'],
        ['إجمالي العهد:', stats.total],
        ['نشط:', stats.active],
        ['مسترجع:', stats.returned],
        [],
        ['تفاصيل العهد'],
        // Headers
        ['الموظف', 'العنصر', 'الكمية', 'تاريخ التسليم', 'تاريخ الاسترجاع', 'الحالة', 'الملاحظات'],
        // Data Rows
        ...custodyItems.map(item => [
            item.employee?.name || '-',
            item.itemName || '-',
            item.quantity,
            new Date(item.assignedDate).toLocaleDateString('ar-EG'),
            item.returnDate ? new Date(item.returnDate).toLocaleDateString('ar-EG') : 'لم يُسترجع',
            item.returnDate ? 'مسترجع' : 'نشط',
            item.notes || '-'
        ])
    ]

    const sheet = XLSX.utils.aoa_to_sheet(data)
    sheet['!cols'] = [
        { wch: 25 }, // الموظف
        { wch: 25 }, // العنصر
        { wch: 10 }, // الكمية
        { wch: 15 }, // تاريخ التسليم
        { wch: 15 }, // تاريخ الاسترجاع
        { wch: 10 }, // الحالة
        { wch: 30 }  // الملاحظات
    ]
    sheet['!views'] = [{ rightToLeft: true }]
    sheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }]

    XLSX.utils.book_append_sheet(workbook, sheet, 'تقرير العهد')
    XLSX.writeFile(workbook, `custody-report-${Date.now()}.xlsx`)
}
