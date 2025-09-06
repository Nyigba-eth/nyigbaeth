"use client";

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, NETWORKS } from '@/lib/contracts';
import { ARTIST_REGISTRY_ABI } from '@/lib/additionalAbis';
import { toast } from 'react-hot-toast';

export const useArtistRegistry = () => {
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
      CONTRACTS.ARTIST_REGISTRY,
      ARTIST_REGISTRY_ABI,
      signer
    );
  }, [getProvider]);

  const getReadOnlyContract = useCallback(async () => {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    return new ethers.Contract(
      CONTRACTS.ARTIST_REGISTRY,
      ARTIST_REGISTRY_ABI,
      provider
    );
  }, []);

  // Submit artist application
  const requestArtistRole = useCallback(async (portfolio: string, bio: string) => {
    if (!CONTRACTS.ARTIST_REGISTRY) {
      throw new Error('Artist Registry contract not deployed yet');
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      // Estimate gas first
      let gasEstimate;
      try {
        gasEstimate = await contract.requestArtistRole.estimateGas(portfolio, bio);
        console.log('Gas estimate:', gasEstimate.toString());
      } catch (estimateError) {
        console.error('Gas estimation failed:', estimateError);
        // Use a higher default if estimation fails
        gasEstimate = BigInt(300000);
      }
      
      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate + (gasEstimate * BigInt(20) / BigInt(100));
      
      console.log('Calling requestArtistRole with:', { portfolio, bio, gasLimit: gasLimit.toString() });
      
      const tx = await contract.requestArtistRole(portfolio, bio, {
        gasLimit: gasLimit
      });
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      toast.success('Artist application submitted successfully!');
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err: any) {
      console.error('requestArtistRole error:', err);
      
      // Provide more specific error messages
      let errorMessage = err.message;
      if (err.code === 'CALL_EXCEPTION') {
        errorMessage = 'Transaction failed. You may not meet the requirements or the contract may have restrictions.';
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for gas fee.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      toast.error(`Failed to submit application: ${errorMessage}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Check if address is registered artist
  const isRegisteredArtist = useCallback(async (address: string) => {
    if (!CONTRACTS.ARTIST_REGISTRY) {
      return false;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const isArtist = await contract.isRegisteredArtist(address);
      return isArtist;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get artist application details
  const getApplication = useCallback(async (address: string) => {
    if (!CONTRACTS.ARTIST_REGISTRY) {
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const application = await contract.applications(address);
      
      if (!application.applicant || application.applicant === ethers.ZeroAddress) {
        return null;
      }
      
      return {
        applicant: application.applicant,
        portfolio: application.portfolio,
        bio: application.bio,
        appliedAt: new Date(Number(application.appliedAt) * 1000),
        approved: application.approved,
        rejected: application.rejected,
        decidedAt: application.decidedAt > 0 ? new Date(Number(application.decidedAt) * 1000) : null
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get total number of registered artists
  const getArtistsCount = useCallback(async () => {
    if (!CONTRACTS.ARTIST_REGISTRY) {
      return 0;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const count = await contract.getArtistCount();
      return Number(count);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get artist by index
  const getArtistByIndex = useCallback(async (index: number) => {
    if (!CONTRACTS.ARTIST_REGISTRY) {
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const artistAddress = await contract.artists(index);
      return artistAddress;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get all registered artists (for admin use)
  const getAllArtists = useCallback(async () => {
    if (!CONTRACTS.ARTIST_REGISTRY) {
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const count = await getArtistsCount();
      const artists = [];
      
      for (let i = 0; i < count; i++) {
        const artistAddress = await getArtistByIndex(i);
        if (artistAddress) {
          artists.push(artistAddress);
        }
      }
      
      return artists;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getArtistsCount, getArtistByIndex]);

  // Debug function to check contract state
  const checkContractState = useCallback(async () => {
    if (!CONTRACTS.ARTIST_REGISTRY) {
      console.error('No contract address available');
      return;
    }

    try {
      const contract = await getReadOnlyContract();
      
      // Check if contract exists at the address
      const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
      const code = await provider.getCode(CONTRACTS.ARTIST_REGISTRY);
      
      console.log('Contract address:', CONTRACTS.ARTIST_REGISTRY);
      console.log('Contract code exists:', code !== '0x');
      
      if (code === '0x') {
        console.error('No contract deployed at this address!');
        return;
      }
      
      // Try to call a simple view function
      try {
        const count = await contract.getArtistCount();
        console.log('Artists count:', count.toString());
      } catch (err) {
        console.error('Failed to call getArtistCount:', err);
      }
      
    } catch (err) {
      console.error('Contract state check failed:', err);
    }
  }, [getReadOnlyContract]);

  return {
    loading,
    error,
    requestArtistRole,
    isRegisteredArtist,
    getApplication,
    getArtistsCount,
    getArtistByIndex,
    getAllArtists,
    checkContractState,
  };
};
