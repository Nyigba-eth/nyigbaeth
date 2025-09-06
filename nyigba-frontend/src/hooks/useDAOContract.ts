'use client'

import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { ARTIST_REGISTRY_ABI, GOVERNOR_ABI, VOTING_TOKEN_ABI } from '@/lib/abis'
import { toast } from 'react-hot-toast'
import { useAccount } from 'wagmi'

export function useDAOContract() {
  const { address } = useAccount()

  // Artist Registry Functions
  const { data: isArtist, refetch: refetchIsArtist } = useContractRead({
    address: CONTRACT_ADDRESSES.artistRegistry,
    abi: ARTIST_REGISTRY_ABI,
    functionName: 'isArtist',
    args: [address!],
    enabled: Boolean(address),
  })

  const { write: requestArtistRole, isLoading: isRequestingArtist } = useContractWrite({
    address: CONTRACT_ADDRESSES.artistRegistry,
    abi: ARTIST_REGISTRY_ABI,
    functionName: 'requestArtistRole',
    onSuccess() {
      toast.success('Artist role requested! Waiting for DAO approval.')
    },
    onError(error) {
      console.error('Error requesting artist role:', error)
      toast.error('Failed to request artist role')
    }
  })

  const { write: approveArtist, isLoading: isApprovingArtist } = useContractWrite({
    address: CONTRACT_ADDRESSES.artistRegistry,
    abi: ARTIST_REGISTRY_ABI,
    functionName: 'approveArtist',
    onSuccess() {
      toast.success('Artist approved successfully!')
      refetchIsArtist()
    },
    onError(error) {
      console.error('Error approving artist:', error)
      toast.error('Failed to approve artist')
    }
  })

  // Voting Token Functions
  const { data: votingBalance } = useContractRead({
    address: CONTRACT_ADDRESSES.votingToken,
    abi: VOTING_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address!],
    enabled: Boolean(address),
  })

  const { data: votingPower } = useContractRead({
    address: CONTRACT_ADDRESSES.votingToken,
    abi: VOTING_TOKEN_ABI,
    functionName: 'getVotes',
    args: [address!],
    enabled: Boolean(address),
  })

  const { write: delegateVotes, isLoading: isDelegating } = useContractWrite({
    address: CONTRACT_ADDRESSES.votingToken,
    abi: VOTING_TOKEN_ABI,
    functionName: 'delegate',
    onSuccess() {
      toast.success('Voting power delegated successfully!')
    },
    onError(error) {
      console.error('Error delegating votes:', error)
      toast.error('Failed to delegate voting power')
    }
  })

  // Governor Functions
  const { write: propose, isLoading: isProposing } = useContractWrite({
    address: CONTRACT_ADDRESSES.governor,
    abi: GOVERNOR_ABI,
    functionName: 'propose',
    onSuccess() {
      toast.success('Proposal created successfully!')
    },
    onError(error) {
      console.error('Error creating proposal:', error)
      toast.error('Failed to create proposal')
    }
  })

  const { write: castVote, isLoading: isVoting } = useContractWrite({
    address: CONTRACT_ADDRESSES.governor,
    abi: GOVERNOR_ABI,
    functionName: 'castVote',
    onSuccess() {
      toast.success('Vote cast successfully!')
    },
    onError(error) {
      console.error('Error casting vote:', error)
      toast.error('Failed to cast vote')
    }
  })

  const useProposalState = (proposalId: string) => {
    return useContractRead({
      address: CONTRACT_ADDRESSES.governor,
      abi: GOVERNOR_ABI,
      functionName: 'state',
      args: [BigInt(proposalId)],
      enabled: Boolean(proposalId),
    })
  }

  const useProposalVotes = (proposalId: string) => {
    return useContractRead({
      address: CONTRACT_ADDRESSES.governor,
      abi: GOVERNOR_ABI,
      functionName: 'proposalVotes',
      args: [BigInt(proposalId)],
      enabled: Boolean(proposalId),
    })
  }

  // Helper functions
  const createArtistApprovalProposal = (artistAddress: string, description: string) => {
    const targets = [CONTRACT_ADDRESSES.artistRegistry]
    const values = [BigInt(0)]
    const calldatas = [
      // Encode the approveArtist function call
      `0x${artistAddress.slice(2).padStart(64, '0')}` // Simple encoding for demo
    ]
    const signatures = ['approveArtist(address)']

    propose({
      args: [targets, values, signatures, calldatas, description] as any
    })
  }

  const voteOnProposal = (proposalId: string, support: 0 | 1 | 2) => {
    // 0 = Against, 1 = For, 2 = Abstain
    castVote({
      args: [BigInt(proposalId), support]
    })
  }

  const delegateToSelf = () => {
    if (address) {
      delegateVotes({
        args: [address]
      })
    }
  }

  return {
    // Artist Registry
    isArtist: Boolean(isArtist),
    requestArtistRole,
    isRequestingArtist,
    approveArtist,
    isApprovingArtist,
    
    // Voting Token
    votingBalance: votingBalance ? votingBalance.toString() : '0',
    votingPower: votingPower ? votingPower.toString() : '0',
    delegateVotes,
    isDelegating,
    delegateToSelf,
    
    // Governor
    propose,
    isProposing,
    castVote,
    isVoting,
    useProposalState,
    useProposalVotes,
    
    // Helper functions
    createArtistApprovalProposal,
    voteOnProposal,
  }
}
