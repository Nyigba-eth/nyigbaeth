"use client";

import { useState, useEffect } from 'react';
import { useRoyaltySplitter } from '@/hooks/useRoyaltySplitter';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'react-hot-toast';
import { DollarSign, Users, Percent, Plus, Trash2, Download, Eye, Clock } from 'lucide-react';
import AddressDisplay from '@/components/ui/AddressDisplay';

interface RoyaltySplit {
  id: string;
  recipients: Array<{
    address: string;
    percentage: number;
    displayName?: string;
  }>;
  totalRoyalties: string;
  pendingPayments: string;
  isOwner: boolean;
}

interface Recipient {
  address: string;
  percentage: number;
  displayName?: string;
}

export function RoyaltyManagement() {
  const [splits, setSplits] = useState<RoyaltySplit[]>([]);
  const [newSplit, setNewSplit] = useState<{
    recipients: Recipient[];
    royaltyPercentage: number;
  }>({
    recipients: [{ address: '', percentage: 100, displayName: '' }],
    royaltyPercentage: 5
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<string | null>(null);

  const { address, isConnected, isCorrectNetwork } = useWallet();
  const {
    createRoyaltySplit,
    distributeRoyalty,
    getTotalRoyalties,
    getPendingPayment,
    getRecipients,
    loading,
    error
  } = useRoyaltySplitter();

  useEffect(() => {
    if (isConnected && address) {
      loadRoyaltySplits();
    }
  }, [isConnected, address]);

  const loadRoyaltySplits = async () => {
    try {
      // Load actual royalty splits from blockchain - no mock data
      // TODO: Implement actual blockchain data fetching
      setSplits([]); // Start with empty array until blockchain implementation is ready
    } catch (err) {
      console.error('Error loading royalty splits:', err);
      setSplits([]);
    }
  };

  const addRecipient = () => {
    if (newSplit.recipients.length >= 20) {
      toast.error('Maximum 20 recipients allowed');
      return;
    }

    setNewSplit({
      ...newSplit,
      recipients: [
        ...newSplit.recipients,
        { address: '', percentage: 0, displayName: '' }
      ]
    });
  };

  const removeRecipient = (index: number) => {
    if (newSplit.recipients.length <= 1) {
      toast.error('At least one recipient is required');
      return;
    }

    const updatedRecipients = newSplit.recipients.filter((_, i) => i !== index);
    setNewSplit({
      ...newSplit,
      recipients: updatedRecipients
    });
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string | number) => {
    const updatedRecipients = [...newSplit.recipients];
    updatedRecipients[index] = {
      ...updatedRecipients[index],
      [field]: value
    };
    setNewSplit({
      ...newSplit,
      recipients: updatedRecipients
    });
  };

  const getTotalPercentage = () => {
    return newSplit.recipients.reduce((sum, recipient) => sum + recipient.percentage, 0);
  };

  const validateSplit = () => {
    const totalPercentage = getTotalPercentage();
    
    if (totalPercentage !== 100) {
      toast.error('Total percentage must equal 100%');
      return false;
    }

    for (const recipient of newSplit.recipients) {
      if (!recipient.address || recipient.percentage <= 0) {
        toast.error('All recipients must have valid addresses and percentages');
        return false;
      }
    }

    if (newSplit.royaltyPercentage < 0 || newSplit.royaltyPercentage > 10) {
      toast.error('Royalty percentage must be between 0% and 10%');
      return false;
    }

    return true;
  };

  const handleCreateSplit = async () => {
    if (!isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Base Sepolia');
      return;
    }

    if (!validateSplit()) {
      return;
    }

    try {
      const recipients = newSplit.recipients.map(r => r.address);
      const percentages = newSplit.recipients.map(r => r.percentage * 100); // Convert to basis points

      await createRoyaltySplit(recipients, percentages, newSplit.royaltyPercentage * 100);
      
      setNewSplit({
        recipients: [{ address: '', percentage: 100, displayName: '' }],
        royaltyPercentage: 5
      });
      setShowCreateForm(false);
      await loadRoyaltySplits();
      toast.success('Royalty split created successfully!');
    } catch (err: any) {
      console.error('Error creating royalty split:', err);
      toast.error(err.message || 'Failed to create royalty split');
    }
  };

  const handleDistributeRoyalties = async (splitId: string) => {
    if (!isConnected || !isCorrectNetwork) {
      toast.error('Please connect your wallet to Base Sepolia');
      return;
    }

    try {
      await distributeRoyalty(splitId);
      await loadRoyaltySplits();
      toast.success('Royalties distributed successfully!');
    } catch (err: any) {
      console.error('Error distributing royalties:', err);
      toast.error(err.message || 'Failed to distribute royalties');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Royalty Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Split
        </button>
      </div>

      {/* Create Split Form */}
      {showCreateForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Create New Royalty Split</h3>
          
          {/* Royalty Percentage */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Royalty Percentage (0-10%)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={newSplit.royaltyPercentage}
              onChange={(e) => setNewSplit({ ...newSplit, royaltyPercentage: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="5.0"
            />
            <p className="text-sm text-gray-500 mt-1">
              This percentage will be applied to all sales and distributed among recipients
            </p>
          </div>

          {/* Recipients */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Recipients ({newSplit.recipients.length}/20)
              </label>
              <div className="text-sm">
                Total: <span className={`font-semibold ${getTotalPercentage() === 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {getTotalPercentage()}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {newSplit.recipients.map((recipient, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={recipient.address}
                      onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      value={recipient.displayName}
                      onChange={(e) => updateRecipient(index, 'displayName', e.target.value)}
                      placeholder="Display name (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={recipient.percentage}
                      onChange={(e) => updateRecipient(index, 'percentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    />
                    <span className="ml-2 text-gray-500">%</span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => removeRecipient(index)}
                      disabled={newSplit.recipients.length <= 1}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addRecipient}
              disabled={newSplit.recipients.length >= 20}
              className="mt-3 flex items-center px-3 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recipient
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSplit}
              disabled={loading || getTotalPercentage() !== 100}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Split'}
            </button>
          </div>
        </div>
      )}

      {/* Existing Splits */}
      <div className="space-y-6">
        {splits.map((split) => (
          <div key={split.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Royalty Split</h3>
                <p className="text-sm text-gray-500 font-mono">{split.id}</p>
              </div>
              
              {split.isOwner && parseFloat(split.pendingPayments) > 0 && (
                <button
                  onClick={() => handleDistributeRoyalties(split.id)}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Distribute
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
                  <div>
                    <div className="text-sm text-blue-600">Total Royalties</div>
                    <div className="font-semibold">{split.totalRoyalties} ETH</div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-orange-600 mr-2" />
                  <div>
                    <div className="text-sm text-orange-600">Pending Distribution</div>
                    <div className="font-semibold">{split.pendingPayments} ETH</div>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-6 w-6 text-purple-600 mr-2" />
                  <div>
                    <div className="text-sm text-purple-600">Recipients</div>
                    <div className="font-semibold">{split.recipients.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recipients List */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Recipients</h4>
              <div className="space-y-2">
                {split.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {recipient.displayName || `Recipient ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          <AddressDisplay address={recipient.address} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="font-semibold">{recipient.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Splits State */}
      {splits.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No royalty splits created</h3>
          <p className="text-gray-600 mb-6">
            Create your first royalty split to automatically distribute earnings from your cultural NFTs
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center mx-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Split
          </button>
        </div>
      )}

      {/* How It Works */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">How Royalty Splits Work</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Create royalty splits to automatically distribute earnings from your NFT sales</p>
          <p>• Set up to 20 recipients with custom percentage allocations</p>
          <p>• Royalties are collected automatically on secondary sales</p>
          <p>• Recipients can claim their share or the split owner can distribute manually</p>
          <p>• All transactions are transparent and recorded on the blockchain</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          Error: {error}
        </div>
      )}
    </div>
  );
}
