import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    description?: string
    icon: LucideIcon
    iconBgGradient?: string
    titleGradient?: string
    gradient?: string
    children?: ReactNode
    actions?: ReactNode
    stats?: {
        label: string
        value: string | number
        icon?: LucideIcon
    }[]
}

export function EnhancedPageHeader({
    title,
    description,
    icon: Icon,
    iconBgGradient,
    titleGradient,
    gradient,
    children,
    actions,
    stats
}: PageHeaderProps) {
    const finalIconGradient = iconBgGradient || gradient || "from-primary to-primary/80"
    const finalTitleGradient = titleGradient || "from-gray-900 via-gray-700 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400"

    return (
        <div className="mb-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={`rounded-2xl bg-gradient-to-br ${finalIconGradient} p-3.5 shadow-lg`}>
                        <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-1.5">
                        <h1 className={`text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${finalTitleGradient}`}>
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-muted-foreground font-medium">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {(children || actions) && (
                    <div className="flex items-center gap-3">
                        {children}
                        {actions}
                    </div>
                )}
            </div>

            {/* Stats Section */}
            {stats && stats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up stagger-1">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-card border rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-center gap-3">
                                {stat.icon && (
                                    <div className={`p-2 rounded-lg bg-gradient-to-br ${finalIconGradient} bg-opacity-10`}>
                                        <stat.icon className="h-5 w-5 text-primary" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
