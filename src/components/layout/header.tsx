"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    CircleUser,
    Menu,
    Package2,
    Search,
    Home,
    LayoutDashboard,
    Settings,
    Package,
    Monitor,
    Users,
    Wifi,
    LifeBuoy,
    MapPin,
    FileText,
    UserCog,
    BookOpen,
    Building2,
    LogOut,
    FileCode2,
    ScanBarcode,
    Server,
    Inbox,
    CreditCard,
    KeyRound,
    MonitorPlay,
    BarChart3,
    MessageCircle,
    AppWindow,
    Timer,
    Wrench,
    Calendar,
    X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import { logout } from "@/app/actions/auth";
import { NotificationBell } from "@/components/layout/notification-bell";
import { CommandMenu } from "@/components/command-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mobile navigation items - same as sidebar
const mobileNavItems = [
    { title: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
    { title: "طلبات الموظفين", href: "/requests", icon: Inbox },
    { title: "الدعم الفني", href: "/admin/support", icon: LifeBuoy },
    { title: "مراقبة SLA", href: "/sla-monitor", icon: Timer },
    { title: "قاعدة المعرفة", href: "/admin/knowledge", icon: BookOpen },
    { title: "دليل البرامج", href: "/admin/software", icon: AppWindow },
    { title: "المستودع", href: "/inventory", icon: Package },
    { title: "الأصول", href: "/assets", icon: Monitor },
    { title: "التفاصيل الفنية", href: "/technical-details", icon: FileCode2 },
    { title: "العهد", href: "/custody", icon: UserCog },
    { title: "الباركود", href: "/barcode", icon: ScanBarcode },
    { title: "الصيانة الدورية", href: "/admin/maintenance", icon: Wrench },
    { title: "الاتصالات", href: "/telecom", icon: Wifi },
    { title: "اشتراكات البرامج", href: "/subscriptions", icon: CreditCard },
    { title: "تراخيص البرامج", href: "/licenses", icon: KeyRound },
    { title: "الوصول عن بعد", href: "/remote-access", icon: MonitorPlay },
    { title: "إدارة الشبكة", href: "/network", icon: Server },
    { title: "المحادثات", href: "/messages", icon: MessageCircle },
    { title: "الموردين", href: "/suppliers", icon: Building2 },
    { title: "الموظفين", href: "/employees", icon: Users },
    { title: "الإدارات", href: "/departments", icon: Building2 },
    { title: "قاعات الاجتماعات", href: "/admin/rooms", icon: Calendar },
    { title: "إدارة الحجوزات", href: "/admin/bookings", icon: Calendar },
    { title: "المواقع", href: "/locations", icon: MapPin },
    { title: "التقارير", href: "/admin/reports", icon: BarChart3 },
    { title: "إدارة المستندات", href: "/documents", icon: FileText },
    { title: "سجل النظام", href: "/admin/logs", icon: FileText },
    { title: "الإعدادات", href: "/settings", icon: Settings },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 flex h-16 items-center gap-2 sm:gap-4 border-b glass px-3 sm:px-4 md:px-6 z-10 print:hidden">
            {/* Mobile Menu Button */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">فتح القائمة</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                    <SheetHeader className="p-4 border-b bg-gradient-to-r from-blue-600 to-indigo-700">
                        <SheetTitle className="flex items-center gap-3 text-white">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Monitor className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col items-start gap-0.5">
                                <span className="font-bold text-lg">نظام إدارة تقنية المعلومات</span>
                                <span className="text-[10px] font-medium opacity-90 tracking-wider">IT SYSTEM MANAGEMENT</span>
                            </div>
                        </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-140px)]">
                        <nav className="grid gap-1 p-3">
                            {mobileNavItems.map((item) => {
                                const isActive = pathname?.startsWith(item.href);
                                return (
                                    <SheetClose asChild key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                                isActive
                                                    ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md"
                                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.title}
                                        </Link>
                                    </SheetClose>
                                );
                            })}
                        </nav>
                    </ScrollArea>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                        <form action={logout} className="w-full">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                                type="submit"
                            >
                                <LogOut className="h-5 w-5" />
                                تسجيل الخروج
                            </Button>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Logo */}
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 sm:gap-3 text-lg font-semibold md:text-base group"
                    title="الرئيسية"
                >
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-sky-600 to-blue-800 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110 border border-white/10 ring-1 ring-white/10">
                        <Monitor className="h-5 w-5 text-white drop-shadow-md" />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent" />
                    </div>
                    <div className="hidden sm:flex flex-col gap-0.5 whitespace-nowrap">
                        <span className="text-sm sm:text-base font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-sky-700 to-slate-800 dark:from-blue-300 dark:via-sky-300 dark:to-slate-100 drop-shadow-sm filter">
                            نظام إدارة تقنية المعلومات
                        </span>
                        <span className="hidden lg:inline text-[10px] font-bold text-muted-foreground/80 tracking-[0.1em] uppercase bg-clip-text bg-gradient-to-r from-slate-500 to-slate-400">
                            IT System Management
                        </span>
                    </div>
                </Link>
            </nav>

            {/* Mobile Logo */}
            <Link
                href="/dashboard"
                className="flex items-center gap-2 lg:hidden"
                title="الرئيسية"
            >
                <div className="p-1.5 bg-gradient-to-br from-blue-600 to-sky-700 rounded-lg shadow-md">
                    <Monitor className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-sky-700 dark:from-blue-300 dark:to-sky-300 hidden xs:inline">
                    IT System
                </span>
            </Link>

            {/* Actions */}
            <div className="flex w-full items-center gap-2 sm:gap-4 md:ml-auto">
                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    <div className="hidden sm:block">
                        <CommandMenu />
                    </div>
                    <NotificationBell />
                    <Link href="/dashboard" className="hidden sm:block">
                        <Button variant="outline" size="icon" title="الرئيسية">
                            <Home className="h-[1.2rem] w-[1.2rem]" />
                            <span className="sr-only">الرئيسية</span>
                        </Button>
                    </Link>
                    <ModeToggle />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full border-2 border-primary/10 hover:border-primary/50 transition-all h-8 w-8 sm:h-9 sm:w-9">
                            <CircleUser className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="sr-only">قائمة المستخدم</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer">
                            <Link href="/settings" className="flex w-full">الإعدادات</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            <Link href="/support" className="flex w-full">الدعم</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" asChild>
                            <form action={logout} className="w-full">
                                <button type="submit" className="flex w-full font-medium">
                                    تسجيل الخروج
                                </button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
