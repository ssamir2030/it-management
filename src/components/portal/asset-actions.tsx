'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileSignature, CheckCircle2 } from 'lucide-react'
import { CustodyAcknowledgmentModal } from '@/components/portal/custody-acknowledgment-modal'
import { Badge } from '@/components/ui/badge'

interface AssetActionsProps {
    asset: {
        id: string
        name: string
        tag: string
        serialNumber?: string | null
    }
    custodyItem?: {
        id: string
        isAcknowledged: boolean
        acknowledgedAt?: Date | null
    } | null
}

export function AssetActions({ asset, custodyItem }: AssetActionsProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    // If no custody item exists, we can't strictly acknowledge it based on current schema choice.
    // However, in a real scenario, we might auto-create one. 
    // For now, only show button if custodyItem exists.

    if (!custodyItem) {
        return <Badge variant="outline" className="text-xs">لا يوجد سجل عهدة</Badge>
    }

    if (custodyItem.isAcknowledged) {
        return (
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200">
                <CheckCircle2 className="h-3 w-3" />
                <span>تم الإقرار {custodyItem.acknowledgedAt ? new Date(custodyItem.acknowledgedAt).toLocaleDateString('ar-EG') : ''}</span>
            </div>
        )
    }

    return (
        <>
            <Button
                size="sm"
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white animate-pulse-subtle"
                onClick={() => setIsModalOpen(true)}
            >
                <FileSignature className="h-4 w-4" />
                توقيع الإقرار
            </Button>

            <CustodyAcknowledgmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={{
                    id: custodyItem.id,
                    name: asset.name,
                    asset: asset
                }}
            />
        </>
    )
}
