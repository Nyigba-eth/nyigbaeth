'use client'

import { motion } from 'framer-motion'
import { 
  Coins, 
  TrendingUp, 
  Download,
  PieChart,
  Calendar,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

const treasuryData = {
  balance: {
    eth: '156.7',
    usd: '$387,450'
  },
  monthlyIncome: {
    eth: '12.3',
    usd: '$30,420'
  },
  totalDistributed: {
    eth: '89.4',
    usd: '$220,680'
  },
  memberCount: 1247,
  lastDistribution: new Date('2024-01-01'),
  nextDistribution: new Date('2024-02-01')
}

const recentTransactions = [
  {
    id: '1',
    type: 'Royalty Income',
    amount: '2.3 ETH',
    date: new Date('2024-01-15'),
    source: 'NFT Sales'
  },
  {
    id: '2',
    type: 'Member Distribution',
    amount: '45.6 ETH',
    date: new Date('2024-01-01'),
    source: 'Monthly Rewards'
  },
  {
    id: '3',
    type: 'Grant Payment',
    amount: '10.0 ETH',
    date: new Date('2023-12-28'),
    source: 'Cultural Initiative'
  },
  {
    id: '4',
    type: 'Royalty Income',
    amount: '1.8 ETH',
    date: new Date('2023-12-25'),
    source: 'NFT Sales'
  }
]

const fundingBreakdown = [
  { category: 'NFT Royalties', percentage: 65, amount: '101.9 ETH' },
  { category: 'Primary Sales', percentage: 25, amount: '39.2 ETH' },
  { category: 'Grants', percentage: 7, amount: '11.0 ETH' },
  { category: 'Other', percentage: 3, amount: '4.6 ETH' }
]

export function TreasuryStats() {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const timeUntilNext = () => {
    const now = new Date()
    const diff = treasuryData.nextDistribution.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} days` : 'Soon'
  }

  return (
    <div className="space-y-6">
      {/* Treasury Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-primary-100 text-primary-600 p-2 rounded-lg">
            <Coins className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Treasury Balance</h3>
        </div>
        
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {treasuryData.balance.eth} ETH
          </div>
          <div className="text-lg text-gray-600">
            {treasuryData.balance.usd}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 mb-1">Monthly Income</div>
            <div className="font-semibold text-green-800">
              +{treasuryData.monthlyIncome.eth} ETH
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 mb-1">Total Distributed</div>
            <div className="font-semibold text-blue-800">
              {treasuryData.totalDistributed.eth} ETH
            </div>
          </div>
        </div>

        <Button className="w-full" size="sm">
          View Full Treasury
        </Button>
      </motion.div>

      {/* Next Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-secondary-100 text-secondary-600 p-2 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Member Rewards</h3>
        </div>

        <div className="space-y-4">
          <div className="text-center p-4 bg-gradient-to-br from-secondary-50 to-accent-50 rounded-xl">
            <div className="text-sm text-gray-600 mb-1">Next Distribution</div>
            <div className="text-xl font-bold text-gray-900 mb-1">
              {formatDate(treasuryData.nextDistribution)}
            </div>
            <div className="text-sm text-secondary-600">
              in {timeUntilNext()}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Eligible Members</span>
            <span className="font-medium text-gray-900">{treasuryData.memberCount.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Est. Per Member</span>
            <span className="font-medium text-gray-900">
              ~{(parseFloat(treasuryData.monthlyIncome.eth) / treasuryData.memberCount).toFixed(4)} ETH
            </span>
          </div>

          <Button variant="outline" className="w-full" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Claim Rewards
          </Button>
        </div>
      </motion.div>

      {/* Funding Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-accent-100 text-accent-600 p-2 rounded-lg">
            <PieChart className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Funding Sources</h3>
        </div>

        <div className="space-y-3">
          {fundingBreakdown.map((item, index) => (
            <div key={item.category}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">{item.category}</span>
                <span className="font-medium text-gray-900">{item.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.amount}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gray-100 text-gray-600 p-2 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>

        <div className="space-y-3">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900 text-sm">{tx.type}</div>
                <div className="text-xs text-gray-500">{tx.source}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 text-sm">{tx.amount}</div>
                <div className="text-xs text-gray-500">{formatDate(tx.date)}</div>
              </div>
            </div>
          ))}
        </div>

        <Button variant="ghost" className="w-full mt-4" size="sm">
          View All Transactions
        </Button>
      </motion.div>
    </div>
  )
}
