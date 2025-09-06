'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Award, Heart, ExternalLink, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Sample artist data - in real app, this would come from API
const sampleArtists = [
  {
    id: 1,
    name: 'Amara Okafor',
    location: 'Lagos, Nigeria',
    category: 'Traditional Crafts',
    verified: true,
    avatar: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/400/200',
    bio: 'Master craftsperson specializing in Yoruba traditional pottery and ceramics',
    artworksCount: 23,
    followersCount: 1247,
    joinedDate: '2023-01-15',
    isFollowing: false
  },
  {
    id: 2,
    name: 'Kwame Asante',
    location: 'Accra, Ghana',
    category: 'Visual Arts',
    verified: true,
    avatar: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/400/200',
    bio: 'Contemporary artist blending Adinkra symbols with modern digital art',
    artworksCount: 45,
    followersCount: 2156,
    joinedDate: '2022-11-08',
    isFollowing: true
  },
  {
    id: 3,
    name: 'Zara Olamide',
    location: 'Johannesburg, South Africa',
    category: 'Photography',
    verified: false,
    avatar: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/400/200',
    bio: 'Documentary photographer capturing modern African urban culture',
    artworksCount: 67,
    followersCount: 892,
    joinedDate: '2023-03-22',
    isFollowing: false
  },
  {
    id: 4,
    name: 'Chidi Okwu',
    location: 'Abuja, Nigeria',
    category: 'Music',
    verified: true,
    avatar: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/400/200',
    bio: 'Traditional drummer and composer preserving Igbo musical heritage',
    artworksCount: 18,
    followersCount: 3421,
    joinedDate: '2022-07-12',
    isFollowing: false
  },
  {
    id: 5,
    name: 'Fatima Al-Rashid',
    location: 'Cairo, Egypt',
    category: 'Textiles',
    verified: true,
    avatar: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/400/200',
    bio: 'Traditional weaver creating contemporary interpretations of ancient patterns',
    artworksCount: 31,
    followersCount: 1876,
    joinedDate: '2023-02-03',
    isFollowing: true
  },
  {
    id: 6,
    name: 'Desta Mekonnen',
    location: 'Addis Ababa, Ethiopia',
    category: 'Literature',
    verified: false,
    avatar: '/api/placeholder/150/150',
    coverImage: '/api/placeholder/400/200',
    bio: 'Storyteller preserving Amharic oral traditions through digital narratives',
    artworksCount: 12,
    followersCount: 567,
    joinedDate: '2023-05-18',
    isFollowing: false
  }
]

export function ArtistGrid() {
  const [artists, setArtists] = useState(sampleArtists)
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid')

  const toggleFollow = (artistId: number) => {
    setArtists(prev => prev.map(artist => 
      artist.id === artistId 
        ? { ...artist, isFollowing: !artist.isFollowing }
        : artist
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {artists.length} artists
        </p>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setCurrentView('grid')}
            className={`px-3 py-1 text-sm ${
              currentView === 'grid'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setCurrentView('list')}
            className={`px-3 py-1 text-sm ${
              currentView === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Artists Grid */}
      <motion.div 
        layout
        className={
          currentView === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {artists.map((artist, index) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card group hover:shadow-lg transition-all duration-300 ${
              currentView === 'list' ? 'flex space-x-4' : ''
            }`}
          >
            {/* Cover Image */}
            <div className={`relative overflow-hidden ${
              currentView === 'list' ? 'w-24 h-24 flex-shrink-0' : 'h-32'
            } bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg mb-4`}>
              <Image
                src={artist.coverImage}
                alt={`${artist.name}'s work`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            <div className={currentView === 'list' ? 'flex-1 min-w-0' : ''}>
              {/* Artist Info */}
              <div className="flex items-start space-x-3 mb-3">
                <div className="relative">
                  <Image
                    src={artist.avatar}
                    alt={artist.name}
                    width={48}
                    height={48}
                    className="rounded-full ring-2 ring-white dark:ring-gray-700"
                  />
                  {artist.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    href={`/artists/${artist.id}`}
                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {artist.name}
                  </Link>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{artist.location}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFollow(artist.id)}
                  className={`${
                    artist.isFollowing
                      ? 'text-red-600 hover:text-red-700'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Heart 
                    className={`w-4 h-4 ${artist.isFollowing ? 'fill-current' : ''}`}
                  />
                </Button>
              </div>

              {/* Category Badge */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                  {artist.category}
                </span>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {artist.bio}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <ExternalLink className="w-3 h-3" />
                    <span>{artist.artworksCount} works</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{artist.followersCount.toLocaleString()}</span>
                  </span>
                </div>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {formatDate(artist.joinedDate)}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Link href={`/artists/${artist.id}`} className="flex-1">
                  <Button size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => toggleFollow(artist.id)}
                  className={artist.isFollowing ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20' : ''}
                >
                  {artist.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Load More */}
      <div className="flex justify-center pt-8">
        <Button variant="outline" size="lg">
          Load More Artists
        </Button>
      </div>
    </div>
  )
}
