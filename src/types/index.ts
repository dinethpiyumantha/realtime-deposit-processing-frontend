export type TransactionStatus = 'PENDING' | 'PROCESSED' | 'FAILED'

export interface Wallet {
  address: string
  createdAt: string
}

export interface Transaction {
  id: string
  walletAddress: string
  transactionHash: string
  amount: string
  status: TransactionStatus
  createdAt: string
  updatedAt: string
}

export interface WalletWithTransactions extends Wallet {
  transactions: Transaction[]
}

export interface DepositRequest {
  walletAddress: string
  transactionHash: string
  amount: number
}

export interface DepositResponse {
  idempotent: boolean
  transaction: Transaction
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error: string
}
