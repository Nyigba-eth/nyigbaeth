'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  Users, 
  Coins, 
  Globe, 
  Zap, 
  Heart,
  Database,
  Vote
} from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'ENS Identity',
    description: 'Get your unique .nyigba.eth subdomain and establish your digital cultural identity onchain.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Database,
    title: 'Permanent Storage',
    description: 'Your cultural heritage is stored permanently on IPFS and Filecoin for future generations.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Coins,
    title: 'Automatic Royalties',
    description: 'Creators earn royalties on secondary sales, ensuring sustainable cultural preservation.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Vote,
    title: 'DAO Governance',
    description: 'Community members vote on important decisions and cultural initiatives.',
    color: 'from-red-500 to-orange-500'
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Share your culture with the world through our decentralized platform.',
    color: 'from-yellow-500 to-amber-500'
  },
  {
    icon: Heart,
    title: 'Community Treasury',
    description: 'A portion of all sales goes to the community treasury for cultural initiatives.',
    color: 'from-indigo-500 to-purple-500'
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
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6
    }
  }
}

export function Features() {
  return (
    <section className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 particle-background"></div>
      <div className="absolute inset-0 floating-shapes opacity-40 dark:opacity-20"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500"></div>
      
      {/* Animated Geometric Shapes */}
      <motion.div
        className="absolute top-20 right-10 w-20 h-20 border-2 border-primary-300 rounded-lg opacity-30"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-16 h-16 bg-secondary-200 rounded-full opacity-30"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4"
          >
            Preserve Culture with{' '}
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent">
              Web3 Technology
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          >
            Nyigba.eth empowers African communities to preserve, share, and monetize their cultural heritage 
            through blockchain technology and decentralized storage.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Animated Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Icon with animated background */}
                <motion.div
                  className={`relative inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>

                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                     style={{ mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }}></div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
