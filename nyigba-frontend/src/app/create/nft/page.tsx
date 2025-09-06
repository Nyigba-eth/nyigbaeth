"use client";

import { useState, useEffect } from 'react';
import { useCulturalNFT } from '@/hooks/useCulturalNFT';
import { useArtistRegistry } from '@/hooks/useArtistRegistry';
import { useWallet } from '@/hooks/useWallet';
import { WalletConnection } from '@/components/WalletConnection';
import { toast } from 'react-hot-toast';
import { Palette, Upload, Globe, Calendar, User, FileText } from 'lucide-react';

export default function CreateNFTPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    culturalOrigin: '',
    language: '',
    category: '',
    artistName: '',
    ipfsHash: '',
    uri: ''
  });
  const [isArtist, setIsArtist] = useState(false);
  const [nextTokenId, setNextTokenId] = useState(1);

  const { address, isConnected, isCorrectNetwork } = useWallet();
  const { loading, error, mintCulturalAsset, getNextTokenId } = useCulturalNFT();
  const { isRegisteredArtist } = useArtistRegistry();

  useEffect(() => {
    if (isConnected && isCorrectNetwork && address) {
      checkArtistStatus();
      loadNextTokenId();
    }
  }, [isConnected, isCorrectNetwork, address]);

  const checkArtistStatus = async () => {
    if (!address) return;
    
    try {
      const artistStatus = await isRegisteredArtist(address);
      setIsArtist(artistStatus);
    } catch (err) {
      console.error('Error checking artist status:', err);
    }
  };

  const loadNextTokenId = async () => {
    try {
      const tokenId = await getNextTokenId();
      setNextTokenId(tokenId);
    } catch (err) {
      console.error('Error loading next token ID:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !isCorrectNetwork) {
      toast.error('Please connect to Base Sepolia network');
      return;
    }

    if (!isArtist) {
      toast.error('You must be a verified artist to mint NFTs');
      return;
    }

    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'culturalOrigin', 'language', 'category', 'artistName', 'uri'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData].trim()) {
        toast.error(`Please fill in the ${field} field`);
        return;
      }
    }

    try {
      const asset = {
        name: formData.name,
        description: formData.description,
        culturalOrigin: formData.culturalOrigin,
        language: formData.language,
        category: formData.category,
        artistName: formData.artistName,
        creationDate: Math.floor(Date.now() / 1000),
        ipfsHash: formData.ipfsHash || '',
        verified: false
      };

      await mintCulturalAsset(address, formData.uri, asset);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        culturalOrigin: '',
        language: '',
        category: '',
        artistName: '',
        ipfsHash: '',
        uri: ''
      });
      
      // Reload next token ID
      setTimeout(() => loadNextTokenId(), 2000);
    } catch (err) {
      console.error('Minting error:', err);
    }
  };

  const categories = [
    'Traditional Art',
    'Music',
    'Dance',
    'Literature',
    'Crafts',
    'Rituals & Ceremonies',
    'Oral Traditions',
    'Architecture',
    'Cuisine',
    'Clothing & Textiles',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Cultural Heritage NFT
          </h1>
          <p className="text-lg text-gray-600">
            Preserve and share cultural heritage through blockchain technology
          </p>
        </div>

        {/* Wallet Connection */}
        <WalletConnection />

        {/* Artist Status Check */}
        {isConnected && isCorrectNetwork && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Artist Verification Status
            </h2>
            
            {isArtist ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Palette className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <h3 className="font-semibold text-green-800">Verified Artist</h3>
                    <p className="text-green-700">You can mint cultural heritage NFTs</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <h3 className="font-semibold text-red-800">Not Verified</h3>
                    <p className="text-red-700">
                      You must be a verified artist to mint NFTs. 
                      <a href="/artists/register" className="ml-1 underline">Apply here</a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NFT Creation Form */}
        {isConnected && isCorrectNetwork && isArtist && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Create Cultural NFT #{nextTokenId}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Asset Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name of the cultural asset"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Artist Name *
                  </label>
                  <input
                    type="text"
                    id="artistName"
                    name="artistName"
                    value={formData.artistName}
                    onChange={handleInputChange}
                    placeholder="Your name or artist pseudonym"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Detailed description of the cultural heritage asset"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Cultural Information */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="culturalOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Cultural Origin *
                  </label>
                  <input
                    type="text"
                    id="culturalOrigin"
                    name="culturalOrigin"
                    value={formData.culturalOrigin}
                    onChange={handleInputChange}
                    placeholder="e.g., West African, Yoruba, Nigeria"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                    Language *
                  </label>
                  <input
                    type="text"
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="e.g., Yoruba, English, French"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Metadata URLs */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="uri" className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="h-4 w-4 inline mr-1" />
                    Metadata URI *
                  </label>
                  <input
                    type="url"
                    id="uri"
                    name="uri"
                    value={formData.uri}
                    onChange={handleInputChange}
                    placeholder="https://ipfs.io/ipfs/... or https://arweave.net/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    IPFS or Arweave URL pointing to the NFT metadata JSON
                  </p>
                </div>

                <div>
                  <label htmlFor="ipfsHash" className="block text-sm font-medium text-gray-700 mb-2">
                    IPFS Hash (Optional)
                  </label>
                  <input
                    type="text"
                    id="ipfsHash"
                    name="ipfsHash"
                    value={formData.ipfsHash}
                    onChange={handleInputChange}
                    placeholder="QmXxXxXx... (if stored on IPFS)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    IPFS hash for direct content reference
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Minting NFT...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4 mr-2" />
                    Mint Cultural Heritage NFT
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">About Cultural Heritage NFTs</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• NFTs are minted on Base Sepolia for low gas costs</li>
            <li>• Each NFT represents a unique cultural heritage asset</li>
            <li>• Artists retain full ownership and royalty rights</li>
            <li>• Metadata should be stored on decentralized storage (IPFS/Arweave)</li>
            <li>• Only verified artists can mint cultural heritage NFTs</li>
            <li>• All cultural information is permanently stored on-chain</li>
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
