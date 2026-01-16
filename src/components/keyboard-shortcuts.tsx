'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Keyboard } from 'lucide-react'

const SHORTCUTS = [
    { keys: ['Ctrl', 'K'], description: 'بحث سريع', action: '/search' },
    { keys: ['Ctrl', 'D'], description: 'لوحة التحكم', action: '/dashboard' },
    { keys: ['Ctrl', 'R'], description: 'الطلبات', action: '/requests' },
    { keys: ['Ctrl', 'A'], description: 'الأصول', action: '/assets' },
    { keys: ['Ctrl', 'E'], description: 'الموظفين', action: '/employees' },
    { keys: ['Ctrl', 'N'], description: 'طلب جديد', action: '/requests/new' },
    { keys: ['Ctrl', '?'], description: 'إظهار الاختصارات', action: 'toggle-help' },
    { keys: ['Esc'], description: 'إلغاء/إغلاق', action: 'close' },
]

export function KeyboardShortcuts() {
    const [showHelp, setShowHelp] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return
            }

            const ctrlKey = e.ctrlKey || e.metaKey

            if (ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case 'k':
                        e.preventDefault()
                        router.push('/search')
                        break
                    case 'd':
                        e.preventDefault()
                        router.push('/dashboard')
                        break
                    case 'r':
                        e.preventDefault()
                        router.push('/requests')
                        break
                    case 'a':
                        e.preventDefault()
                        router.push('/assets')
                        break
                    case 'e':
                        e.preventDefault()
                        router.push('/employees')
                        break
                    case 'n':
                        e.preventDefault()
                        router.push('/requests/new')
                        break
                    case '/':
                    case '?':
                        e.preventDefault()
                        setShowHelp(prev => !prev)
                        break
                }
            }

            if (e.key === 'Escape') {
                setShowHelp(false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [router])

    return (
        <Dialog open={showHelp} onOpenChange={setShowHelp}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Keyboard className="h-5 w-5" />
                        اختصارات لوحة المفاتيح
                    </DialogTitle>
                    <DialogDescription>
                        استخدم هذه الاختصارات للتنقل السريع في النظام
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                    {SHORTCUTS.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <span className="text-sm text-gray-700">{shortcut.description}</span>
                            <div className="flex gap-1">
                                {shortcut.keys.map((key, i) => (
                                    <Badge key={i} variant="outline" className="font-mono px-2 py-1">
                                        {key}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-sm text-center text-muted-foreground border-t pt-4">
                    اضغط <Badge variant="outline" className="mx-1">Esc</Badge> للإغلاق
                </div>
            </DialogContent>
        </Dialog>
    )
}
