'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { Menu, X, Palette, Home, Users, Gavel, Plus, ChevronDown, BarChart3, Settings, HelpCircle, FileText, Globe, Shield, Package, Vote } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { CustomConnectButton } from '@/components/ui/CustomConnectButton'
import { cn } from '@/lib/utils'

const primaryNavigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Marketplace', href: '/marketplace', icon: Gavel },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Governance', href: '/governance', icon: Vote },
]

const createNavigation = [
  { name: 'Create NFT', href: '/create/nft', icon: Palette },
  { name: 'Batch Mint', href: '/create/batch', icon: Package },
]

const moreNavigation = [
  { name: 'Artist Registry', href: '/artists/register', icon: Users },
  { name: 'Subdomains', href: '/subdomains', icon: Globe },
  { name: 'Implementation', href: '/implementation', icon: FileText },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  const { isConnected, address } = useAccount()
  
  const createDropdownRef = useRef<HTMLDivElement>(null)
  const moreDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (createDropdownRef.current && !createDropdownRef.current.contains(event.target as Node)) {
        setCreateDropdownOpen(false)
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Image
                  src="/images/nyigba-logo.svg"
                  alt="Nyigba.eth"
                  width={48}
                  height={48}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors duration-300">
                Nyigba.eth
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {/* Primary Navigation */}
            {primaryNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Create Dropdown */}
            <div className="relative" ref={createDropdownRef}>
              <button
                onClick={() => {
                  setCreateDropdownOpen(!createDropdownOpen)
                  setMoreDropdownOpen(false)
                }}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${createDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {createDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {createNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      onClick={() => setCreateDropdownOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* More Dropdown */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => {
                  setMoreDropdownOpen(!moreDropdownOpen)
                  setCreateDropdownOpen(false)
                }}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <span>More</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {moreDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {moreNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      onClick={() => setMoreDropdownOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <ThemeToggle />
            
            {isConnected && (
              <div className="flex items-center space-x-2">
                <Link href="/create/nft">
                  <Button variant="outline" size="sm" className="hidden lg:flex">
                    <Plus className="w-4 h-4 mr-1" />
                    Create
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            )}
            
            <CustomConnectButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
              {/* Primary Navigation */}
              <div className="px-4 py-3 space-y-1">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Main Menu
                </div>
                {primaryNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* Create Section */}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Create
                </div>
                {createNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* More Section */}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  More
                </div>
                {moreNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
              
              {/* Actions */}
              <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                  <ThemeToggle />
                </div>
                
                {isConnected && (
                  <div className="space-y-2">
                    <Link href="/create/nft" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Create NFT
                      </Button>
                    </Link>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                  </div>
                )}
                
                <div className="pt-2">
                  <CustomConnectButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
