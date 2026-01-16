export const dynamic = 'force-dynamic';

import { searchAll } from "@/app/actions/search"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Package, Users, Archive, Search as SearchIcon, ArrowRight, Briefcase, ExternalLink } from "lucide-react"

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q: string }
}) {
    const query = searchParams.q || ""
    const results = await searchAll(query)

    const hasResults =
        results.assets.length > 0 ||
        results.employees.length > 0 ||
        results.inventory.length > 0 ||
        results.custody.length > 0 ||
        results.pages.length > 0

    return (
        <div className="w-full py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    <SearchIcon className="h-8 w-8 text-primary" />
                    نتائج البحث
                </h1>
                <p className="text-muted-foreground">
                    نتائج البحث عن: <span className="font-bold text-foreground">"{query}"</span>
                </p>
            </div>

            {!hasResults ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <SearchIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-foreground">لا توجد نتائج</h3>
                    <p className="text-muted-foreground">لم يتم العثور على أي نتائج تطابق بحثك.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Pages / Quick Links Section */}
                    {results.pages.length > 0 && (
                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                                <ExternalLink className="h-5 w-5" />
                                روابط سريعة
                            </h2>
                            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {results.pages.map((page, idx) => (
                                    <Link href={page.url} key={idx}>
                                        <Card className="hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer h-full border-l-4 border-l-primary">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-lg font-bold text-primary flex justify-between items-center">
                                                    {page.title}
                                                    <ArrowRight className="h-4 w-4" />
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">{page.description}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-8 flex-wrap h-auto gap-2">
                            <TabsTrigger value="all">الكل</TabsTrigger>
                            <TabsTrigger value="assets" disabled={results.assets.length === 0}>
                                الأصول
                                <Badge variant="secondary" className="mr-2">{results.assets.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="employees" disabled={results.employees.length === 0}>
                                الموظفين
                                <Badge variant="secondary" className="mr-2">{results.employees.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="inventory" disabled={results.inventory.length === 0}>
                                المخزون
                                <Badge variant="secondary" className="mr-2">{results.inventory.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="custody" disabled={results.custody.length === 0}>
                                العهد
                                <Badge variant="secondary" className="mr-2">{results.custody.length}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-8">
                            {/* Assets Section */}
                            {results.assets.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            الأصول
                                        </h2>
                                        <Link href="/assets" className="text-sm text-primary hover:underline flex items-center">
                                            عرض الكل <ArrowRight className="h-4 w-4 mr-1" />
                                        </Link>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {results.assets.map((asset) => (
                                            <Link href={`/assets?search=${asset.tag}`} key={asset.id}>
                                                <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-base font-medium flex justify-between">
                                                            {asset.name}
                                                            <Badge variant={asset.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                                                                {asset.status}
                                                            </Badge>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            <p>Tag: {asset.tag}</p>
                                                            <p>SN: {asset.serialNumber || '-'}</p>
                                                            <p>الموظف: {asset.employee?.name || '-'}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Employees Section */}
                            {results.employees.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            الموظفين
                                        </h2>
                                        <Link href="/employees" className="text-sm text-primary hover:underline flex items-center">
                                            عرض الكل <ArrowRight className="h-4 w-4 mr-1" />
                                        </Link>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {results.employees.map((emp) => (
                                            <Link href={`/employees?search=${emp.identityNumber}`} key={emp.id}>
                                                <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-base font-medium">
                                                            {emp.name}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            <p>{emp.jobTitle || 'بدون مسمى'}</p>
                                                            <p>{emp.department?.name || 'بدون قسم'}</p>
                                                            <p>الأصول: {emp._count.assets}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Inventory Section */}
                            {results.inventory.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <Archive className="h-5 w-5" />
                                            المخزون
                                        </h2>
                                        <Link href="/inventory" className="text-sm text-primary hover:underline flex items-center">
                                            عرض الكل <ArrowRight className="h-4 w-4 mr-1" />
                                        </Link>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {results.inventory.map((item) => (
                                            <Link href={`/inventory?search=${item.name}`} key={item.id}>
                                                <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-base font-medium flex justify-between">
                                                            {item.name}
                                                            <Badge variant="outline">{(item as any).quantity || 0}</Badge>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            <p>الفئة: {item.category}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Custody Section */}
                            {results.custody.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            <Briefcase className="h-5 w-5" />
                                            العهد
                                        </h2>
                                        <Link href="/custody" className="text-sm text-primary hover:underline flex items-center">
                                            عرض الكل <ArrowRight className="h-4 w-4 mr-1" />
                                        </Link>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {results.custody.map((item) => (
                                            <Link href={`/custody?search=${item.name}`} key={item.id}>
                                                <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-base font-medium flex justify-between">
                                                            {item.name}
                                                            <Badge variant={item.returnDate ? 'secondary' : 'default'}>
                                                                {item.returnDate ? 'مسترجع' : 'نشط'}
                                                            </Badge>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            <p>الموظف: {item.employee?.name || '-'}</p>
                                                            <p>الأصل: {item.asset?.name || '-'}</p>
                                                            <p>تاريخ التسليم: {new Date(item.assignedDate).toLocaleDateString('ar-EG')}</p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </TabsContent>

                        {/* Individual Tabs Content */}
                        <TabsContent value="assets">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {results.assets.map((asset) => (
                                    <Link href={`/assets?search=${asset.tag}`} key={asset.id}>
                                        <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base font-medium flex justify-between">
                                                    {asset.name}
                                                    <Badge variant={asset.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                                                        {asset.status}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>Tag: {asset.tag}</p>
                                                    <p>SN: {asset.serialNumber || '-'}</p>
                                                    <p>الموظف: {asset.employee?.name || '-'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="employees">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {results.employees.map((emp) => (
                                    <Link href={`/employees?search=${emp.identityNumber}`} key={emp.id}>
                                        <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base font-medium">
                                                    {emp.name}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>{emp.jobTitle || 'بدون مسمى'}</p>
                                                    <p>{emp.department?.name || 'بدون قسم'}</p>
                                                    <p>الأصول: {emp._count.assets}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="inventory">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {results.inventory.map((item) => (
                                    <Link href={`/inventory?search=${item.name}`} key={item.id}>
                                        <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base font-medium flex justify-between">
                                                    {item.name}
                                                    <Badge variant="outline">{(item as any).quantity || 0}</Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>الفئة: {item.category}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="custody">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {results.custody.map((item) => (
                                    <Link href={`/custody?search=${item.name}`} key={item.id}>
                                        <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base font-medium flex justify-between">
                                                    {item.name}
                                                    <Badge variant={item.returnDate ? 'secondary' : 'default'}>
                                                        {item.returnDate ? 'مسترجع' : 'نشط'}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm text-muted-foreground space-y-1">
                                                    <p>الموظف: {item.employee?.name || '-'}</p>
                                                    <p>الأصل: {item.asset?.name || '-'}</p>
                                                    <p>تاريخ التسليم: {new Date(item.assignedDate).toLocaleDateString('ar-EG')}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    )
}

