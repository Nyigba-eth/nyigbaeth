'use client'

import { motion } from 'framer-motion'
import { Users, Award, Globe, Sparkles } from 'lucide-react'

export function ArtistsHero() {
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center space-x-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 text-sm font-medium px-3 py-1 rounded-full">
              <Users className="w-4 h-4" />
              <span>Cultural Creators</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6"
          >
            Discover <span className="gradient-text">African Artists</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12"
          >
            Meet the talented creators preserving African heritage through digital art, 
            traditional stories, music, and cultural expressions on the blockchain.
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8 text-center"
          >
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">1,247+ Artists</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">567 Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">42 Countries</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">8,924 NFTs Created</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
