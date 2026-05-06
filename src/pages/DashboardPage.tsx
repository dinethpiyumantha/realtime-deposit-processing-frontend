import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

import { useAuth } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AddWalletForm } from '@/features/wallets/components/AddWalletForm'
import { WalletList } from '@/features/wallets/components/WalletList'
import { DepositForm } from '@/features/deposits/components/DepositForm'
import { TransactionsTable } from '@/features/transactions/components/TransactionsTable'

export function DashboardPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-border bg-background/95 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="border-border bg-foreground flex size-7 items-center justify-center rounded-md border">
              <span className="text-background text-xs font-bold">D</span>
            </div>
            <span className="font-semibold tracking-tight">Deposit Processing</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-xs">
            <LogOut className="size-3.5" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {/* Wallets section */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Wallets</CardTitle>
              <CardDescription>Register and manage wallet addresses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddWalletForm />
              <Separator />
              <WalletList />
            </CardContent>
          </Card>
        </section>

        {/* Deposit simulation section */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Simulate Deposit</CardTitle>
              <CardDescription>
                Submit a deposit request — processing is asynchronous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepositForm />
            </CardContent>
          </Card>
        </section>

        {/* Transactions section */}
        <section>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Transactions</CardTitle>
              <CardDescription>
                All transactions across registered wallets — real-time via WebSocket, 30s REST
                fallback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
