import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
    title: string
    description?: string
    action?: ReactNode
    backButton?: boolean
}

export function PageHeader({ title, description, action, backButton }: PageHeaderProps) {
    const router = useRouter()

    return (
        <div className="mb-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    {backButton && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="mb-2 -ml-2"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-sm sm:text-base text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
        </div>
    )
}