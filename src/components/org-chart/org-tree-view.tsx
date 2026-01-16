'use client'

import { useMemo, useState } from 'react'
import { OrgChartData } from '@/app/actions/org-chart'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Building2,
    User,
    Monitor,
    ChevronDown,
    ChevronRight,
    Search,
    Laptop,
    Briefcase,
    Network,
    BarChart3,
    Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

interface OrgTreeNodeProps {
    node: OrgChartData
    level: number
    onSelect: (node: OrgChartData) => void
    expandedNodes: Set<string>
    toggleNode: (id: string) => void
}

function OrgTreeNode({ node, level, onSelect, expandedNodes, toggleNode }: OrgTreeNodeProps) {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children && node.children.length > 0
    const isRoot = level === 0

    const getIcon = () => {
        switch (node.type) {
            case 'DEPARTMENT': return <Building2 className="h-5 w-5 text-blue-600" />
            case 'EMPLOYEE': return <User className="h-4 w-4 text-emerald-600" />
            case 'ASSET': return <Monitor className="h-4 w-4 text-purple-600" />
            default: return <Briefcase className="h-4 w-4" />
        }
    }

    const getBgColor = () => {
        if (node.type === 'DEPARTMENT') return 'bg-blue-50/50 hover:bg-blue-100/50 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:border-blue-800'
        if (node.type === 'EMPLOYEE') return 'bg-emerald-50/50 hover:bg-emerald-100/50 border-emerald-200 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 dark:border-emerald-800'
        if (node.type === 'ASSET') return 'bg-purple-50/50 hover:bg-purple-100/50 border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:border-purple-800'
        return 'bg-card dark:bg-slate-900/50 border-border'
    }

    return (
        <div className="select-none">
            <div
                className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border mb-2 cursor-pointer transition-all duration-200",
                    getBgColor(),
                    level > 0 && "mr-8 relative"
                )}
                onClick={() => {
                    if (hasChildren) toggleNode(node.id)
                    onSelect(node)
                }}
            >
                {/* Connection Line for nested items */}
                {level > 0 && (
                    <div className="absolute right-[-20px] top-1/2 w-[20px] h-[1px] bg-gray-300 dark:bg-slate-700" />
                )}

                {hasChildren ? (
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 p-0 text-muted-foreground hover:bg-transparent">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                ) : (
                    <div className="w-6" /> // Spacer
                )}

                <div className="p-1.5 rounded-md bg-white shadow-sm border dark:bg-slate-800 dark:border-slate-700">
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{node.name}</p>
                    {node.details && (
                        <p className="text-xs text-muted-foreground truncate opacity-80">{node.details}</p>
                    )}
                </div>

                {node.type === 'ASSET' && node.status && (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-white/50 dark:bg-slate-800/50">{node.status}</Badge>
                )}

                {node.type === 'DEPARTMENT' && node.children && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{node.children.length} موظف</Badge>
                )}

                {node.type === 'EMPLOYEE' && node.children && (
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{node.children.length} عهدة</Badge>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && node.children && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-r border-dashed border-gray-300 dark:border-slate-700 mr-5 pr-2"
                    >
                        {node.children.map(child => (
                            <OrgTreeNode
                                key={child.id}
                                node={child}
                                level={level + 1}
                                onSelect={onSelect}
                                expandedNodes={expandedNodes}
                                toggleNode={toggleNode}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function OrgTreeView({ data }: { data: OrgChartData }) {
    const [selectedNode, setSelectedNode] = useState<OrgChartData | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']))

    // Calculate Stats
    const stats = useMemo(() => {
        let deptCount = 0
        let empCount = 0
        let assetCount = 0

        // Start from children of root since root is container
        data.children?.forEach(dept => {
            deptCount++
            dept.children?.forEach(emp => {
                empCount++
                assetCount += emp.children?.length || 0
            })
        })

        return { deptCount, empCount, assetCount }
    }, [data])

    const toggleNode = (id: string) => {
        const newExpanded = new Set(expandedNodes)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedNodes(newExpanded)
    }

    const expandAll = () => {
        const allIds = new Set<string>()
        const traverse = (node: OrgChartData) => {
            allIds.add(node.id)
            node.children?.forEach(traverse)
        }
        traverse(data)
        setExpandedNodes(allIds)
    }

    const collapseAll = () => {
        setExpandedNodes(new Set(['root']))
    }

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            <PremiumPageHeader
                title="الهيكل التنظيمي"
                description="عرض شجري للأقسام والموظفين وعهد الأصول"
                icon={Network}
                stats={[
                    { label: "إجمالي الإدارات", value: stats.deptCount, icon: Building2 },
                    { label: "إجمالي الموظفين", value: stats.empCount, icon: Users },
                    { label: "إجمالي العهد", value: stats.assetCount, icon: BarChart3 },
                ]}
            />

            <div className="grid lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Tree View Panel */}
                <Card className="lg:col-span-2 overflow-hidden flex flex-col border-0 shadow-xl bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
                    <div className="p-4 border-b space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <h2 className="font-bold text-lg">الهيكل التنظيمي</h2>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="ابحث في الهيكل..."
                                    className="pr-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={expandAll}>توسيع الكل</Button>
                            <Button variant="outline" size="sm" onClick={collapseAll}>طي الكل</Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 custom-scrollbar" dir="rtl">
                        <OrgTreeNode
                            node={data}
                            level={0}
                            onSelect={setSelectedNode}
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                        />
                    </div>
                </Card>

                {/* Details Panel */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedNode ? (
                            <motion.div
                                key={selectedNode.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Card className="border-0 shadow-xl overflow-hidden sticky top-6">
                                    <div className={cn(
                                        "h-24 bg-gradient-to-br p-6 text-white relative flex items-center gap-4",
                                        selectedNode.type === 'DEPARTMENT' ? "from-blue-600 to-indigo-700" :
                                            selectedNode.type === 'EMPLOYEE' ? "from-emerald-600 to-teal-700" :
                                                "from-purple-600 to-violet-700"
                                    )}>
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-lg">
                                            {selectedNode.type === 'DEPARTMENT' ? <Building2 className="h-8 w-8" /> :
                                                selectedNode.type === 'EMPLOYEE' ? <User className="h-8 w-8" /> :
                                                    <Monitor className="h-8 w-8" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium opacity-90 mb-1">
                                                {selectedNode.type === 'DEPARTMENT' ? 'قسم' :
                                                    selectedNode.type === 'EMPLOYEE' ? 'موظف' : 'أصل'}
                                            </p>
                                            <h3 className="text-xl font-bold">{selectedNode.name}</h3>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm text-muted-foreground block mb-1">التفاصيل</label>
                                                <p className="font-medium bg-secondary/50 p-2 rounded-lg">{selectedNode.details || '-'}</p>
                                            </div>

                                            {selectedNode.manager && (
                                                <div>
                                                    <label className="text-sm text-muted-foreground block mb-1">المدير المسؤول</label>
                                                    <div className="flex items-center gap-2 font-medium bg-blue-50 p-2 rounded-lg text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                                                        <User className="h-4 w-4" />
                                                        {selectedNode.manager}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedNode.status && (
                                                <div>
                                                    <label className="text-sm text-muted-foreground block mb-1">الحالة</label>
                                                    <Badge>{selectedNode.status}</Badge>
                                                </div>
                                            )}
                                        </div>

                                        {selectedNode.children && selectedNode.children.length > 0 && (
                                            <div className="pt-4 border-t">
                                                <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                                                    <Laptop className="h-4 w-4" />
                                                    العناصر التابعة ({selectedNode.children.length})
                                                </h4>
                                                <div className="space-y-2 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                                                    {selectedNode.children.map(child => (
                                                        <div key={child.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                                            <div className={cn(
                                                                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs",
                                                                child.type === 'ASSET' ? "bg-purple-500" : "bg-emerald-500"
                                                            )}>
                                                                {child.type === 'ASSET' ? <Monitor className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate">{child.name}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{child.details}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 border-2 border-dashed rounded-xl">
                                <Building2 className="h-16 w-16 mb-4 opacity-20" />
                                <p className="font-medium">اختر عنصراً من القائمة لعرض التفاصيل</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
