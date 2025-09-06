import { Address } from 'viem'

// Core types
export interface NyigbaName {
  id: string
  label: string
  owner: Address
  subdomain: string // e.g., "ama.nyigba.eth"
  textRecords: Record<string, string>
  createdAt: Date
}

export interface CulturalNFT {
  id: string
  tokenId: string
  name: string
  description: string
  image: string
  audio?: string
  animation_url?: string
  creator: Address
  creatorENS?: string
  owner: Address
  price?: string
  currency?: 'ETH' | 'USDC'
  attributes: NFTAttribute[]
  metadata: NFTMetadata
  royalties: RoyaltyInfo
  createdAt: Date
  lastSale?: Sale
}

export interface NFTAttribute {
  trait_type: string
  value: string
}

export interface NFTMetadata {
  name: string
  description: string
  image: string
  audio?: string
  animation_url?: string
  attributes: NFTAttribute[]
  external_url?: string
  background_color?: string
}

export interface RoyaltyInfo {
  receiver: Address
  percentage: number // basis points (e.g., 1000 = 10%)
}

export interface Sale {
  id: string
  tokenId: string
  buyer: Address
  seller: Address
  price: string
  currency: 'ETH' | 'USDC'
  timestamp: Date
  transactionHash: string
}

// Artist and DAO types
export interface Artist {
  address: Address
  ensName?: string
  nyigbaName?: string
  bio?: string
  origin?: string
  verified: boolean
  totalNFTs: number
  totalSales: string
  joinedAt: Date
  socialLinks?: SocialLinks
  avatar?: string
}

export interface SocialLinks {
  twitter?: string
  instagram?: string
  website?: string
  discord?: string
}

export interface ArtistApplication {
  id: string
  applicant: Address
  proposal: string
  portfolio?: string[]
  status: 'pending' | 'approved' | 'rejected'
  votes: Vote[]
  createdAt: Date
  decidedAt?: Date
}

export interface Vote {
  voter: Address
  support: boolean
  weight: string
  reason?: string
  timestamp: Date
}

// DAO types
export interface DAOProposal {
  id: string
  title: string
  description: string
  proposer: Address
  targets: Address[]
  values: string[]
  signatures: string[]
  calldatas: string[]
  startBlock: bigint
  endBlock: bigint
  forVotes: string
  againstVotes: string
  abstainVotes: string
  canceled: boolean
  executed: boolean
  state: ProposalState
  createdAt: Date
}

export enum ProposalState {
  Pending = 0,
  Active = 1,
  Canceled = 2,
  Defeated = 3,
  Succeeded = 4,
  Queued = 5,
  Expired = 6,
  Executed = 7
}

export interface DAOMember {
  address: Address
  votingPower: string
  delegatedTo?: Address
  joinedAt: Date
}

export interface TreasuryReward {
  epochId: string
  totalAmount: string
  currency: 'ETH' | 'USDC'
  perMemberAmount: string
  claimed: boolean
  eligibleMembers: Address[]
  distributedAt: Date
  claimDeadline: Date
}

// Collection and marketplace types
export interface Collection {
  id: string
  name: string
  description: string
  creator: Address
  contractAddress: Address
  totalSupply: number
  floorPrice?: string
  totalVolume: string
  nfts: CulturalNFT[]
  createdAt: Date
}

export interface MarketplaceStats {
  totalNFTs: number
  totalArtists: number
  totalVolume: string
  totalRoyaltiesPaid: string
  averagePrice: string
  activeListings: number
}

// UI and form types
export interface MintFormData {
  name: string
  description: string
  image: File | null
  audio?: File | null
  attributes: {
    origin: string
    language: string
    category: string
    era?: string
    [key: string]: string | undefined
  }
  royaltyPercentage: number
}

export interface FilterOptions {
  origin?: string[]
  language?: string[]
  category?: string[]
  priceRange?: [number, number]
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'most_popular'
}

// Blockchain interaction types
export interface ContractConfig {
  nyigbaNames: Address
  nyigbaNFT: Address
  artistRegistry: Address
  governor: Address
  timelock: Address
  votingToken: Address
  treasuryRewards: Address
  royaltySplitterFactory: Address
}

export interface Web3Storage {
  uploadFile: (file: File) => Promise<string>
  uploadJSON: (data: object) => Promise<string>
  getFile: (cid: string) => Promise<File>
  getJSON: (cid: string) => Promise<object>
}

// Error types
export interface APIError {
  message: string
  code?: string
  details?: any
}

// Event types for real-time updates
export interface BlockchainEvent {
  type: 'nft_minted' | 'name_claimed' | 'artist_approved' | 'proposal_created' | 'sale_completed'
  data: any
  blockNumber: bigint
  transactionHash: string
  timestamp: Date
}
