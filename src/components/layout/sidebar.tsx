"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import {
    LayoutDashboard,
    Settings,
    Package,
    Monitor,
    Users,
    Wifi,
    LifeBuoy,
    MapPin,
    Map as MapIcon,
    FileText,
    UserCog,
    Shield,
    BookOpen,
    Building2,
    LogOut,
    ChevronLeft,
    PanelLeftClose,
    PanelRightClose,
    Printer,
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
    CalendarClock,
    Menu,
    X,
    ChevronRight,
    Laptop,
    Network,
    ScreenShare,
    Database,
    Megaphone,
    ShoppingCart,
    ClipboardList,
    FileScan,
    Activity,
    Bell,
    Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { logout } from "@/app/actions/auth";
// import { useSession } from "next-auth/react"; // Removed - using simple auth
import { hasPermission } from "@/lib/rbac";

const sidebarItems = [
    // 📊 الرئيسية
    { title: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
    { title: "تحليلات متقدمة", href: "/admin/analytics", icon: BarChart3 },
    { title: "التقارير", href: "/admin/reports", icon: FileText },
    { title: "الخطة التشغيلية", href: "/admin/operational-plan", icon: Target },

    // 📬 العمليات اليومية
    { title: "طلبات الموظفين", href: "/requests", icon: Inbox },
    { title: "الدعم الفني", href: "/admin/support", icon: LifeBuoy },
    { title: "مراقبة SLA", href: "/sla-monitor", icon: Timer },
    { title: "المحادثات", href: "/messages", icon: MessageCircle },
    { title: "الإعلانات", href: "/admin/announcements", icon: Megaphone },
    { title: "التذكيرات", href: "/reminders", icon: Bell },

    // 🖥️ إدارة الأصول
    { title: "الأصول", href: "/assets", icon: Monitor },
    { title: "العهد", href: "/custody", icon: UserCog },
    { title: "التفاصيل الفنية", href: "/technical-details", icon: FileCode2 },
    { title: "الباركود", href: "/barcode", icon: ScanBarcode },
    { title: "تدقيق الأصول", href: "/admin/audits", icon: ClipboardList },

    // 📦 المخزون والمشتريات
    { title: "المستودع", href: "/inventory", icon: Package },
    { title: "المستهلكات", href: "/admin/consumables", icon: Printer },
    { title: "المشتريات", href: "/admin/purchasing", icon: ShoppingCart },
    { title: "ماسح الفواتير", href: "/admin/invoice-scanner", icon: FileScan },
    { title: "الموردين", href: "/suppliers", icon: Building2 },

    // 🔧 الصيانة
    { title: "الصيانة الدورية", href: "/admin/maintenance", icon: Wrench },
    { title: "الصيانة التنبؤية", href: "/admin/maintenance/predictions", icon: Activity },
    { title: "إدارة الأجهزة", href: "/admin/equipment", icon: Laptop },

    // 🌐 الشبكات والبنية التحتية
    { title: "إدارة الشبكة", href: "/network", icon: Server },
    { title: "اكتشاف الشبكة", href: "/admin/discovery", icon: FileScan }, // New Discovery Link
    { title: "إدارة العناوين IPAM", href: "/admin/ipam", icon: Network },
    { title: "كبائن السيرفرات", href: "/admin/racks", icon: Database },
    { title: "الاتصالات", href: "/telecom", icon: Wifi },
    { title: "الوصول عن بعد", href: "/admin/remote-access", icon: ScreenShare },

    // 💼 البرامج والتراخيص
    { title: "دليل البرامج", href: "/admin/software", icon: AppWindow },
    { title: "تراخيص البرامج", href: "/admin/licenses", icon: KeyRound },
    { title: "اشتراكات البرامج", href: "/subscriptions", icon: CreditCard },

    // 👥 الموارد البشرية
    { title: "الموظفين", href: "/employees", icon: Users },
    { title: "الإدارات", href: "/departments", icon: Building2 },
    { title: "الهيكل التنظيمي", href: "/org-chart", icon: Network },
    { title: "إدارة الزوار", href: "/admin/visitors", icon: Users },

    // 📍 المرافق
    { title: "المواقع", href: "/locations", icon: MapPin },
    { title: "قاعات الاجتماعات", href: "/admin/rooms", icon: Calendar },
    { title: "إدارة الحجوزات", href: "/admin/bookings", icon: CalendarClock },
    { title: "التقويم الشامل", href: "/admin/calendar", icon: CalendarClock },

    // 📚 المعرفة والتدريب
    { title: "قاعدة المعرفة", href: "/admin/knowledge", icon: BookOpen },
    { title: "الدورات التدريبية", href: "/admin/courses", icon: MonitorPlay },
    { title: "دليل الخدمات", href: "/admin/services", icon: ClipboardList },

    // ⚙️ النظام
    {
        title: "الأتمتة التشغيلية",
        href: "/admin/automation",
        icon: MonitorPlay,
    },
    {
        title: "إدارة المستندات",
        href: "/documents",
        icon: FileText,
    },

    {
        title: "الماسح الضوئي",
        href: "/admin/scan",
        icon: ScanBarcode,
    },
    {
        title: "النشاط والسجلات",
        href: "/admin/logs",
        icon: FileText,
    },
    { title: "الإعدادات", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, toggle, isMounted } = useSidebar();
    // const { data: session } = useSession(); // Removed - using simple auth
    const session = null; // Temporary placeholder

    return (
        <div
            className={cn(
                "hidden border-l glass lg:flex !flex-col h-full min-h-screen fixed right-0 top-0 shadow-2xl z-[100] print:hidden",
                "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
                isOpen ? "w-[280px]" : "w-[80px]"
            )}
        >
            <div className="flex h-full max-h-screen flex-col w-full">
                {/* Logo Area */}
                <div className={cn(
                    "flex h-[80px] items-center border-b border-border/50",
                    "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    isOpen ? "px-6 justify-between" : "px-0 justify-center"
                )}>
                    <Link
                        className={cn(
                            "flex items-center gap-3 font-semibold group transition-all duration-500",
                            isOpen ? "w-auto" : "w-12 justify-center"
                        )}
                        href="/dashboard"
                        title="الرئيسية"
                    >
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-800 shadow-xl shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-500 group-hover:scale-105 border border-white/20 ring-1 ring-white/10">
                            <Monitor className="h-6 w-6 text-white drop-shadow-md" />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                        <div className={cn(
                            "flex flex-col gap-0.5 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap",
                            isOpen ? "w-[200px] opacity-100" : "w-0 opacity-0"
                        )}>
                            <span className="text-base font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-sky-700 to-slate-800 dark:from-blue-300 dark:via-sky-300 dark:to-slate-100 drop-shadow-sm filter">
                                نظام إدارة تقنية المعلومات
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground/90 tracking-[0.2em] uppercase bg-clip-text bg-gradient-to-r from-slate-500 to-slate-400">
                                IT SYSTEM MANAGEMENT
                            </span>
                        </div>
                    </Link>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        className={cn(
                            "h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300",
                            isOpen ? "opacity-100" : "absolute left-1/2 -translate-x-1/2 bottom-2"
                        )}
                        style={{ display: isOpen ? 'flex' : 'none' }}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                    <nav className="flex flex-col gap-2">
                        <TooltipProvider delayDuration={0}>
                            {sidebarItems.filter(item => {
                                // RBAC Filtering - Temporary relaxed check
                                return true;
                            }).map((item) => {
                                const isSpecificMatch = pathname === item.href;
                                const isSubPathMatch = pathname?.startsWith(item.href + '/') && item.href !== '/dashboard';
                                // Smart check: If another sidebar item is a "more specific" match for this current path, 
                                // then this parent item should NOT be active.
                                const hasMoreSpecificSibling = sidebarItems.some(other =>
                                    other.href !== item.href &&
                                    other.href.startsWith(item.href) &&
                                    pathname?.startsWith(other.href)
                                );

                                const isActive = (isSpecificMatch || isSubPathMatch) && !hasMoreSpecificSibling;

                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                className={cn(
                                                    "group flex items-center gap-3 rounded-xl text-base font-bold transition-all duration-300 relative overflow-hidden",
                                                    isOpen ? "px-4 py-3" : "px-0 py-3 justify-center",
                                                    isActive
                                                        ? "text-white shadow-lg shadow-blue-500/25"
                                                        : "text-muted-foreground hover:text-foreground"
                                                )}
                                                href={item.href}
                                            >
                                                {isActive && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-600 opacity-100 transition-all duration-500" />
                                                )}
                                                {!isActive && (
                                                    <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/50 transition-all duration-300 rounded-xl" />
                                                )}
                                                <item.icon className={cn(
                                                    "h-5 w-5 transition-all duration-300 group-hover:scale-110 relative z-10",
                                                    isActive && "animate-pulse-subtle",
                                                    !isOpen && "h-6 w-6"
                                                )} />
                                                <span
                                                    className={cn(
                                                        "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap relative z-10",
                                                        isOpen ? "w-[140px] opacity-100" : "w-0 opacity-0"
                                                    )}
                                                >
                                                    {item.title}
                                                </span>
                                                {isActive && isOpen && (
                                                    <div className="mr-auto h-2 w-2 rounded-full bg-white/50 animate-pulse relative z-10" />
                                                )}
                                            </Link>
                                        </TooltipTrigger>
                                        {!isOpen && (
                                            <TooltipContent side="left" className="font-semibold">
                                                {item.title}
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                );
                            })}
                        </TooltipProvider>
                    </nav>
                </div>

                {/* Toggle Button when collapsed */}
                {!isOpen && (
                    <div className="flex justify-center py-3 border-t border-border/50">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggle}
                            className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-300"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                )}

                {/* Footer Actions */}
                <div className={cn(
                    "p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm",
                    !isOpen && "p-2"
                )}>
                    <div className={cn("flex flex-col gap-2", !isOpen && "items-center")}>
                        <form action={logout} className="w-full">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full gap-3 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300",
                                                isOpen ? "justify-start" : "justify-center px-0"
                                            )}
                                            type="submit"
                                        >
                                            <LogOut className={cn("h-5 w-5", !isOpen && "h-6 w-6")} />
                                            <span className={cn(
                                                "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden whitespace-nowrap",
                                                isOpen ? "w-auto opacity-100" : "w-0 opacity-0"
                                            )}>
                                                تسجيل الخروج
                                            </span>
                                        </Button>
                                    </TooltipTrigger>
                                    {!isOpen && (
                                        <TooltipContent side="left" className="font-semibold">
                                            تسجيل الخروج
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

