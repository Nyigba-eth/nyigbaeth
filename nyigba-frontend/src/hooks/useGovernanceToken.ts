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

// Governance Token ABI
const GOVERNANCE_TOKEN_ABI = [
  // Basic ERC20 functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  
  // Voting functions
  'function getCurrentVotes(address account) view returns (uint256)',
  'function getPriorVotes(address account, uint256 blockNumber) view returns (uint256)',
  'function delegate(address delegatee)',
  'function delegates(address account) view returns (address)',
  
  // Minting functions
  'function mint(address to, uint256 amount)',
  'function addMinter(address minter)',
  'function removeMinter(address minter)',
  'function minters(address account) view returns (bool)',
  'function mintingEnabled() view returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)',
  'event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)',
  'event MinterAdded(address indexed minter)',
  'event MinterRemoved(address indexed minter)'
];

// Use the actual deployed governance token address from contracts
import { CONTRACTS } from '@/lib/contracts';
const GOVERNANCE_TOKEN_ADDRESS = CONTRACTS.NYIGBA_TOKEN;

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface UserTokenInfo {
  balance: string;
  votes: string;
  delegatee: string;
  isMinter: boolean;
}

export function useGovernanceToken() {
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
    return new ethers.Contract(GOVERNANCE_TOKEN_ADDRESS, GOVERNANCE_TOKEN_ABI, signer);
  }, [isCorrectNetwork, getProvider]);

  const getReadOnlyContract = useCallback(async () => {
    const provider = await getProvider();
    return new ethers.Contract(GOVERNANCE_TOKEN_ADDRESS, GOVERNANCE_TOKEN_ABI, provider);
  }, [getProvider]);

  // Get basic token information
  const getTokenInfo = useCallback(async (): Promise<TokenInfo> => {
    try {
      const contract = await getReadOnlyContract();
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatEther(totalSupply)
      };
    } catch (err: any) {
      setError(err.message || 'Failed to get token info');
      throw err;
    }
  }, [getReadOnlyContract]);

  // Get user's token information
  const getUserTokenInfo = useCallback(async (userAddress?: string): Promise<UserTokenInfo> => {
    try {
      const contract = await getReadOnlyContract();
      const targetAddress = userAddress || address;
      
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      const [balance, votes, delegatee, isMinter] = await Promise.all([
        contract.balanceOf(targetAddress),
        contract.getCurrentVotes(targetAddress),
        contract.delegates(targetAddress),
        contract.minters(targetAddress)
      ]);

      return {
        balance: ethers.formatEther(balance),
        votes: ethers.formatEther(votes),
        delegatee,
        isMinter
      };
    } catch (err: any) {
      setError(err.message || 'Failed to get user token info');
      throw err;
    }
  }, [getReadOnlyContract, address]);

  // Transfer tokens
  const transfer = useCallback(async (to: string, amount: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.transfer(to, ethers.parseEther(amount));
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to transfer tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Approve spending
  const approve = useCallback(async (spender: string, amount: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.approve(spender, ethers.parseEther(amount));
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to approve spending');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Delegate voting power
  const delegate = useCallback(async (delegatee: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.delegate(delegatee);
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to delegate votes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Mint tokens (only for minters)
  const mint = useCallback(async (to: string, amount: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.mint(to, ethers.parseEther(amount));
      await tx.wait();
    } catch (err: any) {
      setError(err.message || 'Failed to mint tokens');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get allowance
  const getAllowance = useCallback(async (owner: string, spender: string): Promise<string> => {
    try {
      const contract = await getReadOnlyContract();
      const allowance = await contract.allowance(owner, spender);
      return ethers.formatEther(allowance);
    } catch (err: any) {
      setError(err.message || 'Failed to get allowance');
      throw err;
    }
  }, [getReadOnlyContract]);

  // Get voting power at specific block
  const getPriorVotes = useCallback(async (account: string, blockNumber: number): Promise<string> => {
    try {
      const contract = await getReadOnlyContract();
      const votes = await contract.getPriorVotes(account, blockNumber);
      return ethers.formatEther(votes);
    } catch (err: any) {
      setError(err.message || 'Failed to get prior votes');
      throw err;
    }
  }, [getReadOnlyContract]);

  return {
    loading,
    error,
    getTokenInfo,
    getUserTokenInfo,
    transfer,
    approve,
    delegate,
    mint,
    getAllowance,
    getPriorVotes
  };
}
