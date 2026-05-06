import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus } from 'lucide-react'

import { useRegisterWallet } from '../hooks/useRegisterWallet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  address: z
    .string()
    .min(1, 'Address is required')
    .max(100, 'Max 100 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only alphanumeric, hyphens and underscores allowed'),
})

type FormValues = z.infer<typeof schema>

export function AddWalletForm() {
  const { mutate, isPending } = useRegisterWallet()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = ({ address }: FormValues) => {
    mutate(address, { onSuccess: () => reset() })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <div className="flex-1 space-y-1">
        <Label htmlFor="wallet-address" className="sr-only">
          Wallet Address
        </Label>
        <Input
          id="wallet-address"
          placeholder="e.g. wallet-abc123"
          {...register('address')}
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
      </div>
      <Button type="submit" disabled={isPending} size="default">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        Add Wallet
      </Button>
    </form>
  )
}
