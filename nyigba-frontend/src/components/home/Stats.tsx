'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Palette, Coins } from 'lucide-react'

const stats = [
  {
    icon: Palette,
    label: 'Cultural NFTs Minted',
    value: '2,547',
    change: '+12%',
    changeType: 'positive',
    description: 'Unique cultural heritage pieces preserved onchain'
  },
  {
    icon: Users,
    label: 'Active Artists',
    value: '456',
    change: '+8%',
    changeType: 'positive',
    description: 'Verified cultural creators from across Africa'
  },
  {
    icon: Coins,
    label: 'Total Volume',
    value: '1,234 ETH',
    change: '+23%',
    changeType: 'positive',
    description: 'Total trading volume across all collections'
  },
  {
    icon: TrendingUp,
    label: 'Royalties Paid',
    value: '156.7 ETH',
    change: '+31%',
    changeType: 'positive',
    description: 'Lifetime royalties paid to creators'
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

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
}

export function Stats() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4"
          >
            Growing <span className="gradient-text">Cultural Impact</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Join a thriving ecosystem where African culture meets Web3 innovation
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 p-3 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Value */}
              <div className="mb-2">
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {stat.label}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 mb-2">15</div>
            <div className="text-sm text-gray-600">African Countries</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary-600 mb-2">8</div>
            <div className="text-sm text-gray-600">Languages Preserved</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent-600 mb-2">25</div>
            <div className="text-sm text-gray-600">Cultural Categories</div>
          </div>
        </motion.div>

        {/* Live activity indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-800 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Live: 23 active creators online</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
