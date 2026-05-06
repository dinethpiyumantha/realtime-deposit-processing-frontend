import { apiClient } from '@/lib/axios'
import type { DepositRequest, DepositResponse } from '@/types'

export async function ingestDeposit(body: DepositRequest): Promise<DepositResponse> {
  const { data } = await apiClient.post<DepositResponse>('/deposits', body)
  return data
}
