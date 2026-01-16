"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import { FloatingChat } from "@/components/chat/floating-chat";
import { CopilotTrigger } from "@/components/admin/copilot/copilot-trigger";
import { NotificationProvider } from "@/contexts/notification-context";

interface ShellProps {
    children: React.ReactNode;
    adminUser?: {
        id: string;
        name: string | null;
        email: string | null;
    } | null;
}

function ShellContent({ children, adminUser }: ShellProps) {
    const pathname = usePathname();
    const isLoginPage = pathname?.startsWith("/login");
    const isPortalPage = pathname?.startsWith("/portal");
    const { isOpen, isMounted } = useSidebar();

    const isPrintPage = pathname?.startsWith("/barcode/print");

    if (isLoginPage || isPrintPage) {
        return <>{children}</>;
    }

    // Portal has its own layout and chat, so we just render children.
    // However, if we are in Portal, we should NOT render the Admin Chat.
    // The previous logic excluded portal page from the SHELL layout entirely (lines 18-20 original).
    // Let's keep that logic.
    if (isPortalPage) {
        return <>{children}</>;
    }

    // Show a minimal loading state until hydration is complete
    if (!isMounted) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
                <div className="hidden lg:block w-[280px] h-screen fixed right-0 top-0 bg-background/80 backdrop-blur-sm border-l" />
                <div className="flex flex-col lg:pr-[280px]">
                    <div className="h-16 border-b bg-background/80 backdrop-blur-sm" />
                    <main className="flex-1 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
                        <div className="py-6 sm:py-8 lg:py-10">
                            <div className="flex items-center justify-center min-h-[60vh]">
                                <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
            <Sidebar />
            <div
                className={cn(
                    "flex flex-col transition-all duration-300 ease-linear",
                    isOpen ? "lg:pr-[280px]" : "lg:pr-[80px]"
                )}
            >
                <Header />
                <main className="flex-1 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] pb-24">
                    <div className="container mx-auto px-4 py-8">
                        {children}
                    </div>
                </main>
                {adminUser && (
                    <>
                        <FloatingChat
                            role="ADMIN"
                            userData={{
                                id: adminUser.id,
                                name: adminUser.name || 'مدير النظام',
                                email: adminUser.email || ''
                            }}
                        />
                        <CopilotTrigger />
                    </>
                )}
            </div>
        </div>
    );
}

export function Shell({ children, adminUser }: ShellProps) {
    return (
        <SidebarProvider>
            <NotificationProvider>
                <ShellContent adminUser={adminUser}>{children}</ShellContent>
            </NotificationProvider>
        </SidebarProvider>
    );
}


