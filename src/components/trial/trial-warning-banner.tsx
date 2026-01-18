'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TrialWarningBanner() {
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
    const [dismissed, setDismissed] = useState(false)

    useEffect(() => {
        // Check trial status from API
        fetch('/api/trial-status')
            .then(res => res.json())
            .then(data => {
                if (data.trialEnabled && data.daysRemaining >= 0 && data.daysRemaining <= 7) {
                    setDaysRemaining(data.daysRemaining)
                }
            })
            .catch(() => { })
    }, [])

    if (daysRemaining === null || dismissed) {
        return null
    }

    const isUrgent = daysRemaining <= 3

    return (
        <div className={`${isUrgent ? 'bg-red-600' : 'bg-amber-500'} text-white py-2 px-4`} dir="rtl">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">
                        {daysRemaining === 0 ? (
                            'تنتهي النسخة التجريبية اليوم!'
                        ) : daysRemaining === 1 ? (
                            'تنتهي النسخة التجريبية غداً!'
                        ) : (
                            <>تنتهي النسخة التجريبية خلال <strong>{daysRemaining}</strong> أيام</>
                        )}
                        {' '}
                        <a href="mailto:support@example.com" className="underline hover:no-underline">
                            تواصل معنا للتجديد
                        </a>
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDismissed(true)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
