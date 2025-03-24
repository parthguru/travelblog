'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Image, Calendar, Clock, AlertCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import the markdown editor with dynamic loading to prevent SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor').then(mod => mod.default), { ssr: false });

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function NewBlogPostPage() {
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [publishDate, setPublishDate] = useState('');
  const [publishTime, setPublishTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  // Media selector state
  const [availableMedia, setAvailableMedia] = useState<any[]>([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  
  // Fetch categories and tags
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/blog/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
        
        // Fetch tags
        const tagsResponse = await fetch('/api/admin/blog/tags');
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setTags(tagsData);
        }

        // Fetch media for the media selector
        const mediaResponse = await fetch('/api/admin/media');
        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          setAvailableMedia(mediaData.media || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load categories and tags');
      }
    };
    
    fetchData();
  }, []);

  // Set current date and time when scheduling is enabled
  useEffect(() => {
    if (isScheduling && !publishDate) {
      const now = new Date();
      // Set default publish date to tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setPublishDate(tomorrow.toISOString().split('T')[0]);
      setPublishTime(now.toTimeString().slice(0, 5)); // HH:MM format
    }
  }, [isScheduling, publishDate]);

  // Handle status change
  useEffect(() => {
    if (status === 'scheduled' && !isScheduling) {
      setIsScheduling(true);
    } else if (status !== 'scheduled' && isScheduling) {
      setIsScheduling(false);
    }
  }, [status]);
  
  // Handle tag selection toggle
  const toggleTag = (tagId: number) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId]
    );
  };

  // Media selector functions
  const openMediaSelector = () => {
    setShowMediaSelector(true);
  };
  
  const closeMediaSelector = () => {
    setShowMediaSelector(false);
    setMediaSearch('');
  };
  
  const selectMedia = (mediaUrl: string) => {
    setFeaturedImage(mediaUrl);
    closeMediaSelector();
  };
  
  const filteredMedia = mediaSearch
    ? availableMedia.filter(media => 
        media.filename.toLowerCase().includes(mediaSearch.toLowerCase()) ||
        (media.alt_text && media.alt_text.toLowerCase().includes(mediaSearch.toLowerCase()))
      )
    : availableMedia;
  
  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    if (status === 'scheduled' && (!publishDate || !publishTime)) {
      setError('Please set both date and time for scheduled posts');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Prepare publication date if status is scheduled
      let publish_date = null;
      if (status === 'scheduled' && publishDate && publishTime) {
        const dateTime = new Date(`${publishDate}T${publishTime}`);
        publish_date = dateTime.toISOString();
      }
      
      const response = await fetch('/api/admin/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || title.substring(0, 150) + '...',
          featured_image: featuredImage,
          category_id: selectedCategory,
          tags: selectedTags,
          status,
          publish_date
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create blog post');
      }
      
      // Redirect to posts list on success
      router.push('/admin/dashboard/blog/posts');
    } catch (err) {
      console.error('Error creating blog post:', err);
      setError((err as Error).message || 'Failed to create blog post');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create New Blog Post</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <button
            className="ml-auto"
            onClick={() => setError('')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg p-6 shadow-sm">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <div data-color-mode="light" className="w-full mb-4">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  height={400}
                  preview="edit"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Short summary of the post (optional). If left blank, it will be auto-generated."
              ></textarea>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-medium mb-3">Publishing Options</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="draft"
                        name="status"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="draft" className="ml-2 text-sm text-gray-700">Draft</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="published"
                        name="status"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="published" className="ml-2 text-sm text-gray-700">Publish Now</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="scheduled"
                        name="status"
                        checked={status === 'scheduled'}
                        onChange={() => setStatus('scheduled')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="scheduled" className="ml-2 text-sm text-gray-700">Schedule</label>
                    </div>
                  </div>
                </div>
                
                {isScheduling && (
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="mb-2">
                      <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Publication Date
                      </label>
                      <input
                        id="publishDate"
                        type="date"
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                        required={isScheduling}
                      />
                    </div>
                    <div>
                      <label htmlFor="publishTime" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Publication Time
                      </label>
                      <input
                        id="publishTime"
                        type="time"
                        value={publishTime}
                        onChange={(e) => setPublishTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={isScheduling}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Featured Image */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-medium mb-3">Featured Image</h3>
              
              {featuredImage ? (
                <div className="relative">
                  <img 
                    src={featuredImage} 
                    alt="Featured" 
                    className="w-full h-40 object-cover rounded border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={openMediaSelector}
                  className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center h-40"
                >
                  <Image className="h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Click to select featured image
                  </p>
                </div>
              )}
              
              {featuredImage && (
                <button
                  type="button"
                  onClick={openMediaSelector}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <Image className="h-4 w-4 mr-1" /> 
                  Change image
                </button>
              )}
            </div>
            
            {/* Tags */}
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-medium mb-3">Tags</h3>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag.id)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No tags available</p>
              )}
            </div>
          </div>
        </div>
      </form>
      
      {/* Media selector modal */}
      {showMediaSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Select Featured Image</h3>
              <button
                type="button"
                onClick={closeMediaSelector}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search media..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            
            {filteredMedia.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMedia.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => selectMedia(media.url)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={media.url}
                      alt={media.alt_text || 'Media item'}
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="mt-1 text-sm truncate">{media.filename}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 text-gray-500">
                No media found. Please upload images in the Media Library.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 