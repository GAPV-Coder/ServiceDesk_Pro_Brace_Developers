export function getTicketStatusColor(status: string): string {
    const colors: Record<string, string> = {
        open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        pending_customer: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        pending_vendor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
        low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
        medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
}

export function getSLAStatusColor(status: string): string {
    const colors: Record<string, string> = {
        on_time: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        at_risk: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        breached: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getRoleColor(role: string): string {
    const colors: Record<string, string> = {
        requester: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        agent: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        manager: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
}

export function calculateSLAProgress(dueDate: string, startDate: string): number {
    const now = new Date().getTime()
    const due = new Date(dueDate).getTime()
    const start = new Date(startDate).getTime()

    const total = due - start
    const elapsed = now - start

    return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

export function isSLABreached(dueDate: string, completedDate?: string): boolean {
    const due = new Date(dueDate).getTime()
    const completed = completedDate ? new Date(completedDate).getTime() : Date.now()
    return completed > due
}

export function downloadFile(data: any, filename: string, type: string = 'application/json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text)
}