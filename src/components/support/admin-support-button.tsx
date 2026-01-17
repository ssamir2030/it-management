'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2, Paperclip, CheckCircle, Bell, HelpCircle, Trash2, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getTickets, getTicketById, addMessage, updateTicketStatus } from '@/app/actions/support'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { toast } from 'sonner'
import { clearChatHistory, endChatSession } from '@/app/actions/live-chat'
import { useUploadThing } from '@/utils/uploadthing'

interface Attachment {
    name: string;
    size: number;
    type: string;
    url: string;
    fileName?: string;
    fileUrl?: string;
}

export function AdminSupportButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [tickets, setTickets] = useState<any[]>([])
    const [selectedTicket, setSelectedTicket] = useState<any>(null)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [uploading, setUploading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Smart polling: يعمل فقط عند فتح النافذة لتحسين الأداء
    useEffect(() => {
        if (isOpen) {
            fetchTickets()
            const interval = setInterval(fetchTickets, 10000) // كل 10 ثواني بدلاً من 3
            return () => clearInterval(interval)
        }
    }, [isOpen])

    useEffect(() => {
        if (scrollRef.current && selectedTicket) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [selectedTicket?.messages, attachments])

    useEffect(() => {
        if (selectedTicket) {
            const interval = setInterval(async () => {
                const result = await getTicketById(selectedTicket.id)
                if (result.success && result.data) {
                    if (result.data.messages.length !== selectedTicket.messages.length || result.data.status !== selectedTicket.status) {
                        setSelectedTicket(result.data)
                    }
                }
            }, 3000) // كل 3 ثواني بدلاً من 1 لتحسين الأداء
            return () => clearInterval(interval)
        }
    }, [selectedTicket])

    const [error, setError] = useState<string | null>(null)

    async function fetchTickets() {
        try {
            const result = await getTickets()
            if (result?.success && result?.data) {
                setTickets(result.data)
                const openCount = result.data.filter((t: any) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
                setUnreadCount(openCount)
                setError(null)
            } else {
                setError(result?.error || 'فشل في تحميل التذاكر')
            }
        } catch (error) {
            console.error('Error fetching tickets:', error)
            setError('حدث خطأ في الاتصال')
        }
    }

    async function openChat(ticket: any) {
        try {
            const result = await getTicketById(ticket.id)
            if (result?.success && result?.data) {
                setSelectedTicket(result.data)
            } else {
                toast.error('فشل في فتح المحادثة')
            }
        } catch (error) {
            console.error('Error opening chat:', error)
            toast.error('حدث خطأ في فتح المحادثة')
        }
    }

    function closeChat() {
        setSelectedTicket(null)
        setNewMessage('')
        setAttachments([])
        fetchTickets()
    }

    function handleFileClick() {
        fileInputRef.current?.click()
    }

    const { startUpload } = useUploadThing("attachmentUploader")

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (files && files.length > 0) {
            setUploading(true)

            try {
                // UploadThing integration
                const uploadedFiles = await startUpload(Array.from(files))

                if (uploadedFiles) {
                    const newAttachments = uploadedFiles.map(file => ({
                        name: file.name,
                        size: file.size,
                        type: 'file', // Default as we don't get MIME type back directly here easily without preserving
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

    async function handleEndChat() {
        if (!selectedTicket || !selectedTicket.createdBy?.id) return
        if (!confirm('هل أنت متأكد من إنهاء هذه المحادثة؟')) return

        try {
            const result = await endChatSession(selectedTicket.createdBy.id)
            if (result.success) {
                toast.success('تم إنهاء المحادثة')
                closeChat()
            } else {
                toast.error('فشل إنهاء المحادثة')
            }
        } catch (error) {
            console.error('Error ending chat:', error)
            toast.error('حدث خطأ')
        }
    }

    async function handleSend() {
        if (!newMessage.trim() && attachments.length === 0 || !selectedTicket) return

        setSending(true)
        const result = await addMessage(selectedTicket.id, newMessage, attachments)

        if (result.success) {
            setNewMessage('')
            setAttachments([])
            const updatedTicket = await getTicketById(selectedTicket.id)
            if (updatedTicket.success && updatedTicket.data) {
                setSelectedTicket(updatedTicket.data)
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
        <>
            <div className="fixed bottom-6 left-6 z-[999]">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-14 px-6 rounded-full shadow-2xl bg-gradient-to-r from-[#0f3c6e] to-[#1a5a9e] hover:from-[#0a2a4d] hover:to-[#0f3c6e] transition-all duration-300 hover:scale-105 flex items-center gap-3"
                >
                    {isOpen ? (
                        <X className="h-6 w-6 text-white" />
                    ) : (
                        <>
                            <MessageCircle className="h-6 w-6 text-white" />
                            <span className="text-white font-bold text-base">الدعم الفني</span>
                        </>
                    )}
                    {!isOpen && unreadCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-red-500 text-white border-2 border-white rounded-full animate-pulse text-xs">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </div>

            {isOpen && (
                <Card className="fixed bottom-24 left-6 w-[380px] h-[550px] shadow-2xl z-[999] animate-in slide-in-from-bottom-5 duration-300 flex flex-col border-0 overflow-hidden rounded-2xl bg-white dark:bg-slate-900">
                    {!selectedTicket ? (
                        // Tickets List
                        <>
                            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border-2 border-white/20">
                                            <AvatarFallback className="bg-white/10 text-white">
                                                <MessageCircle className="h-6 w-6" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base">تذاكر الدعم الفني</h3>
                                        <p className="text-xs text-blue-100 flex items-center gap-1">
                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                            {tickets.length} تذكرة
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-white hover:bg-white/10 rounded-full"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <ScrollArea className="flex-1 p-4">
                                {tickets.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm">{error || 'لا توجد تذاكر'}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {tickets.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                onClick={() => openChat(ticket)}
                                                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                            >
                                                <div className="flex items-start justify-between mb-1">
                                                    <h4 className="font-medium text-sm line-clamp-1">{ticket.title}</h4>
                                                    <StatusBadge status={ticket.status} />
                                                </div>
                                                <p className="text-xs text-gray-600 mb-2">{ticket.createdBy.name}</p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>{format(new Date(ticket.createdAt), 'PPp', { locale: ar })}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </>
                    ) : (
                        // Chat View
                        <>
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-white hover:bg-white/20"
                                        onClick={closeChat}
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-bold truncate">{selectedTicket.title}</h3>
                                        <p className="text-xs text-blue-100">{selectedTicket.createdBy.name}</p>
                                    </div>

                                    {/* Clear Chat Button - Virtual Tickets Only */}
                                    {/* Clear Chat Button - Virtual Tickets Only */}
                                    {selectedTicket.id && selectedTicket.id.startsWith('chat_') && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-200 hover:text-red-100 hover:bg-red-500/20"
                                            onClick={handleEndChat}
                                            title="إنهاء المحادثة"
                                        >
                                            <Power className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <ScrollArea className="flex-1 p-4 bg-white dark:bg-slate-900">
                                {selectedTicket.messages?.length === 0 ? (
                                    <div className="text-center py-8 text-sm text-muted-foreground">
                                        لا توجد رسائل
                                    </div>
                                ) : (
                                    <div className="space-y-4 pb-4">
                                        {selectedTicket.messages?.map((message: any) => {
                                            const isAdmin = message.sender.role === 'ADMIN' || message.sender.role === 'TECHNICIAN'
                                            return (
                                                <div key={message.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <Avatar className="h-8 w-8 shrink-0">
                                                        <AvatarImage src={message.sender.image || undefined} />
                                                        <AvatarFallback className="text-xs">
                                                            {message.sender.name?.charAt(0) || '؟'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                                        <div className="flex items-center gap-2 mb-1 px-1">
                                                            <span className="text-[10px] font-medium text-gray-700">{message.sender.name}</span>
                                                            {isAdmin && (
                                                                <Badge variant="secondary" className="text-[8px] px-1.5 py-0">أنت</Badge>
                                                            )}
                                                        </div>
                                                        {message.content && (
                                                            <div className={`rounded-2xl px-4 py-2.5 ${isAdmin ? 'bg-[#0f3c6e] text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-slate-700 text-foreground dark:text-gray-100 rounded-tl-sm border dark:border-slate-600'}`}>
                                                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                                                            </div>
                                                        )}
                                                        {message.attachments && message.attachments.length > 0 && (
                                                            <div className={`mt-2 flex flex-wrap gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                                {message.attachments.map((att: Attachment) => (
                                                                    <a
                                                                        key={att.url}
                                                                        href={att.fileUrl || att.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 bg-white border rounded-lg p-2 text-xs hover:bg-gray-50 transition-colors shadow-sm group"
                                                                    >
                                                                        <div className="bg-gray-100 p-1.5 rounded group-hover:bg-gray-200 transition-colors">
                                                                            <Paperclip className="h-3.5 w-3.5 text-gray-600" />
                                                                        </div>
                                                                        <span className="max-w-[100px] truncate font-medium text-gray-700">{att.fileName || att.name}</span>
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

                            {selectedTicket.status !== 'CLOSED' && (
                                <div className="border-t px-4 py-3 bg-white dark:bg-slate-900 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                    {/* Attachments Preview */}
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-lg border border-dashed">
                                            {attachments.map((att, index) => (
                                                <div key={index} className="relative bg-white rounded-md p-1.5 pr-7 text-xs flex items-center border shadow-sm group">
                                                    <Paperclip className="h-3 w-3 ml-1.5 text-muted-foreground" />
                                                    <span className="max-w-[100px] truncate font-medium">{att.name}</span>
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
                                                placeholder="اكتب ردك..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                rows={1}
                                                className="min-h-[44px] max-h-[120px] resize-none text-sm py-3 px-4 rounded-lg border-gray-200 focus:border-[#0f3c6e] focus:ring-[#0f3c6e] pr-10"
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
                                            className="h-11 w-11 rounded-lg bg-[#0f3c6e] hover:bg-[#0a2a4d] shadow-sm shrink-0"
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
                        </>
                    )}
                </Card>
            )}
        </>
    )
}

function StatusBadge({ status }: { status: string }) {
    const variants: Record<string, { label: string; className: string }> = {
        OPEN: { label: 'مفتوحة', className: 'bg-blue-100 text-blue-800' },
        IN_PROGRESS: { label: 'جاري', className: 'bg-yellow-100 text-yellow-800' },
        RESOLVED: { label: 'محلولة', className: 'bg-green-100 text-green-800' },
        CLOSED: { label: 'مغلقة', className: 'bg-gray-100 text-gray-800' }
    }
    const variant = variants[status] || variants.OPEN
    return <Badge className={`text-[10px] ${variant.className}`}>{variant.label}</Badge>
}
