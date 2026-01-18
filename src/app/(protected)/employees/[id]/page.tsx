import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getEmployeeById } from '@/app/actions/employees'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import {
    Users,
    ArrowLeft,
    Edit,
    User,
    Briefcase,
    MapPin,
    Phone,
    Mail,
    CreditCard,
    Monitor,
    Ticket,
    Calendar,
    Package
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EmployeeDetailsPage({ params }: { params: { id: string } }) {
    const result = await getEmployeeById(params.id)

    if (!result.success || !result.data) {
        notFound()
    }

    const employee = result.data

    return (
        <div className="w-full py-10" dir="rtl">
            <PremiumPageHeader
                title={employee.name}
                description={employee.jobTitle || 'موظف'}
                icon={Users}
                rightContent={
                    <div className="flex gap-2">
                        <Link href={`/employees/${employee.id}/edit`}>
                            <Button variant="secondary" size="lg" className="gap-2">
                                <Edit className="h-4 w-4" />
                                تعديل
                            </Button>
                        </Link>
                        <Link href="/employees">
                            <Button variant="ghost" size="lg" className="text-white hover:bg-white/20 gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                العودة
                            </Button>
                        </Link>
                    </div>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Info Card */}
                <Card className="card-elevated border-t-4 border-t-blue-500/20 lg:col-span-2">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-500/10 p-2.5">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">البيانات الشخصية</CardTitle>
                                <CardDescription>المعلومات الأساسية للموظف</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">رقم الهوية</p>
                                        <p className="font-semibold font-mono">{employee.identityNumber || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                                        <p className="font-semibold" dir="ltr">{employee.email || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">رقم الجوال</p>
                                        <p className="font-semibold font-mono" dir="ltr">{employee.phone || '-'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">المسمى الوظيفي</p>
                                        <p className="font-semibold">{employee.jobTitle || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">الإدارة</p>
                                    <p className="font-semibold">{employee.department?.name || 'غير محدد'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">الموقع</p>
                                    <p className="font-semibold">{employee.location?.name || 'غير محدد'}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Card */}
                <Card className="card-elevated border-t-4 border-t-emerald-500/20">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-emerald-500/10 p-2.5">
                                <Package className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold">إحصائيات</CardTitle>
                                <CardDescription>ملخص نشاط الموظف</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Monitor className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">الأصول</span>
                            </div>
                            <Badge variant="secondary" className="text-lg px-3">
                                {employee._count?.assets || 0}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Ticket className="h-5 w-5 text-amber-600" />
                                <span className="font-medium">الطلبات</span>
                            </div>
                            <Badge variant="secondary" className="text-lg px-3">
                                {employee._count?.requests || 0}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                <span className="font-medium">حجوزات القاعات</span>
                            </div>
                            <Badge variant="secondary" className="text-lg px-3">
                                {employee._count?.roomBookings || 0}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-rose-600" />
                                <span className="font-medium">حجوزات المعدات</span>
                            </div>
                            <Badge variant="secondary" className="text-lg px-3">
                                {employee._count?.equipmentBookings || 0}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Assets */}
                {employee.assets && employee.assets.length > 0 && (
                    <Card className="card-elevated border-t-4 border-t-violet-500/20 lg:col-span-3">
                        <CardHeader className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-violet-500/10 p-2.5">
                                        <Monitor className="h-5 w-5 text-violet-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold">آخر الأصول المسجلة</CardTitle>
                                        <CardDescription>الأصول التقنية المخصصة للموظف</CardDescription>
                                    </div>
                                </div>
                                <Link href={`/assets?employeeId=${employee.id}`}>
                                    <Button variant="outline" size="sm">
                                        عرض الكل
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {employee.assets.map((asset: any) => (
                                    <div key={asset.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                                <Monitor className="h-5 w-5 text-violet-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{asset.name}</p>
                                                <p className="text-sm text-muted-foreground">{asset.type} • {asset.manufacturer}</p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-mono text-sm">{asset.assetTag}</p>
                                            <Badge variant={asset.status === 'ASSIGNED' ? 'default' : 'secondary'} className="mt-1">
                                                {asset.status === 'ASSIGNED' ? 'مخصص' : asset.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
