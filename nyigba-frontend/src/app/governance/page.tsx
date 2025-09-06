
"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useDAO, COMMUNITY_CATEGORIES, useArtistApplicationVoting } from '@/hooks/useDAO';
import { useGovernanceToken } from '@/hooks/useGovernanceToken';
import { useWallet } from '@/hooks/useWallet';
import { CONTRACTS } from '@/lib/contracts';
import { toast } from 'react-hot-toast';
import { Users, Vote, Clock, CheckCircle, XCircle, Plus, Eye } from 'lucide-react';
import { usePendingArtistApplications } from '@/hooks/useDAO';
import AddressDisplay from '@/components/ui/AddressDisplay';

interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  votesFor: string;
  votesAgainst: string;
  deadline: Date;
  executed: boolean;
  category: string;
}

export default function GovernancePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [votingProposal, setVotingProposal] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { address, isConnected, isCorrectNetwork } = useWallet();
  const { 
    createProposal,
    vote,
    executeProposal,
    joinDAO,
    isCommunityMember,
    checkTokenBalance,
    getAllProposals,
    loading: daoLoading,
    error: daoError,
    communityCategories
  } = useDAO();

  const { pendingApplications, fetchPendingApplications } = usePendingArtistApplications();

  // Only use categories from blockchain - no fallback
  const categories = communityCategories || [];

  const {
    getTokenInfo,
    getUserTokenInfo,
    delegate,
    loading: tokenLoading,
    error: tokenError
  } = useGovernanceToken();

  const { voteOnApplication, loading: votingLoading, error: votingError } = useArtistApplicationVoting();

  const [membershipStatus, setMembershipStatus] = useState(false);
  const [votingPower, setVotingPower] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [governanceTokenBalance, setGovernanceTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [minimumStake, setMinimumStake] = useState('0');

  useEffect(() => {
    if (isConnected && address) {
      loadGovernanceData();
      fetchPendingApplications();
    }
  }, [isConnected, address]);

  const loadGovernanceData = async () => {
    try {
      // Check membership status
      const membership = await isCommunityMember(address!);
      setMembershipStatus(membership);

      // Load categories from blockchain
      try {
        const blockchainCategories = await getCategories();
        // Categories are now loaded from blockchain and stored in the hook
      } catch (error) {
        console.warn('Failed to load categories from blockchain:', error);
      }

      // Get token balance and voting power
      try {
        const userTokenInfo = await getUserTokenInfo(address!);
        setTokenBalance(userTokenInfo.balance);
        setVotingPower(userTokenInfo.votes);
      } catch (error) {
        console.warn('Failed to load token info:', error);
        setTokenBalance('0');
        setVotingPower('0');
      }

      // Check governance token balance for DAO requirements
      const govTokenBal = await checkTokenBalance(address!);
      setGovernanceTokenBalance(govTokenBal);

      // Get user's ETH balance
      const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
      const balanceEth = await provider.getBalance(address!);
      setEthBalance(ethers.formatEther(balanceEth));

      // Get minimum stake from contract
      const contract = new ethers.Contract(CONTRACTS.BASE_COMMUNITY_DAO, [
        'function MINIMUM_STAKE() view returns (uint256)'
      ], provider);
      const minStake = await contract.MINIMUM_STAKE();
      setMinimumStake(ethers.formatEther(minStake));

      // Load proposals using DAO hook
      try {
        const allProposals = await getAllProposals();
        // Convert to expected format for existing UI
        const formattedProposals = allProposals.map((p: any) => ({
          id: p.id,
          title: p.description.substring(0, 50) + '...', // Use description as title
          description: p.description,
          proposer: p.proposer,
          votesFor: p.forVotes,
          votesAgainst: p.againstVotes,
          deadline: new Date(p.endTime * 1000),
          executed: p.executed,
          category: p.category
        }));
        setProposals(formattedProposals);
      } catch (error) {
        console.warn('Failed to load proposals:', error);
        // Set empty array if proposals can't be loaded - no mock data
        setProposals([]);
      }
    } catch (err) {
      console.error('Error loading governance data:', err);
    }
  };

  const handleCreateProposal = async () => {
    if (!isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Base Sepolia');
      return;
    }

    if (!membershipStatus) {
      toast.error('You must be a DAO member to create proposals');
      return;
    }

    if (!newProposal.title || !newProposal.description || !newProposal.category) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createProposal(
        `${newProposal.title}: ${newProposal.description}`,
        newProposal.category as any
      );
      
      setNewProposal({ title: '', description: '', category: '' });
      setShowCreateForm(false);
      await loadGovernanceData();
      toast.success('Proposal created successfully!');
    } catch (err: any) {
      console.error('Error creating proposal:', err);
      toast.error(err.message || 'Failed to create proposal');
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Base Sepolia');
      return;
    }

    if (!membershipStatus) {
      toast.error('You must be a DAO member to vote');
      return;
    }

    try {
      setVotingProposal(proposalId);
      await vote(proposalId.toString(), support);
      await loadGovernanceData();
      toast.success(`Vote cast ${support ? 'in favor' : 'against'} proposal!`);
    } catch (err: any) {
      console.error('Error voting:', err);
      toast.error(err.message || 'Failed to cast vote');
    } finally {
      setVotingProposal(null);
    }
  };

  const handleDelegateVotes = async () => {
    if (!isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Base Sepolia');
      return;
    }

    try {
      await delegate(address!); // Self-delegate
      await loadGovernanceData();
      toast.success('Voting power delegated to yourself!');
    } catch (err: any) {
      console.error('Error delegating votes:', err);
      toast.error(err.message || 'Failed to delegate votes');
    }
  };

  const handleJoinDAO = async () => {
    if (!isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Base Sepolia');
      return;
    }

    try {
      await joinDAO();
      await loadGovernanceData(); // Reload to update membership status
      toast.success('Membership request submitted! Please wait for admin approval.');
    } catch (err: any) {
      console.error('Error joining DAO:', err);
      toast.error(err.message || 'Failed to join DAO');
    }
  };

  const getProposalStatus = (proposal: Proposal) => {
    const now = new Date();
    if (proposal.executed) {
      return { status: 'executed', color: 'green', text: 'Executed' };
    } else if (now > proposal.deadline) {
      const totalVotes = parseFloat(proposal.votesFor) + parseFloat(proposal.votesAgainst);
      const support = parseFloat(proposal.votesFor) / totalVotes;
      if (support > 0.5 && totalVotes > 1000) { // Simplified quorum check
        return { status: 'passed', color: 'blue', text: 'Passed - Ready to Execute' };
      } else {
        return { status: 'failed', color: 'red', text: 'Failed' };
      }
    } else {
      return { status: 'active', color: 'orange', text: 'Active' };
    }
  };

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const timeLeft = deadline.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return 'Voting ended';
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else {
      return `${hours}h remaining`;
    }
  };

  const filteredProposals = proposals.filter(proposal => 
    selectedCategory === 'all' || proposal.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nyigba DAO Governance</h1>
              <p className="text-gray-600 mt-2">
                Participate in the governance of the Nyigba cultural marketplace
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Your Voting Power</div>
              <div className="text-2xl font-bold text-purple-600">{votingPower} votes</div>
              <div className="text-sm text-gray-500">Balance: {tokenBalance} NYIGBA</div>
            </div>
          </div>

          {/* Membership Status */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-purple-600 mr-2" />
                <div>
                  <div className="text-sm text-purple-600">Membership Status</div>
                  <div className="font-semibold">
                    {membershipStatus ? 'Active Member' : 'Not a Member'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Vote className="h-6 w-6 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm text-blue-600">Total Proposals</div>
                  <div className="font-semibold">{proposals.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                <div>
                  <div className="text-sm text-green-600">Active Votes</div>
                  <div className="font-semibold">
                    {proposals.filter(p => new Date() <= p.deadline && !p.executed).length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DAO Membership Requirements */}
          {!membershipStatus && isConnected && isCorrectNetwork && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Join the Nyigba DAO</h3>
              <p className="text-blue-700 text-sm mb-3">
                To join the DAO and participate in governance, you need to stake ETH.
              </p>
              <div className="text-xs space-y-1">
                <p><strong>Minimum Stake Required:</strong> {minimumStake} ETH</p>
                <p><strong>Your ETH Balance:</strong> {ethBalance} ETH</p>
                <p><strong>Membership Status:</strong> {membershipStatus ? 'Active Member' : 'Not a Member'}</p>
                {parseFloat(ethBalance) < parseFloat(minimumStake) && (
                  <p className="text-orange-600">
                    ⚠️ You need at least {minimumStake} ETH to join. Please fund your wallet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            {!membershipStatus && isConnected && isCorrectNetwork && (
              <button
                onClick={handleJoinDAO}
                disabled={daoLoading || parseFloat(ethBalance) < parseFloat(minimumStake)}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  parseFloat(ethBalance) < parseFloat(minimumStake)
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50`}
                title={parseFloat(ethBalance) < parseFloat(minimumStake) ? `You need at least ${minimumStake} ETH to join` : 'Stake ETH to join the DAO'}
              >
                <Users className="h-4 w-4 mr-2" />
                Join DAO (Stake {minimumStake} ETH)
              </button>
            )}
            
            {membershipStatus && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Proposal
              </button>
            )}
            
            {parseFloat(tokenBalance) > 0 && parseFloat(votingPower) === 0 && (
              <button
                onClick={handleDelegateVotes}
                disabled={tokenLoading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Vote className="h-4 w-4 mr-2" />
                Activate Voting Power
              </button>
            )}
          </div>
        </div>

        {/* DAO Membership Info for Non-Members */}
        {isConnected && isCorrectNetwork && !membershipStatus && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <Users className="h-6 w-6 text-blue-600 mt-1 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Join the Nyigba DAO</h3>
                <p className="text-blue-800 mb-4">
                  Become a community member to participate in governance, create proposals, and vote on important decisions that shape the future of the Nyigba cultural marketplace.
                </p>
                <ul className="text-sm text-blue-700 space-y-1 mb-4">
                  <li>• Create and vote on governance proposals</li>
                  <li>• Participate in cultural preservation initiatives</li>
                  <li>• Help shape platform policies and economics</li>
                  <li>• Connect with other cultural artists and enthusiasts</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Create Proposal Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Proposal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proposal Title
                </label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter a clear, descriptive title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newProposal.category}
                  onChange={(e) => setNewProposal({ ...newProposal, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Provide a detailed description of your proposal, including rationale and expected impact"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProposal}
                  disabled={daoLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {daoLoading ? 'Creating...' : 'Create Proposal'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-6">
          {filteredProposals.map((proposal) => {
            const status = getProposalStatus(proposal);
            const totalVotes = parseFloat(proposal.votesFor) + parseFloat(proposal.votesAgainst);
            const supportPercentage = totalVotes > 0 ? (parseFloat(proposal.votesFor) / totalVotes) * 100 : 0;

            return (
              <div key={proposal.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{proposal.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-${status.color}-800 bg-${status.color}-100`}>
                        {status.text}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                        {proposal.category}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{proposal.description}</p>
                    <div className="text-sm text-gray-500">
                      Proposed by: <AddressDisplay address={proposal.proposer} />
                    </div>
                  </div>
                </div>

                {/* Voting Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Support: {supportPercentage.toFixed(1)}%</span>
                    <span>Total Votes: {totalVotes.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${supportPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-green-600">For: {parseFloat(proposal.votesFor).toLocaleString()}</span>
                    <span className="text-red-600">Against: {parseFloat(proposal.votesAgainst).toLocaleString()}</span>
                  </div>
                </div>

                {/* Time Remaining */}
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  {getTimeRemaining(proposal.deadline)}
                </div>

                {/* Voting Buttons */}
                {membershipStatus && new Date() <= proposal.deadline && !proposal.executed && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVote(proposal.id, true)}
                      disabled={votingProposal === proposal.id || daoLoading}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {votingProposal === proposal.id ? 'Voting...' : 'Vote For'}
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, false)}
                      disabled={votingProposal === proposal.id || daoLoading}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {votingProposal === proposal.id ? 'Voting...' : 'Vote Against'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No Proposals State */}
        {filteredProposals.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <Vote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'No proposals have been created yet. Be the first to make a proposal!'
                : `No proposals found in the "${selectedCategory}" category.`
              }
            </p>
          </div>
        )}

        {/* Error States */}
        {(daoError || tokenError) && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            Error: {daoError || tokenError}
          </div>
        )}

        {/* Pending Artist Applications Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Pending Artist Applications</h2>
          {pendingApplications.length === 0 ? (
            <p className="text-gray-500">No pending artist applications.</p>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((app: any) => (
                <div key={app.applicant} className="bg-white rounded-lg shadow p-4 flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      Applicant: <AddressDisplay address={app.applicant} />
                    </div>
                    <div className="text-sm text-gray-600">Portfolio: <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">{app.portfolio}</a></div>
                    <div className="text-sm text-gray-600">Bio: {app.bio}</div>
                    <div className="text-xs text-gray-400">Applied: {new Date(app.appliedAt * 1000).toLocaleString()}</div>
                  </div>
                  {/* Voting actions can be added here */}
                  <div className="mt-2 md:mt-0 flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      disabled={votingLoading}
                      onClick={async () => {
                        try {
                          await voteOnApplication(app.applicant, true);
                          toast.success('Voted to approve artist application!');
                          fetchPendingApplications();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to vote.');
                        }
                      }}
                    >Approve</button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      disabled={votingLoading}
                      onClick={async () => {
                        try {
                          await voteOnApplication(app.applicant, false);
                          toast.success('Voted to reject artist application!');
                          fetchPendingApplications();
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to vote.');
                        }
                      }}
                    >Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
