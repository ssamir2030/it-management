'use client'

import React, { useEffect, useState } from 'react'
import { PremiumPageHeader } from '@/components/ui/premium-page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Terminal, Package, RefreshCw, Copy, Check, Server } from 'lucide-react'
import { toast } from 'sonner'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

type SoftwarePackage = {
    id: string
    name: string
    version: string
    downloadUrl: string
    silentArgs: string
    description: string
    isSystemAgent: boolean
}

export default function DeploymentPage() {
    const [packages, setPackages] = useState<SoftwarePackage[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)
    const [enrollCommand, setEnrollCommand] = useState('Loading...')

    // Demo Server URL
    useEffect(() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
        setEnrollCommand(`irm ${origin}/api/deployment/script | iex`)

        fetch('/api/deployment/packages')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setPackages(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const handleCopy = async () => {
        try {
            // Check if Clipboard API is available (Secure Context usually required)
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(enrollCommand)
                setCopied(true)
                toast.success('تم نسخ الأمر بنجاح')
            } else {
                // Fallback for HTTP / non-secure contexts
                const textArea = document.createElement("textarea")
                textArea.value = enrollCommand
                textArea.style.position = "fixed"
                textArea.style.left = "-9999px"
                textArea.style.top = "0"
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()

                const successful = document.execCommand('copy')
                document.body.removeChild(textArea)

                if (successful) {
                    setCopied(true)
                    toast.success('تم نسخ الأمر بنجاح')
                } else {
                    throw new Error('Fallback copy failed')
                }
            }
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Copy failed:', err)
            toast.error('فشل النسخ التلقائي. يرجى تحديد النص ونسخه يدوياً.')
        }
    }

    return (
        <div className="container mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <PremiumPageHeader
                title="مركز النشر"
                description="إدارة برامج النظام، وإنشاء سكريبتات التثبيت التلقائي للأجهزة."
                icon={Server}
            />

            <div className="grid grid-cols 1 lg:grid-cols-3 gap-8">
                {/* Left Column: Universal Script */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-primary/20 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Terminal className="h-5 w-5 text-primary" />
                                التثبيت الذكي (Smart Enrollment)
                            </CardTitle>
                            <CardDescription>
                                قم بتشغيل هذا الأمر في PowerShell على أي جهاز لربطه بالنظام وتثبيت البرامج المطلوبة تلقائياً.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative group">
                                <div className="absolute top-3 right-3 z-10">
                                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={handleCopy}>
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <div className="rounded-lg overflow-hidden border bg-[#1e1e1e] dir-ltr text-left">
                                    <SyntaxHighlighter
                                        language="powershell"
                                        style={vscDarkPlus}
                                        customStyle={{ margin: 0, padding: '1.5rem' }}
                                    >
                                        {enrollCommand}
                                    </SyntaxHighlighter>
                                </div>
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground space-y-2">
                                <p className="font-semibold text-foreground">💡 ماذا يفعل هذا السكريبت؟</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>يقوم بفحص الجهاز والاتصال بالسيرفر.</li>
                                    <li>يتحقق من وجود (Veyon, OCS Agent, DWService).</li>
                                    <li>يقوم بتحميل البرامج الناقصة وتثبيتها بشكل صامت (Silent Install).</li>
                                    <li>يعيد تسجيل الجهاز في قاعدة البيانات كـ "Online".</li>
                                </ul>
                            </div>

                            {/* Direct Download Options */}
                            <div className="flex gap-4 pt-2">
                                <Button className="w-full gap-2" variant="outline" onClick={() => window.open('/agent.ps1', '_blank')}>
                                    <Download className="h-4 w-4" />
                                    تحميل ملف العميل (agent.ps1)
                                </Button>
                                <Button className="w-full gap-2" variant="outline" onClick={() => window.open('/api/deployment/script?download=true', '_blank')}>
                                    <Download className="h-4 w-4" />
                                    تحميل سكريبت التثبيت (Full Installer)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <h3 className="text-xl font-bold flex items-center gap-2 pt-4">
                        <Package className="h-5 w-5" />
                        مستودع البرامج (Agents Repository)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? (
                            [1, 2].map(i => <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl" />)
                        ) : (
                            packages.map((pkg) => (
                                <Card key={pkg.id} className="hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base font-bold">{pkg.name}</CardTitle>
                                            <Badge variant="outline">{pkg.version}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4 h-10 line-clamp-2">
                                            {pkg.description}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            {pkg.isSystemAgent && (
                                                <Badge variant="secondary" className="text-xs">System Agent</Badge>
                                            )}
                                            <Button variant="ghost" size="sm" className="gap-2 ml-auto" onClick={() => window.open(pkg.downloadUrl, '_blank')}>
                                                <Download className="h-4 w-4" />
                                                تحميل
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column: Instructions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>تعليمات النشر</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <h4 className="font-bold mb-1">1. التثبيت اليدوي</h4>
                                <p className="text-muted-foreground">
                                    انسخ كود PowerShell وقم بلصقه في نافذة المسؤول (Administrator) على أي جهاز عميل.
                                </p>
                            </div>
                            <hr />
                            <div>
                                <h4 className="font-bold mb-1">2. النشر عبر GPO</h4>
                                <p className="text-muted-foreground">
                                    يمكنك حفظ السكريبت كملف `.ps1` وإضافته كـ Startup Script في الـ Group Policy لتثبيته على الدومين بالكامل.
                                </p>
                            </div>
                            <hr />
                            <div>
                                <h4 className="font-bold mb-1">3. الأجهزة خارج الشبكة</h4>
                                <p className="text-muted-foreground">
                                    بما أن السكريبت يستخدم `http/https`، يمكن للأجهزة المنزلية الاتصال طالما السيرفر متاح عبر الإنترنت (Public IP / Domain).
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4 flex gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full h-fit">
                                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-700 dark:text-blue-300">التحديث التلقائي</h4>
                                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                                    عند تغيير إصدار البرنامج هنا، ستقوم الأجهزة تلقائياً بتحديث نفسها عند تشغيل السكريبت مرة أخرى (أو عبر المهمة المجدولة).
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
