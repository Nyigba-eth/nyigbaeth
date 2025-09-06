"use client";

import { useState } from 'react';
import { useNyigbaNames } from '@/hooks/useNyigbaNames';
import { useWallet } from '@/hooks/useWallet';

export const ContractTest = () => {
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);
  const { isConnected, isCorrectNetwork } = useWallet();
  const { checkAvailability } = useNyigbaNames();

  const runTest = async () => {
    if (!isConnected || !isCorrectNetwork) {
      setTestResult('Please connect to Base Sepolia network first');
      return;
    }

    setTesting(true);
    setTestResult('Testing contract connection...');

    try {
      // Test with a simple availability check
      const result = await checkAvailability('test123');
      setTestResult(`✅ Contract working! Test subdomain availability: ${result.available ? 'Available' : 'Not available'}, Fee: ${result.fee} ETH`);
    } catch (error: any) {
      setTestResult(`❌ Contract test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Contract Test</h3>
      <p className="text-yellow-700 mb-4">Test the connection to the deployed contract on Base Sepolia</p>
      
      <button
        onClick={runTest}
        disabled={testing || !isConnected || !isCorrectNetwork}
        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 mb-4"
      >
        {testing ? 'Testing...' : 'Test Contract'}
      </button>
      
      {testResult && (
        <div className="bg-white p-3 rounded border text-sm">
          {testResult}
        </div>
      )}
    </div>
  );
};
