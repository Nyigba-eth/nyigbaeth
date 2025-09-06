import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Address } from 'viem'
import { formatEther, parseEther } from 'viem'

/**
 * Utility fun/**
 * Generate avatar from address
 */
export function generateAvatar(address: Address): string {
  // Simple gradient avatar based on address
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  
  const hash = address.toLowerCase().split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0)
  }, 0)
  
  const colorIndex = hash % colors.length
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="${colors[colorIndex]}"/><text x="20" y="25" text-anchor="middle" fill="white" font-size="14" font-family="Arial">${address.slice(2, 4).toUpperCase()}</text></svg>`
}

/**
 * Format wallet address to show first 6 and last 4 characters
 */
export function formatAddress(address: Address): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format display name for user - prioritizes Nyigba name over address
 */
export function formatDisplayName(address: Address, nyigbaName?: string | null): string {
  if (nyigbaName) {
    return nyigbaName
  }
  return formatAddress(address)
}

/**
 * Get user identifier for display purposes
 */
export function getUserDisplayName(address: Address, nyigbaName?: string | null): {
  displayName: string
  isNyigbaName: boolean
  shortAddress: string
} {
  const shortAddress = formatAddress(address)
  
  if (nyigbaName) {
    return {
      displayName: nyigbaName,
      isNyigbaName: true,
      shortAddress
    }
  }
  
  return {
    displayName: shortAddress,
    isNyigbaName: false,
    shortAddress
  }
}

/**
 * Utility function to combine Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Truncate address for display
 */
export function truncateAddress(address: Address, startLength = 6, endLength = 4): string {
  if (!address) return ''
  if (address.length <= startLength + endLength) return address
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Format ETH amount for display
 */
export function formatEthAmount(wei: bigint | string, decimals = 4): string {
  const ethAmount = formatEther(typeof wei === 'string' ? BigInt(wei) : wei)
  return parseFloat(ethAmount).toFixed(decimals)
}

/**
 * Parse ETH amount to wei
 */
export function parseEthAmount(eth: string): bigint {
  return parseEther(eth)
}

/**
 * Format number with commas
 */
export function formatNumber(num: number | string): string {
  return Number(num).toLocaleString()
}

/**
 * Calculate percentage
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

/**
 * Convert basis points to percentage
 */
export function basisPointsToPercentage(basisPoints: number): number {
  return basisPoints / 100
}

/**
 * Convert percentage to basis points
 */
export function percentageToBasisPoints(percentage: number): number {
  return percentage * 100
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate ENS name
 */
export function isValidENSName(name: string): boolean {
  // Basic ENS validation - can be expanded
  const ensRegex = /^[a-z0-9-]+\.eth$/
  return ensRegex.test(name.toLowerCase())
}

/**
 * Format time ago
 */
export function timeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  return `${Math.floor(diffInSeconds / 31536000)}y ago`
}

/**
 * Format date
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(date)
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return true
  }
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

/**
 * Check if file is image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Check if file is audio
 */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/')
}

/**
 * Parse search params from URL
 */
export function parseSearchParams(searchParams: URLSearchParams) {
  const params: Record<string, string | string[]> = {}
  
  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      // Convert to array if multiple values
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value)
      } else {
        params[key] = [params[key] as string, value]
      }
    } else {
      params[key] = value
    }
  }
  
  return params
}

/**
 * Create URL with search params
 */
export function createUrlWithParams(
  baseUrl: string, 
  params: Record<string, string | string[] | undefined>
): string {
  const url = new URL(baseUrl, window.location.origin)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v))
      } else {
        url.searchParams.set(key, value)
      }
    }
  })
  
  return url.toString()
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await sleep(delay)
    }
  }
  
  throw lastError!
}
