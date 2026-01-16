export const dynamic = 'force-dynamic';

import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/app/actions/employee-portal'
import prisma from '@/lib/prisma'
import { ReportActions } from '@/components/portal/report-actions'

async function CustodyReport() {
    const currentEmployee = await getCurrentEmployee()

    if (!currentEmployee) {
        redirect('/portal/login')
    }

    const companyProfile = await prisma.companyProfile.findFirst()
    const employee = await prisma.employee.findUnique({
        where: { id: currentEmployee.id },
        include: {
            department: true,
            location: true,
            assets: {
                include: {
                    location: true
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!employee) {
        return <div className="text-center py-12 text-red-600">لم يتم العثور على بيانات الموظف</div>
    }

    const reportDate = new Date().toLocaleDateString('en-GB')
    const documentID = `ASSET-MANIFEST-${new Date().getFullYear()}-${employee.identityNumber?.slice(-5) || '0001'}`
    const digitalFingerprint = Buffer.from(`${employee.id}-${new Date().getTime()}`).toString('base64').slice(0, 24).toUpperCase()

    const labelStyle = "text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1";
    const valueStyle = "text-[14px] font-bold text-slate-800 tracking-tight transition-colors";

    return (
        <div className="flex flex-col items-center bg-[#f8fafc] py-12 min-h-screen">
            {/* Control Bar (Non-Printable) */}
            <div className="mb-10 no-print w-full max-w-[210mm] px-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Enterprise System Core Active</span>
                </div>
                <ReportActions />
            </div>

            {/* THE BILINGUAL ENTERPRISE MANIFEST CONTAINER */}
            <div
                id="custody-report"
                className="w-[210mm] min-h-[297mm] bg-white relative shadow-[0_20px_70px_-15px_rgba(0,0,0,0.05)] print:shadow-none print:w-full overflow-hidden flex flex-col transition-all duration-500"
                style={{ fontFamily: "'Cairo', 'Inter', -apple-system, sans-serif" }}
                dir="rtl"
            >
                {/* Print Engine Calibration & Arabic Typography Fix */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
                    @media print {
                        @page { size: A4 portrait; margin: 0 !important; }
                        body, html { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .no-print { display: none !important; }
                        #custody-report { width: 210mm !important; height: 297mm !important; border: none !important; margin: 0 !important; padding: 0 !important; }
                    }
                    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
                    .bilingual-label { display: flex; align-items: center; gap: 8px; }
                    .bilingual-label span:last-child { opacity: 0.6; font-size: 0.85em; }
                    
                    /* Arabic Flow Optimization */
                    h2, h3, h4, p, label {
                        word-spacing: -0.05em; /* Tighten word gaps slightly */
                        text-rendering: optimizeLegibility;
                    }
                    .declaration-text {
                        text-align: justify;
                        text-justify: inter-word;
                        line-height: 1.8;
                    }
                `}} />

                {/* 1. ENTERPRISE HEADER (ITAM Identity Layout) */}
                <div className="px-12 py-10 flex justify-between items-center border-b-[0.5px] border-slate-100 bg-white" dir="ltr">
                    {/* LEFT: Institution Official Logo */}
                    <div className="flex-1 flex justify-start">
                        {companyProfile?.logoUrl ? (
                            <img src={companyProfile.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                        ) : (
                            <div className="h-12 w-12 bg-slate-900 flex items-center justify-center text-white font-black rounded-sm">IT</div>
                        )}
                    </div>

                    {/* CENTER: Institution Name (Single Line) */}
                    <div className="flex-[2] text-center" dir="rtl">
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter leading-tight whitespace-nowrap">
                            {companyProfile?.nameAr || 'الجمعية الخيرية لتحفيظ القرآن الكريم بتبوك'}
                        </h2>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="h-[1px] w-4 bg-slate-200"></span>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">IT ASSET MANAGEMENT SYSTEM</p>
                            <span className="h-[1px] w-4 bg-slate-200"></span>
                        </div>
                    </div>

                    {/* RIGHT: Document Metadata (Symmetric Matrix) */}
                    <div className="flex-1 text-right flex flex-col items-end">
                        <div className="bg-slate-950 text-white px-3 py-1.5 mb-2 inline-block shadow-sm">
                            <h1 className="text-[12px] font-black tracking-[0.3em] leading-none uppercase">MANIFEST</h1>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none"><span className="text-slate-200">Ref:</span> {documentID}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none"><span className="text-slate-200">Auth:</span> <span className="text-emerald-500 font-bold uppercase">Secured v2.9</span></p>
                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none"><span className="text-slate-200">Date:</span> {reportDate}</p>
                        </div>
                    </div>
                </div>

                {/* 2. SUBJECT MODULAR GRID */}
                <div className="px-12 py-8 bg-slate-50/30 border-b-[0.5px] border-slate-100">
                    <div className="grid grid-cols-4 gap-12">
                        <div className="space-y-1.5">
                            <label className={labelStyle}>
                                <span className="bilingual-label">المستلم <span>/ Recipient</span></span>
                            </label>
                            <p className={valueStyle}>{employee.name}</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelStyle}>
                                <span className="bilingual-label">الإدارة <span>/ Dept</span></span>
                            </label>
                            <p className={valueStyle}>{employee.department?.name || 'Operations'}</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelStyle}>
                                <span className="bilingual-label">المعرف <span>/ EMP-ID</span></span>
                            </label>
                            <p className={`${valueStyle} font-mono`}>{employee.identityNumber || 'ASSET-771'}</p>
                        </div>
                        <div className="flex justify-end items-center">
                            <div className="h-12 w-12 border border-slate-200 p-1 bg-white opacity-40">
                                <div className="grid grid-cols-3 gap-0.5">
                                    {[...Array(9)].map((_, i) => (
                                        <div key={i} className={`h-2 w-2 ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-transparent'}`}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. HARDWARE SPECIFICATION MATRIX */}
                <div className="px-12 py-10 flex-1">
                    <div className="mb-4 flex justify-between items-end">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            <h3 className="text-[10px] font-black text-slate-900 uppercase">
                                بيان الأصول المعتمد <span className="text-slate-400 tracking-[0.2em]">/ ITEMIZED REGISTRY</span>
                            </h3>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total: {employee.assets.length} Units</p>
                    </div>

                    <div className="border-[0.5px] border-slate-200">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-900" dir="ltr">
                                    <th className="py-3 px-4 text-center text-[9px] font-black uppercase tracking-widest w-12 border-b border-r border-slate-200">ID</th>
                                    <th className="py-3 px-6 text-right text-[9px] font-black uppercase border-b border-slate-200">
                                        المواصفات <span className="text-slate-400 tracking-widest">/ SPECIFICATIONS</span>
                                    </th>
                                    <th className="py-3 px-6 text-center text-[9px] font-black uppercase border-b border-x border-slate-200 w-64">
                                        التسلسل <span className="text-slate-400 tracking-widest">/ SERIAL</span>
                                    </th>
                                    <th className="py-3 px-6 text-center text-[9px] font-black uppercase border-b border-slate-200 w-40">
                                        الحالة <span className="text-slate-400 tracking-widest">/ META</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {employee.assets.length > 0 ? (
                                    employee.assets.map((asset, index) => (
                                        <tr key={asset.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                                            <td className="py-4 text-center text-[10px] font-mono font-bold text-slate-300 border-r border-slate-50">{(index + 1).toString().padStart(2, '0')}</td>
                                            <td className="py-4 px-6 text-right">
                                                <h4 className="font-bold text-slate-900 text-[13px] leading-tight mb-1">{asset.name}</h4>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap">
                                                    <span>{asset.manufacturer}</span>
                                                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                    <span>{asset.type}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="font-mono font-black text-[11px] text-slate-700 block tracking-tight">{asset.serialNumber || 'VOID-SN'}</span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-0.5 rounded-sm">Active</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={4} className="py-32 text-center text-[10px] font-black text-slate-200 uppercase tracking-widest">Void Data</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 4. LEGAL DECLARATION (Width Matched to Table) */}
                    <div className="mt-8">
                        <div className="border-[0.5px] border-slate-200 p-8 bg-slate-50/20">
                            <div className="flex items-center gap-4 mb-4">
                                <h4 className="text-[10px] font-black text-slate-900 uppercase border-b border-slate-900 pb-1">
                                    إقرار استلام العهدة <span className="text-slate-400 tracking-widest">/ CUSTODY DECLARATION</span>
                                </h4>
                            </div>
                            <div className="grid grid-cols-12 gap-8 items-start">
                                <div className="col-span-12 space-y-4">
                                    <p className="text-[13px] text-slate-600 leading-[1.8] text-justify font-bold declaration-text">
                                        "أقر أنا الموقع أدناه، باستلامي للأصول التقنية الموضحة في مصفوفة العهدة أعلاه، وأتعهد بالحفاظ عليها واستخدامها وفقاً لسياسة المؤسسة المقررة. كما أقر بمسؤوليتي الكاملة عن حمايتها من التلف أو الفقدان الناتج عن الإهمال، وألتزم بإعادتها فور طلبها من قبل إدارة تقنية المعلومات بحالتها الأصلية."
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] border-t border-slate-100 pt-3" dir="ltr">
                                        I hereby acknowledge the receipt of the IT assets listed in the inventory matrix above and commit to maintaining them in accordance with Institutional Governance and returning them upon request.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. VALIDATION GRID (Bilingual Approval) */}
                <div className="px-12 pt-4 pb-6 mt-4">
                    <div className="grid grid-cols-3 gap-20 items-end">
                        {/* Approval Flow 1 */}
                        <div className="space-y-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Section 01</p>
                                <p className="text-[10px] font-black text-slate-900 uppercase">توقيع المستلم <span className="text-slate-400 tracking-widest">/ RECIPIENT</span></p>
                            </div>
                            <div className="relative pt-6">
                                <p className="text-[14px] font-black text-slate-800 tracking-tight leading-none mb-3">{employee.name}</p>
                                <div className="h-[1.5px] w-full bg-slate-900 scale-x-105 origin-right"></div>
                                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-3">Identity Verified via Portal</p>
                            </div>
                        </div>

                        {/* Approval Flow 2: IT ADMIN */}
                        <div className="space-y-8">
                            <div className="space-y-1 text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Section 02</p>
                                <p className="text-[10px] font-black text-slate-900 uppercase">إدارة تقنية المعلومات <span className="text-slate-400 tracking-widest">/ IT ADMIN</span></p>
                            </div>
                            <div className="relative pt-6 flex flex-col items-center">
                                <p className="text-[14px] font-black text-slate-800 tracking-tight leading-none mb-3">مسؤول النظام المعتمد</p>
                                <div className="h-[1.5px] w-full bg-slate-900"></div>
                                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em] mt-3">Governance Approval Required</p>
                            </div>
                        </div>

                        {/* Approval Flow 3: SEAL (Lifted & Resized) */}
                        <div className="flex flex-col items-center justify-end">
                            <div className="relative group/seal flex flex-col items-center">
                                <img
                                    src="/uploads/official-stamp.png"
                                    alt="Seal"
                                    className="h-28 w-auto object-contain opacity-95 transition-all duration-700 hover:scale-110 grayscale-[0.2] hover:grayscale-0 mb-3"
                                    style={{ mixBlendMode: 'multiply' }}
                                />
                                <div className="text-center">
                                    <span className="text-[9px] font-black text-slate-200 uppercase tracking-[1.2em] block ml-4">REGISTERED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. DOCUMENT STRATUM (Metadata) - Compacted */}
                <div className="px-12 py-6 border-t border-slate-50 flex justify-between items-end bg-white relative z-20 mt-auto">
                    <div className="space-y-1.5 grayscale opacity-30">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Checksum ID: <span className="text-slate-900 font-mono">{digitalFingerprint}</span></p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Generated via AssetCore v2.9 // Protocol 771-A // Security Tier 4</p>
                    </div>
                    <div className="text-[11px] font-black text-slate-50 uppercase tracking-[1em] select-none">
                        SYSTEM RECORD
                    </div>
                </div>

                {/* ServiceNow Subtle Aesthetic Background */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.012] z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(#000_1.2px,transparent_0)] bg-[size:32px_32px]"></div>
                </div>
            </div>

            {/* ACTION FOOTER: SYSTEM DOWNLOAD (Non-Printable) */}
            <div className="mt-16 no-print w-full max-w-[210mm] px-4 pb-24">
                <div className="bg-[#1e293b] p-12 rounded-[2rem] shadow-[0_45px_100px_-20px_rgba(15,23,42,0.3)] border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 opacity-5 rounded-full blur-[80px] -mr-40 -mt-40 transition-all group-hover:opacity-10"></div>

                    <div className="relative z-10 flex flex-col items-center gap-10">
                        <div className="text-center space-y-3">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight">Final Registry Generation</h3>
                            <p className="text-slate-400 text-base max-w-md mx-auto font-medium">This document is formatted with precision typography for High-Fidelity A4 output. Validated at Security Tier 4.</p>
                        </div>
                        <div className="w-12 h-[1px] bg-white/10"></div>
                        <ReportActions variant="bottom" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function DownloadReportPage() {
    return (
        <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
            <div className="w-14 h-14 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center space-y-1">
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.5em]">Synchronizing Asset Metadata</p>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">Global Enterprise Protocol</p>
            </div>
        </div>}>
            <CustodyReport />
        </Suspense>
    )
}
