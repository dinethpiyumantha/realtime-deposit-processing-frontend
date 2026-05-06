import { Badge } from '@/components/ui/badge'
import type { TransactionStatus } from '@/types'
import { cn } from '@/lib/utils'

const config: Record<TransactionStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'border border-border bg-background text-muted-foreground',
  },
  PROCESSED: {
    label: 'Processed',
    className: 'border-0 bg-foreground text-background',
  },
  FAILED: {
    label: 'Failed',
    className: 'border-0 bg-red-600 text-white',
  },
}

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const { label, className } = config[status]
  return (
    <Badge className={cn('text-xs font-medium', className)}>
      {label}
    </Badge>
  )
}
