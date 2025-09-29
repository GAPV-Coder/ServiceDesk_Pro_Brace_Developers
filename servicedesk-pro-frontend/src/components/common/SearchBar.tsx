'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface SearchBarProps {
    placeholder?: string
    onSearch: (query: string) => void
    debounceMs?: number
    className?: string
    defaultValue?: string
}

export function SearchBar({
    placeholder = 'Search...',
    onSearch,
    debounceMs = 300,
    className,
    defaultValue = ''
}: SearchBarProps) {
    const [query, setQuery] = useState(defaultValue)
    const debouncedQuery = useDebounce(query, debounceMs)

    useEffect(() => {
        onSearch(debouncedQuery)
    }, [debouncedQuery, onSearch])

    const handleClear = () => {
        setQuery('')
        onSearch('')
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    return (
        <div className={cn('relative', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
                className="pl-10 pr-10"
            />
            {query && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                </Button>
            )}
        </div>
    )
}