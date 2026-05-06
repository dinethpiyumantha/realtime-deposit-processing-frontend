import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/auth.store'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="border-border bg-foreground mb-3 inline-flex size-12 items-center justify-center rounded-xl border">
            <span className="text-background text-xl font-bold">D</span>
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Deposit Processing</h1>
          <p className="text-muted-foreground mt-1 text-sm">Realtime deposit management</p>
        </div>

        {/* Login card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Sign in</CardTitle>
            <CardDescription>Enter your API key to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-muted-foreground text-center text-xs">
          Default dev key:{' '}
          <code className="bg-muted rounded px-1 py-0.5 font-mono">dev-api-key</code>
        </p>
      </div>
    </div>
  )
}
