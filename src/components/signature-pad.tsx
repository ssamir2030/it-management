'use client'

import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eraser, Save, Download } from 'lucide-react'
import { toast } from 'sonner'

interface SignaturePadProps {
    onSave?: (signature: string) => void
    initialSignature?: string
    readonly?: boolean
}

export function SignaturePad({ onSave, initialSignature, readonly = false }: SignaturePadProps) {
    const sigPad = useRef<SignatureCanvas>(null)
    const [isEmpty, setIsEmpty] = useState(true)

    const clear = () => {
        sigPad.current?.clear()
        setIsEmpty(true)
    }

    const save = async () => {
        if (sigPad.current?.isEmpty()) {
            toast.error('الرجاء التوقيع أولاً')
            return
        }

        const signature = sigPad.current?.toDataURL()
        if (signature && onSave) {
            onSave(signature)
            toast.success('تم حفظ التوقيع بنجاح')
        }
    }

    const download = () => {
        if (sigPad.current?.isEmpty()) {
            toast.error('الرجاء التوقيع أولاً')
            return
        }

        const signature = sigPad.current?.toDataURL()
        if (signature) {
            const link = document.createElement('a')
            link.href = signature
            link.download = 'signature.png'
            link.click()
            toast.success('تم تحميل التوقيع')
        }
    }

    if (readonly && initialSignature) {
        return (
            <div className="border-2 border-dashed rounded-lg p-4 bg-slate-50 dark:bg-slate-950">
                <img src={initialSignature} alt="التوقيع" className="max-h-40 mx-auto" />
            </div>
        )
    }

    return (
        <Card className="border-2">
            <CardHeader>
                <CardTitle>التوقيع الإلكتروني</CardTitle>
                <CardDescription>
                    قم بالتوقيع في المربع أدناه باستخدام الماوس أو شاشة اللمس
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg overflow-hidden bg-white">
                    <SignatureCanvas
                        ref={sigPad}
                        canvasProps={{
                            className: 'w-full h-40 cursor-crosshair',
                        }}
                        onEnd={() => setIsEmpty(false)}
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={clear}
                        className="gap-2"
                    >
                        <Eraser className="h-4 w-4" />
                        مسح
                    </Button>
                    {onSave && (
                        <Button
                            type="button"
                            onClick={save}
                            disabled={isEmpty}
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            حفظ التوقيع
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={download}
                        disabled={isEmpty}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        تحميل
                    </Button>
                </div>

                {initialSignature && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium">التوقيع المحفوظ:</p>
                        <div className="border-2 border-dashed rounded-lg p-4 bg-slate-50 dark:bg-slate-950">
                            <img src={initialSignature} alt="التوقيع المحفوظ" className="max-h-32 mx-auto" />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
