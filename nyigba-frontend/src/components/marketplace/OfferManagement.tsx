"use client";

import { useState, useEffect } from 'react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'react-hot-toast';
import { Clock, DollarSign, User, Check, X } from 'lucide-react';

interface Offer {
  buyer: string;
  price: string;
  deadline: Date;
  active: boolean;
  index: number;
}

interface OfferManagementProps {
  nftContract: string;
  tokenId: number;
  isOwner: boolean;
}

export function OfferManagement({ nftContract, tokenId, isOwner }: OfferManagementProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [newOfferAmount, setNewOfferAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const { address, isConnected, isCorrectNetwork } = useWallet();
  const { 
    makeOffer, 
    acceptOffer, 
    getOffers, 
    cancelOffer,
    loading: marketplaceLoading,
    error 
  } = useMarketplace();

  useEffect(() => {
    loadOffers();
  }, [nftContract, tokenId]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const fetchedOffers = await getOffers(nftContract, tokenId);
      const offersWithIndex = fetchedOffers.map((offer, index) => ({
        ...offer,
        index
      }));
      setOffers(offersWithIndex);
    } catch (err) {
      console.error('Error loading offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Base Sepolia');
      return;
    }

    if (!newOfferAmount || parseFloat(newOfferAmount) <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    try {
      await makeOffer(nftContract, tokenId, newOfferAmount);
      setNewOfferAmount('');
      await loadOffers();
      toast.success('Offer made successfully!');
    } catch (err: any) {
      console.error('Error making offer:', err);
      toast.error(err.message || 'Failed to make offer');
    }
  };

  const handleAcceptOffer = async (offerIndex: number) => {
    if (!isOwner) {
      toast.error('Only the NFT owner can accept offers');
      return;
    }

    try {
      await acceptOffer(nftContract, tokenId, offerIndex);
      await loadOffers();
      toast.success('Offer accepted successfully!');
    } catch (err: any) {
      console.error('Error accepting offer:', err);
      toast.error(err.message || 'Failed to accept offer');
    }
  };

  const handleCancelOffer = async (offerIndex: number, offerBuyer: string) => {
    if (address?.toLowerCase() !== offerBuyer.toLowerCase()) {
      toast.error('You can only cancel your own offers');
      return;
    }

    try {
      await cancelOffer(nftContract, tokenId, offerIndex);
      await loadOffers();
      toast.success('Offer cancelled successfully!');
    } catch (err: any) {
      console.error('Error cancelling offer:', err);
      toast.error(err.message || 'Failed to cancel offer');
    }
  };

  const isOfferExpired = (deadline: Date) => {
    return new Date() > deadline;
  };

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const timeLeft = deadline.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return 'Expired';
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else {
      return `${hours}h left`;
    }
  };

  const activeOffers = offers.filter(offer => offer.active && !isOfferExpired(offer.deadline));
  const expiredOffers = offers.filter(offer => offer.active && isOfferExpired(offer.deadline));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-6">Offers</h3>

      {/* Make Offer Section */}
      {!isOwner && isConnected && isCorrectNetwork && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-3">Make an Offer</h4>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="number"
                step="0.001"
                min="0"
                value={newOfferAmount}
                onChange={(e) => setNewOfferAmount(e.target.value)}
                placeholder="Enter offer amount in ETH"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleMakeOffer}
              disabled={marketplaceLoading || !newOfferAmount}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {marketplaceLoading ? 'Making...' : 'Make Offer'}
            </button>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            Your offer will be valid for 7 days and requires sending ETH upfront
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading offers...</p>
        </div>
      )}

      {/* Active Offers */}
      {!loading && activeOffers.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Active Offers ({activeOffers.length})</h4>
          <div className="space-y-3">
            {activeOffers.map((offer) => (
              <div key={offer.index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-green-600">
                      <DollarSign className="h-5 w-5 mr-1" />
                      <span className="font-semibold">{offer.price} ETH</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-sm font-mono">
                        {offer.buyer.slice(0, 6)}...{offer.buyer.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center text-orange-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{formatTimeRemaining(offer.deadline)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {isOwner && (
                      <button
                        onClick={() => handleAcceptOffer(offer.index)}
                        disabled={marketplaceLoading}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </button>
                    )}
                    
                    {address?.toLowerCase() === offer.buyer.toLowerCase() && (
                      <button
                        onClick={() => handleCancelOffer(offer.index, offer.buyer)}
                        disabled={marketplaceLoading}
                        className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expired Offers */}
      {!loading && expiredOffers.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-600 mb-3">Expired Offers ({expiredOffers.length})</h4>
          <div className="space-y-3">
            {expiredOffers.map((offer) => (
              <div key={offer.index} className="border border-gray-200 rounded-lg p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-gray-500">
                      <DollarSign className="h-5 w-5 mr-1" />
                      <span className="font-semibold">{offer.price} ETH</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      <span className="text-sm font-mono">
                        {offer.buyer.slice(0, 6)}...{offer.buyer.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center text-red-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">Expired</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Offers State */}
      {!loading && offers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No offers yet</p>
          <p className="text-sm">Be the first to make an offer on this cultural NFT!</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
          Error: {error}
        </div>
      )}

      {/* Offer Guidelines */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-semibold text-gray-800 mb-2">How Offers Work</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Offers require sending ETH upfront to ensure commitment</li>
          <li>• Offers are valid for 7 days from creation</li>
          <li>• Only the NFT owner can accept offers</li>
          <li>• Buyers can cancel their own offers anytime</li>
          <li>• Platform fee (0.25%) is deducted when offer is accepted</li>
        </ul>
      </div>
    </div>
  );
}
