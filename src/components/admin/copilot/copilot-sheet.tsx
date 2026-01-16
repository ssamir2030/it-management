"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, Send, Bot, User, Loader2, Sparkles as SparklesIcon } from "lucide-react"
import { querySystemCopilot } from "@/app/actions/copilot"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

type Message = {
    id: string
    role: 'user' | 'assistant'
    text: string
    type?: 'text' | 'table' | 'stat' | 'list' | 'action'
    data?: any
}

export function CopilotSheet() {
    const router = useRouter()
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: 'مرحباً بك! أنا مساعدك الذكي 🤖\nكيف يمكنني مساعدتك اليوم؟\nيمكنك سؤالي عن الأجهزة، التراخيص، أو الموظفين.'
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsLoading(true)

        try {
            const response = await querySystemCopilot(userMsg.text)
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: response.text,
                type: response.type,
                data: response.data
            }
            setMessages(prev => [...prev, botMsg])
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                text: "عذراً، حدث خطأ في الاتصال."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const renderData = (msg: Message) => {
        if (!msg.data) return null

        if (msg.type === 'stat') {
            return (
                <Card className="bg-violet-500/10 border-violet-500/20 p-4 mt-2">
                    <div className="text-xs text-muted-foreground">{msg.data.label}</div>
                    <div className="text-2xl font-bold text-violet-600">{msg.data.value}</div>
                </Card>
            )
        }

        if (msg.type === 'list') {
            return (
                <Card className="bg-muted/50 p-3 mt-2 space-y-2 text-sm">
                    {msg.data.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between border-b last:border-0 pb-1 last:pb-0">
                            <span className="text-muted-foreground">{item.label}:</span>
                            <span className="font-medium">{item.value}</span>
                        </div>
                    ))}
                </Card>
            )
        }

        if (msg.type === 'table') {
            return (
                <div className="mt-2 overflow-x-auto rounded-md border text-xs">
                    <table className="w-full text-right bg-card">
                        <thead className="bg-muted">
                            <tr>
                                {Object.keys(msg.data[0]).map(key => (
                                    <th key={key} className="p-2 font-medium border-b">{key.replace(/_/g, ' ')}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {msg.data.map((row: any, i: number) => (
                                <tr key={i} className="border-b last:border-0">
                                    {Object.values(row).map((val: any, j) => (
                                        <td key={j} className="p-2">{val}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }
        if (msg.type === 'action') {
            return (
                <Card className="bg-primary/10 border-primary/20 p-4 mt-2 flex flex-col gap-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">إجراء مقترح</span>
                    <Button
                        onClick={() => {
                            if (msg.data.action === 'navigate') {
                                router.push(msg.data.url)
                            }
                        }}
                        className="w-full gap-2 bg-primary hover:bg-primary/90"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        {msg.data.label}
                    </Button>
                </Card>
            )
        }
    }

    return (
        <div className="flex flex-col h-full bg-background" dir="rtl">
            <div className="p-4 border-b flex items-center gap-3 bg-violet-50 dark:bg-violet-950/20">
                <div className="h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                    <h2 className="font-bold text-lg">المساعد الذكي</h2>
                    <p className="text-xs text-muted-foreground">Admin Copilot</p>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pb-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-2 max-w-[90%]",
                                msg.role === 'user' ? "mr-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                msg.role === 'user' ? "bg-blue-100 text-blue-600" : "bg-violet-100 text-violet-600"
                            )}>
                                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div className={cn(
                                "rounded-2xl p-3 px-4 text-sm shadow-sm",
                                msg.role === 'user'
                                    ? "bg-blue-600 text-white rounded-tl-none"
                                    : "bg-muted rounded-tr-none"
                            )}>
                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                {renderData(msg)}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-2">
                            <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="bg-muted rounded-2xl p-3 rounded-tr-none flex items-center">
                                <span className="animate-pulse flex gap-1">
                                    <span className="block h-2 w-2 rounded-full bg-current opacity-50"></span>
                                    <span className="block h-2 w-2 rounded-full bg-current opacity-50 animation-delay-200"></span>
                                    <span className="block h-2 w-2 rounded-full bg-current opacity-50 animation-delay-400"></span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend() }}
                    className="flex gap-2 items-end"
                >
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="اسألني عن الأجهزة والموظفين..."
                        className="flex-1 min-h-[50px] resize-none"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="h-[50px] w-[50px] rounded-xl bg-violet-600 hover:bg-violet-700"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
            </div>
        </div>
    )
}
