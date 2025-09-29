import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authService } from '../../api/types/services/auth.service'
import { apiClient } from '../../api/client'
import type { User, LoginRequest, RegisterRequest } from '../../api/types/auth.types'

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
}

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials)
            apiClient.setToken(response.accessToken)
            localStorage.setItem('user', JSON.stringify(response.user))
            return response
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed')
        }
    }
)

export const register = createAsyncThunk(
    'auth/register',
    async (userData: RegisterRequest, { rejectWithValue }) => {
        try {
            const response = await authService.register(userData)
            apiClient.setToken(response.accessToken)
            localStorage.setItem('user', JSON.stringify(response.user))
            return response
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed')
        }
    }
)

export const getProfile = createAsyncThunk(
    'auth/getProfile',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authService.getProfile()
            localStorage.setItem('user', JSON.stringify(user))
            return user
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to get profile')
        }
    }
)

export const logout = createAsyncThunk('auth/logout', async () => {
    await authService.logout()
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
})

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user
            state.token = action.payload.token
            state.isAuthenticated = true
        },
        clearAuth: (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
        },
        initializeAuth: (state) => {
            const token = localStorage.getItem('access_token')
            const userStr = localStorage.getItem('user')
            if (token && userStr) {
                state.token = token
                state.user = JSON.parse(userStr)
                state.isAuthenticated = true
            }
        },
    },
    extraReducers: (builder) => {
        // Inicio de sesión
        builder.addCase(login.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(login.fulfilled, (state, action) => {
            state.isLoading = false
            state.user = action.payload.user
            state.token = action.payload.accessToken
            state.isAuthenticated = true
        })
        builder.addCase(login.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })

        // Registro de usuario
        builder.addCase(register.pending, (state) => {
            state.isLoading = true
            state.error = null
        })
        builder.addCase(register.fulfilled, (state, action) => {
            state.isLoading = false
            state.user = action.payload.user
            state.token = action.payload.accessToken
            state.isAuthenticated = true
        })
        builder.addCase(register.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })

        // Obtener perfil de usuario
        builder.addCase(getProfile.fulfilled, (state, action) => {
            state.user = action.payload
        })

        // Cerrar sesión
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null
            state.token = null
            state.isAuthenticated = false
        })
    },
})

export const { setCredentials, clearAuth, initializeAuth } = authSlice.actions
export default authSlice.reducer