'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Minimize2, Loader2, Check, CheckCheck, Paperclip, Image as ImageIcon, Trash2, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { sendChatMessage, getChatMessages, markChatMessagesAsRead, getUnreadChatCount, clearChatHistory, switchChatMode } from '@/app/actions/live-chat'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useUploadThing } from '@/utils/uploadthing'

interface Message {
    id: string
    content: string
    senderType: 'USER' | 'EMPLOYEE'
    senderId: string
    user?: { id: string; name: string; email: string; role: string }
    employee?: { id: string; name: string; email: string }
    createdAt: Date | string
    isRead: boolean
    attachmentUrl?: string | null
    isBotMessage?: boolean
}

interface CurrentUser {
    id: string
    role: string
    name?: string
    email?: string
    chatStatus?: 'BOT' | 'HUMAN'
}

interface FloatingChatProps {
    role?: 'ADMIN' | 'EMPLOYEE'
    userData?: {
        id: string
        name: string
        email?: string
        chatStatus?: 'BOT' | 'HUMAN'
    }
}

export function FloatingChat({ role, userData }: FloatingChatProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [unreadCount, setUnreadCount] = useState(0)
    const [isSending, setIsSending] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
    const [isSwitchingMode, setIsSwitchingMode] = useState(false)

    // New State for Attachment Preview
    const [attachment, setAttachment] = useState<string | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Update currentUser when userData changes
    useEffect(() => {
        if (userData) {
            setCurrentUser(prev => {
                // If ID is same and essential data is same, don't update (Stable Identity)
                if (prev?.id === userData.id && prev?.name === userData.name) return prev

                return {
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    role: role || 'EMPLOYEE',
                    chatStatus: userData.chatStatus as 'BOT' | 'HUMAN' | undefined
                }
            })
        }
    }, [userData?.id, userData?.name, userData?.email, userData?.chatStatus, role]) // Use primitives in deps array

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        if (isOpen) {
            loadMessages()
            markChatMessagesAsRead(role, userData)
            setUnreadCount(0)
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen && messages.length > 0) {
            scrollToBottom()
        }
    }, [messages, isOpen])

    useEffect(() => {
        // POLLING DISABLED AGAIN - Switching to API Route strategy
        // const interval = setInterval(async () => {
        //     // ... logic ...
        // }, 10000)

        // return () => clearInterval(interval)
        return () => { }
    }, [isOpen, messages.length, newMessage, role, userData, currentUser?.chatStatus])

    const loadMessages = async () => {
        const result = await getChatMessages(100, role, userData)
        if (result && result.success && result.data) {
            setMessages(result.data as Message[])
            if (result.currentUser) {
                const userData = result.currentUser as any
                setCurrentUser(prev => ({
                    ...prev,
                    ...userData,
                    chatStatus: userData.chatStatus as 'BOT' | 'HUMAN' | undefined
                }))
            }
        }
    }



    const handleSwitchToHuman = async () => {
        if (confirm('هل تود التحدث إلى موظف دعم بشري مباشر؟')) {
            setIsSwitchingMode(true)
            try {
                await switchChatMode('HUMAN')
                toast.success('تم تحويلك إلى موظف دعم')
                // Refresh explicitly
                loadMessages()
            } catch (error) {
                toast.error('حدث خطأ أثناء التحويل')
            } finally {
                setIsSwitchingMode(false)
            }
        }
    }

    const handleSendMessage = async () => {
        // Use the state attachment if available
        const attachmentUrl = attachment
        const contentToSend = newMessage.trim() || (attachmentUrl ? 'صورة مرفقة' : '')

        if (!contentToSend && !attachmentUrl) return
        if (isSending) return

        setIsSending(true)

        try {
            const result = await sendChatMessage(contentToSend, undefined, attachmentUrl || undefined, role, userData)

            if (result && result.success) {
                setNewMessage('')
                setAttachment(null) // Clear attachment after sending
                await loadMessages()
                scrollToBottom()
            } else {
                toast.error(result?.error || 'فشل إرسال الرسالة')
            }
        } catch (error) {
            console.error('Error sending message:', error)
            toast.error('حدث خطأ أثناء إرسال الرسالة')
        } finally {
            setIsSending(false)
        }
    }

    const { startUpload } = useUploadThing("imageUploader")

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('الرجاء اختيار صورة فقط')
            return
        }

        // Validate file size (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت')
            return
        }

        setIsUploading(true)

        try {
            const uploadedFiles = await startUpload([file])

            if (uploadedFiles && uploadedFiles[0]) {
                setAttachment(uploadedFiles[0].url) // Set attachment for preview
                toast.success('تم رفع الصورة، اضغط إرسال')
            }
        } catch (error) {
            console.error('Error uploading file:', error)
            toast.error('حدث خطأ أثناء رفع الصورة')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Helper to check if the message belongs to the current logged-in user
    const isMyMessage = (message: Message) => {
        if (!currentUser) return false
        return message.senderId === currentUser.id
    }

    if (!isMounted) return null

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 h-14 px-6 rounded-full shadow-2xl z-[999] bg-gradient-to-r from-[#0f3c6e] to-[#1a5a9e] hover:from-[#0a2a4d] hover:to-[#0f3c6e] transition-all duration-300 hover:scale-105 flex items-center gap-3 print:hidden"
            >
                <MessageCircle className="h-6 w-6 text-white" />
                <span className="text-white font-bold text-base">الدعم الفني</span>
                {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-red-500 text-white border-2 border-white rounded-full animate-pulse text-xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Button>
        )
    }

    // Use Portal to escape any parent stacking contexts (Fixes shaking)
    if (typeof document === 'undefined') return null
    const { createPortal } = require('react-dom')

    const chatContent = (
        <Card
            style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999 }}
            className={cn(
                "shadow-2xl transition-none border-0 overflow-hidden flex flex-col custom-chat-shadow print:hidden",
                isMinimized ? "w-80 h-16 rounded-2xl" : "w-[380px] h-[650px] rounded-2xl"
            )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-white/20">
                            {/* <AvatarImage src="/placeholder-avatar.jpg" /> */}
                            <AvatarFallback className="bg-white/10 text-white">
                                <MessageCircle className="h-6 w-6" />
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-blue-600 rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-base">
                            {currentUser?.chatStatus === 'BOT' && role === 'EMPLOYEE' ? 'المساعد الذكي 🤖' : 'الدعم الفني'}
                        </h3>
                        <div className="flex flex-col">
                            <p className="text-xs text-blue-100 flex items-center gap-1">
                                <span className={cn(
                                    "inline-block h-1.5 w-1.5 rounded-full animate-pulse",
                                    currentUser?.chatStatus === 'BOT' ? "bg-purple-400" : "bg-green-400"
                                )}></span>
                                {currentUser?.chatStatus === 'BOT' && role === 'EMPLOYEE' ? 'يعمل الآن' : 'متصل الآن'}
                            </p>

                            {/* Handover Button */}
                            {currentUser?.chatStatus === 'BOT' && role === 'EMPLOYEE' && (
                                <Button
                                    size="sm"
                                    onClick={handleSwitchToHuman}
                                    disabled={isSwitchingMode}
                                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 h-6 rounded-full mt-2 w-full shadow-md animate-in fade-in zoom-in"
                                >
                                    {isSwitchingMode ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Power className="h-3 w-3 mr-1" />}
                                    تحدث إلى موظف بشري
                                </Button>
                            )}

                            <p className="text-[10px] text-blue-200 opacity-80 mt-0.5">
                                أنت: {userData?.name || currentUser?.name || 'غير معروف'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/10 rounded-full"
                        onClick={async () => {
                            if (confirm('هل تود إنهاء المحادثة الحالية؟')) {
                                await clearChatHistory(role, userData)
                                setMessages([])
                                toast.success('تم إنهاء المحادثة')
                            }
                        }}
                        title="إنهاء المحادثة"
                    >
                        <Power className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/10 rounded-full"
                        onClick={() => setIsMinimized(!isMinimized)}
                    >
                        <Minimize2 className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/10 rounded-full"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Chat Area - System Background */}
                    <ScrollArea className="flex-1 bg-slate-50 dark:bg-slate-900 p-4 relative" dir="ltr">
                        <div className="flex flex-col gap-4 pb-4 w-full">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[400px] text-center p-6" dir="rtl">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4 shadow-sm">
                                        <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">مرحباً بك في الدعم الفني</h3>
                                    <p className="text-sm text-gray-600 dark:text-muted-foreground bg-white/80 dark:bg-gray-800/80 p-3 rounded-lg shadow-sm">
                                        نحن هنا لمساعدتك. تفضل بطرح استفسارك وسيقوم أحد ممثلينا بالرد عليك في أقرب وقت.
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const isMe = isMyMessage(message)

                                    // Debug logging
                                    const getSenderName = () => {
                                        if (isMe) {
                                            return 'أنا'
                                        }

                                        // If I am an EMPLOYEE
                                        if (role === 'EMPLOYEE') {
                                            // Message from USER (Admin) -> Show 'الدعم الفني'
                                            if (message.senderType === 'USER') {
                                                return 'الدعم الفني'
                                            }
                                            // Message from another EMPLOYEE (should not happen in 1-to-1 but just in case)
                                            return message.employee?.name || 'موظف'
                                        }

                                        // If I am ADMIN
                                        if (role === 'ADMIN') {
                                            // Message from EMPLOYEE -> Show Employee Name
                                            if (message.senderType === 'EMPLOYEE') {
                                                return message.employee?.name || 'موظف'
                                            }
                                            // Message from another USER (Admin)
                                            return message.user?.name || 'مسؤول'
                                        }

                                        // Fallback
                                        return message.senderType === 'USER'
                                            ? (message.user?.name || 'المسؤول')
                                            : (message.employee?.name || 'الموظف')
                                    }

                                    const isBot = message.isBotMessage
                                    return (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "flex w-full mb-4",
                                                // If it's me, align right (flex-end in RTL context, but here we control via justify)
                                                isMe ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex max-w-[80%] flex-col gap-1",
                                                isMe ? "items-end" : "items-start"
                                            )}>
                                                {/* Sender Name */}
                                                <span className="text-[10px] text-muted-foreground px-1 flex items-center gap-1">
                                                    {isBot && <span className="text-purple-600">🤖</span>}
                                                    {getSenderName()}
                                                </span>

                                                {/* Message Bubble */}
                                                <div className={cn(
                                                    "rounded-2xl px-4 py-2 text-sm shadow-sm text-right",
                                                    isMe
                                                        ? "bg-blue-600 text-white rounded-tr-none"
                                                        : isBot
                                                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 border border-purple-200 dark:border-purple-800 rounded-tl-none"
                                                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border"
                                                )} dir="rtl">
                                                    {message.attachmentUrl && (
                                                        <div className="mb-2 rounded-lg overflow-hidden bg-black/10">
                                                            <img
                                                                src={message.attachmentUrl}
                                                                alt="مرفق"
                                                                className="max-w-full h-auto max-h-[200px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                                loading="lazy"
                                                                onClick={() => window.open(message.attachmentUrl!, '_blank')}
                                                            />
                                                        </div>
                                                    )}
                                                    <p className="whitespace-pre-wrap break-words leading-relaxed min-w-[60px]">
                                                        {message.content}
                                                    </p>

                                                    <div className={cn(
                                                        "flex items-center gap-1 mt-1 select-none opacity-80",
                                                        "justify-end"
                                                    )}>
                                                        <span className="text-[10px]">
                                                            {new Date(message.createdAt).toLocaleTimeString('ar-EG', {
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true
                                                            })}
                                                        </span>
                                                        {isMe && (
                                                            <span className={cn(
                                                                "text-[14px]",
                                                                message.isRead ? "text-blue-200" : "text-blue-300/70"
                                                            )}>
                                                                {message.isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            {(isSending || isUploading) && (
                                <div className="flex w-full mr-auto justify-start mb-2">
                                    <div className="bg-blue-600/10 rounded-lg p-2 px-4 shadow-sm flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                        <span className="text-xs text-blue-600">
                                            {isUploading ? 'جاري رفع الصورة...' : 'جاري الإرسال...'}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
                        {/* Attachment Preview */}
                        {attachment && (
                            <div className="px-4 pt-3 pb-1 flex items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
                                <div className="relative group">
                                    <div className="h-16 w-16 rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800 shadow-sm">
                                        <img src={attachment} alt="Preview" className="h-full w-full object-cover" />
                                    </div>
                                    <button
                                        onClick={() => setAttachment(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md hover:bg-red-600 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <p className="font-medium text-blue-600">تم إرفاق الصورة</p>
                                    <p>اضغط إرسال للمتابعة</p>
                                </div>
                            </div>
                        )}

                        <div className="p-3 shrink-0 flex items-end gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-10 w-10 rounded-full shrink-0 transition-colors",
                                    attachment
                                        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                        : "text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-700"
                                )}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isSending || isUploading}
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>

                            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl flex items-center px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 transition-colors">
                                <Input
                                    placeholder="اكتب رسالتك هنا..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isSending || isUploading}
                                    className="border-0 focus-visible:ring-0 p-0 h-auto max-h-32 bg-transparent resize-none placeholder:text-muted-foreground dark:placeholder:text-muted-foreground text-foreground dark:text-gray-100"
                                />
                            </div>
                            <Button
                                onClick={() => handleSendMessage()}
                                disabled={isSending || isUploading || (!newMessage.trim() && !attachment)}
                                className={cn(
                                    "h-10 w-10 rounded-full shrink-0 shadow-sm transition-all duration-200",
                                    (newMessage.trim() || attachment)
                                        ? "bg-blue-600 hover:bg-blue-700 text-white scale-100"
                                        : "bg-gray-200 dark:bg-gray-700 text-muted-foreground scale-95"
                                )}
                                size="icon"
                            >
                                {isSending ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5 ml-0.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </Card>
    )

    return createPortal(chatContent, document.body)
}

export default FloatingChat
