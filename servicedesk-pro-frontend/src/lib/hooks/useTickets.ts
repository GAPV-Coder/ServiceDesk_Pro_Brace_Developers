import { useAppSelector, useAppDispatch } from '../store/hooks'
import {
    fetchTickets,
    fetchTicketById,
    fetchMyTickets,
    createTicket,
    updateTicket,
    assignTicket,
    resolveTicket,
    closeTicket,
    reopenTicket,
    addComment,
    setFilters,
} from '../store/slices/ticketsSlice'
import type { TicketQueryParams, CreateTicketRequest, UpdateTicketRequest } from '../api/types/ticket.types'

export function useTickets() {
    const dispatch = useAppDispatch()
    const { tickets, currentTicket, myTickets, pagination, isLoading, error, filters } = useAppSelector(
        (state) => state.tickets
    )

    const loadTickets = (params?: TicketQueryParams) => {
        dispatch(fetchTickets(params))
    }

    const loadTicketById = (id: string) => {
        dispatch(fetchTicketById(id))
    }

    const loadMyTickets = (status?: string) => {
        dispatch(fetchMyTickets(status))
    }

    const createNewTicket = async (data: CreateTicketRequest) => {
        const result = await dispatch(createTicket(data))
        return result
    }

    const updateExistingTicket = async (id: string, data: UpdateTicketRequest) => {
        const result = await dispatch(updateTicket({ id, data }))
        return result
    }

    const assignToAgent = async (id: string, agentId: string) => {
        const result = await dispatch(assignTicket({ id, agentId }))
        return result
    }

    const resolveExistingTicket = async (id: string) => {
        const result = await dispatch(resolveTicket(id))
        return result
    }

    const closeExistingTicket = async (id: string) => {
        const result = await dispatch(closeTicket(id))
        return result
    }

    const reopenExistingTicket = async (id: string) => {
        const result = await dispatch(reopenTicket(id))
        return result
    }

    const addNewComment = async (id: string, content: string, type?: 'public' | 'internal') => {
        const result = await dispatch(addComment({ id, content, type }))
        return result
    }

    const updateFilters = (newFilters: TicketQueryParams) => {
        dispatch(setFilters(newFilters))
    }

    return {
        tickets,
        currentTicket,
        myTickets,
        pagination,
        isLoading,
        error,
        filters,
        loadTickets,
        loadTicketById,
        loadMyTickets,
        createTicket: createNewTicket,
        updateTicket: updateExistingTicket,
        assignTicket: assignToAgent,
        resolveTicket: resolveExistingTicket,
        closeTicket: closeExistingTicket,
        reopenTicket: reopenExistingTicket,
        addComment: addNewComment,
        updateFilters,
    }
}