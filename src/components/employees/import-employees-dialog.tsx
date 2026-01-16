'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { importEmployees } from "@/app/actions/import-employees"

export function ImportEmployeesDialog() {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleImport = async () => {
        if (!file) return

        setIsLoading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const result = await importEmployees(formData)
            if (result.success) {
                toast.success(result.message)
                setOpen(false)
                setFile(null)
            } else {
                toast.error(result.error)
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء الاستيراد")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    استيراد
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>استيراد الموظفين</DialogTitle>
                    <DialogDescription>
                        قم برفع ملف Excel يحتوي على بيانات الموظفين.
                        يجب أن يكون الملف بنفس تنسيق ملف التصدير.
                        سيتم تعيين كلمة المرور الافتراضية "123456" للموظفين الجدد.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4 rounded-lg border p-4 bg-muted/50">
                        <FileSpreadsheet className="h-8 w-8 text-green-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">قالب الاستيراد</p>
                            <p className="text-xs text-muted-foreground">
                                يمكنك تصدير الموظفين الحاليين لاستخدامه كقالب
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="file">ملف Excel</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        إلغاء
                    </Button>
                    <Button onClick={handleImport} disabled={!file || isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        استيراد البيانات
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
