import React from 'react';
import { Monitor } from 'lucide-react';

interface PrintableReportProps {
    title: string;
    stats: { label: string; value: string | number }[];
    columns: { header: string; accessor: string | ((row: any) => React.ReactNode) }[];
    data: any[];
}

export const PrintableReport = React.forwardRef<HTMLDivElement, PrintableReportProps>(
    ({ title, stats, columns, data }, ref) => {
        return (
            <div ref={ref} className="p-8 font-sans bg-white text-black min-h-screen relative" dir="rtl">
                {/* Watermark Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden z-0">
                    <Monitor className="w-[500px] h-[500px]" />
                </div>

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-primary/20 pb-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                                <Monitor className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-primary mb-1">إدارة أصول تقنية المعلومات</h1>
                                <p className="text-sm text-muted-foreground font-medium">IT Asset Management System</p>
                            </div>
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-bold text-gray-800 mb-1">{title}</h2>
                            <div className="text-sm text-muted-foreground">
                                <p>تاريخ التقرير: <span className="font-mono font-bold text-gray-700">{new Date().toLocaleDateString('ar-EG')}</span></p>
                                <p>عدد السجلات: <span className="font-mono font-bold text-gray-700">{data.length}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 break-inside-avoid">
                                <p className="text-sm text-muted-foreground mb-1 font-medium">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Data Table */}
                    <div className="mb-8">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-primary/5 border-y-2 border-primary/10">
                                    <th className="p-3 text-right font-bold text-primary w-12">#</th>
                                    {columns.map((col, index) => (
                                        <th key={index} className="p-3 text-right font-bold text-primary">
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="even:bg-gray-50/50 hover:bg-gray-50 transition-colors break-inside-avoid">
                                        <td className="p-3 text-muted-foreground font-mono text-xs">{rowIndex + 1}</td>
                                        {columns.map((col, colIndex) => (
                                            <td key={colIndex} className="p-3 text-gray-700 font-medium">
                                                {typeof col.accessor === 'function'
                                                    ? col.accessor(row)
                                                    : row[col.accessor] || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center text-xs text-muted-foreground">
                        <p>تم استخراج هذا التقرير آلياً من نظام إدارة الأصول</p>
                        <div className="flex gap-4">
                            <p>صفحة 1 من 1</p> {/* Note: Dynamic page numbers are hard in HTML/CSS print */}
                            <p>{new Date().toLocaleString('ar-EG')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

PrintableReport.displayName = 'PrintableReport';
