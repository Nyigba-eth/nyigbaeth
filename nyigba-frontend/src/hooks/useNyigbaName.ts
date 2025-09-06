'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import { CONTRACTS } from '@/lib/contracts'

interface UseNyigbaNameResult {
  name: string | null
  loading: boolean
  error: string | null
}

export function useNyigbaName(address?: Address): UseNyigbaNameResult {
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setName(null)
      setLoading(false)
      setError(null)
      return
    }

    const fetchName = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if we have the contract address
        if (!CONTRACTS.BASE_SEPOLIA_NYIGBA_NAMES) {
          setName(null)
          setLoading(false)
          return
        }

        // Implement actual blockchain reverse lookup from Nyigba Names contract
        try {
          const { ethers } = await import('ethers')
          const provider = new ethers.JsonRpcProvider('https://sepolia.base.org')
          
          // Simple Nyigba Names contract ABI for reverse lookup
          const nyigbaNameABI = [
            'function ownerToName(address owner) view returns (string)',
            'function nameToOwner(string name) view returns (address)',
            'function isNameTaken(string name) view returns (bool)'
          ]
          
          const contract = new ethers.Contract(
            CONTRACTS.BASE_SEPOLIA_NYIGBA_NAMES,
            nyigbaNameABI,
            provider
          )
          
          // Get the name associated with this address
          const resolvedName = await contract.ownerToName(address)
          
          if (resolvedName && resolvedName.trim() !== '') {
            setName(`${resolvedName}.nyigba.eth`)
          } else {
            setName(null)
          }
        } catch (contractError) {
          console.warn('Failed to resolve name from contract:', contractError)
          setName(null)
        }
      } catch (err) {
        console.error('Error fetching Nyigba name:', err)
        setError('Failed to resolve name')
        setName(null)
      } finally {
        setLoading(false)
      }
    }

    fetchName()
  }, [address])

  return { name, loading, error }
}

// Hook to get the current user's Nyigba name
export function useMyNyigbaName(): UseNyigbaNameResult {
  const { address } = useAccount()
  return useNyigbaName(address)
}

// Default export for compatibility
export default useNyigbaName
