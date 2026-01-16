'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, ChevronDown, ChevronRight, Folder } from "lucide-react"
import { deleteActivity } from "@/app/actions/operational-plan"
import { EditActivityDialog } from "./edit-activity-dialog"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

export function ActivityList({ activities, searchQuery }: { activities: any[], searchQuery: string }) {
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

    const toggleProject = (projectId: string) => {
        const newExpanded = new Set(expandedProjects)
        if (newExpanded.has(projectId)) {
            newExpanded.delete(projectId)
        } else {
            newExpanded.add(projectId)
        }
        setExpandedProjects(newExpanded)
    }

    const filteredActivities = activities.filter(activity =>
        activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.code?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع الأنشطة المرتبطة به.')) {
            await deleteActivity(id)
        }
    }

    // Projects list (Actually now just a list of "Projects" which are the operational activities themselves)
    // We treat each activity as a Project now.

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="text-right w-[100px]">الرمز</TableHead>
                        <TableHead className="text-right w-[350px]">اسم المشروع</TableHead>
                        <TableHead className="text-right w-[100px]">الأولوية</TableHead>
                        <TableHead className="text-right">ميزانية المشروع</TableHead>
                        <TableHead className="text-right">المصروف الفعلي</TableHead>
                        <TableHead className="text-right">الفائض</TableHead>
                        <TableHead className="text-right w-[150px]">نسبة الإنجاز</TableHead>
                        <TableHead className="text-right">المسؤول</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredActivities.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">

                                لا توجد مشاريع مطابقة للبحث
                            </TableCell>
                        </TableRow>
                    ) : filteredActivities.map((project) => {
                        const isExpanded = expandedProjects.has(project.id)

                        // Project Progress
                        const percentage = project.completionPercentage || 0

                        return (
                            <>
                                {/* Project Row */}
                                <TableRow
                                    key={project.id}
                                    className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer font-semibold border-b-2 border-slate-200 dark:border-slate-800"
                                    onClick={() => toggleProject(project.id)}
                                >
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {project.code || '-'}
                                    </TableCell>
                                    <TableCell colSpan={1}>
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? <ChevronDown className="h-4 w-4 text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                            <Folder className="h-5 w-5 text-blue-500 fill-blue-500/20" />
                                            <span className="text-base text-slate-800 dark:text-slate-100">{project.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            project.priority === 'HIGH' ? 'destructive' :
                                                project.priority === 'MEDIUM' ? 'secondary' : 'outline'
                                        } className="text-[10px] h-5 px-1.5">
                                            {project.priority === 'HIGH' ? 'مرتفعة' :
                                                project.priority === 'MEDIUM' ? 'متوسطة' : 'منخفضة'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-800 dark:text-slate-100">
                                        {(project.budget || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-blue-700 dark:text-blue-300">{(project.spent || 0).toLocaleString()}</span>
                                            {project.budget > 0 && (
                                                <Progress value={(project.spent / project.budget) * 100} className="h-1.5 bg-slate-200" indicatorClassName={
                                                    (project.spent / project.budget) > 1 ? "bg-red-500" : "bg-sky-500"
                                                } />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "font-bold",
                                            (project.budget - project.spent) < 0 ? "text-red-500" : "text-emerald-600"
                                        )}>
                                            {(project.budget - project.spent).toLocaleString()}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {/* Project Progress */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs w-8 text-left">{percentage}%</span>
                                            <Progress value={percentage} className="h-2 flex-1" />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{project.responsible || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 justify-end">
                                            <EditActivityDialog activity={project} /> {/* Passed as activity prop but it's a project */}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                {/* Activity Rows (Children Items) */}
                                {isExpanded && project.items && project.items.length > 0 && (
                                    <TableRow className="bg-white dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-950">
                                        <TableCell colSpan={8} className="p-0">
                                            <div className="border-l-4 border-l-blue-500/20 ml-8 mr-4 my-2 rounded-r-lg overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-b-0">
                                                            <TableHead className="h-8 text-xs font-semibold">اسم النشاط (البند)</TableHead>
                                                            <TableHead className="h-8 text-xs font-semibold text-right">المبلغ المخصص</TableHead>
                                                            <TableHead className="h-8 text-xs font-semibold text-right">المصروف</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {project.items.map((item: any) => (
                                                            <TableRow key={item.id} className="border-b-0 hover:bg-slate-100/50">
                                                                <TableCell className="text-sm py-2 pl-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                                                                        {item.title}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-sm font-mono text-muted-foreground text-right py-2">{item.amount?.toLocaleString()}</TableCell>
                                                                <TableCell className="text-sm font-mono text-blue-600 text-right py-2">{item.spent?.toLocaleString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
