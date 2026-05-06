import { useQuery } from '@tanstack/react-query'
import { listWallets } from '@/services/wallets.service'

export const WALLETS_QUERY_KEY = ['wallets'] as const

export function useWallets() {
  return useQuery({
    queryKey: WALLETS_QUERY_KEY,
    queryFn: listWallets,
    refetchInterval: 5_000,
  })
}
