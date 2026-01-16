import html2pdf from 'html2pdf.js'

// Helper to create HTML table string
function createReportHTML(title: string, stats: any, tableHead: string[], tableBody: any[][]) {
    const date = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = new Date().toLocaleTimeString('ar-EG');

    // Create header styling
    const thead = `
        <tr style="background-color: #1e293b; color: white;">
            ${tableHead.map(h => `
                <th style="padding: 12px 16px; text-align: right; font-weight: bold; border-bottom: 2px solid #0f172a; font-size: 13px; white-space: nowrap;">
                    ${h}
                </th>
            `).join('')}
        </tr>
    `;

    // Create rows with zebra striping
    const rows = tableBody.map((row, index) => {
        const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
        return `
            <tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0;">
                ${row.map(cell => `
                    <td style="padding: 10px 16px; text-align: right; color: #334155; font-size: 12px; vertical-align: middle;">
                        ${cell}
                    </td>
                `).join('')}
            </tr>
        `;
    }).join('');

    // Stats layout
    let statsHTML = '';
    if (stats) {
        statsHTML = Object.entries(stats).map(([key, value]) => `
            <div>
                <span style="font-size: 12px; color: #64748b; display: block;">${key}</span>
                <span style="font-size: 18px; font-weight: bold; color: #2563eb;">${value}</span>
            </div>
        `).join('');
    }

    return `
        <div dir="rtl" style="padding: 40px; font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif; background-color: white; color: #0f172a;">
            <!-- Header -->
            <div style="border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 style="font-size: 28px; font-weight: 800; color: #1e293b; margin: 0 0 5px 0;">${title}</h1>
                    <p style="font-size: 14px; color: #64748b; margin: 0;">تقرير شامل للنظام</p>
                </div>
                <div style="text-align: left;">
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 2px;">تاريخ الإنشاء</div>
                    <div style="font-size: 14px; font-weight: bold; color: #1e293b;">${date}</div>
                    <div style="font-size: 12px; color: #94a3b8;">${time}</div>
                </div>
            </div>

            <!-- Stats -->
             ${stats ? `
            <div style="margin-bottom: 20px; padding: 20px; background-color: #eff6ff; border-radius: 8px; border: 1px solid #dbeafe; display: flex; flex-wrap: wrap; gap: 40px;">
                ${statsHTML}
            </div>
            ` : ''}

            <!-- Table -->
            <div style="border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                <table style="width: 100%; border-collapse: collapse; min-width: 100%;">
                    <thead>${thead}</thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; color: #94a3b8; font-size: 11px;">
                <div>نظام إدارة الأصول التقنية</div>
                <div>تقرير تم توليده آلياً</div>
            </div>
        </div>
    `;
}

async function generatePDF(content: string, filename: string) {
    const element = document.createElement('div');
    element.innerHTML = content;
    // Apply temporary styles ensuring font is loaded
    element.style.fontFamily = "'Tajawal', 'Arial', sans-serif";
    document.body.appendChild(element);

    const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    } as any;

    try {
        await html2pdf().set(opt).from(element).save();
    } finally {
        document.body.removeChild(element);
    }
}

// ==================== تصدير تقرير الأصول ====================
export async function exportAssetsToPDF(assets: any[], stats: any) {
    const tableHead = ['الاسم', 'النوع', 'الحالة', 'السعر', 'الموقع'];
    const tableBody = assets.map(asset => [
        asset.name || '-',
        asset.type || '-',
        asset.status || '-',
        asset.price ? `${asset.price} ريال` : '-',
        asset.location?.name || '-'
    ]);

    const statsFormatted = {
        'إجمالي الأصول': stats.total,
        'القيمة الإجمالية': `${stats.totalValue.toLocaleString()} ريال`
    };

    const html = createReportHTML('تقرير الأصول', statsFormatted, tableHead, tableBody);
    await generatePDF(html, `assets-report-${Date.now()}.pdf`);
}

// ==================== تصدير تقرير المخزون ====================
export async function exportInventoryToPDF(items: any[], stats: any) {
    const tableHead = ['الاسم', 'الفئة', 'الكمية', 'الحد الأدنى', 'السعر'];
    const tableBody = items.map(item => [
        item.name || '-',
        item.category || '-',
        item.quantity.toString(),
        item.minQuantity.toString(),
        item.unitPrice ? `${item.unitPrice} ريال` : '-'
    ]);

    const statsFormatted = {
        'إجمالي العناصر': stats.total,
        'القيمة الإجمالية': `${stats.totalValue.toLocaleString()} ريال`,
        'عناصر ناقصة': stats.lowStock
    };

    const html = createReportHTML('تقرير المخزون', statsFormatted, tableHead, tableBody);
    await generatePDF(html, `inventory-report-${Date.now()}.pdf`);
}

// ==================== تصدير تقرير الموظفين ====================
export async function exportEmployeesToPDF(employees: any[], stats: any) {
    const tableHead = ['الاسم', 'رقم الهوية', 'القسم', 'الموقع', 'عدد الأصول'];
    const tableBody = employees.map(emp => [
        emp.name || '-',
        emp.identityNumber || '-',
        emp.department || '-',
        emp.location?.name || '-',
        emp._count?.assets?.toString() || '0'
    ]);

    const statsFormatted = {
        'إجمالي الموظفين': stats.total,
        'لديهم أصول': stats.withAssets
    };

    const html = createReportHTML('تقرير الموظفين', statsFormatted, tableHead, tableBody);
    await generatePDF(html, `employees-report-${Date.now()}.pdf`);
}
