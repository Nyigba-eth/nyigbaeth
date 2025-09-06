import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CreateNFTForm } from '@/components/create/CreateNFTForm'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function CreatePage() {
  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Creative Background Animations */}
        <div className="absolute inset-0 animated-gradient opacity-20 dark:opacity-10"></div>
        <div className="absolute inset-0 african-pattern opacity-30 dark:opacity-15"></div>
        
        {/* Creative Floating Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-gradient-to-br from-accent-400 to-primary-400 rounded-lg opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-10 w-12 h-12 bg-gradient-to-br from-secondary-400 to-accent-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
        
        <ProtectedRoute requireArtist={true}>
          <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
                Create Cultural <span className="gradient-text">Heritage NFT</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Share your traditional stories, art, and music with the world. 
                Preserve your culture and earn royalties forever.
              </p>
            </div>
            <CreateNFTForm />
          </div>
        </ProtectedRoute>
      </main>
      <Footer />
    </>
  )
}
