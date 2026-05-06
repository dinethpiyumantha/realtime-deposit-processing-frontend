import { apiClient } from '@/lib/axios'
import type { Wallet, WalletWithTransactions } from '@/types'

export async function listWallets(): Promise<Wallet[]> {
  const { data } = await apiClient.get<Wallet[]>('/wallets')
  return data
}

export async function registerWallet(address: string): Promise<Wallet> {
  const { data } = await apiClient.post<Wallet>('/wallets', { address })
  return data
}

export async function getWallet(address: string): Promise<WalletWithTransactions> {
  const { data } = await apiClient.get<WalletWithTransactions>(`/wallets/${address}`)
  return data
}
