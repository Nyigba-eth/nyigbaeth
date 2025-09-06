"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { NETWORKS } from '@/lib/contracts';
import { toast } from 'react-hot-toast';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  isCorrectNetwork: boolean;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    isCorrectNetwork: false,
  });
  const [loading, setLoading] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('Please install MetaMask to continue');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      
      setState({
        address: accounts[0],
        isConnected: true,
        chainId: Number(network.chainId),
        isCorrectNetwork: Number(network.chainId) === NETWORKS.BASE_SEPOLIA.chainId,
      });

      if (Number(network.chainId) !== NETWORKS.BASE_SEPOLIA.chainId) {
        toast.error('Please switch to Base Sepolia network');
      } else {
        toast.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setLoading(false);
    }
  }, [isMetaMaskInstalled]);

  // Switch to Base Sepolia network
  const switchToBaseSepolia = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask not installed');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORKS.BASE_SEPOLIA.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the chain is not added, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${NETWORKS.BASE_SEPOLIA.chainId.toString(16)}`,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia-explorer.base.org'],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
          toast.error('Failed to add Base Sepolia network');
        }
      } else {
        console.error('Failed to switch network:', error);
        toast.error('Failed to switch to Base Sepolia network');
      }
    }
  }, [isMetaMaskInstalled]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      chainId: null,
      isCorrectNetwork: false,
    });
    toast.success('Wallet disconnected');
  }, []);

  // Check connection status
  const checkConnection = useCallback(async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        setState({
          address: accounts[0].address,
          isConnected: true,
          chainId: Number(network.chainId),
          isCorrectNetwork: Number(network.chainId) === NETWORKS.BASE_SEPOLIA.chainId,
        });
      }
    } catch (error) {
      console.error('Check connection error:', error);
    }
  }, [isMetaMaskInstalled]);

  // Listen for account and network changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState(prev => ({
          ...prev,
          address: accounts[0],
          isConnected: true,
        }));
      }
    };

    const handleChainChanged = (chainId: string) => {
      const numericChainId = parseInt(chainId, 16);
      setState(prev => ({
        ...prev,
        chainId: numericChainId,
        isCorrectNetwork: numericChainId === NETWORKS.BASE_SEPOLIA.chainId,
      }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check initial connection
    checkConnection();

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isMetaMaskInstalled, disconnect, checkConnection]);

  return {
    ...state,
    loading,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connect,
    disconnect,
    switchToBaseSepolia,
  };
};
