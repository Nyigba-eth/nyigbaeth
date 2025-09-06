'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-primary-200 border-t-primary-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

interface LogoLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LogoLoader({ size = 'md', text, className = '' }: LogoLoaderProps) {
  const sizeClasses = {
    sm: { width: 48, height: 48 },
    md: { width: 72, height: 72 },
    lg: { width: 96, height: 96 }
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/images/nyigba-logo.svg"
            alt="Loading..."
            width={sizeClasses[size].width}
            height={sizeClasses[size].height}
            className="drop-shadow-lg"
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 border-2 border-primary-500/30 rounded-full border-t-primary-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {text && (
        <motion.p
          className="text-sm text-gray-600 dark:text-gray-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

interface PulseLoaderProps {
  className?: string
}

export function PulseLoader({ className = '' }: PulseLoaderProps) {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-3 h-3 bg-primary-600 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  )
}

interface WaveLoaderProps {
  className?: string
}

export function WaveLoader({ className = '' }: WaveLoaderProps) {
  return (
    <div className={`flex items-end space-x-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className="w-2 bg-primary-600 rounded-t"
          animate={{
            height: ["8px", "24px", "8px"]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className="bg-gray-200 rounded mb-2 last:mb-0"
          style={{ height: '1rem' }}
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.1
          }}
        />
      ))}
    </div>
  )
}

interface AnimatedBackgroundProps {
  children: React.ReactNode
  variant?: 'mesh' | 'particles' | 'waves' | 'geometric'
  className?: string
}

export function AnimatedBackground({ 
  children, 
  variant = 'mesh', 
  className = '' 
}: AnimatedBackgroundProps) {
  const variants = {
    mesh: 'mesh-gradient animate-mesh',
    particles: 'particle-background',
    waves: 'animated-gradient',
    geometric: 'floating-shapes african-pattern'
  }

  return (
    <div className={`relative ${className}`}>
      <div className={`absolute inset-0 ${variants[variant]} opacity-30 pointer-events-none`}></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
