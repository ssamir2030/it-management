'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Printer } from "lucide-react"
import { useRef } from "react"
import { useReactToPrint } from "react-to-print"

interface BarcodePrintProps {
    assetName: string
    assetTag: string
    employeeName: string
    department: string
    date: string
}

export function BarcodePrint({ assetName, assetTag, employeeName, department, date }: BarcodePrintProps) {
    const componentRef = useRef(null)

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    } as any)

    return (
        <div className="flex flex-col gap-4 items-center">
            <div className="hidden">
                <div ref={componentRef} className="p-4 border border-black w-[300px] h-[200px] flex flex-col items-center justify-center text-center gap-2 font-bold">
                    <div className="text-lg">{assetName}</div>
                    <div className="text-xl font-mono">{assetTag}</div>
                    <div className="text-sm border-t border-black w-full pt-2 mt-2">
                        <div>{employeeName}</div>
                        <div>{department}</div>
                        <div className="text-xs mt-1">{date}</div>
                    </div>
                </div>
            </div>

            <Card className="p-4 w-full max-w-sm bg-muted/50">
                <div className="text-center space-y-2">
                    <h3 className="font-bold text-lg text-green-600">تمت الإضافة بنجاح!</h3>
                    <p className="text-sm text-muted-foreground">تم إنشاء الأصل والعهدة وخصم الكمية.</p>
                    <div className="p-4 border rounded bg-white mx-auto w-fit text-center text-sm shadow-sm">
                        <div className="font-bold">{assetName}</div>
                        <div className="font-mono">{assetTag}</div>
                        <div className="text-xs text-muted-foreground mt-1">{employeeName}</div>
                    </div>
                    <Button onClick={handlePrint} className="w-full gap-2 mt-4">
                        <Printer className="h-4 w-4" />
                        طباعة الملصق
                    </Button>
                </div>
            </Card>
        </div>
    )
}
