'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Send, Edit, Trash2, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { getComments, createComment, updateComment, deleteComment } from '@/app/actions/comments'
import { toast } from 'sonner'

interface Comment {
    id: string
    content: string
    userId: string
    user: {
        name: string
        email: string
        image?: string | null
    }
    createdAt: Date | string
    editedAt?: Date | string | null
}

interface CommentsSystemProps {
    entityType: string
    entityId: string
    currentUserId?: string
}

export function CommentsSystem({ entityType, entityId, currentUserId }: CommentsSystemProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadComments()
    }, [entityType, entityId])

    const loadComments = async () => {
        setLoading(true)
        const result = await getComments(entityType, entityId)
        if (result.success && result.data) {
            setComments(result.data as any[])
        }
        setLoading(false)
    }

    const handleSubmit = async () => {
        if (!newComment.trim()) return

        setSubmitting(true)
        const result = await createComment(entityType, entityId, newComment)

        if (result.success) {
            toast.success('تم إضافة التعليق')
            setNewComment('')
            await loadComments()
        } else {
            toast.error('فشل إضافة التعليق')
        }
        setSubmitting(false)
    }

    const handleUpdate = async (commentId: string) => {
        if (!editContent.trim()) return

        setSubmitting(true)
        const result = await updateComment(commentId, editContent)

        if (result.success) {
            toast.success('تم تحديث التعليق')
            setEditingId(null)
            setEditContent('')
            await loadComments()
        } else {
            toast.error('فشل تحديث التعليق')
        }
        setSubmitting(false)
    }

    const handleDelete = async (commentId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return

        const result = await deleteComment(commentId)

        if (result.success) {
            toast.success('تم حذف التعليق')
            await loadComments()
        } else {
            toast.error('فشل حذف التعليق')
        }
    }

    const startEdit = (comment: Comment) => {
        setEditingId(comment.id)
        setEditContent(comment.content)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditContent('')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    التعليقات
                    {comments.length > 0 && (
                        <span className="text-sm text-muted-foreground">({comments.length})</span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* New Comment Input */}
                <div className="space-y-2">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="اكتب تعليقاً..."
                        rows={3}
                        disabled={submitting}
                    />
                    <Button
                        onClick={handleSubmit}
                        disabled={!newComment.trim() || submitting}
                        className="w-full sm:w-auto"
                    >
                        <Send className="h-4 w-4 ml-2" />
                        إضافة تعليق
                    </Button>
                </div>

                {/* Comments List */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                        <p className="text-sm text-muted-foreground mt-4">جاري التحميل...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>لا توجد تعليقات بعد</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 group">
                                    <Avatar className="h-10 w-10 shrink-0">
                                        <AvatarImage src={comment.user.image || undefined} />
                                        <AvatarFallback>
                                            {comment.user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-semibold text-sm">{comment.user.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.createdAt), {
                                                        addSuffix: true,
                                                        locale: ar
                                                    })}
                                                    {comment.editedAt && ' (معدّل)'}
                                                </p>
                                            </div>

                                            {currentUserId === comment.userId && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {editingId === comment.id ? (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6"
                                                            onClick={cancelEdit}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6"
                                                                onClick={() => startEdit(comment)}
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-destructive"
                                                                onClick={() => handleDelete(comment.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {editingId === comment.id ? (
                                            <div className="space-y-2">
                                                <Textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    rows={3}
                                                    disabled={submitting}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdate(comment.id)}
                                                    disabled={!editContent.trim() || submitting}
                                                >
                                                    حفظ
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-sm bg-accent/50 rounded-lg p-3 whitespace-pre-wrap">
                                                {comment.content}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
