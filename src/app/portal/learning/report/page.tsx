export const dynamic = 'force-dynamic';

import { PremiumPageHeader } from "@/components/ui/premium-page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, Download, ExternalLink, FileText } from "lucide-react"
import prisma from "@/lib/prisma"
import { getCurrentEmployee } from "@/app/actions/employee-portal"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import Link from "next/link"

export default async function CertificatesReportPage() {
    const employee = await getCurrentEmployee()
    if (!employee) redirect('/login')

    // Fetch Internal Certificates
    const internalCerts = await prisma.certificate.findMany({
        where: { employeeId: employee.id },
        include: { course: true },
        orderBy: { issuedAt: 'desc' }
    })

    // Fetch External Certificates
    const externalCerts = await prisma.externalCertificate.findMany({
        where: { employeeId: employee.id },
        orderBy: { completionDate: 'desc' }
    })

    return (
        <div className="space-y-6 pb-20 container mx-auto px-4 py-8">
            <PremiumPageHeader
                title="سجل الشهادات والإنجازات"
                description="تقرير شامل بجميع الدورات التدريبية والشهادات المعتمدة"
                icon={Award}
                rightContent={
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        تصدير PDF
                    </Button>
                }
            />

            <div className="grid gap-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{internalCerts.length + externalCerts.length}</div>
                            <p className="text-xs text-muted-foreground">إجمالي الشهادات</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-blue-600">{internalCerts.length}</div>
                            <p className="text-xs text-muted-foreground">شهادات المنصة</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-purple-600">{externalCerts.length}</div>
                            <p className="text-xs text-muted-foreground">شهادات خارجية</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Certificates List */}
                <Card>
                    <CardContent className="p-0">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-right">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">اسم الشهادة / الدورة</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">الجهة المانحة</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">تاريخ الإنجاز</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">النوع</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">الحالة</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">المرفقات</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {/* Internal Certs */}
                                    {internalCerts.map((cert) => (
                                        <tr key={cert.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{cert.course.title}</td>
                                            <td className="p-4 align-middle">IT Management System</td>
                                            <td className="p-4 align-middle">{format(cert.issuedAt, 'yyyy-MM-dd')}</td>
                                            <td className="p-4 align-middle"><Badge variant="secondary">داخلي</Badge></td>
                                            <td className="p-4 align-middle"><Badge className="bg-green-500">معتمدة</Badge></td>
                                            <td className="p-4 align-middle">
                                                <Button variant="ghost" size="sm">
                                                    <FileText className="w-4 h-4 ml-2" />
                                                    عرض
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}

                                    {/* External Certs */}
                                    {externalCerts.map((cert) => (
                                        <tr key={cert.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{cert.title}</td>
                                            <td className="p-4 align-middle">{cert.issuer}</td>
                                            <td className="p-4 align-middle">{format(cert.completionDate, 'yyyy-MM-dd')}</td>
                                            <td className="p-4 align-middle"><Badge variant="outline">خارجي</Badge></td>
                                            <td className="p-4 align-middle">
                                                <Badge variant={cert.status === 'APPROVED' ? 'default' : 'secondary'} className={cert.status === 'APPROVED' ? 'bg-green-500' : 'bg-yellow-500'}>
                                                    {cert.status === 'APPROVED' ? 'معتمدة' : 'قيد المراجعة'}
                                                </Badge>
                                            </td>
                                            <td className="p-4 align-middle">
                                                {cert.fileUrl && (
                                                    <Link href={cert.fileUrl} target="_blank">
                                                        <Button variant="ghost" size="sm">
                                                            <ExternalLink className="w-4 h-4 ml-2" />
                                                            عرض
                                                        </Button>
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
