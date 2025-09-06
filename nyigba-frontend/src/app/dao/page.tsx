import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { DAOOverview } from '@/components/dao/DAOOverview'
import { ProposalList } from '@/components/dao/ProposalList'
import { TreasuryStats } from '@/components/dao/TreasuryStats'

export default function DAOPage() {
  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 mesh-gradient animate-mesh opacity-30 dark:opacity-20"></div>
        <div className="absolute inset-0 floating-shapes opacity-20 dark:opacity-10"></div>
        
        {/* Glowing Orbs for DAO Theme */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-xl animate-pulse-glow"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/10 rounded-full blur-xl animate-pulse-glow" style={{ animationDelay: '3s' }}></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
              Community <span className="gradient-text">Governance</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Shape the future of cultural preservation through decentralized governance. 
              Vote on proposals, approve artists, and manage the community treasury.
            </p>
          </div>

          <div className="space-y-8">
            <DAOOverview />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ProposalList />
              </div>
              <div>
                <TreasuryStats />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
