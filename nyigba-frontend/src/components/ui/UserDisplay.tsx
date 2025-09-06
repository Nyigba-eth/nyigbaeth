'use client'

import { useState, useEffect } from 'react'
import { Address } from 'viem'
import { getUserDisplayName, generateAvatar, cn } from '@/lib/utils'

interface UserDisplayProps {
  address: Address
  showAvatar?: boolean
  showTooltip?: boolean
  className?: string
  avatarSize?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'name-only' | 'address-only'
}

export function UserDisplay({ 
  address,
  showAvatar = true,
  showTooltip = true,
  className,
  avatarSize = 'md',
  variant = 'full'
}: UserDisplayProps) {
  const [nyigbaName, setNyigbaName] = useState<string | null>(null)
  const loading = false

  // Simulate Nyigba name resolution
  useEffect(() => {
    const knownMappings: Record<string, string> = {
      '0x742d35cc6634c0532925a3b8d431e8b457e7e890': 'kwame.nyigba.eth',
      '0x8ba1f109551bd432803012645hac136c2b7acd1f': 'ama.nyigba.eth', 
      '0x9fb9832e1234567890a1234567890a1234567890': 'kofi.nyigba.eth',
    }
    
    const resolvedName = knownMappings[address?.toLowerCase() || '']
    setNyigbaName(resolvedName || null)
  }, [address])
  
  const { displayName, isNyigbaName, shortAddress } = getUserDisplayName(address, nyigbaName)
  
  const avatarSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const renderContent = () => {
    if (variant === 'address-only') {
      return <span className={textSizes[avatarSize]}>{shortAddress}</span>
    }

    if (variant === 'name-only') {
      return (
        <span className={cn(textSizes[avatarSize], isNyigbaName && 'text-primary-600 font-medium')}>
          {loading ? shortAddress : displayName}
        </span>
      )
    }

    // Full variant
    return (
      <div className="flex flex-col">
        <span className={cn(textSizes[avatarSize], isNyigbaName && 'text-primary-600 font-medium')}>
          {loading ? shortAddress : displayName}
        </span>
        {isNyigbaName && (
          <span className="text-xs text-gray-500">{shortAddress}</span>
        )}
      </div>
    )
  }

  const content = (
    <div className={cn('flex items-center space-x-2', className)}>
      {showAvatar && (
        <img
          src={generateAvatar(address)}
          alt={`Avatar for ${displayName}`}
          className={cn('rounded-full', avatarSizes[avatarSize])}
        />
      )}
      {renderContent()}
    </div>
  )

  if (showTooltip && isNyigbaName) {
    return (
      <div className="group relative">
        {content}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {shortAddress}
        </div>
      </div>
    )
  }

  return content
}
