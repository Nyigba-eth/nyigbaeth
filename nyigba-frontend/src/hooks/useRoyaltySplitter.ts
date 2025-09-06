"use client";

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';

// Extend Window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Royalty Splitter ABI
const ROYALTY_SPLITTER_ABI = [
  // Structs and core functions
  'function createRoyaltySplit(bytes32 splitId, address[] memory recipients, uint256[] memory percentages) external',
  'function distributeRoyalty(bytes32 splitId, address tokenAddress, uint256 amount) external',
  'function addRecipient(bytes32 splitId, address recipient, uint256 percentage) external',
  'function removeRecipient(bytes32 splitId, address recipient) external',
  'function updateRecipient(bytes32 splitId, address recipient, uint256 newPercentage) external',
  
  // View functions
  'function getRoyaltySplit(bytes32 splitId) external view returns (tuple(address recipient, uint256 percentage, bool active)[])',
  'function getSplit(bytes32 splitId) external view returns (tuple(address tokenAddress, uint256 totalAmount, uint256 distributedAmount, bool completed, uint256 createdAt))',
  'function getCreatorSplits(address creator) external view returns (bytes32[])',
  'function getAllSplitIds() external view returns (bytes32[])',
  
  // Constants
  'function BASE_MAX_SHARES() external view returns (uint256)',
  'function BASIS_POINTS() external view returns (uint256)',
  
  // Events
  'event RoyaltySplitCreated(bytes32 indexed splitId, address indexed creator, uint256 totalShares)',
  'event RoyaltyDistributed(bytes32 indexed splitId, address indexed token, uint256 amount)',
  'event RecipientAdded(bytes32 indexed splitId, address indexed recipient, uint256 percentage)',
  'event RecipientRemoved(bytes32 indexed splitId, address indexed recipient)'
];

// Use the actual deployed royalty splitter address from contracts
import { CONTRACTS } from '@/lib/contracts';
const ROYALTY_SPLITTER_ADDRESS = CONTRACTS.BASE_ROYALTY_SPLITTER;

export interface RoyaltyShare {
  recipient: string;
  percentage: number;
  active: boolean;
}

export interface Split {
  tokenAddress: string;
  totalAmount: string;
  distributedAmount: string;
  completed: boolean;
  createdAt: Date;
}

export function useRoyaltySplitter() {
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
    return new ethers.Contract(ROYALTY_SPLITTER_ADDRESS, ROYALTY_SPLITTER_ABI, signer);
  }, [isCorrectNetwork, getProvider]);

  const getReadOnlyContract = useCallback(async () => {
    const provider = await getProvider();
    return new ethers.Contract(ROYALTY_SPLITTER_ADDRESS, ROYALTY_SPLITTER_ABI, provider);
  }, [getProvider]);

  // Create royalty split configuration
  const createRoyaltySplit = useCallback(async (
    splitId: string,
    recipients: string[],
    percentages: number[]
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (recipients.length !== percentages.length) {
        throw new Error('Recipients and percentages arrays must have same length');
      }

      if (recipients.length > 20) {
        throw new Error('Too many recipients (max 20)');
      }

      const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
      if (totalPercentage !== 10000) {
        throw new Error('Total percentage must equal 100% (10000 basis points)');
      }

      const contract = await getContract();
      const splitIdBytes = ethers.id(splitId);
      
      const tx = await contract.createRoyaltySplit(splitIdBytes, recipients, percentages);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to create royalty split');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Distribute royalty to recipients
  const distributeRoyalty = useCallback(async (
    splitId: string,
    tokenAddress: string,
    amount: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const splitIdBytes = ethers.id(splitId);
      const amountWei = ethers.parseEther(amount);
      
      const tx = await contract.distributeRoyalty(splitIdBytes, tokenAddress, amountWei, {
        value: tokenAddress === ethers.ZeroAddress ? amountWei : 0 // Send ETH if token is zero address
      });
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to distribute royalty');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Add recipient to existing split
  const addRecipient = useCallback(async (
    splitId: string,
    recipient: string,
    percentage: number
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const splitIdBytes = ethers.id(splitId);
      
      const tx = await contract.addRecipient(splitIdBytes, recipient, percentage);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to add recipient');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Remove recipient from split
  const removeRecipient = useCallback(async (
    splitId: string,
    recipient: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const splitIdBytes = ethers.id(splitId);
      
      const tx = await contract.removeRecipient(splitIdBytes, recipient);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to remove recipient');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Update recipient percentage
  const updateRecipient = useCallback(async (
    splitId: string,
    recipient: string,
    newPercentage: number
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const splitIdBytes = ethers.id(splitId);
      
      const tx = await contract.updateRecipient(splitIdBytes, recipient, newPercentage);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to update recipient');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get royalty split configuration
  const getRoyaltySplit = useCallback(async (splitId: string): Promise<RoyaltyShare[]> => {
    try {
      const contract = await getReadOnlyContract();
      const splitIdBytes = ethers.id(splitId);
      
      const shares = await contract.getRoyaltySplit(splitIdBytes);
      return shares.map((share: any) => ({
        recipient: share.recipient,
        percentage: Number(share.percentage),
        active: share.active
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to get royalty split');
      throw err;
    }
  }, [getReadOnlyContract]);

  // Get split details
  const getSplit = useCallback(async (splitId: string): Promise<Split> => {
    try {
      const contract = await getReadOnlyContract();
      const splitIdBytes = ethers.id(splitId);
      
      const split = await contract.getSplit(splitIdBytes);
      return {
        tokenAddress: split.tokenAddress,
        totalAmount: ethers.formatEther(split.totalAmount),
        distributedAmount: ethers.formatEther(split.distributedAmount),
        completed: split.completed,
        createdAt: new Date(Number(split.createdAt) * 1000)
      };
    } catch (err: any) {
      setError(err.message || 'Failed to get split');
      throw err;
    }
  }, [getReadOnlyContract]);

  // Get creator's splits
  const getCreatorSplits = useCallback(async (creator?: string): Promise<string[]> => {
    try {
      const contract = await getReadOnlyContract();
      const targetAddress = creator || address;
      
      if (!targetAddress) {
        return [];
      }
      
      const splitIds = await contract.getCreatorSplits(targetAddress);
      return splitIds.map((id: string) => id);
    } catch (err: any) {
      setError(err.message || 'Failed to get creator splits');
      throw err;
    }
  }, [getReadOnlyContract, address]);

  // Get all split IDs
  const getAllSplitIds = useCallback(async (): Promise<string[]> => {
    try {
      const contract = await getReadOnlyContract();
      const splitIds = await contract.getAllSplitIds();
      return splitIds.map((id: string) => id);
    } catch (err: any) {
      setError(err.message || 'Failed to get all split IDs');
      throw err;
    }
  }, [getReadOnlyContract]);

  // Get constants
  const getConstants = useCallback(async (): Promise<{ maxShares: number; basisPoints: number }> => {
    try {
      const contract = await getReadOnlyContract();
      const [maxShares, basisPoints] = await Promise.all([
        contract.BASE_MAX_SHARES(),
        contract.BASIS_POINTS()
      ]);
      
      return {
        maxShares: Number(maxShares),
        basisPoints: Number(basisPoints)
      };
    } catch (err: any) {
      setError(err.message || 'Failed to get constants');
      throw err;
    }
  }, [getReadOnlyContract]);

  return {
    loading,
    error,
    createRoyaltySplit,
    distributeRoyalty,
    addRecipient,
    removeRecipient,
    updateRecipient,
    getRoyaltySplit,
    getSplit,
    getCreatorSplits,
    getAllSplitIds,
    getConstants
  };
}
