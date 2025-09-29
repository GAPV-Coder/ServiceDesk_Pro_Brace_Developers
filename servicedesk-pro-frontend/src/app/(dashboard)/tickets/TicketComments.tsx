'use client'

import { formatDateTime, getInitials } from '@/lib/utils/formatters'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { MessageSquare, Lock, CheckCircle } from 'lucide-react'
import type { TicketComment } from '@/lib/api/types/ticket.types'
import { cn } from '@/lib/utils'

interface TicketCommentsProps {
    comments: TicketComment[]
    currentUserId: string
}

export function TicketComments({ comments, currentUserId }: TicketCommentsProps) {
    if (!comments || comments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                <p className="text-sm text-muted-foreground">
                    Be the first to comment on this ticket
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {comments.map((comment, index) => (
                <div key={comment.id}>
                    <Card className={cn(
                        'transition-colors',
                        comment.type === 'internal' && 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
                        comment.type === 'system' && 'bg-muted/50'
                    )}>
                        <CardContent className="pt-6">
                            <div className="flex gap-3">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src="" alt={comment.author.firstName} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                        {getInitials(comment.author.firstName, comment.author.lastName)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm">
                                                {comment.author.firstName} {comment.author.lastName}
                                            </span>
                                            <Badge variant="secondary" className="text-xs">
                                                {comment.author.role}
                                            </Badge>
                                            {comment.type === 'internal' && (
                                                <Badge variant="outline" className="text-xs gap-1">
                                                    <Lock className="h-3 w-3" />
                                                    Internal
                                                </Badge>
                                            )}
                                            {comment.isFirstResponse && (
                                                <Badge variant="outline" className="text-xs gap-1 bg-green-50 text-green-700 border-green-200">
                                                    <CheckCircle className="h-3 w-3" />
                                                    First Response
                                                </Badge>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDateTime(comment.createdAt)}
                                        </span>
                                    </div>

                                    <div className="prose prose-sm max-w-none dark:prose-invert">
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {index < comments.length - 1 && <Separator className="my-4" />}
                </div>
            ))}
        </div>
    )
}