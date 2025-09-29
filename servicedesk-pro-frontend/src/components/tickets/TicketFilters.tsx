'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/common/SearchBar'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import type { TicketQueryParams } from '@/lib/api/types/ticket.types'

interface TicketFiltersProps {
    filters: TicketQueryParams
    onFiltersChange: (filters: TicketQueryParams) => void
    categories?: Array<{ id: string; name: string }>
    agents?: Array<{ id: string; firstName: string; lastName: string }>
}

export function TicketFilters({
    filters,
    onFiltersChange,
    categories = [],
    agents = []
}: TicketFiltersProps) {
    const [open, setOpen] = useState(false)

    const handleFilterChange = (key: keyof TicketQueryParams, value: any) => {
        onFiltersChange({ ...filters, [key]: value || undefined })
    }

    const handleClearFilters = () => {
        onFiltersChange({ page: 1, limit: 10 })
    }

    const activeFiltersCount = Object.keys(filters).filter(
        (key) => key !== 'page' && key !== 'limit' && filters[key as keyof TicketQueryParams]
    ).length

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
                placeholder="Search tickets..."
                onSearch={(query) => handleFilterChange('search', query)}
                className="flex-1"
            />

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="relative">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Filter Tickets</SheetTitle>
                        <SheetDescription>
                            Narrow down your ticket search with these filters
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-4 mt-6">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={filters.status || ''}
                                onValueChange={(value) => handleFilterChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="pending_customer">Pending Customer</SelectItem>
                                    <SelectItem value="pending_vendor">Pending Vendor</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority</label>
                            <Select
                                value={filters.priority || ''}
                                onValueChange={(value) => handleFilterChange('priority', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All priorities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Filter */}
                        {categories.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Select
                                    value={filters.categoryId || ''}
                                    onValueChange={(value) => handleFilterChange('categoryId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All categories</SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Assigned Agent Filter */}
                        {agents.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assigned Agent</label>
                                <Select
                                    value={filters.assignedAgentId || ''}
                                    onValueChange={(value) => handleFilterChange('assignedAgentId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All agents" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All agents</SelectItem>
                                        {agents.map((agent) => (
                                            <SelectItem key={agent.id} value={agent.id}>
                                                {agent.firstName} {agent.lastName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* SLA Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">SLA Status</label>
                            <Select
                                value={filters.slaStatus || ''}
                                onValueChange={(value) => handleFilterChange('slaStatus', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All SLA statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All SLA statuses</SelectItem>
                                    <SelectItem value="on_time">On Time</SelectItem>
                                    <SelectItem value="at_risk">At Risk</SelectItem>
                                    <SelectItem value="breached">Breached</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters Button */}
                        {activeFiltersCount > 0 && (
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="w-full"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear all filters
                            </Button>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}