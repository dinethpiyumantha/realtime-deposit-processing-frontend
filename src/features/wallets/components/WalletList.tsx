import { Wallet } from 'lucide-react'
import { useWallets } from '../hooks/useWallets'
import { Card, CardContent } from '@/components/ui/card'
import type { Wallet as WalletType } from '@/types'

function WalletCard({ wallet }: { wallet: WalletType }) {
  return (
    <Card className="border border-border bg-background">
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded border border-border bg-muted">
          <Wallet className="size-4 text-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-sm font-medium">{wallet.address}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(wallet.createdAt).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <div className="h-[60px] animate-pulse rounded-lg border border-border bg-muted" />
  )
}

export function WalletList() {
  const { data: wallets, isLoading, isError } = useWallets()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500">Failed to load wallets. Is the backend running?</p>
    )
  }

  if (!wallets || wallets.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No wallets registered yet. Add one above.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {wallets.map((w) => (
        <WalletCard key={w.address} wallet={w} />
      ))}
    </div>
  )
}
