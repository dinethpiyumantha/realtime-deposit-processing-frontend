import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'
import { registerWallet } from '@/services/wallets.service'
import { getAxiosErrorMessage } from '@/lib/utils'
import { WALLETS_QUERY_KEY } from './useWallets'

export function useRegisterWallet() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: registerWallet,
    onSuccess: (wallet) => {
      qc.invalidateQueries({ queryKey: WALLETS_QUERY_KEY })
      toast.success(`Wallet "${wallet.address}" registered successfully`)
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error('Wallet already registered')
      } else {
        toast.error(getAxiosErrorMessage(err, 'Failed to register wallet'))
      }
    },
  })
}
