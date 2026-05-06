import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/auth.store'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="mb-3 inline-flex size-12 items-center justify-center rounded-xl border border-border bg-foreground">
            <span className="text-xl font-bold text-background">D</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Deposit Processing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Realtime deposit management</p>
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

        <p className="text-center text-xs text-muted-foreground">
          Default dev key:{' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono">dev-api-key</code>
        </p>
      </div>
    </div>
  )
}
