import { NFTStorage, File as NFTFile } from 'nft.storage'
import { NFT_STORAGE_TOKEN } from './config'
import { NFTMetadata } from '@/types'

// Initialize NFT.Storage client
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

/**
 * Upload a file to IPFS via NFT.Storage
 */
export async function uploadFile(file: File): Promise<string> {
  try {
    const nftFile = new NFTFile([file], file.name, { type: file.type })
    const cid = await client.storeBlob(nftFile)
    return `ipfs://${cid}`
  } catch (error) {
    console.error('Error uploading file to IPFS:', error)
    throw new Error('Failed to upload file to IPFS')
  }
}

/**
 * Upload JSON metadata to IPFS
 */
export async function uploadJSON(data: NFTMetadata): Promise<string> {
  try {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    const file = new NFTFile([blob], 'metadata.json', { type: 'application/json' })
    const cid = await client.storeBlob(file)
    return `ipfs://${cid}`
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error)
    throw new Error('Failed to upload metadata to IPFS')
  }
}

/**
 * Upload complete NFT (files + metadata) to IPFS
 */
export async function uploadNFT(
  image: File,
  audio: File | null,
  metadata: Omit<NFTMetadata, 'image' | 'audio'>
): Promise<string> {
  try {
    // Upload image
    const imageCID = await uploadFile(image)
    
    // Upload audio if provided
    let audioCID: string | undefined
    if (audio) {
      audioCID = await uploadFile(audio)
    }

    // Create complete metadata
    const completeMetadata: NFTMetadata = {
      ...metadata,
      image: imageCID,
      ...(audioCID && { audio: audioCID }),
    }

    // Upload metadata
    return await uploadJSON(completeMetadata)
  } catch (error) {
    console.error('Error uploading NFT to IPFS:', error)
    throw new Error('Failed to upload NFT to IPFS')
  }
}

/**
 * Retrieve file from IPFS
 */
export async function getFile(cid: string): Promise<File> {
  try {
    const response = await fetch(resolveIPFS(cid))
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const blob = await response.blob()
    return new File([blob], 'file', { type: blob.type })
  } catch (error) {
    console.error('Error fetching file from IPFS:', error)
    throw new Error('Failed to fetch file from IPFS')
  }
}

/**
 * Retrieve JSON from IPFS
 */
export async function getJSON(cid: string): Promise<any> {
  try {
    const response = await fetch(resolveIPFS(cid))
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching JSON from IPFS:', error)
    throw new Error('Failed to fetch JSON from IPFS')
  }
}

/**
 * Resolve IPFS URL to HTTP gateway URL
 */
export function resolveIPFS(ipfsUrl: string): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    const cid = ipfsUrl.replace('ipfs://', '')
    return `https://ipfs.io/ipfs/${cid}`
  }
  return ipfsUrl
}

/**
 * Get multiple IPFS gateway URLs for a CID (for redundancy)
 */
export function getIPFSGateways(cid: string): string[] {
  const cleanCID = cid.replace('ipfs://', '')
  return [
    `https://ipfs.io/ipfs/${cleanCID}`,
    `https://gateway.ipfs.io/ipfs/${cleanCID}`,
    `https://cloudflare-ipfs.com/ipfs/${cleanCID}`,
  ]
}

/**
 * Check if URL is an IPFS URL
 */
export function isIPFSUrl(url: string): boolean {
  return url.startsWith('ipfs://') || url.includes('/ipfs/')
}

/**
 * Extract CID from IPFS URL
 */
export function extractCID(ipfsUrl: string): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    return ipfsUrl.replace('ipfs://', '')
  }
  const ipfsMatch = ipfsUrl.match(/\/ipfs\/([a-zA-Z0-9]+)/)
  return ipfsMatch ? ipfsMatch[1] : ''
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, allowedTypes: string[], maxSize: number): void {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`)
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size ${file.size} exceeds maximum allowed size ${maxSize}`)
  }
}

/**
 * Get file info
 */
export function getFileInfo(file: File) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sizeFormatted: formatFileSize(file.size),
  }
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
