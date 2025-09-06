'use client'

import { useState } from 'react'
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { NYIGBA_NFT_ABI } from '@/lib/abis'
import { uploadNFT } from '@/lib/ipfs'
import { MintFormData, NFTMetadata } from '@/types'
import { toast } from 'react-hot-toast'

export function useNFTContract() {
  const [isMinting, setIsMinting] = useState(false)

  // Get total supply
  const { data: totalSupply, refetch: refetchTotalSupply } = useContractRead({
    address: CONTRACT_ADDRESSES.nyigbaNFT,
    abi: NYIGBA_NFT_ABI,
    functionName: 'totalSupply',
  })

  // Get token URI
  const useTokenURI = (tokenId: string) => {
    return useContractRead({
      address: CONTRACT_ADDRESSES.nyigbaNFT,
      abi: NYIGBA_NFT_ABI,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
      enabled: Boolean(tokenId),
    })
  }

  // Get royalty info
  const useRoyaltyInfo = (tokenId: string, salePrice: string) => {
    return useContractRead({
      address: CONTRACT_ADDRESSES.nyigbaNFT,
      abi: NYIGBA_NFT_ABI,
      functionName: 'royaltyInfo',
      args: [BigInt(tokenId), BigInt(salePrice)],
      enabled: Boolean(tokenId && salePrice),
    })
  }

  // Mint NFT
  const { data: mintData, write: mintNFT, isLoading: isMintWriteLoading } = useContractWrite({
    address: CONTRACT_ADDRESSES.nyigbaNFT,
    abi: NYIGBA_NFT_ABI,
    functionName: 'mintTo',
    onSuccess() {
      toast.success('NFT minted successfully!')
      refetchTotalSupply()
    },
    onError(error) {
      console.error('Error minting NFT:', error)
      toast.error('Failed to mint NFT')
      setIsMinting(false)
    }
  })

  const { isLoading: isMintWaiting } = useWaitForTransaction({
    hash: mintData?.hash,
    onSuccess() {
      setIsMinting(false)
    }
  })

  // Create and mint NFT with metadata upload
  const createNFT = async (data: MintFormData, creatorAddress: string) => {
    if (!data.image) {
      throw new Error('Image is required')
    }

    setIsMinting(true)
    
    try {
      // Create metadata object
      const metadata: Omit<NFTMetadata, 'image' | 'audio'> = {
        name: data.name,
        description: data.description,
        attributes: [
          { trait_type: 'Origin', value: data.attributes.origin },
          { trait_type: 'Language', value: data.attributes.language },
          { trait_type: 'Category', value: data.attributes.category },
          ...(data.attributes.era ? [{ trait_type: 'Era', value: data.attributes.era }] : []),
        ],
        external_url: `${process.env.NEXT_PUBLIC_APP_URL}/nft/`, // Will be completed with token ID
      }

      // Upload to IPFS
      const metadataURI = await uploadNFT(
        data.image,
        data.audio || null,
        metadata
      )

      // Mint NFT
      mintNFT({
        args: [creatorAddress as `0x${string}`, metadataURI]
      })

    } catch (error) {
      console.error('Error creating NFT:', error)
      toast.error('Failed to upload NFT metadata')
      setIsMinting(false)
      throw error
    }
  }

  return {
    totalSupply,
    useTokenURI,
    useRoyaltyInfo,
    createNFT,
    isMinting: isMinting || isMintWriteLoading || isMintWaiting,
    refetchTotalSupply,
  }
}
