'use client'

import { useState } from 'react'
import { ChevronDown, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CULTURAL_ORIGINS, LANGUAGES, NFT_CATEGORIES } from '@/lib/config'

export function NFTFilters() {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    origins: [] as string[],
    languages: [] as string[],
    categories: [] as string[],
    priceRange: [0, 10] as [number, number],
    sortBy: 'newest' as string
  })

  const handleFilterChange = (type: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }))
  }

  const handleCheckboxChange = (type: 'origins' | 'languages' | 'categories', value: string) => {
    const currentValues = filters[type]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    handleFilterChange(type, newValues)
  }

  const clearFilters = () => {
    setFilters({
      origins: [],
      languages: [],
      categories: [],
      priceRange: [0, 10],
      sortBy: 'newest'
    })
  }

  const hasActiveFilters = filters.origins.length > 0 || 
                          filters.languages.length > 0 || 
                          filters.categories.length > 0

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-6">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          <span className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block bg-white rounded-xl shadow-sm border border-gray-100 p-6`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Sort By */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="most_popular">Most Popular</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range (ETH)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceRange[0]}
              onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
              className="w-20 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
              className="w-20 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Cultural Origins */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cultural Origin
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {CULTURAL_ORIGINS.map((origin) => (
              <label key={origin} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.origins.includes(origin)}
                  onChange={() => handleCheckboxChange('origins', origin)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{origin}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Language
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {LANGUAGES.map((language) => (
              <label key={language} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.languages.includes(language)}
                  onChange={() => handleCheckboxChange('languages', language)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{language}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Category
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {NFT_CATEGORIES.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => handleCheckboxChange('categories', category)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Apply filters button for mobile */}
        <div className="lg:hidden">
          <Button
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  )
}
