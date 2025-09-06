import { baseSepolia } from 'wagmi/chains'
import { Address } from 'viem'

// Network configuration
export const SUPPORTED_CHAIN = baseSepolia

// Contract addresses (update these with your deployed contracts)
export const CONTRACT_ADDRESSES = {
  nyigbaNames: '0x0000000000000000000000000000000000000000' as Address,
  nyigbaNFT: '0x0000000000000000000000000000000000000000' as Address,
  artistRegistry: '0x0000000000000000000000000000000000000000' as Address,
  governor: '0x0000000000000000000000000000000000000000' as Address,
  timelock: '0x0000000000000000000000000000000000000000' as Address,
  votingToken: '0x0000000000000000000000000000000000000000' as Address,
  treasuryRewards: '0x0000000000000000000000000000000000000000' as Address,
  royaltySplitterFactory: '0x0000000000000000000000000000000000000000' as Address,
} as const

// NFT.Storage configuration
export const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN || ''

// Application constants
export const APP_CONFIG = {
  name: 'Nyigba.eth',
  description: 'Preserving African heritage onchain, forever.',
  url: 'https://nyigba.eth',
  baseDomain: 'nyigba.eth',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  supportedAudioTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  defaultRoyaltyPercentage: 10, // 10%
  treasuryShare: 15, // 15% to treasury
  artistShare: 85, // 85% to artist
} as const

// Cultural origins and languages
export const CULTURAL_ORIGINS = [
  'Akan', 'Yoruba', 'Igbo', 'Hausa', 'Ewe', 'Ga', 'Dagbani', 'Twi',
  'Swahili', 'Amharic', 'Zulu', 'Xhosa', 'Shona', 'Oromo', 'Fulani',
  'Mandinka', 'Wolof', 'Kongo', 'Luba', 'Other'
] as const

export const LANGUAGES = [
  'English', 'Akan', 'Yoruba', 'Igbo', 'Hausa', 'Ewe', 'Ga', 'Dagbani',
  'Twi', 'Swahili', 'Amharic', 'Zulu', 'Xhosa', 'Shona', 'Oromo',
  'French', 'Arabic', 'Portuguese', 'Other'
] as const

export const NFT_CATEGORIES = [
  'Folklore', 'Traditional Music', 'Visual Art', 'Dance', 'Crafts',
  'Oral History', 'Proverbs', 'Ceremonies', 'Recipes', 'Games',
  'Textiles', 'Sculpture', 'Painting', 'Photography', 'Other'
] as const

// UI constants
export const ITEMS_PER_PAGE = 12
export const DEBOUNCE_DELAY = 300

// IPFS gateways
export const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
] as const

// Social media patterns
export const SOCIAL_PATTERNS = {
  twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
  website: /^https?:\/\/.+/,
  discord: /^https?:\/\/(www\.)?discord\.(gg|com)\/.+/,
} as const

// Error messages
export const ERROR_MESSAGES = {
  wallet: {
    notConnected: 'Please connect your wallet to continue',
    wrongNetwork: `Please switch to ${SUPPORTED_CHAIN.name}`,
    transactionFailed: 'Transaction failed. Please try again.',
    insufficientFunds: 'Insufficient funds for this transaction',
  },
  nft: {
    invalidFile: 'Please select a valid image or audio file',
    uploadFailed: 'Failed to upload file to IPFS',
    mintFailed: 'Failed to mint NFT. Please try again.',
    transferFailed: 'Failed to transfer NFT',
  },
  dao: {
    notMember: 'You must be a DAO member to perform this action',
    proposalFailed: 'Failed to create proposal',
    voteFailed: 'Failed to cast vote',
  },
  general: {
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
    unauthorized: 'You are not authorized to perform this action',
  },
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  nft: {
    minted: 'NFT minted successfully!',
    listed: 'NFT listed for sale successfully!',
    purchased: 'NFT purchased successfully!',
  },
  dao: {
    proposalCreated: 'Proposal created successfully!',
    voteSubmitted: 'Vote submitted successfully!',
    artistApproved: 'Artist application approved!',
  },
  ens: {
    nameClaimed: 'Nyigba name claimed successfully!',
    profileUpdated: 'Profile updated successfully!',
  },
} as const
