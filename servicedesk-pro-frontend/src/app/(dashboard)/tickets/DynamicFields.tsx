'use client'

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
import { Checkbox } from '@/components/ui/checkbox'
import type { CategoryField } from '@/lib/api/types/category.types'

interface DynamicFieldsProps {
    fields: CategoryField[]
    values: Record<string, any>
    onChange: (values: Record<string, any>) => void
    disabled?: boolean
}

export function DynamicFields({ fields, values, onChange, disabled }: DynamicFieldsProps) {
    const handleChange = (fieldName: string, value: any) => {
        onChange({ ...values, [fieldName]: value })
    }

    return (
        <div className="space-y-4">
            {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>

                    {field.type === 'text' && (
                        <Input
                            id={field.id}
                            value={values[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            disabled={disabled}
                            required={field.required}
                        />
                    )}

                    {field.type === 'textarea' && (
                        <Textarea
                            id={field.id}
                            value={values[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            disabled={disabled}
                            required={field.required}
                            rows={4}
                        />
                    )}

                    {field.type === 'number' && (
                        <Input
                            id={field.id}
                            type="number"
                            value={values[field.name] || ''}
                            onChange={(e) => handleChange(field.name, parseFloat(e.target.value))}
                            disabled={disabled}
                            required={field.required}
                            min={field.validation?.min}
                            max={field.validation?.max}
                        />
                    )}

                    {field.type === 'date' && (
                        <Input
                            id={field.id}
                            type="date"
                            value={values[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            disabled={disabled}
                            required={field.required}
                        />
                    )}

                    {field.type === 'select' && field.options && (
                        <Select
                            value={values[field.name] || ''}
                            onValueChange={(value) => handleChange(field.name, value)}
                            disabled={disabled}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {field.type === 'boolean' && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={field.id}
                                checked={values[field.name] || false}
                                onCheckedChange={(checked) => handleChange(field.name, checked)}
                                disabled={disabled}
                            />
                            <Label htmlFor={field.id} className="font-normal cursor-pointer">
                                {field.label}
                            </Label>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
