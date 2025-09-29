import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import ticketsReducer from './slices/ticketsSlice'
import categoriesReducer from './slices/categoriesSlice'
import usersReducer from './slices/usersSlice'
import dashboardReducer from './slices/dashboardSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tickets: ticketsReducer,
        categories: categoriesReducer,
        users: usersReducer,
        dashboard: dashboardReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch