'use client'

import { useState, useEffect, useRef } from 'react'
import { addMessage, getTicketById } from '@/app/actions/support'
import { Button } from '@/components/ui/button'
import { useUploadThing } from '@/utils/uploadthing'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, Clock, User, Paperclip, X } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'

interface Sender {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
}

interface Attachment {
    id: string
    fileName: string
    fileUrl: string
    name?: string // For new uploads
}

interface Message {
    id: string
    content: string
    createdAt: Date | string
    sender: Sender
    attachments?: Attachment[]
}

interface Ticket {
    id: string
    description: string
    status: string
    priority: string
    category: string
    createdAt: Date | string
    messages: Message[]
    assignedTo?: Sender
}

interface TicketChatProps {
    ticket: any
    currentUserId: string
}

export function TicketChat({ ticket: initialTicket, currentUserId }: TicketChatProps) {
    const [ticket, setTicket] = useState<any>(initialTicket)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [uploading, setUploading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [ticket.messages, attachments])

    const { startUpload } = useUploadThing("attachmentUploader") // Endpoint

    // Polling for new messages every 1 second
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const result = await getTicketById(ticket.id)
                if (result.success && result.data) {
                    // Only update if there are new messages
                    if (result.data.messages.length !== ticket.messages.length) {
                        setTicket(result.data)
                    }
                }
            } catch (error) {
                console.error('Error polling messages:', error)
            }
        }, 3000) // Increase poll time to 3s to reduce load

        return () => clearInterval(interval)
    }, [ticket.id, ticket.messages.length])

    function handleFileClick() {
        fileInputRef.current?.click()
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (files && files.length > 0) {
            setUploading(true)

            try {
                // UploadThing integration
                const uploadedFiles = await startUpload(Array.from(files))

                if (uploadedFiles) {
                    const newAttachments = uploadedFiles.map(file => ({
                        id: Math.random().toString(36).substr(2, 9), // Temp ID
                        fileName: file.name,
                        fileUrl: file.ufsUrl,
                        name: file.name
                    }))
                    setAttachments(prev => [...prev, ...newAttachments])
                }
            } catch (error) {
                console.error('Upload error:', error)
                toast.error(`خطأ في رفع الملفات`)
            } finally {
                setUploading(false)
                if (fileInputRef.current) fileInputRef.current.value = ''
            }
        }
    }

    function removeAttachment(index: number) {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    async function handleSend() {
        if (!newMessage.trim() && attachments.length === 0) return

        setSending(true)

        // Map attachments to expected backend format if needed, but our backend action expects similar structure
        const result = await addMessage(ticket.id, newMessage, attachments.map(a => ({
            fileName: a.fileName,
            fileUrl: a.fileUrl,
            fileType: 'file', // Default
            fileSize: 0 // Default
        })))

        if (result.success) {
            setNewMessage('')
            setAttachments([])
            // Fetch updated ticket immediately
            const updatedTicket = await getTicketById(ticket.id)
            if (updatedTicket.success && updatedTicket.data) {
                setTicket(updatedTicket.data)
            }
        } else {
            toast.error(result.error || 'فشل في إرسال الرسالة')
        }

        setSending(false)
    }

    function handleKeyPress(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Ticket Info */}
            <div className="bg-gray-50 border-b px-6 py-4 shrink-0">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={ticket.status} />
                            <PriorityBadge priority={ticket.priority} />
                            <CategoryBadge category={ticket.category} />
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(new Date(ticket.createdAt), 'PPp', { locale: ar })}
                            </div>
                        </div>
                    </div>
                    {ticket.assignedTo && (
                        <Card className="p-3">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={ticket.assignedTo.image || undefined} />
                                    <AvatarFallback>
                                        {ticket.assignedTo.name?.charAt(0) || 'F'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-xs">
                                    <p className="font-medium text-gray-700">
                                        {ticket.assignedTo.name || 'فني'}
                                    </p>
                                    <p className="text-muted-foreground">المسؤول</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {ticket.messages.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">
                            لا توجد رسائل بعد. ابدأ المحادثة مع فريق الدعم الفني
                        </p>
                    </div>
                ) : (
                    ticket.messages.map((message: any) => {
                        const isMe = message.sender.id === currentUserId
                        const isSupport = message.sender.role === 'ADMIN' || message.sender.role === 'TECHNICIAN'

                        return (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                <Avatar className="h-8 w-8 shrink-0">
                                    <AvatarImage src={message.sender.image || undefined} />
                                    <AvatarFallback>
                                        {message.sender.name?.charAt(0) || '؟'}
                                    </AvatarFallback>
                                </Avatar>

                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                                    <div className="flex items-center gap-2 mb-1 px-1">
                                        <span className="text-xs font-medium text-gray-700">
                                            {message.sender.name || message.sender.email}
                                        </span>
                                        {isSupport && (
                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                فريق الدعم
                                            </Badge>
                                        )}
                                    </div>
                                    {message.content && (
                                        <div
                                            className={`rounded-2xl px-4 py-2.5 ${isMe
                                                ? 'bg-[#0f3c6e] text-white rounded-br-sm'
                                                : 'bg-gray-100 text-foreground rounded-bl-sm border'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                                {message.content}
                                            </p>
                                        </div>
                                    )}
                                    {message.attachments && message.attachments.length > 0 && (
                                        <div className={`mt-2 flex flex-wrap gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            {message.attachments.map((att: any) => (
                                                <a
                                                    key={att.id}
                                                    href={att.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 bg-white border rounded-lg p-2 text-xs hover:bg-gray-50 transition-colors shadow-sm group"
                                                >
                                                    <div className="bg-gray-100 p-1.5 rounded group-hover:bg-gray-200 transition-colors">
                                                        <Paperclip className="h-3.5 w-3.5 text-gray-600" />
                                                    </div>
                                                    <span className="max-w-[120px] truncate font-medium text-gray-700">{att.fileName}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1 px-1">
                                        {format(new Date(message.createdAt), 'p', { locale: ar })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Message Input */}
            {ticket.status !== 'CLOSED' && (
                <div className="border-t px-6 py-4 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-lg border border-dashed">
                            {attachments.map((att, index) => (
                                <div key={index} className="relative bg-white rounded-md p-1.5 pr-7 text-xs flex items-center border shadow-sm group">
                                    <Paperclip className="h-3 w-3 ml-1.5 text-muted-foreground" />
                                    <span className="max-w-[120px] truncate font-medium">{att.name}</span>
                                    <button
                                        onClick={() => removeAttachment(index)}
                                        className="absolute top-0.5 right-0.5 p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <Textarea
                                placeholder="اكتب رسالتك..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                rows={1}
                                className="min-h-[44px] max-h-[120px] resize-none text-sm py-3 px-4 rounded-xl border-gray-200 focus:border-[#0f3c6e] focus:ring-[#0f3c6e] pr-10"
                                disabled={sending}
                                style={{ height: 'auto' }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                                }}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleFileClick}
                                title="إرفاق ملف"
                                disabled={uploading}
                                className="absolute left-1 bottom-1 h-9 w-9 text-muted-foreground hover:text-[#0f3c6e] hover:bg-transparent"
                            >
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                            </Button>
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={(!newMessage.trim() && attachments.length === 0) || sending || uploading}
                            size="icon"
                            className="h-11 w-11 rounded-xl bg-[#0f3c6e] hover:bg-[#0a2a4d] shadow-sm shrink-0"
                        >
                            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*,video/*,.pdf,.doc,.docx"
                            onChange={handleFileChange}
                            multiple
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, { label: string; className: string }> = {
        OPEN: { label: 'مفتوحة', className: 'bg-blue-100 text-blue-800' },
        IN_PROGRESS: { label: 'قيد المعالجة', className: 'bg-yellow-100 text-yellow-800' },
        RESOLVED: { label: 'محلولة', className: 'bg-green-100 text-green-800' },
        CLOSED: { label: 'مغلقة', className: 'bg-gray-100 text-gray-800' }
    }

    const variant = variants[status] || variants.OPEN

    return <Badge className={variant.className}>{variant.label}</Badge>
}

function PriorityBadge({ priority }: { priority: string }) {
    const variants: Record<string, { label: string; className: string }> = {
        LOW: { label: 'منخفضة', className: 'bg-gray-100 text-gray-700' },
        MEDIUM: { label: 'متوسطة', className: 'bg-blue-100 text-blue-700' },
        HIGH: { label: 'عالية', className: 'bg-orange-100 text-orange-700' },
        CRITICAL: { label: 'حرجة', className: 'bg-red-100 text-red-700' }
    }

    const variant = variants[priority] || variants.MEDIUM

    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>
}

function CategoryBadge({ category }: { category: string }) {
    const labels: Record<string, string> = {
        MAINTENANCE: 'صيانة',
        SUPPORT: 'دعم فني',
        HARDWARE: 'أجهزة',
        INK: 'حبر',
        PAPER: 'ورق',
        OTHER: 'أخرى'
    }

    return (
        <Badge variant="outline" className="bg-gray-50">
            {labels[category] || category}
        </Badge>
    )
}
