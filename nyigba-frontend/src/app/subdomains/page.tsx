"use client";

import { useState, useEffect } from 'react';
import { useNyigbaNames } from '@/hooks/useNyigbaNames';
import { useWallet } from '@/hooks/useWallet';
import { WalletConnection } from '@/components/WalletConnection';
import { toast } from 'react-hot-toast';
import { Search, Globe, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function SubdomainRegistration() {
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityResult, setAvailabilityResult] = useState<any>(null);
  const [ownedDomains, setOwnedDomains] = useState<any[]>([]);

  const { address, isConnected, isCorrectNetwork } = useWallet();
  const {
    loading,
    error,
    checkAvailability,
    claimSubdomain,
    getOwnedSubdomains,
    setText,
    getText,
  } = useNyigbaNames();

  // Auto-load owned domains when wallet connects
  useEffect(() => {
    if (isConnected && isCorrectNetwork && address && ownedDomains.length === 0) {
      handleGetOwnedDomains();
    }
  }, [isConnected, isCorrectNetwork, address]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a subdomain name');
      return;
    }

    try {
      const result = await checkAvailability(searchTerm.toLowerCase());
      setAvailabilityResult(result);
      
      if (result.available) {
        toast.success(`${searchTerm}.nyigba-base.eth is available!`);
      } else {
        toast.error(`${searchTerm}.nyigba-base.eth is not available: ${result.reason}`);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleClaim = async () => {
    if (!isConnected || !isCorrectNetwork) {
      toast.error('Please connect to Base Sepolia network');
      return;
    }

    if (!availabilityResult?.available) {
      toast.error('Subdomain is not available');
      return;
    }

    try {
      const result = await claimSubdomain(searchTerm.toLowerCase());
      console.log('Claim result:', result);
      setAvailabilityResult(null);
      setSearchTerm('');
      // Refresh owned domains
      if (address) {
        setTimeout(() => handleGetOwnedDomains(), 2000);
      }
    } catch (err) {
      console.error('Claim error:', err);
    }
  };

  const handleGetOwnedDomains = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const domains = await getOwnedSubdomains(address);
      setOwnedDomains(domains);
      toast.success(`Found ${domains.length} owned domains`);
    } catch (err) {
      console.error('Get owned domains error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nyigba.eth Subdomain Registration
          </h1>
          <p className="text-lg text-gray-600">
            Claim your own .nyigba-base.eth subdomain on Base Sepolia
          </p>
        </div>

        {/* Wallet Connection */}
        <WalletConnection />

        {/* Subdomain Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Search className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold">Search Subdomain</h2>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                placeholder="Enter subdomain name (e.g., myname)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-32"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                maxLength={63}
              />
              <div className="absolute right-3 top-2 text-sm text-gray-500">
                .nyigba-base.eth
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>

          {availabilityResult && (
            <div className={`mt-4 p-4 border rounded-lg ${availabilityResult.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center mb-3">
                {availabilityResult.available ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <h3 className={`font-semibold ${availabilityResult.available ? 'text-green-800' : 'text-red-800'}`}>
                  {availabilityResult.available ? 'Available!' : 'Not Available'}
                </h3>
              </div>
              <div className="space-y-2">
                <p><strong>Domain:</strong> {searchTerm}.nyigba-base.eth</p>
                <p><strong>Fee:</strong> {availabilityResult.fee} ETH</p>
                {availabilityResult.reason && (
                  <p><strong>Reason:</strong> {availabilityResult.reason}</p>
                )}
              </div>
              
              {availabilityResult.available && isConnected && isCorrectNetwork && (
                <button
                  onClick={handleClaim}
                  disabled={loading}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Claim for {availabilityResult.fee} ETH
                    </>
                  )}
                </button>
              )}
              
              {availabilityResult.available && (!isConnected || !isCorrectNetwork) && (
                <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800">
                  Please connect to Base Sepolia network to claim this subdomain
                </div>
              )}
            </div>
          )}
        </div>

        {/* Owned Domains */}
        {isConnected && isCorrectNetwork && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-xl font-semibold">Your Domains</h2>
              </div>
              <button
                onClick={handleGetOwnedDomains}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {ownedDomains.length > 0 ? (
              <div className="space-y-3">
                {ownedDomains.map((domain, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{domain.fullDomain}</h3>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          Expires: {domain.expiryDate.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          domain.isExpired 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {domain.isExpired ? 'Expired' : 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No subdomains found</p>
                <p className="text-sm">Start by claiming your first subdomain above!</p>
              </div>
            )}
          </div>
        )}

        {/* Contract Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Network:</strong> Base Sepolia Testnet</p>
            <p><strong>Contract Address:</strong> 0x516A5dd0bDCf2D711188Daa54f7156C84f89286C</p>
            <p><strong>Registration Fee:</strong> 0.001 ETH</p>
            <p><strong>Domain Format:</strong> [name].nyigba-base.eth</p>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
              Error: {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
