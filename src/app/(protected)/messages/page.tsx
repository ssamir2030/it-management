"use client"

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react"
import { getConversations, getMessages, getChatStats, searchConversations } from "@/app/actions/chat-archive"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Search, Users, TrendingUp, Clock, Download, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export default function MessagesArchivePage() {
    const [stats, setStats] = useState<any>(null)
    const [conversations, setConversations] = useState<any[]>([])
    const [selectedConversation, setSelectedConversation] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const [statsRes, convRes] = await Promise.all([
            getChatStats(),
            getConversations()
        ])

        if (statsRes.success) setStats(statsRes.data)
        if (convRes.success) setConversations(convRes.data || [])
        setLoading(false)
    }

    const handleSelectConversation = async (conversation: any) => {
        setSelectedConversation(conversation)
        const messagesRes = await getMessages(conversation.id)
        if (messagesRes.success) {
            setMessages(messagesRes.data || [])
        }
    }

    const handleSearch = async (query: string) => {
        setSearchQuery(query)
        if (query.trim()) {
            const result = await searchConversations(query)
            if (result.success) {
                setConversations(result.data || [])
            }
        } else {
            loadData()
        }
    }

    const handleExport = () => {
        if (!selectedConversation || messages.length === 0) return

        const headers = ['التاريخ', 'الوقت', 'المرسل', 'الرسالة']
        const rows = messages.map(msg => [
            new Date(msg.createdAt).toLocaleDateString('ar-SA'),
            new Date(msg.createdAt).toLocaleTimeString('ar-SA'),
            msg.senderType === 'USER' ? (msg.user?.name || 'مستخدم') : (msg.employee?.name || 'موظف'),
            msg.isTicket ? `"[تذكرة] ${msg.content.replace(/"/g, '""')}"` : `"${msg.content.replace(/"/g, '""')}"`
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `chat_${selectedConversation.name}_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="w-full py-6 space-y-6 px-6" dir="rtl">
            {/* Header */}
            {/* Header */}
            <PremiumPageHeader
                title="أرشيف المحادثات"
                description="مركز توثيق جميع المحادثات داخل النظام"
                icon={MessageSquare}
            />

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الرسائل</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
                            <p className="text-xs text-muted-foreground mt-1">عدد جميع الرسائل</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">عدد المحادثات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.totalConversations}</div>
                            <p className="text-xs text-muted-foreground mt-1">موظف لديه محادثات</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">رسائل اليوم</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{stats.messagesToday}</div>
                            <p className="text-xs text-muted-foreground mt-1">رسائل جديدة اليوم</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">أكثر نشاطاً</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {stats.topEmployees[0]?.name.split(' ')[0] || '-'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">الموظف الأكثر محادثات</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Conversations List */}
                <Card className="lg:col-span-1 border-t-4 border-t-blue-600">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            قائمة المحادثات
                        </CardTitle>
                        <CardDescription>
                            <span className="relative mt-2 block">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="ابحث بالاسم..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pr-10"
                                />
                            </span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px]">
                            {loading ? (
                                <div className="p-4 text-center text-muted-foreground">جاري التحميل...</div>
                            ) : conversations.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">لا توجد محادثات</div>
                            ) : (
                                conversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        onClick={() => handleSelectConversation(conv)}
                                        className={`p-4 cursor-pointer border-b hover:bg-muted/50 transition-colors ${selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar>
                                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                                    {(conv.name || 'U').slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-sm truncate">{conv.name}</h4>
                                                    <Badge variant="outline" className="text-xs">
                                                        {conv._count.messages}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{conv.email}</p>
                                                {conv.jobTitle && (
                                                    <p className="text-xs text-muted-foreground mt-1">{conv.jobTitle}</p>
                                                )}
                                                {conv.messages?.[0] && (
                                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                                        {conv.messages[0].content.slice(0, 40)}...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Messages Viewer */}
                <Card className="lg:col-span-2 border-t-4 border-t-cyan-600">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    {selectedConversation ? (
                                        <>
                                            <MessageSquare className="h-5 w-5 text-cyan-600" />
                                            محادثة مع {selectedConversation.name}
                                        </>
                                    ) : (
                                        'اختر محادثة لعرضها'
                                    )}
                                </CardTitle>
                                {selectedConversation && (
                                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                        {selectedConversation.email}
                                        {selectedConversation.department && (
                                            <Badge variant="outline" className="text-xs">
                                                {selectedConversation.department.name}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                            {selectedConversation && (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                                        <Download className="h-4 w-4" />
                                        تصدير
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                            {!selectedConversation ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
                                    <p>اختر محادثة من القائمة لعرض الرسائل</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-muted-foreground">لا توجد رسائل</div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.senderType === 'USER' ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg p-4 ${msg.senderType === 'USER'
                                                    ? 'bg-blue-100 text-blue-900'
                                                    : 'bg-green-100 text-green-900'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-semibold">
                                                        {msg.senderType === 'USER'
                                                            ? (msg.user?.name || 'مستخدم')
                                                            : (msg.employee?.name || 'موظف')}
                                                    </span>
                                                    {msg.isTicket && (
                                                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                                            تذكرة
                                                        </Badge>
                                                    )}
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(msg.createdAt).toLocaleTimeString('ar-SA', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                {msg.attachmentUrl && (
                                                    <div className="mt-2">
                                                        <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                                                            عرض المرفق
                                                        </a>
                                                    </div>
                                                )}
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {msg.attachments.map((att: any) => (
                                                            <div key={att.id}>
                                                                <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                                                                    مرفق: {att.fileName}
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
