'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { login } from '@/lib/store/slices/authSlice'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schemas'
import { toast } from 'sonner'

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const dispatch = useAppDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/my-tickets'
    const { user } = useAppSelector((state) => state.auth)

    useEffect(() => {
        if (user) {
            router.replace(redirect)
        }
    }, [user, router, redirect])

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        setError('')

        try {
            const result = await dispatch(login(data)).unwrap()
            toast.success('Welcome back!', {
                description: `Logged in as ${result.user.firstName} ${result.user.lastName}`,
            })
            router.push(redirect)
        } catch (err: any) {
            setError(err || 'Login failed. Please check your credentials.')
            toast.error('Login failed', {
                description: err || 'Please check your credentials and try again.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (user) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl sm:text-3xl font-bold">Welcome back</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Enter your credentials to access your account
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register('email')}
                        disabled={isLoading}
                    />
                    {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...register('password')}
                            disabled={isLoading}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                    </div>
                    {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link href="/register" className="text-primary hover:underline font-medium">
                    Sign up
                </Link>
            </div>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Demo Credentials:</p>
                <div className="grid gap-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Manager:</span>
                        <span className="font-mono">manager@servicedesk.com / password123</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Agent:</span>
                        <span className="font-mono">agent1@servicedesk.com / password123</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">User:</span>
                        <span className="font-mono">user1@company.com / password123</span>
                    </div>
                </div>
            </div>
        </div>
    )
}