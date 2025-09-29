import { useAuth } from './useAuth'

export function usePermissions() {
    const { user } = useAuth(false)

    const isRequester = user?.role === 'requester'
    const isAgent = user?.role === 'agent'
    const isManager = user?.role === 'manager'

    const canManageTickets = isAgent || isManager
    const canViewDashboard = isManager
    const canManageUsers = isManager
    const canManageCategories = isManager
    const canViewAudit = isManager

    const canEditTicket = (ticketRequesterId?: string) => {
        if (isManager || isAgent) return true
        if (isRequester && ticketRequesterId === user?.id) return true
        return false
    }

    const canCloseTicket = (ticketRequesterId?: string) => {
        if (isManager || isAgent) return true
        if (isRequester && ticketRequesterId === user?.id) return true
        return false
    }

    return {
        isRequester,
        isAgent,
        isManager,
        canManageTickets,
        canViewDashboard,
        canManageUsers,
        canManageCategories,
        canViewAudit,
        canEditTicket,
        canCloseTicket,
    }
}