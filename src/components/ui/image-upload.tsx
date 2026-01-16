'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ImageUploadProps {
    label: string
    description?: string
    value?: string
    onChange?: (value: string) => void
    aspectRatio?: 'square' | 'a4' | 'wide'
}

export function ImageUpload({
    label,
    description,
    value,
    onChange,
    aspectRatio = 'square'
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const aspectRatioClass = {
        square: 'aspect-square',
        a4: 'aspect-[1/1.414]',
        wide: 'aspect-video'
    }[aspectRatio]

    const handleFileChange = (file: File | null) => {
        if (!file) return

        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            alert('يرجى اختيار ملف صورة')
            return
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت')
            return
        }

        // Read file as base64
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setPreview(base64String)
            onChange?.(base64String)
        }
        reader.readAsDataURL(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        handleFileChange(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleRemove = () => {
        setPreview(null)
        onChange?.('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-2">
            <Label className="text-base font-semibold">{label}</Label>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}

            <Card
                className={`relative overflow-hidden ${aspectRatioClass} ${isDragging ? 'border-primary bg-primary/5' : 'border-dashed'
                    } transition-colors`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {preview ? (
                    <div className="relative w-full h-full">
                        <img
                            src={preview}
                            alt={label}
                            className="w-full h-full object-contain bg-muted/30"
                        />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center h-full gap-3 cursor-pointer p-4"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">اضغط للرفع أو اسحب الصورة</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG  (حد أقصى 5MB)
                            </p>
                        </div>
                    </div>
                )}
            </Card>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
        </div>
    )
}
