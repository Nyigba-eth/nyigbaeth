import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import '@rainbow-me/rainbowkit/styles.css'

// Extract API key from Alchemy URL if provided
const getAlchemyApiKey = () => {
  const alchemyUrl = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL
  if (alchemyUrl) {
    const match = alchemyUrl.match(/\/v2\/(.+)$/)
    return match ? match[1] : 'demo'
  }
  return process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'demo'
}

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [baseSepolia],
  [
    alchemyProvider({ 
      apiKey: getAlchemyApiKey()
    }),
    publicProvider(),
  ]
)

// Get default wallets
const { connectors } = getDefaultWallets({
  appName: 'Nyigba.eth',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains,
})

// Create wagmi config
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
})

export { chains }
