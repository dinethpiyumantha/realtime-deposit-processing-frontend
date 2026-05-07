import { AxiosError } from 'axios'

import { cn, getAxiosErrorMessage } from './utils'

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4', 'text-sm')).toBe('px-4 text-sm')
  })
})

describe('getAxiosErrorMessage', () => {
  it('returns joined string when axios response message is an array', () => {
    const err = new AxiosError('Request failed')
    err.response = { data: { message: ['first', 'second'] } } as never

    expect(getAxiosErrorMessage(err, 'fallback')).toBe('first, second')
  })

  it('returns fallback for non-axios errors', () => {
    expect(getAxiosErrorMessage(new Error('x'), 'fallback')).toBe('fallback')
  })
})
