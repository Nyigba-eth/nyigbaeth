import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/home/Hero'
import { Features } from '@/components/home/Features'
import { Stats } from '@/components/home/Stats'
import { RecentNFTs } from '@/components/home/RecentNFTs'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Stats />
        <RecentNFTs />
      </main>
      <Footer />
    </>
  )
}
