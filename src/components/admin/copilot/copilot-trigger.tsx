"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CopilotSheet } from "./copilot-sheet"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function CopilotTrigger() {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    className={cn(
                        "fixed bottom-24 left-6 h-14 w-14 rounded-full shadow-2xl z-50",
                        "bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
                        "border-2 border-white/20 animate-in zoom-in duration-300",
                        "print:hidden"
                    )}
                    size="icon"
                >
                    <Sparkles className="h-7 w-7 text-white animate-pulse-subtle" />
                    <span className="sr-only">المساعد الذكي</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0 border-l border-border bg-background z-[200]" style={{ zIndex: 200 }}>
                <CopilotSheet />
            </SheetContent>
        </Sheet>
    )
}
