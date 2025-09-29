import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ticketsService } from '../../api/types/services/tickets.service'
import type {
    Ticket,
    TicketComment,
    CreateTicketRequest,
    UpdateTicketRequest,
    TicketQueryParams,
} from '../../api/types/ticket.types'
import type { PaginatedResponse } from '../../api/types/common.types'

interface TicketsState {
    tickets: Ticket[]
    currentTicket: Ticket | null
    myTickets: Ticket[]
    pagination: PaginatedResponse<Ticket>['pagination'] | null
    isLoading: boolean
    error: string | null
    filters: TicketQueryParams
}

const initialState: TicketsState = {
    tickets: [],
    currentTicket: null,
    myTickets: [],
    pagination: null,
    isLoading: false,
    error: null,
    filters: {
        page: 1,
        limit: 10,
    },
}

export const fetchTickets = createAsyncThunk(
    'tickets/fetchAll',
    async (params: TicketQueryParams | undefined, { rejectWithValue }) => {
        try {
            return await ticketsService.getAll(params)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets')
        }
    }
)

export const fetchTicketById = createAsyncThunk(
    'tickets/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await ticketsService.getById(id)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch ticket')
        }
    }
)

export const fetchMyTickets = createAsyncThunk(
    'tickets/fetchMyTickets',
    async (status: string | undefined, { rejectWithValue }) => {
        try {
            return await ticketsService.getMyTickets(status)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch my tickets')
        }
    }
)

export const createTicket = createAsyncThunk(
    'tickets/create',
    async (ticketData: CreateTicketRequest, { rejectWithValue }) => {
        try {
            return await ticketsService.create(ticketData)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create ticket')
        }
    }
)

export const updateTicket = createAsyncThunk(
    'tickets/update',
    async ({ id, data }: { id: string; data: UpdateTicketRequest }, { rejectWithValue }) => {
        try {
            return await ticketsService.update(id, data)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update ticket')
        }
    }
)

export const assignTicket = createAsyncThunk(
    'tickets/assign',
    async ({ id, agentId }: { id: string; agentId: string }, { rejectWithValue }) => {
        try {
            return await ticketsService.assign(id, { agentId })
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign ticket')
        }
    }
)

export const resolveTicket = createAsyncThunk(
    'tickets/resolve',
    async (id: string, { rejectWithValue }) => {
        try {
            return await ticketsService.resolve(id)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to resolve ticket')
        }
    }
)

export const closeTicket = createAsyncThunk(
    'tickets/close',
    async (id: string, { rejectWithValue }) => {
        try {
            return await ticketsService.close(id)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to close ticket')
        }
    }
)

export const reopenTicket = createAsyncThunk(
    'tickets/reopen',
    async (id: string, { rejectWithValue }) => {
        try {
            return await ticketsService.reopen(id)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reopen ticket')
        }
    }
)

export const addComment = createAsyncThunk(
    'tickets/addComment',
    async ({ id, content, type }: { id: string; content: string; type?: 'public' | 'internal' }, { rejectWithValue }) => {
        try {
            return await ticketsService.addComment(id, { content, type })
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add comment')
        }
    }
)

const ticketsSlice = createSlice({
    name: 'tickets',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<TicketQueryParams>) => {
            state.filters = { ...state.filters, ...action.payload }
        },
        clearCurrentTicket: (state) => {
            state.currentTicket = null
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        // Obtener tickets
        builder.addCase(fetchTickets.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(fetchTickets.fulfilled, (state, action) => {
            state.isLoading = false
            state.tickets = action.payload.data
            state.pagination = action.payload.pagination
        })
        builder.addCase(fetchTickets.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })

        // Obtener Ticket por ID
        builder.addCase(fetchTicketById.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(fetchTicketById.fulfilled, (state, action) => {
            state.isLoading = false
            state.currentTicket = action.payload
        })
        builder.addCase(fetchTicketById.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })

        // Obtener tickets del usuario autenticado
        builder.addCase(fetchMyTickets.fulfilled, (state, action) => {
            state.myTickets = action.payload
            state.pagination = null
        })

        // Crear Ticket
        builder.addCase(createTicket.fulfilled, (state, action) => {
            state.tickets.unshift(action.payload)
        })

        // Actualizar Ticket
        builder.addCase(updateTicket.fulfilled, (state, action) => {
            const index = state.tickets.findIndex((t) => t.id === action.payload.id)
            if (index !== -1) {
                state.tickets[index] = action.payload
            }
            if (state.currentTicket?.id === action.payload.id) {
                state.currentTicket = action.payload
            }
        })

        // Asignar, resolver, cerrar y reabrir tickets
        builder.addCase(assignTicket.fulfilled, (state, action) => {
            const index = state.tickets.findIndex((t) => t.id === action.payload.id)
            if (index !== -1) {
                state.tickets[index] = action.payload
            }
            if (state.currentTicket?.id === action.payload.id) {
                state.currentTicket = action.payload
            }
        })
        builder.addCase(resolveTicket.fulfilled, (state, action) => {
            const index = state.tickets.findIndex((t) => t.id === action.payload.id)
            if (index !== -1) {
                state.tickets[index] = action.payload
            }
            if (state.currentTicket?.id === action.payload.id) {
                state.currentTicket = action.payload
            }
        })
        builder.addCase(closeTicket.fulfilled, (state, action) => {
            const index = state.tickets.findIndex((t) => t.id === action.payload.id)
            if (index !== -1) {
                state.tickets[index] = action.payload
            }
            if (state.currentTicket?.id === action.payload.id) {
                state.currentTicket = action.payload
            }
        })
        builder.addCase(reopenTicket.fulfilled, (state, action) => {
            const index = state.tickets.findIndex((t) => t.id === action.payload.id)
            if (index !== -1) {
                state.tickets[index] = action.payload
            }
            if (state.currentTicket?.id === action.payload.id) {
                state.currentTicket = action.payload
            }
        })

        // Agregar comentario
        builder.addCase(addComment.fulfilled, (state, action) => {
            if (state.currentTicket) {
                if (!state.currentTicket.comments) {
                    state.currentTicket.comments = []
                }
                state.currentTicket.comments.push(action.payload)
            }
        })
    },
})

export const { setFilters, clearCurrentTicket, clearError } = ticketsSlice.actions
export default ticketsSlice.reducer