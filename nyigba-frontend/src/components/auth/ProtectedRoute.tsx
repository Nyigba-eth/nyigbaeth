'use client'

import { ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { AlertCircle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: ReactNode
  requireArtist?: boolean
}

export function ProtectedRoute({ children, requireArtist = false }: ProtectedRouteProps) {
  const { isConnected, address } = useAccount()
  
  // TODO: Check if user is an approved artist from contract
  const isArtist = true // Placeholder - should check ArtistRegistry contract

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-6">
            You need to connect your wallet to access this feature.
          </p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  if (requireArtist && !isArtist) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Artist Verification Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be a verified artist to create NFTs. Apply for artist status 
            and get approved by the DAO community.
          </p>
          <Link href="/apply">
            <Button className="w-full">
              Apply as Artist
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
