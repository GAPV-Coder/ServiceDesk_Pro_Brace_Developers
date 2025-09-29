import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    // Show max 7 page numbers
    let visiblePages = pages
    if (totalPages > 7) {
        if (currentPage <= 4) {
            visiblePages = [...pages.slice(0, 5), -1, totalPages]
        } else if (currentPage >= totalPages - 3) {
            visiblePages = [1, -1, ...pages.slice(totalPages - 5)]
        } else {
            visiblePages = [
                1,
                -1,
                currentPage - 1,
                currentPage,
                currentPage + 1,
                -1,
                totalPages,
            ]
        }
    }

    return (
        <div className={cn('flex items-center justify-center gap-1', className)}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {visiblePages.map((page, index) => {
                if (page === -1) {
                    return (
                        <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                            ...
                        </span>
                    )
                }

                return (
                    <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </Button>
                )
            })}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}