'use client'

import { useNyigbaName } from '@/hooks/useNyigbaName'

interface AddressDisplayProps {
  address: string
  showFullAddress?: boolean
  className?: string
}

export function AddressDisplay({ address, showFullAddress = false, className = '' }: AddressDisplayProps) {
  const { name, loading } = useNyigbaName(address as `0x${string}`)
  
  // Function to shorten address
  const shortenAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
  
  if (loading) {
    return (
      <span className={`animate-pulse ${className}`}>
        {shortenAddress(address)}
      </span>
    )
  }
  
  // If we have a domain name, show it
  if (name) {
    return (
      <span className={`font-medium text-blue-600 ${className}`} title={address}>
        {name}
      </span>
    )
  }
  
  // Otherwise show the address (full or shortened)
  return (
    <span className={`font-mono text-gray-600 ${className}`} title={address}>
      {showFullAddress ? address : shortenAddress(address)}
    </span>
  )
}

export default AddressDisplay
