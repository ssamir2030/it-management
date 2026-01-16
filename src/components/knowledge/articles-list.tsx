'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Eye, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function ArticlesList({ articles }: { articles: any[] }) {
    if (!articles?.length) {
        return <div className="text-center py-10 text-muted-foreground">لا توجد مقالات حالياً</div>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">التصنيف</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-center">المشاهدات</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {articles.map((article) => (
                    <TableRow key={article.id}>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>
                            <Badge variant="outline">{article.category?.nameAr}</Badge>
                        </TableCell>
                        <TableCell>
                            <Badge variant={article.isPublished ? "default" : "secondary"}>
                                {article.isPublished ? 'منشور' : 'مسودة'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                                <Eye className="w-3 h-3 text-muted-foreground" />
                                {article.views}
                            </div>
                        </TableCell>
                        <TableCell className="text-left">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/admin/knowledge/edit/${article.id}`}>
                                        <Edit className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
