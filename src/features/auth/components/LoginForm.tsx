import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = ({ apiKey }: FormValues) => {
    login(apiKey)
    toast.success('Authenticated successfully')
    navigate('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="Enter your API key"
          {...register('apiKey')}
          className={errors.apiKey ? 'border-red-500' : ''}
        />
        {errors.apiKey && <p className="text-xs text-red-500">{errors.apiKey.message}</p>}
      </div>
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  )
}
