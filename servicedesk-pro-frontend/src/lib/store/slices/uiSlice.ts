import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UiState {
    sidebarOpen: boolean
    theme: 'light' | 'dark'
    notifications: Notification[]
}

interface Notification {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
}

const initialState: UiState = {
    sidebarOpen: true,
    theme: 'light',
    notifications: [],
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', action.payload)
                document.documentElement.classList.toggle('dark', action.payload === 'dark')
            }
        },
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
            const id = Date.now().toString()
            state.notifications.push({ ...action.payload, id })
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter((n) => n.id !== action.payload)
        },
        clearNotifications: (state) => {
            state.notifications = []
        },
    },
})

export const {
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    addNotification,
    removeNotification,
    clearNotifications,
} = uiSlice.actions
export default uiSlice.reducer