import type { Metadata } from "next"
import { Cairo, Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" })

export const metadata: Metadata = {
    title: "إدارة تقنية المعلومات",
    description: "نظام متكامل لإدارة الأصول التقنية والموارد المادية",
    icons: {
        icon: [
            { url: "/favicon.png", type: "image/png" },
            { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
        ],
        apple: [
            { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        ],
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ar" dir="rtl" suppressHydrationWarning>
            <body className={`${inter.variable} ${cairo.variable} font-cairo antialiased`}>
                <Providers>
                    {children}
                </Providers>
                <Toaster position="top-center" richColors />
            </body>
        </html>
    )
}
