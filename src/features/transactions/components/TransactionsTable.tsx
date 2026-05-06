import { useState, useMemo, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, Radio } from 'lucide-react'

import { useTransactions } from '../hooks/useTransactions'
import { depositsSocket } from '@/lib/socket'
import { StatusBadge } from './StatusBadge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Transaction } from '@/types'

const helper = createColumnHelper<Transaction>()

const columns = [
  helper.accessor('walletAddress', {
    header: 'Wallet',
    cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
  }),
  helper.accessor('transactionHash', {
    header: 'Transaction Hash',
    cell: (info) => (
      <span className="block max-w-[160px] truncate font-mono text-xs">{info.getValue()}</span>
    ),
  }),
  helper.accessor('amount', {
    header: ({ column }) => (
      <button
        className="hover:text-foreground flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Amount <ArrowUpDown className="size-3" />
      </button>
    ),
    cell: (info) => <span className="font-mono text-sm">{Number(info.getValue()).toFixed(8)}</span>,
    sortingFn: (a, b) => Number(a.original.amount) - Number(b.original.amount),
  }),
  helper.accessor('status', {
    header: 'Status',
    cell: (info) => <StatusBadge status={info.getValue()} />,
    filterFn: (row, _id, value) => value === 'ALL' || row.original.status === value,
  }),
  helper.accessor('createdAt', {
    header: ({ column }) => (
      <button
        className="hover:text-foreground flex items-center gap-1"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Created <ArrowUpDown className="size-3" />
      </button>
    ),
    cell: (info) => (
      <span className="text-muted-foreground text-xs">
        {new Date(info.getValue()).toLocaleString()}
      </span>
    ),
  }),
]

export function TransactionsTable() {
  const { transactions, isLoading, isError } = useTransactions()
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }])
  const [socketConnected, setSocketConnected] = useState(depositsSocket.connected)

  useEffect(() => {
    const onConnect = () => setSocketConnected(true)
    const onDisconnect = () => setSocketConnected(false)
    depositsSocket.on('connect', onConnect)
    depositsSocket.on('disconnect', onDisconnect)
    return () => {
      depositsSocket.off('connect', onConnect)
      depositsSocket.off('disconnect', onDisconnect)
    }
  }, [])

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return transactions
    return transactions.filter((t) => t.status === statusFilter)
  }, [transactions, statusFilter])

  const table = useReactTable({
    data: filtered,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, value) => {
      const q = String(value).toLowerCase()
      return (
        row.original.walletAddress.toLowerCase().includes(q) ||
        row.original.transactionHash.toLowerCase().includes(q) ||
        row.original.status.toLowerCase().includes(q)
      )
    },
  })

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search hash, wallet, status…"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-8 max-w-xs text-sm"
        />
        <div className="flex items-center gap-1">
          {(['ALL', 'PENDING', 'PROCESSED', 'FAILED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-8 rounded-md border px-2.5 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-foreground text-background border-foreground'
                  : 'text-muted-foreground border-border hover:text-foreground hover:border-foreground/40 bg-transparent'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {/* Live indicator */}
        <div className="text-muted-foreground ml-auto flex items-center gap-1.5 text-xs">
          <Radio
            className={`size-3 animate-pulse ${socketConnected ? 'text-green-500' : 'text-yellow-500'}`}
          />
          {socketConnected ? 'Live · WS' : 'Connecting…'}
        </div>
      </div>

      {/* Table */}
      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/50">
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-foreground text-xs font-semibold">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <div className="bg-muted h-4 animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center text-sm text-red-500">
                  Failed to load transactions.
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground py-8 text-center text-sm"
                >
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && (
        <p className="text-muted-foreground text-xs">
          {table.getRowModel().rows.length} of {transactions.length} transaction
          {transactions.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
