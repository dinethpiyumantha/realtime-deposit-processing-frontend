import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'
import { registerWallet } from '@/services/wallets.service'
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
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message
        const detail = Array.isArray(msg) ? msg.join(', ') : msg
        if (err.response?.status === 409) {
          toast.error(`Wallet already registered`)
        } else {
          toast.error(detail ?? 'Failed to register wallet')
        }
      } else {
        toast.error('Failed to register wallet')
      }
    },
  })
}
