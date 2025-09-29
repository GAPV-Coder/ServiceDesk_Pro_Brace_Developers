'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { DynamicFields } from '../DynamicFields'
import { useTickets } from '@/lib/hooks/useTickets'
import { useCategories } from '@/lib/hooks/useCategories'
import { createTicketSchema, type CreateTicketFormData } from '@/lib/validations/ticket.schemas'
import { toast } from 'sonner'
import type { Category } from '@/lib/api/types/category.types'
import { useAppDispatch } from '@/lib/store/hooks'

export default function CreateTicketPage() {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { createTicket } = useTickets()
    const { categories, loadCategories, isLoading: categoriesLoading } = useCategories()
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateTicketFormData>({
        resolver: zodResolver(createTicketSchema),
        defaultValues: {
            priority: 'medium',
            additionalData: {},
        },
    })

    const watchCategoryId = watch('categoryId')

    useEffect(() => {
        loadCategories()
    }, [])

    useEffect(() => {
        if (watchCategoryId) {
            const category = categories.find((c) => c.id === watchCategoryId)
            setSelectedCategory(category || null)
            setValue('additionalData', {})
        }
    }, [watchCategoryId, categories])

    const onSubmit = async (data: CreateTicketFormData) => {
        setIsSubmitting(true)
        try {
            const ticket = await (createTicket(data))
            toast.success('Ticket created successfully!', {
                description: `Ticket ${ticket.ticketNumber} has been created.`,
            })
            router.push(`/tickets/${ticket.id}`)
        } catch (error: any) {
            toast.error('Failed to create ticket', {
                description: error?.message || 'Please try again later.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <PageContainer maxWidth="2xl">
            <PageHeader
                title="Create New Ticket"
                description="Submit a new support ticket for assistance"
                backButton
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Ticket Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Category */}
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">
                                Category <span className="text-destructive">*</span>
                            </Label>
                            <Controller
                                name="categoryId"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={categoriesLoading || isSubmitting}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.categoryId && (
                                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                            )}
                            {selectedCategory && (
                                <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
                            )}
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Controller
                                name="priority"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Brief description of the issue"
                                {...register('title')}
                                disabled={isSubmitting}
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title.message}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Provide detailed information about your issue..."
                                rows={6}
                                {...register('description')}
                                disabled={isSubmitting}
                                className="resize-none"
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Dynamic Fields based on Category */}
                {selectedCategory && selectedCategory.additionalFields.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                name="additionalData"
                                control={control}
                                render={({ field }) => (
                                    <DynamicFields
                                        fields={selectedCategory.additionalFields}
                                        values={field.value || {}}
                                        onChange={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                )}
                            />
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSubmitting ? 'Creating...' : 'Create Ticket'}
                    </Button>
                </div>
            </form>
        </PageContainer>
    )
}
