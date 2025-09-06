'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, Play, ExternalLink, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UserDisplay } from '@/components/ui/UserDisplay'

// This component will fetch NFT data from blockchain instead of using mock data
// TODO: Implement blockchain NFT fetching
const blockchainNFTs: any[] = []; // Empty until blockchain implementation is ready

export function NFTGrid() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Calculate pagination
  const totalPages = Math.ceil(blockchainNFTs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentNFTs = blockchainNFTs.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {blockchainNFTs.length} Cultural NFTs
          </h2>
          <p className="text-gray-600">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, blockchainNFTs.length)} of {blockchainNFTs.length}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* NFT Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentNFTs.map((nft, index) => (
            <NFTCard key={nft.id} nft={nft} index={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {currentNFTs.map((nft, index) => (
            <NFTListItem key={nft.id} nft={nft} index={index} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

function NFTCard({ nft, index }: { nft: any, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <Link href={`/nft/${nft.id}`}>
        <div className="relative aspect-square overflow-hidden">
          {/* Placeholder for NFT image */}
          <div className="w-full h-full bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 relative">
            <div className="absolute inset-0 bg-black/10" />
            
            {/* Audio indicator */}
            {nft.hasAudio && (
              <div className="absolute top-3 left-3">
                <div className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-lg">
                  <Play className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Category badge */}
            <div className="absolute bottom-3 left-3">
              <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-2 py-1 rounded-full">
                {nft.category}
              </span>
            </div>

            {/* Like button */}
            <div className="absolute top-3 right-3">
              <button 
                className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Handle like
                }}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
            {nft.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {nft.description}
          </p>

          {/* Metadata */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Creator</span>
              <UserDisplay 
                address={nft.creatorAddress}
                variant="name-only"
                showAvatar={false}
                avatarSize="sm"
                className="text-gray-900 font-medium"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Origin</span>
              <span className="font-medium text-gray-900">{nft.origin}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Language</span>
              <span className="font-medium text-gray-900">{nft.language}</span>
            </div>
          </div>

          {/* Price and stats */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">{nft.price}</div>
              <div className="text-xs text-gray-500">{nft.priceUSD}</div>
            </div>
            <div className="flex items-center space-x-4 text-gray-500">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{nft.likes}</span>
              </div>
              <div className="text-sm">{nft.views} views</div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function NFTListItem({ nft, index }: { nft: typeof mockNFTs[0], index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300"
    >
      <Link href={`/nft/${nft.id}`} className="block">
        <div className="flex items-center space-x-6">
          {/* Thumbnail */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 rounded-xl flex-shrink-0 relative">
            <div className="absolute inset-0 bg-black/10 rounded-xl" />
            {nft.hasAudio && (
              <div className="absolute top-1 right-1">
                <div className="bg-black/50 backdrop-blur-sm text-white p-1 rounded">
                  <Play className="w-2 h-2" />
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{nft.name}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">{nft.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{nft.creator}</span>
                  <span>•</span>
                  <span>{nft.origin}</span>
                  <span>•</span>
                  <span>{nft.category}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-4">
                <div className="font-semibold text-gray-900">{nft.price}</div>
                <div className="text-xs text-gray-500">{nft.priceUSD}</div>
                <div className="flex items-center justify-end space-x-3 mt-2 text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span className="text-xs">{nft.likes}</span>
                  </div>
                  <div className="text-xs">{nft.views} views</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
