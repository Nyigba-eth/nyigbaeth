'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, Play, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UserDisplay } from '@/components/ui/UserDisplay'

// Mock data for featured NFTs
const featuredNFTs = [
  {
    id: '1',
    name: 'Ananse and the Wisdom Pot',
    description: 'Traditional Akan folklore about how wisdom came to be scattered across the world',
    image: '/api/placeholder/400/400',
    creator: 'kwame.nyigba.eth',
    creatorAddress: '0x742d35Cc6634C0532925a3b8D431e8b457e7e890' as const,
    price: '0.5 ETH',
    category: 'Folklore',
    origin: 'Akan',
    hasAudio: true,
    likes: 24
  },
  {
    id: '2',
    name: 'Adowa Dance Sequence',
    description: 'Traditional Ashanti ceremonial dance preserved in digital art',
    image: '/api/placeholder/400/400',
    creator: 'ama.nyigba.eth',
    creatorAddress: '0x8ba1f109551bD432803012645Hac136c2b7ACD1F' as const,
    price: '0.8 ETH',
    category: 'Dance',
    origin: 'Ashanti',
    hasAudio: false,
    likes: 31
  },
  {
    id: '3',
    name: 'Kente Pattern Stories',
    description: 'The symbolic meanings behind traditional Kente cloth patterns',
    image: '/api/placeholder/400/400',
    creator: 'kofi.nyigba.eth',
    creatorAddress: '0x9Fb9832e1234567890A1234567890A1234567890' as const,
    price: '1.2 ETH',
    category: 'Textiles',
    origin: 'Ewe',
    hasAudio: false,
    likes: 18
  },
  {
    id: '4',
    name: 'Griot Songs of Mali',
    description: 'Ancient praise songs and historical narratives from West African griots',
    image: '/api/placeholder/400/400',
    creator: 'amadou.nyigba.eth',
    price: '0.7 ETH',
    category: 'Music',
    origin: 'Mandinka',
    hasAudio: true,
    likes: 42
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
}

function NFTCard({ nft }: { nft: typeof featuredNFTs[0] }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
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

          {/* Like button */}
          <div className="absolute top-3 right-3">
            <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30 transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>

          {/* Category badge */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-2 py-1 rounded-full">
              {nft.category}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Title and description */}
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {nft.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {nft.description}
        </p>

        {/* Creator and origin */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Created by</div>
            <UserDisplay 
              address={nft.creatorAddress || '0x0000000000000000000000000000000000000000'}
              variant="name-only"
              showAvatar={false}
              avatarSize="sm"
              className="text-sm font-medium text-gray-900"
            />
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">Origin</div>
            <div className="text-sm font-medium text-gray-900">{nft.origin}</div>
          </div>
        </div>

        {/* Price and likes */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">Price</div>
            <div className="font-semibold text-gray-900">{nft.price}</div>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{nft.likes}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function RecentNFTs() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4"
            >
              Featured <span className="gradient-text">Cultural Heritage</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600"
            >
              Discover and collect authentic African cultural heritage
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="hidden sm:block"
          >
            <Link href="/marketplace">
              <Button variant="outline" className="group">
                View All
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredNFTs.map((nft) => (
            <Link key={nft.id} href={`/nft/${nft.id}`}>
              <NFTCard nft={nft} />
            </Link>
          ))}
        </motion.div>

        {/* Mobile view all button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-8 text-center sm:hidden"
        >
          <Link href="/marketplace">
            <Button variant="outline" className="group">
              View All NFTs
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-4">
              Share Your Cultural Heritage
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Have traditional stories, art, or music to preserve? Join our community 
              of cultural creators and help preserve African heritage for future generations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apply">
                <Button size="lg" className="group">
                  Apply as Artist
                  <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/learn">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
