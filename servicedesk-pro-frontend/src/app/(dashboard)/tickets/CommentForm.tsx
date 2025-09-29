'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { addCommentSchema, type AddCommentFormData } from '@/lib/validations/ticket.schemas'
import { usePermissions } from '@/lib/hooks/usePermissions'

interface CommentFormProps {
    onSubmit: (data: AddCommentFormData) => Promise<void>
}

export function CommentForm({ onSubmit }: CommentFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { canManageTickets } = usePermissions()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AddCommentFormData>({
        resolver: zodResolver(addCommentSchema),
        defaultValues: {
            type: 'public',
        },
    })

    const commentType = watch('type')

    const handleFormSubmit = async (data: AddCommentFormData) => {
        setIsSubmitting(true)
        try {
            await onSubmit(data)
            reset()
        } catch (error) {
            console.error('Failed to submit comment:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="content">Add Comment</Label>
                    {canManageTickets && (
                        <Select
                            value={commentType}
                            onValueChange={(value: 'public' | 'internal') => setValue('type', value)}
                        >
                            <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="internal">Internal</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <Textarea
                    id="content"
                    placeholder="Write your comment here..."
                    rows={4}
                    {...register('content')}
                    disabled={isSubmitting}
                    className="resize-none"
                />
                {errors.content && (
                    <p className="text-sm text-destructive">{errors.content.message}</p>
                )}
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Posting...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4" />
                            Post Comment
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}