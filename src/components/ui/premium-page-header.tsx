

import { cn } from "@/lib/utils"
import { LucideIcon, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PremiumPageHeaderProps {
    title: string
    description?: string
    icon?: LucideIcon
    rightContent?: React.ReactNode
    backLink?: string
    backText?: string
    breadcrumbs?: { label: string; href: string }[]
    stats?: Array<{
        label: string
        value: string | number
        icon: LucideIcon
        color?: string
    }>
}

export function PremiumPageHeader({
    title,
    description,
    icon: Icon,
    rightContent,
    backLink,
    backText = "رجوع",
    stats
}: PremiumPageHeaderProps) {
    return (
        <div dir="rtl" className="relative overflow-hidden rounded-[2rem] shadow-2xl mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" />
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl opacity-50" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl opacity-50 delay-75" />

            <div className="relative px-6 py-8 md:px-10 md:py-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-6">
                        {Icon && (
                            <div className="p-4 md:p-6 bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl">
                                <Icon className="h-10 w-10 md:h-14 md:w-14 text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-lg md:text-xl text-blue-100 font-medium opacity-90">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {backLink && (
                            <Button
                                variant="outline"
                                asChild
                                className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm shadow-lg h-10 px-4 cursor-pointer"
                            >
                                <Link href={backLink}>
                                    <ArrowRight className="h-4 w-4" />
                                    {backText}
                                </Link>
                            </Button>
                        )}
                        {rightContent && (
                            <div className="flex-shrink-0">
                                {rightContent}
                            </div>
                        )}
                    </div>
                </div>

                {stats && stats.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-8">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-white border border-white/10 shadow-lg"
                            >
                                <stat.icon className={cn("h-4 w-4", stat.color || "text-blue-300")} />
                                <span className="text-sm font-medium opacity-80">{stat.label}:</span>
                                <span className="text-sm font-bold">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
