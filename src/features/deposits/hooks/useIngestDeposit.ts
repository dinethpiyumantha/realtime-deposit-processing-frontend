import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ingestDeposit } from '@/services/deposits.service'
import { getAxiosErrorMessage } from '@/lib/utils'
import { WALLETS_QUERY_KEY } from '@/features/wallets/hooks/useWallets'

export function useIngestDeposit() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ingestDeposit,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: WALLETS_QUERY_KEY })
      if (data.idempotent) {
        toast.info(`Duplicate transaction — already exists with status: ${data.transaction.status}`)
      } else {
        toast.success(`Deposit submitted — processing started (TX: ${data.transaction.id})`)
      }
    },
    onError: (err) => {
      toast.error(getAxiosErrorMessage(err, 'Failed to submit deposit'))
    },
  })
}
