import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { depositsSocket } from '@/lib/socket'
import type { Wallet, WalletWithTransactions, Transaction } from '@/types'

interface CallbackFailedEvent {
  walletAddress: string
  transactionHash: string
  status: string
  reason: string
  updatedAt: string
}

/**
 * Connects to the /deposits Socket.IO namespace and listens globally
 * for deposit events. Uses the global namespace broadcast (no room
 * subscription) to avoid duplicate events.
 *
 * On each (re)connect, invalidates wallet queries to reconcile any
 * events missed while offline.
 *
 * The socket lifecycle is tied to the set of wallet addresses, not the
 * array reference, so periodic refetches of the wallet list do not
 * cause unnecessary reconnects.
 */
export function useDepositSocket(wallets: Wallet[]) {
  const queryClient = useQueryClient()
  // Keep latest wallets accessible inside the effect without adding the
  // unstable array reference to the dependency array.
  const walletsRef = useRef(wallets)
  walletsRef.current = wallets

  // Stable key — only changes when wallets are added or removed.
  const walletAddressesKey = wallets.map((w) => w.address).join(',')

  useEffect(() => {
    depositsSocket.connect()

    const handleConnect = () => {
      walletsRef.current.forEach((w) => {
        queryClient.invalidateQueries({ queryKey: ['wallet', w.address] })
      })
    }

    const handleProcessed = (tx: Transaction) => {
      queryClient.setQueryData<WalletWithTransactions>(['wallet', tx.walletAddress], (old) => {
        if (!old) return old
        const exists = old.transactions.some((t) => t.id === tx.id)
        return {
          ...old,
          transactions: exists
            ? old.transactions.map((t) => (t.id === tx.id ? tx : t))
            : [tx, ...old.transactions],
        }
      })
    }

    const handleCallbackFailed = (event: CallbackFailedEvent) => {
      toast.warning(
        `Callback failed for TX ${event.transactionHash.slice(0, 14)}…: ${event.reason}`,
        { duration: 8000 }
      )
    }

    depositsSocket.on('connect', handleConnect)
    depositsSocket.on('deposit.processed', handleProcessed)
    depositsSocket.on('deposit.callback_failed', handleCallbackFailed)

    return () => {
      depositsSocket.off('connect', handleConnect)
      depositsSocket.off('deposit.processed', handleProcessed)
      depositsSocket.off('deposit.callback_failed', handleCallbackFailed)
      depositsSocket.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddressesKey, queryClient])
}
