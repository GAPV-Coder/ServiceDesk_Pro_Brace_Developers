import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { usersService } from '../../api/types/services/users.service'
import type { User, CreateUserRequest, UpdateUserRequest, UserQueryParams } from '../../api/types/user.types'
import type { PaginatedResponse } from '../../api/types/common.types'

interface UsersState {
    users: User[]
    agents: User[]
    currentUser: User | null
    pagination: PaginatedResponse<User>['pagination'] | null
    isLoading: boolean
    error: string | null
}

const initialState: UsersState = {
    users: [],
    agents: [],
    currentUser: null,
    pagination: null,
    isLoading: false,
    error: null,
}

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (params: UserQueryParams | undefined, { rejectWithValue }) => {
        try {
            return await usersService.getAll(params)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch users')
        }
    }
)

export const fetchAgents = createAsyncThunk(
    'users/fetchAgents',
    async (_, { rejectWithValue }) => {
        try {
            return await usersService.getAgents()
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch agents')
        }
    }
)

export const fetchUserById = createAsyncThunk(
    'users/fetchById',
    async (id: string, { rejectWithValue }) => {
        try {
            return await usersService.getById(id)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
        }
    }
)

export const createUser = createAsyncThunk(
    'users/create',
    async (userData: CreateUserRequest, { rejectWithValue }) => {
        try {
            return await usersService.create(userData)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create user')
        }
    }
)

export const updateUser = createAsyncThunk(
    'users/update',
    async ({ id, data }: { id: string; data: UpdateUserRequest }, { rejectWithValue }) => {
        try {
            return await usersService.update(id, data)
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update user')
        }
    }
)

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id: string, { rejectWithValue }) => {
        try {
            await usersService.delete(id)
            return id
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete user')
        }
    }
)

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearCurrentUser: (state) => {
            state.currentUser = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUsers.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            state.isLoading = false
            state.users = action.payload.data
            state.pagination = action.payload.pagination
        })
        builder.addCase(fetchUsers.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })

        builder.addCase(fetchAgents.fulfilled, (state, action) => {
            state.agents = action.payload
        })

        builder.addCase(fetchUserById.fulfilled, (state, action) => {
            state.currentUser = action.payload
        })

        builder.addCase(createUser.fulfilled, (state, action) => {
            state.users.push(action.payload)
        })

        builder.addCase(updateUser.fulfilled, (state, action) => {
            const index = state.users.findIndex((u) => u.id === action.payload.id)
            if (index !== -1) {
                state.users[index] = action.payload
            }
            if (state.currentUser?.id === action.payload.id) {
                state.currentUser = action.payload
            }
        })

        builder.addCase(deleteUser.fulfilled, (state, action) => {
            state.users = state.users.filter((u) => u.id !== action.payload)
        })
    },
})

export const { clearCurrentUser } = usersSlice.actions
export default usersSlice.reducer