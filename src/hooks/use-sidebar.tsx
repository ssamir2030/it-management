"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
    isOpen: boolean;
    isMounted: boolean;
    toggle: () => void;
    close: () => void;
    open: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    // IMPORTANT: Start with null to indicate "not yet determined" state
    // This prevents hydration mismatch
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Only read from localStorage AFTER hydration is complete
        // This prevents the flash/flicker caused by state change during hydration
        const stored = localStorage.getItem("sidebar-open");
        if (stored !== null) {
            setIsOpen(stored === "true");
        }
        // Set mounted AFTER reading localStorage to prevent intermediate states
        setIsMounted(true);
    }, []);

    const toggle = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        localStorage.setItem("sidebar-open", String(newState));
    };

    const close = () => {
        setIsOpen(false);
        localStorage.setItem("sidebar-open", "false");
    };

    const open = () => {
        setIsOpen(true);
        localStorage.setItem("sidebar-open", "true");
    };

    return (
        <SidebarContext.Provider value={{ isOpen, isMounted, toggle, close, open }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
