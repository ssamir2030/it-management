"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster({ position = "top-center", richColors = false }: { position?: "top-center" | "top-right" | "bottom-right" | "bottom-center" | "bottom-left" | "top-left"; richColors?: boolean }) {
    return (
        <SonnerToaster
            position={position}
            richColors={richColors}
            closeButton
            toastOptions={{
                classNames: {
                    toast: "font-cairo",
                },
            }}
        />
    )
}
