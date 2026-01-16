'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LogOut, Moon, Sun, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { employeeLogout } from '@/app/actions/employee-portal'
import { useRouter } from 'next/navigation'
import { useTheme } from "next-themes"
import { NotificationBell } from '@/components/layout/notification-bell'

export default function PortalHeader({ employeeName, employeeImage }: { employeeName?: string, employeeImage?: string | null }) {
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { setTheme, theme } = useTheme()

    useEffect(() => {
        setMounted(true)
    }, [])

    async function handleLogout() {
        await employeeLogout()
        router.push('/portal/login')
    }

    // Don't show header on login page
    if (pathname === '/portal/login') return null

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
            <div className="flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 px-4 md:px-6">
                <div className="flex gap-6 md:gap-10">
                    <Link href="/portal/dashboard" className="flex items-center space-x-2">
                        <div className="bg-blue-600/10 p-2 rounded-lg ml-2">
                            <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="inline-block font-bold text-slate-900 dark:text-slate-100">
                            بوابة الموظفين
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex flex-1 items-center justify-center gap-6 text-sm font-medium">
                    <Link href="/portal/dashboard" className={pathname === "/portal/dashboard" ? "text-primary" : "text-muted-foreground hover:text-primary transition-colors"}>
                        الرئيسية
                    </Link>
                    <Link href="/portal/services" className={pathname?.startsWith("/portal/services") ? "text-primary" : "text-muted-foreground hover:text-primary transition-colors"}>
                        دليل الخدمات
                    </Link>
                    <Link href="/portal/requests" className={pathname?.startsWith("/portal/requests") ? "text-primary" : "text-muted-foreground hover:text-primary transition-colors"}>
                        طلباتي
                    </Link>
                    <Link href="/portal/knowledge" className={pathname?.startsWith("/portal/knowledge") ? "text-primary" : "text-muted-foreground hover:text-primary transition-colors"}>
                        قاعدة المعرفة
                    </Link>
                    <Link href="/portal/learning" className={pathname?.startsWith("/portal/learning") ? "text-primary" : "text-muted-foreground hover:text-primary transition-colors"}>
                        التعلم والتوعية
                    </Link>
                    <Link href="/portal/my-assets/audit" className={pathname?.startsWith("/portal/my-assets/audit") ? "text-primary" : "text-muted-foreground hover:text-primary transition-colors"}>
                        التدقيق
                    </Link>
                    <Link href="/portal/my-devices" className={pathname?.startsWith("/portal/my-devices") ? "text-primary" : "text-muted-foreground hover:text-primary transition-colors"}>
                        أجهزتي
                    </Link>
                </nav>

                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center space-x-2">
                        {employeeName && (
                            <Link href="/portal/profile">
                                <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                        {employeeImage ? (
                                            <img src={employeeImage} alt={employeeName} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                        )}
                                    </div>
                                    <div className="hidden md:block text-right">
                                        <p className="text-xs text-slate-500 font-normal mb-1">مرحباً،</p>
                                        <p className="text-sm font-medium">{employeeName}</p>
                                    </div>
                                </Button>
                            </Link>
                        )}

                        <NotificationBell />

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        <div className="border-r border-slate-200 dark:border-slate-800 h-6 mx-2" />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                        >
                            <LogOut className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">خروج</span>
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    )
}
