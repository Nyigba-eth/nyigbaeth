'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Twitter, Github, Globe, MessageCircle } from 'lucide-react';

const footerLinks = {
  platform: [
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'Artists', href: '/artists' },
    { name: 'Collections', href: '/collections' },
    { name: 'Create NFT', href: '/create' },
  ],
  governance: [
    { name: 'DAO', href: '/dao' },
    { name: 'Proposals', href: '/dao/proposals' },
    { name: 'Treasury', href: '/dao/treasury' },
    { name: 'Members', href: '/dao/members' },
  ],
  resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'Help Center', href: '/help' },
    { name: 'API', href: '/api' },
    { name: 'Status', href: '/status' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
}

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/nyigba_eth', icon: Twitter },
  { name: 'Discord', href: 'https://discord.gg/nyigba', icon: MessageCircle },
  { name: 'GitHub', href: 'https://github.com/nyigba-eth', icon: Github },
  { name: 'Website', href: 'https://nyigba.eth', icon: Globe },
]

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <Image
                  src="/images/nyigba-logo.svg"
                  alt="Nyigba.eth"
                  width={56}
                  height={56}
                  className="transition-transform duration-300 hover:scale-110"
                />
              </div>
              <span className="font-display font-bold text-xl gradient-text">
                Nyigba.eth
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mb-6">
              Preserving African heritage onchain, forever. A Web3 cultural heritage platform 
              that empowers creators with identity, royalties, and transparent community governance.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  aria-label={item.name}
                >
                  <item.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Governance */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
              Governance
            </h3>
            <ul className="space-y-3">
              {footerLinks.governance.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 mb-4 md:mb-0">
              {footerLinks.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-500 hover:text-primary-600 text-sm transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Nyigba.eth. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
