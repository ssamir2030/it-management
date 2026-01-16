"use client";

// import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"; // Removed - using simple auth
import { usePathname } from "next/navigation";

export function SessionProvider({ children }: { children: React.ReactNode }) {
    // Temporarily disabled NextAuth session provider - using simple auth instead
    return <>{children}</>;

    // const pathname = usePathname();
    // // Don't use NextAuth session provider for portal pages to avoid 500 errors
    // // as portal uses its own cookie-based auth
    // const isPortal = pathname?.startsWith("/portal");

    // if (isPortal) {
    //     return <>{children}</>;
    // }

    // return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
