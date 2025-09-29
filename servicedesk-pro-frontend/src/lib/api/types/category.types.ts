import { Ticket } from "./ticket.types"

export interface Category {
    id: string
    name: string
    description: string
    additionalFields: CategoryField[]
    sla: CategorySLA
    isActive: boolean
    sortOrder: number
    color?: string
    icon?: string
    tickets?: Ticket[]
    createdAt: string
    updatedAt: string
}

export interface CategoryField {
    id: string
    name: string
    label: string
    type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'boolean'
    required: boolean
    options?: string[]
    validation?: {
        minLength?: number
        maxLength?: number
        min?: number
        max?: number
        pattern?: string
    }
}

export interface CategorySLA {
    firstResponseHours: number
    resolutionHours: number
}

export interface CategorySnapshot {
    id: string
    name: string
    sla: CategorySLA
    additionalFields: CategoryField[]
}

export interface CreateCategoryRequest {
    name: string
    description: string
    additionalFields?: CategoryField[]
    sla: CategorySLA
    color?: string
    icon?: string
}

export interface UpdateCategoryRequest {
    name?: string
    description?: string
    additionalFields?: CategoryField[]
    sla?: CategorySLA
    isActive?: boolean
    sortOrder?: number
    color?: string
    icon?: string
}