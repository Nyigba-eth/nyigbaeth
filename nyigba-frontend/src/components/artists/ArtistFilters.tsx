'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, X, MapPin, Award, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const countries = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Uganda', 'Tanzania', 'Morocco',
  'Egypt', 'Senegal', 'Mali', 'Burkina Faso', 'Ivory Coast', 'Cameroon', 'Zimbabwe', 'Botswana'
]

const categories = [
  'Visual Arts', 'Music', 'Folklore', 'Traditional Crafts', 'Dance', 'Oral History',
  'Photography', 'Digital Art', 'Sculpture', 'Textiles', 'Pottery', 'Literature'
]

const verificationStatus = [
  'All Artists', 'Verified Only', 'Emerging Artists', 'Established Artists'
]

export function ArtistFilters() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All Artists')

  const clearFilters = () => {
    setSelectedCountry('')
    setSelectedCategory('')
    setSelectedStatus('All Artists')
  }

  const hasActiveFilters = selectedCountry || selectedCategory || selectedStatus !== 'All Artists'

  return (
    <div className="space-y-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center space-x-2"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: isOpen || window.innerWidth >= 1024 ? 1 : 0,
          y: isOpen || window.innerWidth >= 1024 ? 0 : -20
        }}
        className={`card space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Artists</span>
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Country Filter */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4" />
            <span>Country/Region</span>
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="input-field"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Award className="w-4 h-4" />
            <span>Art Category</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Award className="w-4 h-4" />
            <span>Verification Status</span>
          </label>
          <div className="space-y-2">
            {verificationStatus.map((status) => (
              <label key={status} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="verification"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Join as Artist CTA */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Are you an artist?
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Join our community and showcase your cultural heritage to the world.
            </p>
            <Button size="sm" className="w-full">
              Apply to Join
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
