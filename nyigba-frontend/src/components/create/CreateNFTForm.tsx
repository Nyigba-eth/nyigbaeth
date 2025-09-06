'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { 
  Upload, 
  X, 
  Play, 
  Image as ImageIcon, 
  Music, 
  Info,
  Loader
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { CULTURAL_ORIGINS, LANGUAGES, NFT_CATEGORIES, APP_CONFIG } from '@/lib/config'
import { MintFormData } from '@/types'
import { toast } from 'react-hot-toast'

export function CreateNFTForm() {
  const [isUploading, setIsUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MintFormData>({
    defaultValues: {
      royaltyPercentage: APP_CONFIG.defaultRoyaltyPercentage,
      attributes: {
        origin: '',
        language: '',
        category: ''
      }
    }
  })

  const royaltyPercentage = watch('royaltyPercentage')

  // Image dropzone
  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive
  } = useDropzone({
    accept: {
      'image/*': APP_CONFIG.supportedImageTypes
    },
    maxFiles: 1,
    maxSize: APP_CONFIG.maxFileSize,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        setImageFile(file)
        setValue('image', file)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0]
      if (error?.code === 'file-too-large') {
        toast.error('File too large. Maximum size is 50MB.')
      } else if (error?.code === 'file-invalid-type') {
        toast.error('Invalid file type. Please upload an image.')
      }
    }
  })

  // Audio dropzone
  const {
    getRootProps: getAudioRootProps,
    getInputProps: getAudioInputProps,
    isDragActive: isAudioDragActive
  } = useDropzone({
    accept: {
      'audio/*': APP_CONFIG.supportedAudioTypes
    },
    maxFiles: 1,
    maxSize: APP_CONFIG.maxFileSize,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        setAudioFile(file)
        setValue('audio', file)
      }
    },
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0]?.errors[0]
      if (error?.code === 'file-too-large') {
        toast.error('Audio file too large. Maximum size is 50MB.')
      } else if (error?.code === 'file-invalid-type') {
        toast.error('Invalid audio file type.')
      }
    }
  })

  const onSubmit = async (data: MintFormData) => {
    if (!imageFile) {
      toast.error('Please upload an image')
      return
    }

    setIsUploading(true)
    try {
      // TODO: Implement NFT minting logic
      console.log('Minting NFT with data:', data)
      toast.success('NFT created successfully!')
    } catch (error) {
      console.error('Error creating NFT:', error)
      toast.error('Failed to create NFT. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setValue('image', null)
  }

  const removeAudio = () => {
    setAudioFile(null)
    setValue('audio', undefined)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Image Upload */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Visual Content <span className="text-red-500">*</span>
        </h2>
        
        {!imageFile ? (
          <div
            {...getImageRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isImageDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <input {...getImageInputProps()} />
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Upload your cultural artwork
            </p>
            <p className="text-gray-600 mb-4">
              Drag and drop your image here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports: JPG, PNG, WebP, SVG • Max size: 50MB
            </p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mt-4 text-sm text-gray-600">
              {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          </div>
        )}
      </div>

      {/* Audio Upload (Optional) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Audio Content <span className="text-gray-500">(Optional)</span>
        </h2>
        
        {!audioFile ? (
          <div
            {...getAudioRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isAudioDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <input {...getAudioInputProps()} />
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Add traditional music or narration
            </p>
            <p className="text-gray-600 mb-4">
              Drag and drop your audio file here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports: MP3, WAV, OGG, MP4 • Max size: 50MB
            </p>
          </div>
        ) : (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
            <div className="bg-primary-500 text-white p-3 rounded-lg">
              <Play className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{audioFile.name}</div>
              <div className="text-sm text-gray-600">
                {(audioFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <button
              type="button"
              onClick={removeAudio}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Cultural Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('name', { required: 'Title is required' })}
              placeholder="e.g., Ananse and the Wisdom Pot"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...register('description', { required: 'Description is required' })}
              placeholder="Tell the story behind your cultural heritage. What does it represent? What traditions does it preserve?"
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Cultural Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cultural Origin <span className="text-red-500">*</span>
            </label>
            <select
              {...register('attributes.origin', { required: 'Cultural origin is required' })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select origin</option>
              {CULTURAL_ORIGINS.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>
            {errors.attributes?.origin && (
              <p className="text-red-500 text-sm mt-1">{errors.attributes.origin.message}</p>
            )}
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language <span className="text-red-500">*</span>
            </label>
            <select
              {...register('attributes.language', { required: 'Language is required' })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select language</option>
              {LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
            {errors.attributes?.language && (
              <p className="text-red-500 text-sm mt-1">{errors.attributes.language.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...register('attributes.category', { required: 'Category is required' })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select category</option>
              {NFT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.attributes?.category && (
              <p className="text-red-500 text-sm mt-1">{errors.attributes.category.message}</p>
            )}
          </div>

          {/* Era/Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Era/Period <span className="text-gray-500">(Optional)</span>
            </label>
            <Input
              {...register('attributes.era')}
              placeholder="e.g., Ancient, Colonial, Modern"
            />
          </div>
        </div>
      </div>

      {/* Royalties */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Royalty Settings
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Royalty Percentage: {royaltyPercentage}%
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              {...register('royaltyPercentage')}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>20%</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-900">Royalty Split</h4>
                <div className="text-sm text-blue-700 mt-1 space-y-1">
                  <div>You (Artist): {APP_CONFIG.artistShare}%</div>
                  <div>Community Treasury: {APP_CONFIG.treasuryShare}%</div>
                  <div className="text-xs text-blue-600 mt-2">
                    The treasury share supports cultural preservation initiatives and community development.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="text-center">
        <Button
          type="submit"
          size="lg"
          disabled={isUploading}
          className="px-12"
        >
          {isUploading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Creating NFT...
            </>
          ) : (
            'Create NFT'
          )}
        </Button>
        <p className="text-sm text-gray-600 mt-4">
          By creating this NFT, you confirm that you own the rights to this cultural content 
          and agree to preserve it for future generations.
        </p>
      </div>
    </form>
  )
}
