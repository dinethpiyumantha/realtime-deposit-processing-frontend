import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'
import { ingestDeposit } from '@/services/deposits.service'
import { WALLETS_QUERY_KEY } from '@/features/wallets/hooks/useWallets'

export function useIngestDeposit() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ingestDeposit,
    onSuccess: (data) => {
      // Invalidate wallet queries to refresh transaction data
      qc.invalidateQueries({ queryKey: WALLETS_QUERY_KEY })
      if (data.idempotent) {
        toast.info(
          `Duplicate transaction — already exists with status: ${data.transaction.status}`
        )
      } else {
        toast.success(`Deposit submitted — processing started (TX: ${data.transaction.id})`)
      }
    },
    onError: (err) => {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message
        const detail = Array.isArray(msg) ? msg.join(', ') : msg
        toast.error(detail ?? 'Failed to submit deposit')
      } else {
        toast.error('Failed to submit deposit')
      }
    },
  })
}
