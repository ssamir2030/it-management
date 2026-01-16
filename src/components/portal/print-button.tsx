'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
    return (
        <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={() => window.print()}
        >
            <Printer className="h-5 w-5" />
            طباعة
        </Button>
    )
}
