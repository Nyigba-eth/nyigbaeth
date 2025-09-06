"use client";

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useCulturalNFT } from '@/hooks/useCulturalNFT';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useGovernanceToken } from '@/hooks/useGovernanceToken';
import { useArtistRegistry } from '@/hooks/useArtistRegistry';
import { RoyaltyManagement } from '@/components/royalty/RoyaltyManagement';
import { toast } from 'react-hot-toast';
import { 
  Palette, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Users, 
  Award,
  Plus,
  ExternalLink,
  BarChart3,
  Clock,
  Star,
  Calendar,
  Package
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalNFTs: number;
  totalSales: string;
  totalRoyalties: string;
  activeListings: number;
  totalOffers: number;
  governanceTokens: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
}

interface NFTItem {
  id: number;
  name: string;
  image: string;
  price?: string;
  isListed: boolean;
  offers: number;
  sales: number;
  culturalOrigin: string;
}

export default function ArtistDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalNFTs: 0,
    totalSales: '0',
    totalRoyalties: '0',
    activeListings: 0,
    totalOffers: 0,
    governanceTokens: '0',
    verificationStatus: 'unverified'
  });

  const [recentNFTs, setRecentNFTs] = useState<NFTItem[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'royalties' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);

  const { address, isConnected, isCorrectNetwork } = useWallet();
  const { getUserNFTs, getUserNFTCount } = useCulturalNFT();
  const { getUserListings, getUserOffers } = useMarketplace();
  const { balance: getTokenBalance } = useGovernanceToken();
  const { isArtistVerified, getArtistProfile } = useArtistRegistry();

  useEffect(() => {
    if (isConnected && address && isCorrectNetwork) {
      loadDashboardData();
    }
  }, [isConnected, address, isCorrectNetwork]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load verification status
      const verified = await isArtistVerified(address!);
      
      // Load governance tokens
      const tokenBalance = await getTokenBalance(address!);

      // Load NFT count
      const nftCount = await getUserNFTCount(address!);

      // For demo purposes, we'll use mock data for other stats
      // In a real implementation, you'd fetch from your backend
      const mockStats: DashboardStats = {
        totalNFTs: nftCount,
        totalSales: '12.5',
        totalRoyalties: '3.8',
        activeListings: 8,
        totalOffers: 15,
        governanceTokens: tokenBalance,
        verificationStatus: verified ? 'verified' : 'unverified'
      };

      const mockNFTs: NFTItem[] = [
        {
          id: 1,
          name: "Adinkra Wisdom #001",
          image: "/api/placeholder/400/400",
          price: "0.5",
          isListed: true,
          offers: 3,
          sales: 1,
          culturalOrigin: "Ghana"
        },
        {
          id: 2,
          name: "Kente Heritage",
          image: "/api/placeholder/400/400",
          price: "1.2",
          isListed: true,
          offers: 7,
          sales: 2,
          culturalOrigin: "Ghana"
        },
        {
          id: 3,
          name: "Yoruba Masks Collection",
          image: "/api/placeholder/400/400",
          isListed: false,
          offers: 2,
          sales: 0,
          culturalOrigin: "Nigeria"
        }
      ];

      setStats(mockStats);
      setRecentNFTs(mockNFTs);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to access your artist dashboard</p>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Wrong Network</h2>
          <p className="text-gray-600">Please switch to Base Sepolia network to continue</p>
        </div>
      </div>
    );
  }

  const getVerificationBadge = () => {
    switch (stats.verificationStatus) {
      case 'verified':
        return (
          <div className="flex items-center text-green-600">
            <Award className="h-5 w-5 mr-2" />
            <span className="font-medium">Verified Artist</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-orange-600">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">Verification Pending</span>
          </div>
        );
      default:
        return (
          <Link href="/artist/verify" className="flex items-center text-blue-600 hover:text-blue-700">
            <Star className="h-5 w-5 mr-2" />
            <span className="font-medium">Get Verified</span>
          </Link>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Artist Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage your cultural NFTs and track your performance
              </p>
              <div className="mt-3">
                {getVerificationBadge()}
              </div>
            </div>
            <div className="flex space-x-3">
              <Link 
                href="/create"
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create NFT
              </Link>
              <Link 
                href="/create/batch"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Package className="h-4 w-4 mr-2" />
                Batch Mint
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Palette className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total NFTs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalNFTs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSales} ETH</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Royalties</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRoyalties} ETH</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Listed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeListings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Offers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOffers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">NYIGBA Tokens</p>
                <p className="text-2xl font-semibold text-gray-900">{parseFloat(stats.governanceTokens).toFixed(0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('royalties')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'royalties'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Royalty Management
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Recent NFTs */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Your Cultural NFTs</h3>
                    <Link 
                      href="/profile"
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View All
                    </Link>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentNFTs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {recentNFTs.map((nft) => (
                        <div key={nft.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <Palette className="h-16 w-16 text-gray-400" />
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">{nft.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">Origin: {nft.culturalOrigin}</p>
                            
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                {nft.isListed ? (
                                  <span className="text-green-600 font-medium">{nft.price} ETH</span>
                                ) : (
                                  <span className="text-gray-500">Not listed</span>
                                )}
                              </div>
                              <div className="text-gray-500">
                                {nft.offers} offers • {nft.sales} sales
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No NFTs yet</h3>
                      <p className="text-gray-600 mb-6">Create your first cultural NFT to get started</p>
                      <Link 
                        href="/create"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First NFT
                      </Link>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link 
                      href="/create"
                      className="p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <Plus className="h-8 w-8 text-purple-600 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Create NFT</h4>
                      <p className="text-sm text-gray-600">Mint a new cultural NFT</p>
                    </Link>

                    <Link 
                      href="/create/batch"
                      className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Package className="h-8 w-8 text-blue-600 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Batch Mint</h4>
                      <p className="text-sm text-gray-600">Mint up to 10 NFTs at once</p>
                    </Link>

                    <Link 
                      href="/marketplace"
                      className="p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Marketplace</h4>
                      <p className="text-sm text-gray-600">Browse and trade NFTs</p>
                    </Link>

                    <Link 
                      href="/governance"
                      className="p-6 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
                    >
                      <Award className="h-8 w-8 text-yellow-600 mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Governance</h4>
                      <p className="text-sm text-gray-600">Participate in DAO voting</p>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Royalties Tab */}
            {activeTab === 'royalties' && (
              <RoyaltyManagement />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">
                    Detailed analytics about your NFT performance, sales trends, and market insights will be available here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
