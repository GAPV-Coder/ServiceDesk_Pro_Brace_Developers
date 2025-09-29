'use client'

import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DateRangePickerProps {
    value?: { from?: Date; to?: Date }
    onChange: (range: { from?: Date; to?: Date } | undefined) => void
    className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
    return (
        <div className={cn('grid gap-2', className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            'justify-start text-left font-normal',
                            !value && 'text-muted-foreground'
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value?.from ? (
                            value.to ? (
                                <>
                                    {format(value.from, 'LLL dd, y')} - {format(value.to, 'LLL dd, y')}
                                </>
                            ) : (
                                format(value.from, 'LLL dd, y')
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                        <p className="text-sm text-muted-foreground">
                            Date range picker component - Install react-day-picker for full functionality
                        </p>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}