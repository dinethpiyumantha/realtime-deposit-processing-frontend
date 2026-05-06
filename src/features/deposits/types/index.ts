export type DepositStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface Deposit {
  id: string
  amount: number
  currency: string
  status: DepositStatus
  createdAt: string
  updatedAt: string
}
