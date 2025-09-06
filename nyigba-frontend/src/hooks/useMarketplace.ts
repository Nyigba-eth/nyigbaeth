"use client";

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, NETWORKS } from '@/lib/contracts';
import { BASE_CULTURAL_MARKETPLACE_ABI } from '@/lib/additionalAbis';
import { toast } from 'react-hot-toast';

interface Listing {
  tokenId: number;
  seller: string;
  nftContract: string;
  price: string;
  active: boolean;
  listedAt: Date;
}

interface Offer {
  buyer: string;
  price: string;
  deadline: Date;
  active: boolean;
}

export const useMarketplace = () => {
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
      CONTRACTS.BASE_CULTURAL_MARKETPLACE,
      BASE_CULTURAL_MARKETPLACE_ABI,
      signer
    );
  }, [getProvider]);

  const getReadOnlyContract = useCallback(async () => {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    return new ethers.Contract(
      CONTRACTS.BASE_CULTURAL_MARKETPLACE,
      BASE_CULTURAL_MARKETPLACE_ABI,
      provider
    );
  }, []);

  // List NFT for sale
  const listNFT = useCallback(async (
    nftContract: string,
    tokenId: number,
    priceInEth: string
  ) => {
    if (!CONTRACTS.BASE_CULTURAL_MARKETPLACE) {
      throw new Error('Marketplace contract not deployed yet');
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      const price = ethers.parseEther(priceInEth);
      
      const tx = await contract.listNFT(nftContract, tokenId, price, {
        gasLimit: 300000
      });
      
      const receipt = await tx.wait();
      toast.success('NFT listed successfully!');
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to list NFT: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Buy NFT
  const buyNFT = useCallback(async (
    nftContract: string,
    tokenId: number,
    priceInEth: string
  ) => {
    if (!CONTRACTS.BASE_CULTURAL_MARKETPLACE) {
      throw new Error('Marketplace contract not deployed yet');
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      const price = ethers.parseEther(priceInEth);
      
      const tx = await contract.buyNFT(nftContract, tokenId, {
        value: price,
        gasLimit: 400000
      });
      
      const receipt = await tx.wait();
      toast.success('NFT purchased successfully!');
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to buy NFT: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Cancel listing
  const cancelListing = useCallback(async (
    nftContract: string,
    tokenId: number
  ) => {
    if (!CONTRACTS.BASE_CULTURAL_MARKETPLACE) {
      throw new Error('Marketplace contract not deployed yet');
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      const tx = await contract.cancelListing(nftContract, tokenId, {
        gasLimit: 200000
      });
      
      const receipt = await tx.wait();
      toast.success('Listing cancelled successfully!');
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to cancel listing: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get listing details
  const getListing = useCallback(async (
    nftContract: string,
    tokenId: number
  ): Promise<Listing | null> => {
    if (!CONTRACTS.BASE_CULTURAL_MARKETPLACE) {
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const listing = await contract.listings(nftContract, tokenId);
      
      if (!listing.active) {
        return null;
      }
      
      return {
        tokenId: Number(listing.tokenId),
        seller: listing.seller,
        nftContract: listing.nftContract,
        price: ethers.formatEther(listing.price),
        active: listing.active,
        listedAt: new Date(Number(listing.listedAt) * 1000)
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get user's listings
  const getUserListings = useCallback(async (userAddress: string) => {
    if (!CONTRACTS.BASE_CULTURAL_MARKETPLACE) {
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const listingIds = await contract.userListings(userAddress);
      return listingIds.map((id: bigint) => Number(id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get marketplace stats
  const getMarketplaceStats = useCallback(async () => {
    if (!CONTRACTS.BASE_CULTURAL_MARKETPLACE) {
      return { totalVolume: '0', totalListings: 0 };
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const [volume, listings] = await Promise.all([
        contract.totalVolume(),
        contract.totalListings()
      ]);
      
      return {
        totalVolume: ethers.formatEther(volume),
        totalListings: Number(listings)
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Make offer on NFT
  const makeOffer = useCallback(async (
    nftContract: string,
    tokenId: number,
    priceInEth: string
  ) => {
    if (!CONTRACTS.BASE_CULTURAL_MARKETPLACE) {
      throw new Error('Marketplace contract not deployed yet');
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      const price = ethers.parseEther(priceInEth);
      
      const tx = await contract.makeOffer(nftContract, tokenId, price, {
        value: price, // Send ETH with the offer
        gasLimit: 200000
      });
      
      const receipt = await tx.wait();
      toast.success('Offer made successfully!');
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to make offer: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Accept offer
  const acceptOffer = useCallback(async (
    nftContract: string,
    tokenId: number,
    offerIndex: number
  ) => {
    if (!CONTRACTS.BASE_CULTURAL_MARKETPLACE) {
      throw new Error('Marketplace contract not deployed yet');
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      const tx = await contract.acceptOffer(nftContract, tokenId, offerIndex, {
        gasLimit: 400000
      });
      
      const receipt = await tx.wait();
      toast.success('Offer accepted successfully!');
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to accept offer: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get offers for NFT
  const getOffers = useCallback(async (
    nftContract: string,
    tokenId: number
  ): Promise<Offer[]> => {
    if (!CONTRACTS.BASE_CULTURAL_MARKETPLACE) {
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const offers = await contract.offers(nftContract, tokenId);
      
      return offers.map((offer: any) => ({
        buyer: offer.buyer,
        price: ethers.formatEther(offer.price),
        deadline: new Date(Number(offer.deadline) * 1000),
        active: offer.active
      }));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Cancel offer (buyer only)
  const cancelOffer = useCallback(async (
    nftContract: string,
    tokenId: number,
    offerIndex: number
  ) => {
    if (!CONTRACTS.BASE_CULTURAL_MARKETPLACE) {
      throw new Error('Marketplace contract not deployed yet');
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      const tx = await contract.cancelOffer(nftContract, tokenId, offerIndex, {
        gasLimit: 150000
      });
      
      const receipt = await tx.wait();
      toast.success('Offer cancelled successfully!');
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to cancel offer: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  return {
    loading,
    error,
    listNFT,
    buyNFT,
    cancelListing,
    getListing,
    getUserListings,
    getMarketplaceStats,
    makeOffer,
    acceptOffer,
    getOffers,
    cancelOffer,
  };
};
