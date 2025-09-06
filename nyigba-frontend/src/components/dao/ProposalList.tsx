'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar,
  ChevronRight,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate, timeAgo } from '@/lib/utils'

// Mock proposal data
const mockProposals = [
  {
    id: '12',
    title: 'Approve Artist Application - Fatima Kone',
    description: 'Proposal to approve Fatima Kone as a verified artist. She specializes in traditional Malian textile art and has submitted a comprehensive portfolio.',
    proposer: 'kwame.nyigba.eth',
    state: 'active',
    forVotes: '456',
    againstVotes: '123',
    abstainVotes: '45',
    totalVotes: '624',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-17'),
    createdAt: new Date('2024-01-13'),
    category: 'Artist Approval'
  },
  {
    id: '11',
    title: 'Increase Treasury Distribution to 20%',
    description: 'Proposal to increase the percentage of royalties that go to the community treasury from 15% to 20% to fund more cultural preservation initiatives.',
    proposer: 'ama.nyigba.eth',
    state: 'succeeded',
    forVotes: '789',
    againstVotes: '234',
    abstainVotes: '67',
    totalVotes: '1090',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-01-12'),
    createdAt: new Date('2024-01-08'),
    category: 'Treasury'
  },
  {
    id: '10',
    title: 'Launch Cultural Education Program',
    description: 'Create an educational program to teach young Africans about their cultural heritage through workshops and digital resources.',
    proposer: 'kofi.nyigba.eth',
    state: 'executed',
    forVotes: '892',
    againstVotes: '156',
    abstainVotes: '78',
    totalVotes: '1126',
    startDate: new Date('2024-01-05'),
    endDate: new Date('2024-01-07'),
    createdAt: new Date('2024-01-03'),
    category: 'Education'
  },
  {
    id: '9',
    title: 'Reject Artist Application - John Smith',
    description: 'Proposal to reject the artist application from John Smith due to lack of authentic African cultural heritage in submitted portfolio.',
    proposer: 'amara.nyigba.eth',
    state: 'defeated',
    forVotes: '234',
    againstVotes: '567',
    abstainVotes: '89',
    totalVotes: '890',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-03'),
    createdAt: new Date('2023-12-30'),
    category: 'Artist Approval'
  }
]

const stateConfig = {
  active: {
    icon: Clock,
    color: 'bg-blue-100 text-blue-800',
    label: 'Active'
  },
  succeeded: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    label: 'Succeeded'
  },
  executed: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    label: 'Executed'
  },
  defeated: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    label: 'Defeated'
  },
  pending: {
    icon: Clock,
    color: 'bg-gray-100 text-gray-800',
    label: 'Pending'
  }
}

export function ProposalList() {
  const [filter, setFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredProposals = mockProposals.filter(proposal => {
    if (filter === 'all') return true
    if (filter === 'active') return proposal.state === 'active'
    if (filter === 'artist-approval') return proposal.category === 'Artist Approval'
    if (filter === 'treasury') return proposal.category === 'Treasury'
    return true
  })

  const calculateVotePercentage = (votes: string, total: string) => {
    const voteNum = parseInt(votes)
    const totalNum = parseInt(total)
    return totalNum > 0 ? Math.round((voteNum / totalNum) * 100) : 0
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Proposals</h2>
          <p className="text-gray-600">Community governance proposals</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">Create Proposal</Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'artist-approval', label: 'Artist Approval' },
              { key: 'treasury', label: 'Treasury' }
            ].map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal, index) => {
          const StateIcon = stateConfig[proposal.state as keyof typeof stateConfig].icon
          const forPercentage = calculateVotePercentage(proposal.forVotes, proposal.totalVotes)
          const againstPercentage = calculateVotePercentage(proposal.againstVotes, proposal.totalVotes)
          
          return (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border border-gray-200 rounded-xl p-6 hover:border-primary-300 hover:shadow-sm transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      #{proposal.id}: {proposal.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stateConfig[proposal.state as keyof typeof stateConfig].color}`}>
                      <StateIcon className="w-3 h-3 mr-1" />
                      {stateConfig[proposal.state as keyof typeof stateConfig].label}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {proposal.description}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>By {proposal.proposer}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{timeAgo(proposal.createdAt)}</span>
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {proposal.category}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>

              {/* Voting Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Voting Results</span>
                  <span className="text-gray-600">{proposal.totalVotes} votes</span>
                </div>
                
                <div className="space-y-2">
                  {/* For votes */}
                  <div className="flex items-center space-x-3">
                    <span className="text-green-600 font-medium w-8">For</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${forPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {forPercentage}% ({proposal.forVotes})
                    </span>
                  </div>
                  
                  {/* Against votes */}
                  <div className="flex items-center space-x-3">
                    <span className="text-red-600 font-medium w-8">Against</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${againstPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {againstPercentage}% ({proposal.againstVotes})
                    </span>
                  </div>
                </div>

                {/* Voting deadline for active proposals */}
                {proposal.state === 'active' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 font-medium">
                        Voting ends {formatDate(proposal.endDate)}
                      </span>
                      <Button size="sm" className="text-xs">
                        Vote Now
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredProposals.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No proposals found matching your filter.</p>
        </div>
      )}
    </div>
  )
}
