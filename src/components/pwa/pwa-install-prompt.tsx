'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // التحقق إذا كان التطبيق مثبتاً
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            // عرض الـ prompt بعد 3 ثواني
            setTimeout(() => setShowPrompt(true), 3000)
        }

        const handleAppInstalled = () => {
            setIsInstalled(true)
            setShowPrompt(false)
            setDeferredPrompt(null)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setShowPrompt(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        // حفظ في localStorage لعدم الإزعاج
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
    }

    // التحقق من رفض سابق
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-prompt-dismissed')
        if (dismissed) {
            const dismissedTime = parseInt(dismissed)
            // إظهار مرة أخرى بعد 7 أيام
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
                setShowPrompt(false)
            }
        }
    }, [])

    if (isInstalled || !showPrompt || !deferredPrompt) return null

    return (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[998] animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-gradient-to-r from-[#0f3c6e] to-[#1a5a9e] rounded-2xl p-4 shadow-2xl text-white">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-white/20 rounded-xl shrink-0">
                        <Download className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base mb-1">تثبيت التطبيق</h3>
                        <p className="text-sm text-blue-100 opacity-90">
                            ثبّت بوابة الموظفين على جهازك للوصول السريع!
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex gap-2 mt-4">
                    <Button
                        onClick={handleInstall}
                        className="flex-1 bg-white text-[#0f3c6e] hover:bg-blue-50 font-bold"
                    >
                        <Download className="h-4 w-4 ml-2" />
                        تثبيت الآن
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleDismiss}
                        className="text-white hover:bg-white/10"
                    >
                        لاحقاً
                    </Button>
                </div>
            </div>
        </div>
    )
}
