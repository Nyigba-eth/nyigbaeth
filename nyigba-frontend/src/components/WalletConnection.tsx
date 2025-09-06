"use client";

import { useWallet } from '@/hooks/useWallet';
import { Wallet, ExternalLink, AlertCircle } from 'lucide-react';
import AddressDisplay from '@/components/ui/AddressDisplay';

export const WalletConnection = () => {
  const {
    address,
    isConnected,
    isCorrectNetwork,
    loading,
    isMetaMaskInstalled,
    connect,
    disconnect,
    switchToBaseSepolia,
  } = useWallet();

  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              MetaMask Required
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please install MetaMask to use this application.
            </p>
          </div>
          <a
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-yellow-800 hover:text-yellow-900"
          >
            Install MetaMask
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </div>
      </div>
    );
  }

  if (isConnected && !isCorrectNetwork) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Wrong Network
              </h3>
              <p className="text-sm text-red-700 mt-1">
                Please switch to Base Sepolia network to continue.
              </p>
            </div>
          </div>
          <button
            onClick={switchToBaseSepolia}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Switch Network
          </button>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Wallet Connected
              </h3>
              <p className="text-sm text-green-700 mt-1">
                <AddressDisplay address={address!} /> • Base Sepolia
              </p>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Wallet className="h-5 w-5 text-blue-400 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Connect Your Wallet
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Connect to start registering subdomains.
            </p>
          </div>
        </div>
        <button
          onClick={connect}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  );
};
