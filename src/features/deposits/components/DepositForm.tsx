import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Send } from 'lucide-react'

import { useIngestDeposit } from '../hooks/useIngestDeposit'
import { useWallets } from '@/features/wallets/hooks/useWallets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  walletAddress: z.string().min(1, 'Select a wallet'),
  transactionHash: z
    .string()
    .min(1, 'Transaction hash is required')
    .max(255, 'Max 255 characters'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Amount must be a positive number')
    .refine((v) => {
      const parts = v.split('.')
      return !parts[1] || parts[1].length <= 8
    }, 'Max 8 decimal places'),
})

type FormValues = z.infer<typeof schema>

export function DepositForm() {
  const { mutate, isPending } = useIngestDeposit()
  const { data: wallets } = useWallets()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = (values: FormValues) => {
    mutate(
      { ...values, amount: Number(values.amount) },
      { onSuccess: () => reset() }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Wallet select */}
        <div className="space-y-1.5">
          <Label htmlFor="deposit-wallet">Wallet Address</Label>
          <select
            id="deposit-wallet"
            {...register('walletAddress')}
            className={`flex h-8 w-full rounded-lg border bg-transparent px-2.5 py-0 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.walletAddress ? 'border-red-500' : 'border-input'
            }`}
          >
            <option value="">Select wallet</option>
            {wallets?.map((w) => (
              <option key={w.address} value={w.address}>
                {w.address}
              </option>
            ))}
          </select>
          {errors.walletAddress && (
            <p className="text-xs text-red-500">{errors.walletAddress.message}</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <Label htmlFor="deposit-amount">Amount</Label>
          <Input
            id="deposit-amount"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 1.5"
            {...register('amount')}
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
        </div>
      </div>

      {/* Transaction hash */}
      <div className="space-y-1.5">
        <Label htmlFor="tx-hash">Transaction Hash</Label>
        <Input
          id="tx-hash"
          placeholder="e.g. 0xabc123def456"
          {...register('transactionHash')}
          className={errors.transactionHash ? 'border-red-500' : ''}
        />
        {errors.transactionHash && (
          <p className="text-xs text-red-500">{errors.transactionHash.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
        Submit Deposit
      </Button>
    </form>
  )
}
