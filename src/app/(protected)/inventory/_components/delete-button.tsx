'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteInventoryItem } from "@/app/actions/inventory"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

export function DeleteButton({ id, name }: { id: string; name: string }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    async function handleDelete() {
        if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return

        startTransition(async () => {
            try {
                const res = await deleteInventoryItem(id)
                if (res?.success) {
                    router.refresh()
                } else {
                    alert(res?.error || "فشل في حذف العنصر")
                }
            } catch (error) {
                console.error("Error deleting item:", error)
                alert("حدث خطأ أثناء الحذف")
            }
        })
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
            disabled={isPending}
        >
            <Trash2 className="h-4 w-4 ml-1" />
            حذف
        </Button>
    )
}
