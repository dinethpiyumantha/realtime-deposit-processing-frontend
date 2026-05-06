import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useWallets } from '@/features/wallets/hooks/useWallets'
import { useDepositSocket } from './useDepositSocket'
import { getWallet } from '@/services/wallets.service'
import type { Transaction } from '@/types'

export function useTransactions() {
  const { data: wallets = [], isLoading: walletsLoading } = useWallets()

  // WebSocket connection — pushes updates directly into the query cache.
  // REST queries below use a 30s fallback interval to reconcile any
  // events missed while the socket was offline.
  useDepositSocket(wallets)

  const walletQueries = useQueries({
    queries: wallets.map((w) => ({
      queryKey: ['wallet', w.address] as const,
      queryFn: () => getWallet(w.address),
      refetchInterval: 30_000,
      staleTime: 10_000,
    })),
  })

  const isLoading = walletsLoading || walletQueries.some((q) => q.isLoading)
  const isError = walletQueries.some((q) => q.isError)

  // Memoize so the array reference only changes when actual data changes,
  // preventing unnecessary re-renders / re-computations in consumers.
  const transactions = useMemo<Transaction[]>(
    () =>
      walletQueries
        .flatMap((q) => q.data?.transactions ?? [])
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletQueries.map((q) => q.dataUpdatedAt).join(',')]
  )

  return { transactions, isLoading, isError }
}
