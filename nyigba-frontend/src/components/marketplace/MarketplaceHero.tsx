'use client'

import { motion } from 'framer-motion'
import { Search, Filter, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function MarketplaceHero() {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 sm:py-24 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 particle-background"></div>
      
      {/* Floating Geometric Shapes */}
      <motion.div
        className="absolute top-20 left-20 w-16 h-16 border-2 border-primary-300 rounded-lg opacity-40"
        animate={{ 
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-12 h-12 bg-secondary-300 rounded-full opacity-40"
        animate={{ 
          y: [-10, 10, -10],
          x: [-5, 5, -5]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-10 w-8 h-8 bg-accent-300 rounded-sm opacity-40"
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6"
          >
            Cultural Heritage <span className="gradient-text">Marketplace</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12"
          >
            Discover, collect, and preserve authentic African cultural heritage. 
            Each NFT tells a story, preserves tradition, and supports creators.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for folklore, art, music, or artist names..."
                className="pl-12 pr-4 py-4 text-lg"
              />
              <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                Search
              </Button>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">2,547</div>
              <div className="text-sm text-gray-600">NFTs Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">456</div>
              <div className="text-sm text-gray-600">Active Artists</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">1.2K ETH</div>
              <div className="text-sm text-gray-600">Total Volume</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
