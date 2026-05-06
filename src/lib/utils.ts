import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import axios from 'axios'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts a human-readable error message from an Axios error, falling
 * back to the provided default when the response body has no message.
 */
export function getAxiosErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message
    return Array.isArray(msg) ? msg.join(', ') : (msg ?? fallback)
  }
  return fallback
}
