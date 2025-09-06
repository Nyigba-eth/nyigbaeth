import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MarketplaceHero } from '@/components/marketplace/MarketplaceHero'
import { NFTFilters } from '@/components/marketplace/NFTFilters'
import { NFTGrid } from '@/components/marketplace/NFTGrid'

export default function MarketplacePage() {
  return (
    <>
      <Header />
      <main className="relative min-h-screen">
        {/* Animated Background */}
        <div className="fixed inset-0 mesh-gradient animate-mesh opacity-30 dark:opacity-20 pointer-events-none"></div>
        <div className="fixed inset-0 african-pattern opacity-20 dark:opacity-10 pointer-events-none"></div>
        
        <MarketplaceHero />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-80">
              <NFTFilters />
            </aside>
            <div className="flex-1">
              <NFTGrid />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
