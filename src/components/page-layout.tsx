import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
    title: string
    description?: string
    icon?: LucideIcon
    actions?: ReactNode
    breadcrumbs?: Array<{ label: string; href?: string }>
}

export function PageHeader({ title, description, icon: Icon, actions, breadcrumbs }: PageHeaderProps) {
    return (
        <div className="space-y-4">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                            {crumb.href ? (
                                <a href={crumb.href} className="hover:text-primary transition-colors">
                                    {crumb.label}
                                </a>
                            ) : (
                                <span className="text-foreground font-medium">{crumb.label}</span>
                            )}
                            {index < breadcrumbs.length - 1 && <span className="mx-1">/</span>}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4 flex-1">
                    {Icon && (
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                            <Icon className="h-8 w-8 text-primary" />
                        </div>
                    )}
                    <div className="space-y-1 flex-1">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-base text-muted-foreground max-w-2xl">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}

interface PageContainerProps {
    children: ReactNode
    className?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function PageContainer({ children, className, maxWidth = 'full' }: PageContainerProps) {
    const maxWidthClasses = {
        sm: 'max-w-2xl',
        md: 'max-w-4xl',
        lg: 'max-w-6xl',
        xl: 'max-w-7xl',
        '2xl': 'max-w-[1400px]',
        full: 'max-w-full'
    }

    return (
        <div className={cn('px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mx-auto', maxWidthClasses[maxWidth], className)}>
            {children}
        </div>
    )
}

interface PageContentProps {
    children: ReactNode
    className?: string
}

export function PageContent({ children, className }: PageContentProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {children}
        </div>
    )
}

interface PageProps {
    title: string
    description?: string
    icon?: LucideIcon
    actions?: ReactNode
    breadcrumbs?: Array<{ label: string; href?: string }>
    children: ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
    className?: string
}

export function Page({
    title,
    description,
    icon,
    actions,
    breadcrumbs,
    children,
    maxWidth = 'full',
    className
}: PageProps) {
    return (
        <PageContainer maxWidth={maxWidth} className={className}>
            <PageHeader
                title={title}
                description={description}
                icon={icon}
                actions={actions}
                breadcrumbs={breadcrumbs}
            />
            <PageContent>
                {children}
            </PageContent>
        </PageContainer>
    )
}
