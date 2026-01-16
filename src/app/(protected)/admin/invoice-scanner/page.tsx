'use client'

export const dynamic = 'force-dynamic';

import { useState, useCallback, useEffect } from 'react'
import Script from 'next/script'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    FileText,
    Upload,
    Loader2,
    Check,
    AlertCircle,
    Plus,
    Trash,
    Image as ImageIcon,
    FileSearch,
    ScanLine,
    Save
} from 'lucide-react'
import { cn } from '@/lib/utils'

declare global {
    interface Window {
        Tesseract: any
        pdfjsLib: any
    }
}

type InvoiceItem = {
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

export default function InvoiceScannerPage() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [scanning, setScanning] = useState(false)
    const [scanned, setScanned] = useState(false)
    const [items, setItems] = useState<InvoiceItem[]>([])
    const [statusMessage, setStatusMessage] = useState("")
    const [mockMode, setMockMode] = useState(false)
    const [debugLog, setDebugLog] = useState<string[]>([])
    const [rawText, setRawText] = useState("")
    const [invoiceInfo, setInvoiceInfo] = useState({
        invoiceNumber: '',
        supplierName: '',
        date: '',
        totalAmount: 0
    })

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)

            setScanned(false)
            setItems([])
            setStatusMessage("")
            setMockMode(false)
            setDebugLog(prev => [...prev, `File selected: ${selectedFile.name} (${selectedFile.type})`])
        }
    }, [])

    const addLog = (msg: string) => {
        console.log(msg)
        setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`])
    }

    const parseOCRResult = (text: string) => {
        addLog(`Parsing text (Length: ${text.length})`)
        console.log("OCR Text:", text)

        // Match Invoice Number
        // Standard: Label [sep] Number
        let invoiceNumberMatch = text.match(/(?:Invoice|Bill|Inv|رقم الفاتورة|الفاتورة|الرقم)\s*[:.#/]\s*([A-Za-z0-9-]*\d[A-Za-z0-9-]*)/i)

        // Reverse Arabic: Number [sep] Label (e.g. 2810 / الرقم)
        if (!invoiceNumberMatch) {
            invoiceNumberMatch = text.match(/([A-Z0-9-]{3,})\s*[:/]\s*(?:الرقم|الفاتورة)/)
        }

        // Fallback: designated number pattern starting with # or No
        if (!invoiceNumberMatch) {
            invoiceNumberMatch = text.match(/(?:No|Number)\.?\s*([A-Z0-9-]{3,})/i)
        }

        const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : 'INV-' + Math.floor(Math.random() * 100000)

        // Match Date
        let dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})/)
        if (!dateMatch) {
            dateMatch = text.match(/[A-Za-z]{3}\s+\d{1,2},?\s+\d{4}/)
        }

        if (!dateMatch) {
            dateMatch = text.match(/(\d{4}\s*[/-]\s*\d{1,2}\s*[/-]\s*\d{1,2})/)
        }

        let date = new Date().toISOString().split('T')[0]
        if (dateMatch) {
            try {
                const cleanDate = dateMatch[0].replace(/\s/g, '')
                const d = new Date(cleanDate)
                if (!isNaN(d.getTime())) {
                    date = d.toISOString().split('T')[0]
                }
            } catch (e) {
                console.error("Date parse error", e)
            }
        }

        // Match Total
        const totalKeywords = "Total|Amount|Grand Total|الإجمالي|الاجمالي|المجموع|المبلغ(?: المطلوب)?|الصافي"
        const currencyChars = "[$£€ر.سSAR]*"

        let totalMatch = text.match(new RegExp(`(?:${totalKeywords})[^\\d]{0,30}?${currencyChars}\\s*([\\d,]+\\.?\\d{0,2})`, "i"))

        let totalAmount = 0
        if (totalMatch) {
            const cleanAmount = totalMatch[1].replace(/,/g, '').replace(/[^0-9.]/g, '')
            totalAmount = parseFloat(cleanAmount)
        }

        if (totalAmount === 0) {
            const currencyMatches = Array.from(text.matchAll(/(?:SAR|ر\.س)\s*([\d,]+\.?\d{2})/g))
            let maxVal = 0
            for (const m of currencyMatches) {
                const val = parseFloat(m[1].replace(/,/g, ''))
                if (val > maxVal) maxVal = val
            }
            if (maxVal > 0) totalAmount = maxVal
        }

        const generatedItems: InvoiceItem[] = []

        if (totalAmount > 0) {
            generatedItems.push({
                name: 'صنف عام (من الفاتورة)',
                quantity: 1,
                unitPrice: totalAmount,
                totalPrice: totalAmount
            })
        } else {
            generatedItems.push({
                name: 'لم يتم التعرف على الأصناف',
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0
            })
            setMockMode(true)
        }

        // Improved Supplier Name Logic with Priority
        // Filter out lines that are too long (sentences) or just numbers or noise
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 4 && l.length < 60 && !/^\d+$/.test(l) && !/^[|!I\s]+$/.test(l))

        // Priority 1: explicitly identifiable company legal entities
        let supplierName = lines.find(l => /مؤسسة|شركة|متجر|group|technologies|solutions|inc\.|l\.l\.c|limited/i.test(l))

        // Priority 2: Fallback to first clean line that isn't excluded
        if (!supplierName) {
            supplierName = lines.find(l => !/invoice|date|date|فاتورة|تاريخ|السادة|المكرم|إلى|To:|Bill To|Total|المجموع|إغلاق|موعد/i.test(l))
        }

        supplierName = supplierName?.substring(0, 50) || 'مورد غير معروف'

        setInvoiceInfo({
            invoiceNumber,
            supplierName,
            date,
            totalAmount
        })
        setItems(generatedItems)
        setRawText(text)
    }

    const processImage = async (imageUrl: string) => {
        if (!window.Tesseract) {
            addLog("Error: Tesseract not loaded on window")
            throw new Error("Tesseract not loaded")
        }

        setStatusMessage("جاري استخراج النص...")
        addLog("Running Tesseract.recognize...")

        try {
            // Using shorthand recognize which handles worker creation/termination automatically
            const { data: { text } } = await window.Tesseract.recognize(imageUrl, 'ara+eng', {
                logger: (m: any) => {
                    if (m.status === 'recognizing text') {
                        setStatusMessage(`جاري التعرف: ${(m.progress * 100).toFixed(0)}%`)
                    }
                }
            })

            addLog(`Text recognized. First 50 chars: ${text.substring(0, 50)}...`)
            return text
        } catch (e: any) {
            addLog(`Tesseract Error: ${e.message}`)
            throw e
        }
    }

    const processPdf = async (file: File) => {
        if (!window.pdfjsLib) {
            addLog("Error: PDF.js not loaded")
            throw new Error("PDF.js not loaded")
        }

        setStatusMessage("جاري معالجة ملف PDF...")
        addLog("Processing PDF...")
        const arrayBuffer = await file.arrayBuffer()

        // Set worker
        addLog("Setting worker source...")
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

        addLog("Loading document...")
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
        addLog(`Document loaded. Pages: ${pdf.numPages}`)
        const page = await pdf.getPage(1)

        addLog("Rendering page to canvas...")
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width

        if (context) {
            await page.render({ canvasContext: context, viewport }).promise
            const imageUrl = canvas.toDataURL('image/png')
            addLog("Page rendered. Sending to OCR...")
            return await processImage(imageUrl)
        }
        throw new Error("Failed to render PDF")
    }

    const handleScan = async () => {
        addLog("Scan button clicked.")
        if (!file) {
            addLog("Error: No file in state.")
            return
        }

        try {
            setScanning(true)
            setStatusMessage("جاري التحميل...")
            addLog("Starting scan process...")

            // Check if libraries loaded
            if (!window.Tesseract || !window.pdfjsLib) {
                // Wait a bit or error
                setStatusMessage("جاري تحميل المكتبات... يرجى الانتظار قليلاً ثم المحاولة")
                addLog("Libraries not found immediately. Waiting...")
                await new Promise(r => setTimeout(r, 2000))
                if (!window.Tesseract || !window.pdfjsLib) {
                    addLog("Libraries failed to load.")
                    throw new Error("Libraries not loaded")
                }
            }

            setStatusMessage("جاري التحليل...")

            let text = ""
            if (file.type === 'application/pdf') {
                text = await processPdf(file)
            } else {
                if (preview) {
                    text = await processImage(preview)
                }
            }

            parseOCRResult(text)
            setScanned(true)
            setStatusMessage("تم استخراج البيانات بنجاح")
        } catch (error) {
            console.error("Scanning Error:", error)
            addLog(`Error: ${error}`)
            setStatusMessage("حدث خطأ في التحليل، يتم عرض بيانات تجريبية...")

            // Explicit Fallback
            setTimeout(() => {
                const mockData: InvoiceItem[] = [
                    { name: 'ورق A4 (رزمة)', quantity: 10, unitPrice: 25, totalPrice: 250 },
                    { name: 'حبر طابعة HP 680', quantity: 5, unitPrice: 85, totalPrice: 425 },
                ]
                setItems(mockData)
                setInvoiceInfo({
                    invoiceNumber: 'INV-MOCK',
                    supplierName: 'مكتبة الإمداد',
                    date: new Date().toISOString().split('T')[0],
                    totalAmount: 675
                })
                setScanned(true)
                setMockMode(true)
            }, 1000)
        } finally {
            setScanning(false)
        }
    }

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }

        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
        }

        setItems(newItems)
        setInvoiceInfo(prev => ({
            ...prev,
            totalAmount: newItems.reduce((sum, i) => sum + i.totalPrice, 0)
        }))
    }

    const addItem = () => {
        setItems([...items, { name: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
    }

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index)
        setItems(newItems)
        setInvoiceInfo(prev => ({
            ...prev,
            totalAmount: newItems.reduce((sum, i) => sum + i.totalPrice, 0)
        }))
    }

    const handleAddToInventory = async () => {
        try {
            const { bulkCreateInventoryItems } = await import("@/app/actions/inventory")
            const result = await bulkCreateInventoryItems(items)

            if (result.success) {
                alert(`تمت إضافة ${result.count} أصناف للمخزون بنجاح!`)
                setStatusMessage('تم الحفظ بنجاح')
            } else {
                alert('حدث خطأ أثناء الإضافة للمخزون')
            }
        } catch (error) {
            console.error(error)
            alert('فشل الاتصال بالخادم')
        }
    }

    const handleSaveAsDocument = async () => {
        alert('سيتم تنفيذ ميزة الحفظ في الأرشيف قريباً')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6" dir="rtl">
            <Script
                src="https://unpkg.com/tesseract.js@5.0.5/dist/tesseract.min.js"
                strategy="afterInteractive"
                onLoad={() => addLog("Tesseract.js loaded ")}
                onError={() => addLog("Error loading Tesseract.js")}
            />
            <Script
                src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
                strategy="afterInteractive"
                onLoad={() => addLog("PDF.js loaded")}
                onError={() => addLog("Error loading PDF.js")}
            />

            <div className="max-w-6xl mx-auto space-y-6">
                <PremiumPageHeader
                    title="ماسح الفواتير"
                    description="رفع صورة الفاتورة واستخراج البيانات تلقائياً"
                    icon={FileSearch}
                />

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Upload Section */}
                    <Card className="bg-slate-900/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-blue-400" />
                                رفع الفاتورة (صورة أو PDF)
                            </CardTitle>
                            <CardDescription>ارفع صورة واضحة أو ملف PDF للفاتورة لاستخراج البيانات</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className={cn(
                                    "relative border-2 border-dashed rounded-lg p-8 text-center transition-all",
                                    preview
                                        ? "border-emerald-500/50 bg-emerald-500/5"
                                        : "border-slate-600 hover:border-slate-500"
                                )}
                            >
                                {preview ? (
                                    <div className="space-y-4">
                                        {file?.type === 'application/pdf' ? (
                                            <div className="h-64 bg-slate-800 rounded-lg flex flex-col items-center justify-center border border-slate-700">
                                                <FileText className="h-16 w-16 text-red-500 mb-4" />
                                                <p className="text-slate-300 font-medium">{file.name}</p>
                                                <p className="text-slate-500 text-sm">ملف PDF جاهز للمسح</p>
                                            </div>
                                        ) : (
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="max-h-64 mx-auto rounded-lg shadow-lg"
                                            />
                                        )}
                                        {file?.type !== 'application/pdf' && (
                                            <p className="text-emerald-400 text-sm">{file?.name}</p>
                                        )}
                                        {statusMessage && (
                                            <p className="text-blue-400 text-sm animate-pulse">{statusMessage}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Upload className="h-12 w-12 mx-auto text-slate-500" />
                                        <div>
                                            <p className="text-slate-300">اسحب الملف هنا أو انقر للاختيار</p>
                                            <p className="text-slate-500 text-sm mt-1">PNG, JPG, PDF (حد أقصى 10 MB)</p>
                                        </div>
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                                />
                            </div>

                            <Button
                                onClick={handleScan}
                                disabled={!file || scanning}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                            >
                                {scanning ? (
                                    <>
                                        <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                        {statusMessage || "جاري المسح..."}
                                    </>
                                ) : scanned ? (
                                    <>
                                        <Check className="h-4 w-4 ml-2" />
                                        إعادة المسح
                                    </>
                                ) : (
                                    <>
                                        <ScanLine className="h-4 w-4 ml-2" />
                                        مسح الفاتورة (OCR)
                                    </>
                                )}
                            </Button>

                            {/* OCR Notice */}
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                <div className="flex gap-2">
                                    <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div className="text-sm text-emerald-200">
                                        <p className="font-medium">OCR جاهز</p>
                                        <p className="text-emerald-300/80 mt-1">
                                            النظام يستخدم الآن مكتبات سحابية للتحليل الفوري بدون تثبيت.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Extracted Data Section */}
                    <Card className="bg-slate-900/50 border-slate-700">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-emerald-400" />
                                        البيانات المستخرجة
                                    </CardTitle>
                                    <CardDescription>
                                        {mockMode ? "تم عرض بيانات افتراضية لعدم إمكانية التحليل" : "راجع البيانات وعدّلها حسب الحاجة"}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSaveAsDocument}
                                    className="border-slate-600 hover:border-blue-500 hover:text-blue-400 hidden lg:flex"
                                >
                                    <Save className="h-4 w-4 ml-2" />
                                    حفظ كمستند
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Invoice Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-400">رقم الفاتورة</Label>
                                    <Input
                                        value={invoiceInfo.invoiceNumber}
                                        onChange={(e) => setInvoiceInfo(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                        className="mt-1 bg-slate-800 border-slate-600"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-400">المورد</Label>
                                    <Input
                                        value={invoiceInfo.supplierName}
                                        onChange={(e) => setInvoiceInfo(prev => ({ ...prev, supplierName: e.target.value }))}
                                        className="mt-1 bg-slate-800 border-slate-600"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-400">التاريخ</Label>
                                    <Input
                                        type="date"
                                        value={invoiceInfo.date}
                                        onChange={(e) => setInvoiceInfo(prev => ({ ...prev, date: e.target.value }))}
                                        className="mt-1 bg-slate-800 border-slate-600"
                                    />
                                </div>
                                <div>
                                    <Label className="text-slate-400">الإجمالي</Label>
                                    <Input
                                        value={invoiceInfo.totalAmount.toLocaleString() + ' ر.س'}
                                        readOnly
                                        className="mt-1 bg-slate-800/50 border-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="border border-slate-700 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-800">
                                        <tr>
                                            <th className="text-right py-2 px-3 text-slate-400 text-sm">الصنف</th>
                                            <th className="text-center py-2 px-3 text-slate-400 text-sm w-20">الكمية</th>
                                            <th className="text-center py-2 px-3 text-slate-400 text-sm w-24">السعر</th>
                                            <th className="text-center py-2 px-3 text-slate-400 text-sm w-24">الإجمالي</th>
                                            <th className="w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.length > 0 ? items.map((item, idx) => (
                                            <tr key={idx} className="border-t border-slate-700">
                                                <td className="py-2 px-3">
                                                    <Input
                                                        value={item.name}
                                                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                                        className="h-8 bg-transparent border-0 text-white"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                                                        className="h-8 w-16 bg-transparent border-0 text-white text-center"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <Input
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        className="h-8 w-20 bg-transparent border-0 text-white text-center"
                                                    />
                                                </td>
                                                <td className="py-2 px-3 text-center text-emerald-400">
                                                    {item.totalPrice.toLocaleString()}
                                                </td>
                                                <td className="py-2 px-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeItem(idx)}
                                                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-500">
                                                    لم يتم استخراج أي أصناف بعد
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addItem}
                                className="w-full border-dashed border-slate-600 text-slate-400"
                            >
                                <Plus className="h-4 w-4 ml-2" />
                                إضافة صنف
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                                {items.length > 0 && (
                                    <Button
                                        onClick={handleAddToInventory}
                                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700"
                                    >
                                        <Check className="h-4 w-4 ml-2" />
                                        إضافة للمخزون
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSaveAsDocument}
                                    variant="outline"
                                    className="w-full border-slate-600 hover:border-blue-500 hover:text-blue-400 lg:hidden"
                                >
                                    <Save className="h-4 w-4 ml-2" />
                                    حفظ كمستند
                                </Button>
                            </div>

                            {/* Raw Text View */}
                            {rawText && (
                                <div className="mt-4">
                                    <Label className="text-slate-400 mb-2 block">النص الخام المستخرج</Label>
                                    <textarea
                                        className="w-full h-32 bg-slate-800 border-slate-700 rounded p-2 text-xs font-mono text-slate-300"
                                        value={rawText}
                                        readOnly
                                        dir="ltr"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">يمكنك نسخ النص أعلاه للمساعدة في التحقق</p>
                                </div>
                            )}

                            {/* Debug Logs */}
                            <div className="mt-4 p-2 bg-black/50 rounded text-xs font-mono text-slate-400 h-32 overflow-y-auto" dir="ltr">
                                <p className="text-slate-500 mb-1 border-b border-slate-700 pb-1">Debug Logs:</p>
                                {debugLog.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
