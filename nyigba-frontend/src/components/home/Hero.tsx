'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { UserDisplay } from '@/components/ui/UserDisplay'
import { useAccount } from 'wagmi'

const culturalItems = [
  'Folklore Stories',
  'Traditional Music',
  'African Art',
  'Oral Histories',
  'Cultural Recipes',
  'Traditional Dances',
]

export function Hero() {
  const [currentItem, setCurrentItem] = useState(0)
  const { isConnected } = useAccount()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItem((prev) => (prev + 1) % culturalItems.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 mesh-gradient animate-mesh"></div>
      <div className="absolute inset-0 african-pattern opacity-30 dark:opacity-20"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-60"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: typeof window !== 'undefined' ? window.innerHeight + 50 : 800,
              rotate: 0 
            }}
            animate={{ 
              y: -50,
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              rotate: 360 
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
          />
        ))}
      </div>

      {/* Glowing Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary-400/20 rounded-full blur-xl animate-pulse-glow"></div>
      <div className="absolute bottom-32 right-20 w-48 h-48 bg-secondary-400/20 rounded-full blur-xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent-400/20 rounded-full blur-xl animate-pulse-glow" style={{ animationDelay: '4s' }}></div>

      {/* Background decoration */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 bg-primary-200 rounded-full opacity-20" 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-24 h-24 bg-secondary-200 rounded-full opacity-20"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent-200 rounded-full opacity-20"
          animate={{ 
            y: [-10, 10, -10],
            x: [-5, 5, -5]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium px-3 py-1 rounded-full">
                <Sparkles className="w-4 h-4" />
                <span>Preserving Heritage Onchain</span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6"
            >
              Preserve{' '}
              <span className="relative">
                <span className="gradient-text">African</span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-primary-300 to-secondary-300 dark:from-primary-600 dark:to-secondary-600 rounded-full opacity-30"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </span>
              <br />
              Culture Forever
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0"
            >
              <span>Tokenize and preserve </span>
              <motion.span
                key={currentItem}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="font-semibold text-primary-600 dark:text-primary-400"
              >
                {culturalItems[currentItem]}
              </motion.span>
              <span> with Web3 technology. Own your heritage, earn royalties, govern collectively.</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href={isConnected ? "/marketplace" : "#"}>
                <Button size="lg" className="group">
                  {isConnected ? "Explore Marketplace" : "Connect Wallet to Start"}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link href="/about">
                <Button variant="outline" size="lg" className="group">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 pt-8 border-t border-gray-200"
            >
              <div className="grid grid-cols-3 gap-8 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold text-gray-900">2.5K+</div>
                  <div className="text-sm text-gray-600">Cultural NFTs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">450+</div>
                  <div className="text-sm text-gray-600">Artists</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">15</div>
                  <div className="text-sm text-gray-600">Countries</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Visual */}
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Main card */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 mx-auto max-w-md">
                <div className="aspect-square bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400 rounded-xl mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <h3 className="font-semibold text-gray-900 text-sm">Ananse Stories</h3>
                      <p className="text-xs text-gray-600">Ewe Folklore Collection</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">0.5 ETH</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Minted
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Created by</div>
                  <UserDisplay 
                    address="0x742d35Cc6634C0532925a3b8D431e8b457e7e890"
                    variant="name-only"
                    showAvatar={true}
                    avatarSize="sm"
                    className="flex items-center justify-center space-x-2 font-semibold"
                  />
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-secondary-500 text-white p-3 rounded-xl shadow-lg"
              >
                <span className="text-sm font-semibold">+15% Royalties</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute -bottom-4 -left-4 bg-accent-500 text-white p-3 rounded-xl shadow-lg"
              >
                <span className="text-sm font-semibold">Verified Heritage</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
