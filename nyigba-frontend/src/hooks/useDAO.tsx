// Vote on artist application
export const useArtistApplicationVoting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isCorrectNetwork } = useWallet();

  const voteOnApplication = useCallback(async (artistAddress: string, support: boolean) => {
    try {
      setLoading(true);
      setError(null);
      if (!window.ethereum) throw new Error('Please install MetaMask');
      if (!isCorrectNetwork) throw new Error('Please connect to Base Sepolia network');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACTS.ARTIST_REGISTRY, [
        'function voteOnApplication(address applicant, bool support) external',
      ], signer);
      const tx = await contract.voteOnApplication(artistAddress, support);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to vote on application');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isCorrectNetwork]);

  return { voteOnApplication, loading, error };
};
// ArtistRegistry ABI
const ARTIST_REGISTRY_ABI = [
  'function getAllArtists() view returns (address[])',
  'function getApplication(address) view returns (tuple(address applicant, string portfolio, string bio, uint256 appliedAt, bool approved, bool rejected, uint256 decidedAt))',
];

export interface ArtistApplication {
  applicant: string;
  portfolio: string;
  bio: string;
  appliedAt: number;
  approved: boolean;
  rejected: boolean;
  decidedAt: number;
}

// Fetch all pending artist applications
export const usePendingArtistApplications = () => {
  const [pendingApplications, setPendingApplications] = useState<ArtistApplication[]>([]);

  const fetchPendingApplications = useCallback(async () => {
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const contract = new ethers.Contract(CONTRACTS.ARTIST_REGISTRY, ARTIST_REGISTRY_ABI, provider);
    const allArtists: string[] = await contract.getAllArtists();
    const applications: ArtistApplication[] = [];
    for (const addr of allArtists) {
      const app = await contract.getApplication(addr);
      if (!app.approved && !app.rejected) {
        applications.push({
          applicant: app.applicant,
          portfolio: app.portfolio,
          bio: app.bio,
          appliedAt: Number(app.appliedAt),
          approved: app.approved,
          rejected: app.rejected,
          decidedAt: Number(app.decidedAt),
        });
      }
    }
    setPendingApplications(applications);
  }, []);

  return { pendingApplications, fetchPendingApplications };
};

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { CONTRACTS } from '@/lib/contracts';

// DAO Contract ABI - Matches the deployed BaseCommunityDAO contract
const DAO_ABI = [
  // Proposal Functions
  'function createProposal(string memory description, string memory category) external returns (uint256)',
  'function castVote(uint256 proposalId, bool support) external',
  'function executeProposal(uint256 proposalId) external',
  'function cancelProposal(uint256 proposalId) external',

  // ETH Staking for Membership
  'function joinDAOWithStake() external payable',
  'function memberStakes(address) external view returns (uint256)',
  'function MINIMUM_STAKE() external view returns (uint256)',

  // Community Management
  'function addCommunityMember(address member) external',

  // View Functions
  'function getProposal(uint256 proposalId) external view returns (uint256 id, address proposer, string memory description, string memory category, uint256 forVotes, uint256 againstVotes, uint256 startTime, uint256 endTime, bool executed, bool canceled)',
  'function getProposalsByCategory(string memory category) external view returns (uint256[] memory)',
  'function isCommunityMember(address account) external view returns (bool)',
  'function getCategories() external view returns (string[] memory)',
  'function getVotes(address account) external view returns (uint256)',

  // Contract State
  'function proposalCount() external view returns (uint256)',
  'function governanceToken() external view returns (address)',
  'function communityMembers(address) external view returns (bool)',
  'function BASE_VOTING_PERIOD() external view returns (uint256)',
  'function BASE_QUORUM_PERCENTAGE() external view returns (uint256)',

  // Events
  'event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string category)',
  'event VoteCast(uint256 indexed proposalId, address indexed voter, bool support)',
  'event ProposalExecuted(uint256 indexed proposalId)',
  'event CommunityMemberAdded(address indexed member)',
  'event ProposalCanceled(uint256 indexed proposalId)'
];

// Contract address - using actual deployed address
const DAO_CONTRACT_ADDRESS = CONTRACTS.BASE_COMMUNITY_DAO;

export interface Proposal {
  id: number;
  proposer: string;
  description: string;
  category: string;
  forVotes: string;
  againstVotes: string;
  startTime: number;
  endTime: number;
  executed: boolean;
  canceled: boolean;
}

export interface TreasuryStats {
  balance: string;
  totalProposals: number;
  activeProposals: number;
  votingPeriod: number;
  quorumPercentage: number;
}

// Community categories from the contract
export const COMMUNITY_CATEGORIES = [
  'Cultural Preservation',
  'Education', 
  'Healthcare',
  'Economic Development',
  'Technology',
  'Environmental',
  'Social Justice'
] as const;

export type CommunityCategory = typeof COMMUNITY_CATEGORIES[number];

export function useDAO() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isCorrectNetwork } = useWallet();

  const getProvider = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }
    return new ethers.BrowserProvider(window.ethereum);
  }, []);

  const getContract = useCallback(async () => {
    if (!isCorrectNetwork) {
      throw new Error('Please connect to Base Sepolia network');
    }
    const provider = await getProvider();
    const signer = await provider.getSigner();
    return new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, signer);
  }, [isCorrectNetwork, getProvider]);

  const getReadOnlyContract = useCallback(async () => {
    const provider = await getProvider();
    return new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, provider);
  }, [getProvider]);

  // Create a community proposal
  const createProposal = useCallback(async (
    description: string,
    category: CommunityCategory
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.createProposal(description, category);
      const receipt = await tx.wait();

      // Extract proposal ID from event
      const event = receipt.logs?.find((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog?.name === 'ProposalCreated';
        } catch {
          return false;
        }
      });
      
      const proposalId = event ? contract.interface.parseLog(event)?.args?.proposalId?.toString() || '0' : '0';
      return proposalId;
    } catch (err: any) {
      setError(err.message || 'Failed to create proposal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Vote on a proposal
  const vote = useCallback(async (
    proposalId: string,
    support: boolean // true = for, false = against
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.vote(proposalId, support);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to vote');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Execute a proposal
  const executeProposal = useCallback(async (proposalId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.executeProposal(proposalId);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to execute proposal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Cancel a proposal
  const cancelProposal = useCallback(async (proposalId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.cancelProposal(proposalId);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel proposal');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get proposal details
  const getProposal = useCallback(async (proposalId: string): Promise<Proposal> => {
    try {
      const contract = await getReadOnlyContract();
      const result = await contract.getProposal(proposalId);
      
      return {
        id: Number(result.id),
        proposer: result.proposer,
        description: result.description,
        category: result.category,
        forVotes: ethers.formatEther(result.forVotes),
        againstVotes: ethers.formatEther(result.againstVotes),
        startTime: Number(result.startTime),
        endTime: Number(result.endTime),
        executed: result.executed,
        canceled: result.canceled
      };
    } catch (err: any) {
      setError(err.message || 'Failed to get proposal');
      throw err;
    }
  }, [getReadOnlyContract]);

  // Get all proposals
  const getAllProposals = useCallback(async (): Promise<Proposal[]> => {
    try {
      const contract = await getReadOnlyContract();
      const count = await contract.getProposalCount();
      const proposals: Proposal[] = [];

      for (let i = 1; i <= Number(count); i++) {
        try {
          const proposal = await getProposal(i.toString());
          proposals.push(proposal);
        } catch (err) {
          console.warn(`Failed to load proposal ${i}:`, err);
        }
      }

      return proposals.reverse(); // Show newest first
    } catch (err: any) {
      setError(err.message || 'Failed to get proposals');
      throw err;
    }
  }, [getReadOnlyContract, getProposal]);

  // Get proposals by category
  const getProposalsByCategory = useCallback(async (category: CommunityCategory): Promise<Proposal[]> => {
    try {
      const contract = await getReadOnlyContract();
      const proposalIds = await contract.getCategoryProposals(category);
      const proposals: Proposal[] = [];

      for (const id of proposalIds) {
        try {
          const proposal = await getProposal(id.toString());
          proposals.push(proposal);
        } catch (err) {
          console.warn(`Failed to load proposal ${id}:`, err);
        }
      }

      return proposals.reverse();
    } catch (err: any) {
      setError(err.message || 'Failed to get proposals by category');
      throw err;
    }
  }, [getReadOnlyContract, getProposal]);

  // Check if address is community member
  const isCommunityMember = useCallback(async (memberAddress?: string): Promise<boolean> => {
    try {
      const contract = await getReadOnlyContract();
      const targetAddress = memberAddress || address;
      
      if (!targetAddress) {
        return false;
      }

      return await contract.communityMembers(targetAddress);
    } catch (err: any) {
      console.warn('Failed to check community membership:', err);
      return false;
    }
  }, [getReadOnlyContract, address]);

  // Check governance token balance
  const checkTokenBalance = useCallback(async (userAddress?: string): Promise<string> => {
    try {
      const targetAddress = userAddress || address;
      if (!targetAddress) return '0';

      // Get governance token contract address from DAO
      const contract = await getReadOnlyContract();
      const tokenAddress = await contract.governanceToken();
      
      // Create token contract instance
      const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      
      const balance = await tokenContract.balanceOf(targetAddress);
      return ethers.formatEther(balance);
    } catch (err: any) {
      console.warn('Failed to check token balance:', err);
      return '0';
    }
  }, [getReadOnlyContract, address]);

  // Join the DAO as a community member
  const joinDAO = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!address) {
        throw new Error('Please connect your wallet first');
      }

      // Check if already a member first
      const isAlreadyMember = await isCommunityMember(address);
      if (isAlreadyMember) {
        throw new Error('You are already a DAO member');
      }

      // Get minimum stake from contract
      const contract = await getContract();
      const minStake = await contract.MINIMUM_STAKE();

      // Check user's ETH balance
      const provider = contract.runner?.provider;
      if (provider) {
        const balance = await provider.getBalance(address);
        if (BigInt(balance) < BigInt(minStake)) {
          throw new Error(`Insufficient ETH balance. You need to stake at least ${ethers.formatEther(minStake)} ETH.`);
        }
      }

      // Estimate gas for staking
      let gasEstimate;
      try {
        gasEstimate = await contract.joinDAOWithStake.estimateGas({ value: minStake });
      } catch (estimateError: any) {
        throw new Error('Gas estimation failed. You may not meet the staking requirements.');
      }

      // Send staking transaction
      const tx = await contract.joinDAOWithStake({
        value: minStake,
        gasLimit: gasEstimate + BigInt(100000)
      });
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to join DAO with staking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [address, isCommunityMember, getContract]);

  // Get treasury stats
  const getTreasuryStats = useCallback(async (): Promise<TreasuryStats> => {
    try {
      const contract = await getReadOnlyContract();
      
      const [balance, proposalCount, votingPeriod, quorumPercentage] = await Promise.all([
        contract.getTreasuryBalance(),
        contract.getProposalCount(),
        contract.BASE_VOTING_PERIOD(),
        contract.BASE_QUORUM_PERCENTAGE()
      ]);

      // Get active proposals count
      const allProposals = await getAllProposals();
      const activeProposals = allProposals.filter(p => !p.executed && !p.canceled);

      return {
        balance: ethers.formatEther(balance),
        totalProposals: Number(proposalCount),
        activeProposals: activeProposals.length,
        votingPeriod: Number(votingPeriod),
        quorumPercentage: Number(quorumPercentage)
      };
    } catch (err: any) {
      setError(err.message || 'Failed to get treasury stats');
      throw err;
    }
  }, [getReadOnlyContract, getAllProposals]);

  // Get available categories
  const getCategories = useCallback(async (): Promise<string[]> => {
    try {
      const contract = await getReadOnlyContract();
      return await contract.getCategories();
    } catch (err: any) {
      // Return empty array if contract call fails - only use blockchain data
      console.warn('Failed to get categories from contract:', err);
      return [];
    }
  }, [getReadOnlyContract]);

  return {
    loading,
    error,
    createProposal,
    vote,
    executeProposal,
    cancelProposal,
    joinDAO,
    getProposal,
    getAllProposals,
    getProposalsByCategory,
    isCommunityMember,
    checkTokenBalance,
    getTreasuryStats,
    getCategories,
    communityCategories: COMMUNITY_CATEGORIES
  };
}
