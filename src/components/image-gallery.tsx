'use client'

import { useState } from 'react'
import { X, Upload, Trash2, ZoomIn, Download, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { toast } from 'sonner'

interface ImageGalleryProps {
    images: string[]
    onUpload?: (file: File) => Promise<string>
    onDelete?: (imageUrl: string) => Promise<void>
    editable?: boolean
    maxImages?: number
}

export function ImageGallery({
    images,
    onUpload,
    onDelete,
    editable = false,
    maxImages = 10
}: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !onUpload) return

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('يرجى اختيار صورة فقط')
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت')
            return
        }

        if (images.length >= maxImages) {
            toast.error(`الحد الأقصى ${maxImages} صور`)
            return
        }

        setIsUploading(true)
        try {
            await onUpload(file)
            toast.success('تم رفع الصورة بنجاح')
        } catch (error) {
            toast.error('فشل رفع الصورة')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (imageUrl: string) => {
        if (!onDelete) return

        if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
            try {
                await onDelete(imageUrl)
                toast.success('تم حذف الصورة')
            } catch (error) {
                toast.error('فشل حذف الصورة')
            }
        }
    }

    const downloadImage = (imageUrl: string) => {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = imageUrl.split('/').pop() || 'image.jpg'
        link.click()
        toast.success('جاري التحميل...')
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Existing Images */}
                {images.map((imageUrl, index) => (
                    <Card key={index} className="group relative aspect-square overflow-hidden cursor-pointer hover:shadow-lg transition-all">
                        <Image
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                            onClick={() => setSelectedImage(imageUrl)}
                        />

                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedImage(imageUrl)
                                }}
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    downloadImage(imageUrl)
                                }}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            {editable && onDelete && (
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(imageUrl)
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}

                {/* Upload Button */}
                {editable && onUpload && images.length < maxImages && (
                    <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">رفع صورة</span>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {images.length}/{maxImages}
                                </span>
                            </>
                        )}
                    </label>
                )}
            </div>

            {/* Empty State */}
            {images.length === 0 && !editable && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-muted-foreground">لا توجد صور</p>
                </div>
            )}

            {/* Fullscreen Image Dialog */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>عرض الصورة</span>
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => selectedImage && downloadImage(selectedImage)}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                                {editable && onDelete && selectedImage && (
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        onClick={() => {
                                            handleDelete(selectedImage)
                                            setSelectedImage(null)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="relative flex-1 min-h-0">
                        {selectedImage && (
                            <Image
                                src={selectedImage}
                                alt="Fullscreen"
                                fill
                                className="object-contain"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
