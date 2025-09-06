"use client";

import { useState } from 'react';
import { useCulturalNFT } from '@/hooks/useCulturalNFT';
import { useWallet } from '@/hooks/useWallet';
import { WalletConnection } from '@/components/WalletConnection';
import { toast } from 'react-hot-toast';
import { Plus, X, Upload, Palette } from 'lucide-react';

interface BatchNFTItem {
  id: string;
  name: string;
  description: string;
  culturalOrigin: string;
  language: string;
  category: string;
  artistName: string;
  imageFile: File | null;
  ipfsHash: string;
}

const CULTURAL_CATEGORIES = [
  'Traditional Art',
  'Music',
  'Dance',
  'Literature',
  'Crafts',
  'Rituals & Ceremonies',
  'Oral Traditions',
  'Architecture',
  'Cuisine',
  'Clothing & Textiles'
];

export default function BatchMintPage() {
  const [nftItems, setNftItems] = useState<BatchNFTItem[]>([
    {
      id: '1',
      name: '',
      description: '',
      culturalOrigin: '',
      language: '',
      category: CULTURAL_CATEGORIES[0],
      artistName: '',
      imageFile: null,
      ipfsHash: ''
    }
  ]);

  const { address, isConnected, isCorrectNetwork } = useWallet();
  const { loading, error, batchMintCulturalAssets } = useCulturalNFT();

  const addNFTItem = () => {
    if (nftItems.length >= 10) {
      toast.error('Maximum 10 NFTs can be minted in one batch');
      return;
    }

    const newItem: BatchNFTItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      culturalOrigin: '',
      language: '',
      category: CULTURAL_CATEGORIES[0],
      artistName: '',
      imageFile: null,
      ipfsHash: ''
    };

    setNftItems([...nftItems, newItem]);
  };

  const removeNFTItem = (id: string) => {
    if (nftItems.length === 1) {
      toast.error('At least one NFT is required');
      return;
    }
    setNftItems(nftItems.filter(item => item.id !== id));
  };

  const updateNFTItem = (id: string, field: keyof BatchNFTItem, value: any) => {
    setNftItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleFileUpload = (id: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    updateNFTItem(id, 'imageFile', file);
    
    // In a real implementation, you would upload to IPFS here
    // For now, we'll use a placeholder hash
    const placeholderHash = `ipfs://QmPlaceholder${Date.now()}`;
    updateNFTItem(id, 'ipfsHash', placeholderHash);
  };

  const validateForm = (): boolean => {
    for (const item of nftItems) {
      if (!item.name.trim()) {
        toast.error('All NFTs must have a name');
        return false;
      }
      if (!item.description.trim()) {
        toast.error('All NFTs must have a description');
        return false;
      }
      if (!item.culturalOrigin.trim()) {
        toast.error('All NFTs must have a cultural origin');
        return false;
      }
      if (!item.artistName.trim()) {
        toast.error('All NFTs must have an artist name');
        return false;
      }
      if (!item.ipfsHash) {
        toast.error('All NFTs must have an image uploaded');
        return false;
      }
    }
    return true;
  };

  const handleBatchMint = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!isCorrectNetwork) {
      toast.error('Please switch to Base Sepolia network');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const uris = nftItems.map(item => item.ipfsHash);
      const assets = nftItems.map(item => ({
        name: item.name,
        description: item.description,
        culturalOrigin: item.culturalOrigin,
        language: item.language,
        category: item.category,
        artistName: item.artistName,
        creationDate: Math.floor(Date.now() / 1000),
        ipfsHash: item.ipfsHash,
        verified: false
      }));

      const result = await batchMintCulturalAssets(address, uris, assets);
      
      toast.success(`Successfully minted ${nftItems.length} cultural NFTs!`);
      
      // Reset form
      setNftItems([{
        id: Date.now().toString(),
        name: '',
        description: '',
        culturalOrigin: '',
        language: '',
        category: CULTURAL_CATEGORIES[0],
        artistName: '',
        imageFile: null,
        ipfsHash: ''
      }]);

    } catch (err: any) {
      console.error('Batch mint error:', err);
      toast.error(err.message || 'Failed to mint NFTs');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Batch Mint Cultural NFTs
          </h1>
          <p className="text-lg text-gray-600">
            Create multiple cultural heritage NFTs in a single transaction - optimized for Base's low gas costs
          </p>
        </div>

        {/* Wallet Connection */}
        <WalletConnection />

        {/* Batch Mint Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-blue-800 mb-2">Batch Minting Benefits</h2>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Save on gas fees by minting up to 10 NFTs in one transaction</li>
            <li>• Perfect for artists with multiple pieces from the same collection</li>
            <li>• Optimized for Base network's 2-second block time</li>
            <li>• All NFTs will be minted to your address</li>
            <li>• Each NFT gets a unique token ID automatically</li>
          </ul>
        </div>

        {/* NFT Items */}
        <div className="space-y-6 mb-8">
          {nftItems.map((item, index) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-purple-500" />
                  NFT #{index + 1}
                </h3>
                {nftItems.length > 1 && (
                  <button
                    onClick={() => removeNFTItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NFT Name *
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateNFTItem(item.id, 'name', e.target.value)}
                      placeholder="e.g., Traditional Kente Pattern"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateNFTItem(item.id, 'description', e.target.value)}
                      placeholder="Describe the cultural significance and history..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cultural Origin *
                    </label>
                    <input
                      type="text"
                      value={item.culturalOrigin}
                      onChange={(e) => updateNFTItem(item.id, 'culturalOrigin', e.target.value)}
                      placeholder="e.g., Ghana, West Africa"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Right Column - Additional Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <input
                      type="text"
                      value={item.language}
                      onChange={(e) => updateNFTItem(item.id, 'language', e.target.value)}
                      placeholder="e.g., Akan, Twi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => updateNFTItem(item.id, 'category', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {CULTURAL_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Artist Name *
                    </label>
                    <input
                      type="text"
                      value={item.artistName}
                      onChange={(e) => updateNFTItem(item.id, 'artistName', e.target.value)}
                      placeholder="Your name or artist name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Upload *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {item.imageFile ? (
                    <div className="space-y-2">
                      <img
                        src={URL.createObjectURL(item.imageFile)}
                        alt="Preview"
                        className="max-h-32 mx-auto rounded"
                      />
                      <p className="text-sm text-gray-600">{item.imageFile.name}</p>
                      <button
                        onClick={() => updateNFTItem(item.id, 'imageFile', null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-2">Upload image for NFT #{index + 1}</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(item.id, file);
                        }}
                        className="hidden"
                        id={`file-upload-${item.id}`}
                      />
                      <label
                        htmlFor={`file-upload-${item.id}`}
                        className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-purple-700"
                      >
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={addNFTItem}
            disabled={nftItems.length >= 10}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Another NFT ({nftItems.length}/10)
          </button>

          <div className="text-sm text-gray-600">
            Gas optimization: {nftItems.length} NFT{nftItems.length !== 1 ? 's' : ''} in one transaction
          </div>
        </div>

        {/* Mint Button */}
        <div className="text-center">
          <button
            onClick={handleBatchMint}
            disabled={loading || !isConnected || !isCorrectNetwork}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Minting...' : `Mint ${nftItems.length} Cultural NFT${nftItems.length !== 1 ? 's' : ''}`}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
            Error: {error}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Important Notes</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• All NFTs in the batch will be minted to your connected wallet address</li>
            <li>• Make sure you're on the Base Sepolia network before minting</li>
            <li>• Images are currently stored as placeholders - IPFS integration coming soon</li>
            <li>• Each NFT will receive a unique token ID starting from the next available number</li>
            <li>• Batch minting saves gas compared to individual minting transactions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
