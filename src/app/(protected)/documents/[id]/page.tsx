'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getDocumentById, deleteDocument } from '@/app/actions/documents'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, DollarSign, Download, Trash2, ArrowRight, User, Laptop } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function DocumentDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [document, setDocument] = useState<any>(null)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        loadDocument()
    }, [id])

    async function loadDocument() {
        const result = await getDocumentById(id)
        if (result.success) {
            setDocument(result.data)
        } else {
            toast.error('لم يتم العثور على المستند')
            router.push('/documents')
        }
        setLoading(false)
    }

    async function handleDelete() {
        setDeleting(true)
        const result = await deleteDocument(id)
        if (result.success) {
            toast.success('تم حذف المستند بنجاح')
            router.push('/documents')
        } else {
            toast.error('فشل حذف المستند')
            setDeleting(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">جار تحميل تفاصيل المستند...</div>
    }

    if (!document) return null

    return (
        <div className="container mx-auto p-6 space-y-6" dir="rtl">
            <PremiumPageHeader
                title={document.title}
                description={`تفاصيل المستند: ${document.fileName}`}
                icon={FileText}
                rightContent={
                    <div className="flex gap-2">
                        <Link href="/documents">
                            <Button variant="ghost" className="text-white hover:bg-white/20">
                                <ArrowRight className="h-4 w-4 ml-2" />
                                العودة للقائمة
                            </Button>
                        </Link>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    حذف
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader className="text-right">
                                    <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        سيتم حذف هذا المستند نهائياً. لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="gap-2">
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
                                        {deleting ? 'جاري الحذف...' : 'حذف'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>معلومات المستند</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-muted-foreground">نوع المستند</label>
                                <p className="font-medium mt-1">
                                    <Badge variant="secondary">{document.type}</Badge>
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">التاريخ</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                        {document.documentDate ? format(new Date(document.documentDate), 'PPP', { locale: ar }) : '-'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">المبلغ</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                        {document.amount ? `${document.amount.toLocaleString()} ر.س` : '-'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">الحجم</label>
                                <p className="font-medium mt-1">
                                    {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>

                        <div className="border rounded-lg p-6 bg-muted/50 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="p-4 bg-background rounded-full shadow-sm">
                                <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{document.fileName}</h3>
                                <p className="text-sm text-muted-foreground">{document.mimeType}</p>
                            </div>
                            <Button asChild className="gap-2">
                                <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4" />
                                    تحميل / عرض الملف
                                </a>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>العلاقات</CardTitle>
                            <CardDescription>الارتباطات بالسجلات الأخرى</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {document.relatedEmployee ? (
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">الموظف المرتبط</p>
                                        <Link href={`/employees/${document.relatedEmployee.id}`} className="text-sm text-blue-600 hover:underline">
                                            {document.relatedEmployee.name}
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">لا يوجد موظف مرتبط</div>
                            )}

                            {document.relatedAsset ? (
                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className="p-2 bg-purple-100 rounded-full">
                                        <Laptop className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">الأصل المرتبط</p>
                                        <Link href={`/assets/${document.relatedAsset.id}`} className="text-sm text-blue-600 hover:underline">
                                            {document.relatedAsset.name} ({document.relatedAsset.tag})
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">لا يوجد أصل مرتبط</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
