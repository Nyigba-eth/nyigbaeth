"use client";

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, NETWORKS } from '@/lib/contracts';
import { BASE_SEPOLIA_NYIGBA_NAMES_ABI } from '@/lib/abi';
import { toast } from 'react-hot-toast';

export const useNyigbaNames = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get provider and signer
  const getProvider = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask');
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    
    // Check if on correct network
    const network = await provider.getNetwork();
    if (Number(network.chainId) !== NETWORKS.BASE_SEPOLIA.chainId) {
      throw new Error('Please switch to Base Sepolia network');
    }
    
    return provider;
  }, []);

  const getContract = useCallback(async () => {
    const provider = await getProvider();
    const signer = await provider.getSigner();
    
    return new ethers.Contract(
      CONTRACTS.BASE_SEPOLIA_NYIGBA_NAMES,
      BASE_SEPOLIA_NYIGBA_NAMES_ABI,
      signer
    );
  }, [getProvider]);

  const getReadOnlyContract = useCallback(async () => {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    return new ethers.Contract(
      CONTRACTS.BASE_SEPOLIA_NYIGBA_NAMES,
      BASE_SEPOLIA_NYIGBA_NAMES_ABI,
      provider
    );
  }, []);

  // Check subdomain availability
  const checkAvailability = useCallback(async (label: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const [available, fee, reason] = await contract.checkAvailability(label);
      
      return {
        available,
        fee: ethers.formatEther(fee),
        reason,
        fullDomain: await contract.fullDomain(label)
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Claim subdomain
  const claimSubdomain = useCallback(async (label: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      // Check availability and get fee
      const [available, fee] = await contract.checkAvailability(label);
      if (!available) {
        throw new Error('Subdomain not available');
      }
      
      // Claim with proper fee
      const tx = await contract.claimSubdomain(label, {
        value: fee,
        gasLimit: 300000 // Base Sepolia gas limit
      });
      
      const receipt = await tx.wait();
      toast.success(`Successfully claimed ${label}.nyigba-base.eth!`);
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        fullDomain: await contract.fullDomain(label)
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to claim subdomain: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get subdomain info
  const getSubdomainInfo = useCallback(async (label: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const [ownerAddress, expiryDate, isPremium, isExpired] = await contract.getSubdomainInfo(label);
      
      return {
        ownerAddress,
        expiryDate: new Date(Number(expiryDate) * 1000),
        isPremium,
        isExpired,
        fullDomain: await contract.fullDomain(label)
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get owned subdomains
  const getOwnedSubdomains = useCallback(async (address: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const [labels, expiryDates] = await contract.getOwnedSubdomains(address);
      
      return labels.map((label: string, index: number) => ({
        label,
        fullDomain: `${label}.nyigba-base.eth`,
        expiryDate: new Date(Number(expiryDates[index]) * 1000),
        isExpired: Date.now() > Number(expiryDates[index]) * 1000
      }));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Set text record
  const setText = useCallback(async (label: string, key: string, value: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      // Generate node hash for the subdomain
      const node = ethers.keccak256(ethers.toUtf8Bytes(`${label}.nyigba-base.eth`));
      
      const tx = await contract.setText(node, key, value, {
        gasLimit: 150000
      });
      
      const receipt = await tx.wait();
      toast.success(`Updated ${key} for ${label}.nyigba-base.eth`);
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to update record: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get text record
  const getText = useCallback(async (label: string, key: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const node = ethers.keccak256(ethers.toUtf8Bytes(`${label}.nyigba-base.eth`));
      
      const value = await contract.text(node, key);
      return value;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Renew subdomain
  const renewSubdomain = useCallback(async (label: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      // Get renewal fee from config
      const config = await contract.config();
      const [, , isPremium] = await contract.getSubdomainInfo(label);
      
      const renewalFee = isPremium ? 
        config.renewalFee * config.premiumMultiplier : 
        config.renewalFee;
      
      const tx = await contract.renewSubdomain(label, {
        value: renewalFee,
        gasLimit: 200000
      });
      
      const receipt = await tx.wait();
      toast.success(`Successfully renewed ${label}.nyigba-base.eth!`);
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to renew subdomain: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  return {
    loading,
    error,
    checkAvailability,
    claimSubdomain,
    getSubdomainInfo,
    getOwnedSubdomains,
    setText,
    getText,
    renewSubdomain,
  };
};
