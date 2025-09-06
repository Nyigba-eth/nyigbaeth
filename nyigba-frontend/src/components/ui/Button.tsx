'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', animated = true, children, ...props }, ref) => {
    if (animated) {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
            {
              'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 hover:shadow-lg hover:shadow-primary-500/25': variant === 'primary',
              'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-400 hover:shadow-lg hover:shadow-secondary-500/25': variant === 'secondary',
              'border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus-visible:ring-primary-500 hover:shadow-lg': variant === 'outline',
              'text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500': variant === 'ghost',
            },
            {
              'h-8 px-3 text-sm': size === 'sm',
              'h-10 px-4 text-sm': size === 'md',
              'h-12 px-6 text-base': size === 'lg',
            },
            className
          )}
          ref={ref}
          type="button"
          {...(props as any)}
        >
          {(variant === 'primary' || variant === 'secondary') && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{children}</span>
        </motion.button>
      )
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500': variant === 'primary',
            'bg-secondary-500 text-white hover:bg-secondary-600 focus-visible:ring-secondary-400': variant === 'secondary',
            'border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white focus-visible:ring-primary-500': variant === 'outline',
            'text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500': variant === 'ghost',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
