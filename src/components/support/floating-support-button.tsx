'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Plus, ArrowRight, Send, Loader2, Paperclip, CheckCircle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getMyTickets, getTicketById, addMessage, updateTicketStatus } from '@/app/actions/support'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'
import Link from 'next/link'
import { useUploadThing } from '@/utils/uploadthing'

interface Attachment {
    name: string;
    size: number;
    type: string;
    url: string;
    fileName?: string;
    fileUrl?: string;
}

export function FloatingSupportButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [view, setView] = useState<'list' | 'chat'>('list')
    const [tickets, setTickets] = useState<any[]>([])
    const [selectedTicket, setSelectedTicket] = useState<any>(null)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [closing, setClosing] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [uploading, setUploading] = useState(false)

    // We need a ref for the scroll viewport, not just the container
    const scrollViewportRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchTickets()
        const interval = setInterval(fetchTickets, 5000)
        return () => clearInterval(interval)
    }, [])

    // Scroll to bottom when messages change or view changes to chat
    useEffect(() => {
        if (view === 'chat' && scrollViewportRef.current) {
            const scrollElement = scrollViewportRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [selectedTicket?.messages, view, attachments])

    useEffect(() => {
        if (view === 'chat' && selectedTicket) {
            const interval = setInterval(async () => {
                const result = await getTicketById(selectedTicket.id)
                if (result && result.success && result.data) {
                    if (result.data.messages.length !== selectedTicket.messages.length || result.data.status !== selectedTicket.status) {
                        setSelectedTicket(result.data)
                    }
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [view, selectedTicket])

    async function fetchTickets() {
        try {
            const result = await getMyTickets()
            if (result && result.success && result.data) {
                setTickets(result.data)
                const openCount = result.data.filter((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
                setUnreadCount(openCount)
            }
        } catch (error) {
            console.error('Error fetching tickets:', error)
        }
    }

    async function openChat(ticket: any) {
        try {
            const result = await getTicketById(ticket.id)
            if (result && result.success && result.data) {
                setSelectedTicket(result.data)
                setView('chat')
            } else {
                toast.error(result?.error || 'فشل في فتح المحادثة')
            }
        } catch (error) {
            console.error('Error opening chat:', error)
            toast.error('حدث خطأ في فتح المحادثة')
        }
    }

    function goBack() {
        setView('list')
        setSelectedTicket(null)
        setNewMessage('')
        setAttachments([])
        fetchTickets()
    }

    async function handleCloseTicket() {
        if (!selectedTicket) return
        if (!confirm('هل أنت متأكد من إنهاء هذه المحادثة؟')) return

        setClosing(true)
        const result = await updateTicketStatus(selectedTicket.id, 'CLOSED')

        if (result && result.success) {
            toast.success('تم إنهاء المحادثة بنجاح')
            fetchTickets()
            setIsOpen(false)
            setView('list')
            setSelectedTicket(null)
        } else {
            toast.error(result?.error || 'فشل في إنهاء المحادثة')
        }
        setClosing(false)
    }

    const { startUpload } = useUploadThing("attachmentUploader")

    function handleFileClick() {
        fileInputRef.current?.click()
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (files && files.length > 0) {
            setUploading(true)

            try {
                const uploadedFiles = await startUpload(Array.from(files))

                if (uploadedFiles) {
                    const newAttachments = uploadedFiles.map((file: any) => ({
                        name: file.name,
                        size: file.size,
                        type: 'file',
                        url: file.ufsUrl,
                        fileName: file.name,
                        fileUrl: file.ufsUrl
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
        if ((!newMessage.trim() && attachments.length === 0) || !selectedTicket) return

        setSending(true)
        const result = await addMessage(selectedTicket.id, newMessage, attachments)

        if (result && result.success) {
            setNewMessage('')
            setAttachments([])
            const updatedTicket = await getTicketById(selectedTicket.id)
            if (updatedTicket && updatedTicket.success && updatedTicket.data) {
                setSelectedTicket(updatedTicket.data)
            }
        } else {
            toast.error(result?.error || 'فشل في إرسال الرسالة')
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
        <>
            <div className="fixed bottom-6 left-6 z-50">
                <Button
                    size="lg"
                    className="h-14 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-[#0f3c6e] hover:bg-[#0a2a4d] text-white flex items-center gap-2"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <>
                            <HelpCircle className="h-6 w-6" />
                            <span className="font-bold text-lg">الدعم</span>
                            {unreadCount > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center p-0 text-xs animate-pulse border-2 border-white">
                                    {unreadCount}
                                </Badge>
                            )}
                        </>
                    )}
                </Button>
            </div>

            {isOpen && (
                <Card className="fixed bottom-24 left-6 w-96 shadow-2xl z-50 animate-in slide-in-from-bottom-5 duration-300 flex flex-col h-[600px] max-h-[80vh] border-0 overflow-hidden">
                    <CardHeader className="bg-[#0f3c6e] text-white shrink-0">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                {view === 'chat' && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                        onClick={goBack}
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                    </Button>
                                )}
                                <HelpCircle className="h-5 w-5" />
                                <span className="truncate">{view === 'list' ? 'تذاكر الدعم الفني' : selectedTicket?.title}</span>
                            </CardTitle>
                            {view === 'list' ? (
                                <Link href="/portal/support/new">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <Plus className="h-4 w-4" />
                                        جديدة
                                    </Button>
                                </Link>
                            ) : selectedTicket?.status !== 'CLOSED' && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleCloseTicket}
                                    disabled={closing}
                                    className="gap-2 bg-white/10 hover:bg-white/20 text-white border-0"
                                >
                                    {closing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                                    إنهاء
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden flex flex-col relative bg-gray-50">
                        {view === 'list' ? (
                            <ScrollArea className="flex-1">
                                {tickets.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center px-4 h-full">
                                        <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                                        <p className="text-sm text-muted-foreground mb-4">لا توجد تذاكر حالياً</p>
                                        <Link href="/portal/support/new">
                                            <Button size="sm" onClick={() => setIsOpen(false)}>
                                                إنشاء تذكرة جديدة
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y bg-white">
                                        {tickets.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                onClick={() => openChat(ticket)}
                                                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-medium text-sm line-clamp-1">{ticket.title}</h4>
                                                    <StatusBadge status={ticket.status} />
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{ticket.description}</p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{getCategoryLabel(ticket.category)}</span>
                                                    <span>{new Date(ticket.createdAt).toLocaleDateString('ar-EG')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        ) : (
                            <div className="flex flex-col h-full">
                                <ScrollArea ref={scrollViewportRef} className="flex-1 p-4">
                                    {selectedTicket?.messages?.length === 0 ? (
                                        <div className="text-center py-8 text-sm text-muted-foreground">
                                            لا توجد رسائل. ابدأ المحادثة الآن
                                        </div>
                                    ) : (
                                        <div className="space-y-4 pb-4">
                                            {selectedTicket?.messages?.map((message: any) => {
                                                const isSupport = message.sender.role === 'ADMIN' || message.sender.role === 'TECHNICIAN'
                                                return (
                                                    <div key={message.id} className={`flex gap-3 ${isSupport ? 'flex-row' : 'flex-row-reverse'}`}>
                                                        <Avatar className="h-8 w-8 border-2 border-white shadow-sm shrink-0">
                                                            <AvatarImage src={message.sender.image || undefined} />
                                                            <AvatarFallback className="text-xs bg-gray-200">
                                                                {message.sender.name?.charAt(0) || '؟'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`flex flex-col ${isSupport ? 'items-start' : 'items-end'} max-w-[80%]`}>
                                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                                <span className="text-[10px] font-medium text-gray-600">{message.sender.name}</span>
                                                                {isSupport && (
                                                                    <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4">دعم فني</Badge>
                                                                )}
                                                            </div>
                                                            {message.content && (
                                                                <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${isSupport ? 'bg-white text-gray-800 rounded-tl-none border' : 'bg-[#0f3c6e] text-white rounded-tr-none'}`}>
                                                                    <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                                                                </div>
                                                            )}
                                                            {message.attachments && message.attachments.length > 0 && (
                                                                <div className={`mt-2 flex flex-wrap gap-2 ${isSupport ? 'justify-start' : 'justify-end'}`}>
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
                                                            <p className="text-[10px] text-muted-foreground mt-1 px-1">
                                                                {format(new Date(message.createdAt), 'p', { locale: ar })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>

                                {selectedTicket?.status !== 'CLOSED' && (
                                    <div className="border-t p-3 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
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

                                        <div className="flex gap-2 items-end">
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

                                {selectedTicket?.status === 'CLOSED' && (
                                    <div className="border-t p-4 bg-gray-50 text-center shrink-0">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200 text-gray-600 text-sm font-medium">
                                            <CheckCircle className="h-4 w-4" />
                                            تم إنهاء هذه المحادثة
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {view === 'list' && tickets.length > 0 && (
                            <div className="border-t p-3 bg-gray-50 shrink-0">
                                <Link href="/portal/support">
                                    <Button variant="ghost" className="w-full text-gray-600 hover:text-[#0f3c6e] hover:bg-white" size="sm" onClick={() => setIsOpen(false)}>
                                        عرض جميع التذاكر
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </>
    )
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, { label: string; className: string }> = {
        OPEN: { label: 'مفتوحة', className: 'bg-blue-50 text-blue-700 border-blue-200 border' },
        IN_PROGRESS: { label: 'جاري', className: 'bg-amber-50 text-amber-700 border-amber-200 border' },
        RESOLVED: { label: 'محلولة', className: 'bg-green-50 text-green-700 border-green-200 border' },
        CLOSED: { label: 'مغلقة', className: 'bg-gray-50 text-gray-600 border-gray-200 border' }
    }
    const variant = variants[status] || variants.OPEN
    return <Badge className={`text-[10px] font-normal px-2 py-0.5 ${variant.className}`}>{variant.label}</Badge>
}

function getCategoryLabel(category: string) {
    const labels: Record<string, string> = {
        MAINTENANCE: 'صيانة',
        SUPPORT: 'دعم فني',
        HARDWARE: 'أجهزة',
        INK: 'حبر',
        PAPER: 'ورق',
        OTHER: 'أخرى'
    }
    return labels[category] || category
}
