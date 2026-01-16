'use client'

import html2pdf from 'html2pdf.js'
// import * as XLSX from 'xlsx' // Replaced by exceljs
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

interface ExportColumn {
    header: string
    key: string
    width?: number
}

interface ExportOptions {
    title: string
    subtitle?: string
    columns: ExportColumn[]
    data: Record<string, any>[]
    fileName: string
    rtl?: boolean
    companyProfile?: {
        nameAr?: string | null
        nameEn?: string | null
        logoUrl?: string | null
    } | null
}

/**
 * Export data to Excel file with Professional Styling
 */
export async function exportToExcel(options: ExportOptions) {
    const { title, subtitle, columns, data, fileName } = options

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('التقرير', {
        views: [{ rightToLeft: true }]
    });

    // 1. Title Row
    worksheet.mergeCells('A1', String.fromCharCode(65 + columns.length - 1) + '1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = { name: 'Tajawal', family: 4, size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Blue-900
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 40;

    // 2. Subtitle / Information Row
    const date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    worksheet.mergeCells('A2', String.fromCharCode(65 + columns.length - 1) + '2');
    const infoCell = worksheet.getCell('A2');
    infoCell.value = `${subtitle ? subtitle + ' - ' : ''}تاريخ التقرير: ${date}`;
    infoCell.font = { name: 'Tajawal', size: 11, color: { argb: 'FF475569' } }; // Slate-600
    infoCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 25;

    // 3. Header Row
    const headerRow = worksheet.addRow(columns.map(c => c.header));
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
        cell.font = { name: 'Tajawal', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }; // Blue-600
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
            right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
    });

    // 4. Data Rows
    data.forEach((row, index) => {
        const rowValues = columns.map(col => {
            const val = row[col.key];
            if (val instanceof Date) {
                return val.toLocaleDateString('ar-SA');
            }
            if (typeof val === 'boolean') {
                return val ? 'نعم' : 'لا'
            }
            return val ?? '-';
        });
        const excelRow = worksheet.addRow(rowValues);
        excelRow.height = 24;

        // Zebra Striping & Borders
        const isEven = index % 2 === 0;
        excelRow.eachCell((cell) => {
            cell.font = { name: 'Tajawal', size: 11, color: { argb: 'FF334155' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                left: { style: 'dotted', color: { argb: 'FFE2E8F0' } },
                right: { style: 'dotted', color: { argb: 'FFE2E8F0' } }
            };
            if (!isEven) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; // Slate-50
            }
        });
    });

    // 5. Columns Width
    worksheet.columns = columns.map(col => ({ width: col.width ? col.width : 20 }));

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Save file
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
}

// Helper to create report HTML with Professional Design
function createReportHTML(options: ExportOptions) {
    const { title, subtitle, columns, data, companyProfile } = options
    const date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = new Date().toLocaleTimeString('ar-EG');

    // ... rest same, updating the header div ...

    // Create header with professional styling
    const thead = `
        <tr style="background-color: #1e293b; color: white;">
            ${columns.map(col => `
                <th style="padding: 12px 16px; text-align: right; font-weight: bold; border-bottom: 2px solid #0f172a; font-size: 13px; white-space: nowrap;">
                    ${col.header}
                </th>
            `).join('')}
        </tr>
    `;

    // Create rows with zebra striping and styling
    const rows = data.map((row, index) => {
        const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc'; // White and Slate-50
        return `
            <tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0;">
                ${columns.map(col => {
            let value = row[col.key];
            if (value instanceof Date) {
                value = value.toLocaleDateString('ar-SA')
            } else if (typeof value === 'boolean') {
                value = value ? 'نعم' : 'لا'
            }
            return `
                        <td style="padding: 10px 16px; text-align: right; color: #334155; font-size: 12px; vertical-align: middle;">
                            ${value ?? '-'}
                        </td>
                    `
        }).join('')}
            </tr>
        `
    }).join('');

    // Create header with professional styling
    const brandHeader = companyProfile ? `
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 10px;">
            ${companyProfile.logoUrl ? `<img src="${companyProfile.logoUrl}" style="height: 60px; object-contain: contain;" />` : ''}
            <div>
                <div style="font-size: 18px; font-weight: bold; color: #1e3a8a;">${companyProfile.nameAr || ''}</div>
                <div style="font-size: 12px; color: #64748b;">نظام إدارة الأصول والكتيبة التقنية</div>
            </div>
        </div>
    ` : '';

    return `
        <div dir="rtl" style="padding: 40px; font-family: 'Tajawal', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: white; color: #0f172a;">
            <!-- Header Section -->
            <div style="border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    ${brandHeader}
                    <h1 style="font-size: 28px; font-weight: 800; color: #1e293b; margin: 10px 0 5px 0;">${title}</h1>
                    ${subtitle ? `<p style="font-size: 14px; color: #64748b; margin: 0;">${subtitle}</p>` : ''}
                </div>
                <div style="text-align: left;">
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">تاريخ التقرير</div>
                    <div style="font-size: 14px; font-weight: bold; color: #1e293b;">${date}</div>
                    <div style="font-size: 12px; color: #94a3b8;">${time}</div>
                </div>
            </div>

            <!-- Report Meta (Summary) -->
            <div style="margin-bottom: 20px; padding: 15px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #dbeafe; display: flex; gap: 40px;">
                <div>
                    <span style="font-size: 12px; color: #64748b; display: block;">عدد السجلات</span>
                    <span style="font-size: 18px; font-weight: bold; color: #2563eb;">${data.length}</span>
                </div>
            </div>
            
            <!-- Table Section -->
            <div style="border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse; min-width: 100%;">
                    <thead>${thead}</thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>

            <!-- Footer Section -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; color: #94a3b8; font-size: 11px;">
                <div>نظام إدارة الأصول التقنية</div>
                <div>تم الاستخراج بواسطة المستخدم</div>
            </div>
        </div>
    `;
}

/**
 * Export data to PDF file with Arabic support using html2pdf.js
 */
export async function exportToPDF(options: ExportOptions) {
    const { fileName } = options
    const html = createReportHTML(options);

    const element = document.createElement('div');
    element.innerHTML = html;
    element.style.fontFamily = "'Tajawal', 'Arial', sans-serif";
    document.body.appendChild(element);

    const opt = {
        margin: 10,
        filename: `${fileName}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } finally {
        document.body.removeChild(element);
    }
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

/**
 * Format currency
 */
export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(amount)
}

/**
 * Translate status to Arabic
 */
export function translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
        'ACTIVE': 'نشط',
        'INACTIVE': 'غير نشط',
        'AVAILABLE': 'متاح',
        'IN_USE': 'قيد الاستخدام',
        'MAINTENANCE': 'صيانة',
        'DISPOSED': 'مستبعد',
        'PENDING': 'معلق',
        'APPROVED': 'موافق عليه',
        'REJECTED': 'مرفوض',
        'COMPLETED': 'مكتمل',
        'OPEN': 'مفتوح',
        'IN_PROGRESS': 'قيد التنفيذ',
        'RESOLVED': 'محلول',
        'CLOSED': 'مغلق',
        'ONLINE': 'متصل',
        'OFFLINE': 'غير متصل',
        'LOW': 'منخفض',
        'NORMAL': 'عادي',
        'HIGH': 'عالي',
        'URGENT': 'عاجل',
        'CRITICAL': 'حرج'
    }
    return statusMap[status] || status
}
