import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { initializeAuth, logout, getProfile } from '../store/slices/authSlice'

export function useAuth(requireAuth: boolean = true) {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth)

    useEffect(() => {
        dispatch(initializeAuth())
    }, [dispatch])

    useEffect(() => {
        if (!isLoading && requireAuth && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, isLoading, requireAuth, router])

    const handleLogout = async () => {
        await dispatch(logout())
        router.push('/login')
    }

    const refreshProfile = async () => {
        await dispatch(getProfile())
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        logout: handleLogout,
        refreshProfile,
    }
}