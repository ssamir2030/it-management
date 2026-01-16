"use client"

import { Loader2, Inbox } from "lucide-react"

export default function RequestsLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <Inbox className="h-12 w-12 text-primary/30" />
                    <Loader2 className="h-6 w-6 animate-spin text-primary absolute -bottom-1 -right-1" />
                </div>
                <p className="text-muted-foreground text-sm">جاري تحميل الطلبات...</p>
            </div>
        </div>
    )
}
