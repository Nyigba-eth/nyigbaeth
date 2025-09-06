"use client";

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, NETWORKS } from '@/lib/contracts';
import { BASE_CULTURAL_NFT_ABI } from '@/lib/additionalAbis';
import { toast } from 'react-hot-toast';

interface CulturalAsset {
  name: string;
  description: string;
  culturalOrigin: string;
  language: string;
  category: string;
  artistName: string;
  creationDate: number;
  ipfsHash: string;
  verified: boolean;
}

export const useCulturalNFT = () => {
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
      CONTRACTS.BASE_CULTURAL_NFT,
      BASE_CULTURAL_NFT_ABI,
      signer
    );
  }, [getProvider]);

  const getReadOnlyContract = useCallback(async () => {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    
    return new ethers.Contract(
      CONTRACTS.BASE_CULTURAL_NFT,
      BASE_CULTURAL_NFT_ABI,
      provider
    );
  }, []);

  // Mint a cultural asset NFT
  const mintCulturalAsset = useCallback(async (
    to: string,
    uri: string,
    asset: CulturalAsset
  ) => {
    if (!CONTRACTS.BASE_CULTURAL_NFT) {
      throw new Error('Cultural NFT contract not deployed yet');
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      const tx = await contract.mintCulturalAsset(to, uri, asset, {
        gasLimit: 500000
      });
      
      const receipt = await tx.wait();
      toast.success('Cultural NFT minted successfully!');
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to mint NFT: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Batch mint multiple cultural assets (Base-optimized)
  const batchMintCulturalAssets = useCallback(async (
    to: string,
    uris: string[],
    assets: CulturalAsset[]
  ) => {
    if (!CONTRACTS.BASE_CULTURAL_NFT) {
      throw new Error('Cultural NFT contract not deployed yet');
    }

    if (uris.length !== assets.length) {
      throw new Error('Arrays length mismatch');
    }

    if (uris.length > 10) {
      throw new Error('Batch too large (max 10)');
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      const tx = await contract.batchMintCulturalAssets(to, uris, assets, {
        gasLimit: 1000000 + (uris.length * 200000) // Dynamic gas based on batch size
      });
      
      const receipt = await tx.wait();
      toast.success(`${uris.length} Cultural NFTs minted successfully!`);
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        tokenIds: receipt.events?.filter((e: any) => e.event === 'BatchMintExecuted')?.[0]?.args?.tokenIds || []
      };
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to batch mint NFTs: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Verify cultural origin (owner only)
  const verifyOrigin = useCallback(async (origin: string) => {
    if (!CONTRACTS.BASE_CULTURAL_NFT) {
      throw new Error('Cultural NFT contract not deployed yet');
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getContract();
      
      const tx = await contract.verifyOrigin(origin, {
        gasLimit: 100000
      });
      
      await tx.wait();
      toast.success(`Cultural origin "${origin}" verified!`);
      
    } catch (err: any) {
      setError(err.message);
      toast.error(`Failed to verify origin: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  // Get tokens by cultural origin with pagination
  const getTokensByOrigin = useCallback(async (
    origin: string,
    startIndex: number = 0,
    limit: number = 20
  ) => {
    try {
      const contract = await getReadOnlyContract();
      const tokenIds = await contract.getTokensByOrigin(origin, startIndex, limit);
      return tokenIds.map((id: any) => Number(id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [getReadOnlyContract]);

  // Check if origin is verified
  const isOriginVerified = useCallback(async (origin: string): Promise<boolean> => {
    try {
      const contract = await getReadOnlyContract();
      return await contract.verifiedOrigins(origin);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [getReadOnlyContract]);

  // Get next token ID
  const getNextTokenId = useCallback(async (): Promise<number> => {
    try {
      const contract = await getReadOnlyContract();
      const nextId = await contract.nextTokenId();
      return Number(nextId);
    } catch (err: any) {
      setError(err.message);
      return 1;
    }
  }, [getReadOnlyContract]);

  // Get cultural asset details
  const getCulturalAsset = useCallback(async (tokenId: number) => {
    if (!CONTRACTS.BASE_CULTURAL_NFT) {
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const asset = await contract.culturalAssets(tokenId);
      
      return {
        name: asset.name,
        description: asset.description,
        culturalOrigin: asset.culturalOrigin,
        language: asset.language,
        category: asset.category,
        artistName: asset.artistName,
        creationDate: new Date(Number(asset.creationDate) * 1000),
        ipfsHash: asset.ipfsHash,
        verified: asset.verified
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get tokens owned by an artist
  const getArtistTokens = useCallback(async (artistAddress: string) => {
    if (!CONTRACTS.BASE_CULTURAL_NFT) {
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const tokenIds = await contract.artistTokens(artistAddress);
      return tokenIds.map((id: bigint) => Number(id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get owner of a token
  const getTokenOwner = useCallback(async (tokenId: number) => {
    if (!CONTRACTS.BASE_CULTURAL_NFT) {
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const owner = await contract.ownerOf(tokenId);
      return owner;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get token URI
  const getTokenURI = useCallback(async (tokenId: number) => {
    if (!CONTRACTS.BASE_CULTURAL_NFT) {
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const uri = await contract.tokenURI(tokenId);
      return uri;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  // Get balance of owner
  const getBalance = useCallback(async (owner: string) => {
    if (!CONTRACTS.BASE_CULTURAL_NFT) {
      return 0;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contract = await getReadOnlyContract();
      const balance = await contract.balanceOf(owner);
      return Number(balance);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getReadOnlyContract]);

  return {
    loading,
    error,
    mintCulturalAsset,
    batchMintCulturalAssets,
    verifyOrigin,
    getTokensByOrigin,
    isOriginVerified,
    getCulturalAsset,
    getArtistTokens,
    getNextTokenId,
    getTokenOwner,
    getTokenURI,
    getBalance,
  };
};
