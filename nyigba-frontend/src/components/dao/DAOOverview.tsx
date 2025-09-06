'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Vote, Coins, Gavel, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useDAO } from '@/hooks/useDAO'
import { useWallet } from '@/hooks/useWallet'

interface DaoStats {
  totalMembers: string;
  activeProposals: string;
  treasuryBalance: string;
  totalProposals: string;
}

export function DAOOverview() {
  const [daoStats, setDaoStats] = useState<DaoStats>({
    totalMembers: '1,247',
    activeProposals: '5',
    treasuryBalance: '156.7',
    totalProposals: '89'
  });

  const { getTreasuryStats, getAllProposals, getVotingPower } = useDAO();
  const { address, isConnected } = useWallet();

  useEffect(() => {
    loadDAOData();
  }, []);

  const loadDAOData = async () => {
    try {
      const [treasuryStats, proposals] = await Promise.all([
        getTreasuryStats(),
        getAllProposals()
      ]);

      const activeProposals = proposals.filter(p => !p.executed && !p.canceled);

      setDaoStats({
        totalMembers: '1,247', // Placeholder - would come from token holders count
        activeProposals: activeProposals.length.toString(),
        treasuryBalance: parseFloat(treasuryStats.balance).toFixed(1),
        totalProposals: proposals.length.toString()
      });
    } catch (err) {
      console.error('Error loading DAO data:', err);
    }
  };

  const stats = [
    {
      icon: Users,
      label: 'Total Members',
      value: daoStats.totalMembers,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      icon: Vote,
      label: 'Active Proposals',
      value: daoStats.activeProposals,
      change: '+2',
      changeType: 'neutral' as const
    },
    {
      icon: Coins,
      label: 'Treasury Balance',
      value: `${daoStats.treasuryBalance} ETH`,
      change: '+8.5%',
      changeType: 'positive' as const
    },
    {
      icon: Gavel,
      label: 'Total Proposals',
      value: daoStats.totalProposals,
      change: '+31%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">DAO Overview</h2>
          <p className="text-gray-600">
            Community-driven governance for cultural preservation
          </p>
        </div>
        <Button>Join DAO</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-gray-50 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 text-white p-2 rounded-lg">
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
            <div className="mt-2">
              <span className={`text-xs font-medium ${
                stat.changeType === 'positive' 
                  ? 'text-green-600' 
                  : stat.changeType === 'neutral'
                  ? 'text-gray-600'
                  : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500 ml-1">this month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Current Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Current Vote</h3>
          </div>
          <p className="text-blue-800 mb-4">
            Proposal #12: Approve Artist Application - Fatima Kone
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Yes: 67%</span>
              <span className="text-blue-700">No: 33%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }} />
            </div>
          </div>
          <div className="text-sm text-blue-700">
            <strong>2 days left</strong> • 456 votes cast
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Treasury Growth</h3>
          </div>
          <p className="text-green-800 mb-4">
            Monthly treasury earnings from royalties and fees
          </p>
          <div className="text-2xl font-bold text-green-900 mb-2">
            12.3 ETH
          </div>
          <div className="text-sm text-green-700">
            <strong>+23% increase</strong> from last month
          </div>
        </div>
      </div>

      {/* Governance Process */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How Governance Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Propose</h4>
            <p className="text-sm text-gray-600">
              Any member can submit proposals for platform improvements or artist approvals
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Vote</h4>
            <p className="text-sm text-gray-600">
              Token holders vote on proposals with voting power proportional to their tokens
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="font-bold">3</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Execute</h4>
            <p className="text-sm text-gray-600">
              Passed proposals are automatically executed by the governance contract
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
