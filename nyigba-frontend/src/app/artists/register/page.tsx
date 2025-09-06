"use client";

import { useState, useEffect } from 'react';
import { useArtistRegistry } from '@/hooks/useArtistRegistry';
import { useWallet } from '@/hooks/useWallet';
import { WalletConnection } from '@/components/WalletConnection';
import { CONTRACTS } from '@/lib/contracts';
import { toast } from 'react-hot-toast';
import { User, FileText, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import AddressDisplay from '@/components/ui/AddressDisplay';

export default function ArtistRegistrationPage() {
  const [portfolio, setPortfolio] = useState('');
  const [bio, setBio] = useState('');
  const [application, setApplication] = useState<any>(null);
  const [isArtist, setIsArtist] = useState(false);
  const [artistsCount, setArtistsCount] = useState(0);

  const { address, isConnected, isCorrectNetwork } = useWallet();
  const {
    loading,
    error,
    requestArtistRole,
    isRegisteredArtist,
    getApplication,
    getArtistsCount,
    checkContractState,
  } = useArtistRegistry();

  // Check if the Artist Registry contract is deployed
  const isContractAvailable = CONTRACTS.ARTIST_REGISTRY && CONTRACTS.ARTIST_REGISTRY !== "";

  // Load user's application and artist status when wallet connects
  useEffect(() => {
    if (isConnected && isCorrectNetwork && address) {
      loadUserData();
      loadArtistsCount();
    }
  }, [isConnected, isCorrectNetwork, address]);

  const loadUserData = async () => {
    if (!address) return;

    try {
      const [artistStatus, userApplication] = await Promise.all([
        isRegisteredArtist(address),
        getApplication(address)
      ]);
      
      setIsArtist(artistStatus);
      setApplication(userApplication);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const loadArtistsCount = async () => {
    try {
      const count = await getArtistsCount();
      setArtistsCount(count);
    } catch (err) {
      console.error('Error loading artists count:', err);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !isCorrectNetwork) {
      toast.error('Please connect to Base Sepolia network');
      return;
    }

    if (!portfolio.trim() || !bio.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await requestArtistRole(portfolio.trim(), bio.trim());
      setPortfolio('');
      setBio('');
      toast.success('Application submitted successfully!');
      // Reload application data
      setTimeout(() => loadUserData(), 2000);
    } catch (err: any) {
      console.error('Application submission error:', err);
      if (err.message?.includes('not deployed yet')) {
        toast.error('Artist Registry contract is not deployed yet. Please try again later.');
      } else {
        toast.error(`Failed to submit application: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const getApplicationStatus = () => {
    if (!application) return null;

    if (application.approved) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div>
              <h3 className="font-semibold text-green-800">Application Approved</h3>
              <p className="text-green-700 text-sm">
                Congratulations! You are now a verified artist.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (application.rejected) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h3 className="font-semibold text-red-800">Application Rejected</h3>
              <p className="text-red-700 text-sm">
                Your application was not approved. You can submit a new application.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-yellow-500 mr-2" />
          <div>
            <h3 className="font-semibold text-yellow-800">Application Pending</h3>
            <p className="text-yellow-700 text-sm">
              Your application is under review by the community.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Artist Registration
          </h1>
          <p className="text-lg text-gray-600">
            Join the Nyigba.eth cultural heritage platform as a verified artist
          </p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-center">
            <Users className="h-8 w-8 text-purple-500 mr-3" />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">{artistsCount}</h2>
              <p className="text-gray-600">Verified Artists</p>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        <WalletConnection />

        {/* Artist Status */}
        {isConnected && isCorrectNetwork && address && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Your Artist Status
            </h2>
            
            {isArtist ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-green-800">Verified Artist</h3>
                    <p className="text-green-700">
                      You are a verified artist on the Nyigba.eth platform!
                    </p>
                  </div>
                </div>
              </div>
            ) : application ? (
              getApplicationStatus()
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Not Registered</h3>
                    <p className="text-blue-700">
                      Submit an application below to become a verified artist.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debug Section - Remove this in production */}
        {isConnected && isCorrectNetwork && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Information</h3>
            <div className="text-xs space-y-1">
              <p><strong>Contract Address:</strong> {CONTRACTS.ARTIST_REGISTRY || 'Not set'}</p>
              <p><strong>Network:</strong> Base Sepolia</p>
              <p><strong>User Address:</strong> <AddressDisplay address={address!} /></p>
              <p><strong>Contract Available:</strong> {isContractAvailable ? 'Yes' : 'No'}</p>
            </div>
            <button
              type="button"
              onClick={checkContractState}
              className="mt-2 px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            >
              Check Contract State
            </button>
          </div>
        )}

        {/* Application Form */}
        {isConnected && isCorrectNetwork && !isArtist && !application && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Submit Artist Application
            </h2>
            
            <form onSubmit={handleSubmitApplication} className="space-y-6">
              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio URL or Description
                </label>
                <input
                  type="text"
                  id="portfolio"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="Link to your portfolio or describe your work"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a link to your portfolio or a detailed description of your artistic work
                </p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Artist Biography
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself, your artistic background, and cultural heritage focus"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe your artistic background, experience, and connection to cultural heritage
                </p>
              </div>

              {/* Contract Status Warning */}
              {!isContractAvailable && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Contract Not Deployed</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        The Artist Registry contract is not yet deployed on Base Sepolia. 
                        Applications will be available once the contract is deployed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !portfolio.trim() || !bio.trim() || !isContractAvailable}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  !isContractAvailable 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                }`}
              >
                {loading 
                  ? 'Submitting Application...' 
                  : !isContractAvailable 
                    ? 'Contract Not Available' 
                    : 'Submit Application'
                }
              </button>
            </form>
          </div>
        )}

        {/* Application Details */}
        {application && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Application Details</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Portfolio</h3>
                <p className="text-gray-700">{application.portfolio}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Biography</h3>
                <p className="text-gray-700">{application.bio}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-gray-900">Applied At</h3>
                  <p className="text-gray-700">{application.appliedAt.toLocaleDateString()}</p>
                </div>
                
                {application.decidedAt && (
                  <div>
                    <h3 className="font-medium text-gray-900">Decided At</h3>
                    <p className="text-gray-700">{application.decidedAt.toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-800 mb-2">About Artist Registration</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Artist registration is managed by community governance</li>
            <li>• Applications are reviewed by verified community members</li>
            <li>• Verified artists can mint cultural heritage NFTs</li>
            <li>• Artists retain full ownership and royalties from their work</li>
            <li>• Registration is free, only gas fees apply</li>
          </ul>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
