'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { UserDisplay } from '@/components/ui/UserDisplay'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CustomConnectButton() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} size="sm">
                    Connect Wallet
                  </Button>
                )
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="outline" size="sm">
                    Wrong network
                  </Button>
                )
              }

              return (
                <div className="flex items-center space-x-2">
                  {/* Chain indicator */}
                  <button
                    onClick={openChainModal}
                    className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded-lg transition-colors"
                    title={chain.name}
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Account button with dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      <UserDisplay 
                        address={account.address as `0x${string}`} 
                        variant="name-only"
                        showAvatar={true}
                        avatarSize="sm"
                        showTooltip={false}
                      />
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        {/* User info header */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <UserDisplay 
                            address={account.address as `0x${string}`} 
                            variant="full"
                            showAvatar={true}
                            avatarSize="md"
                            showTooltip={false}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Balance: {account.displayBalance ? account.displayBalance : '0 ETH'}
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          <Link href="/profile" onClick={() => setDropdownOpen(false)}>
                            <div className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <User className="w-4 h-4" />
                              <span>Profile</span>
                            </div>
                          </Link>
                          <Link href="/settings" onClick={() => setDropdownOpen(false)}>
                            <div className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <Settings className="w-4 h-4" />
                              <span>Settings</span>
                            </div>
                          </Link>
                          <button
                            onClick={() => {
                              setDropdownOpen(false)
                              openAccountModal()
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Disconnect</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}
