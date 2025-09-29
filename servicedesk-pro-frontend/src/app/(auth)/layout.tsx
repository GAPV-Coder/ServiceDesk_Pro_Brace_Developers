import { Ticket } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side - Form */}
            <div className="flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md space-y-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Ticket className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-2xl">ServiceDesk Pro</span>
                    </Link>

                    {children}
                </div>
            </div>

            {/* Right side - Hero/Image */}
            <div className="hidden lg:flex bg-gradient-to-br from-primary/10 via-primary/5 to-background items-center justify-center p-12">
                <div className="max-w-lg space-y-6">
                    <h1 className="text-4xl font-bold">
                        Streamline your support operations
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Manage tickets, track SLAs, and deliver exceptional support with ServiceDesk Pro.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-6">
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-primary">99.9%</div>
                            <p className="text-sm text-muted-foreground">SLA Compliance</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-primary">24/7</div>
                            <p className="text-sm text-muted-foreground">Support Available</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-primary">1000+</div>
                            <p className="text-sm text-muted-foreground">Tickets Resolved</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-primary">50+</div>
                            <p className="text-sm text-muted-foreground">Happy Teams</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}