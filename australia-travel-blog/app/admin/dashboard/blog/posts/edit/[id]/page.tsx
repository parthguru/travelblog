'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Image, Trash2, Calendar, Clock, AlertCircle } from 'lucide-react';
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

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category_id?: number;
  status: 'draft' | 'published' | 'scheduled';
  created_at: string;
  updated_at: string;
  publish_date?: string;
  tags: number[];
}

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const postId = parseInt(params.id);
  
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [availableMedia, setAvailableMedia] = useState<any[]>([]);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  
  // Fetch post data and options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch post data
        const postResponse = await fetch(`/api/admin/blog/posts/${postId}`);
        if (!postResponse.ok) {
          throw new Error('Failed to fetch post data');
        }
        
        const postData: BlogPost = await postResponse.json();
        
        // Set form state from post data
        setTitle(postData.title);
        setContent(postData.content);
        setExcerpt(postData.excerpt || '');
        setFeaturedImage(postData.featured_image || '');
        setSelectedCategory(postData.category_id || null);
        setSelectedTags(postData.tags || []);
        setStatus(postData.status);
        
        // Handle publish date if it exists
        if (postData.publish_date) {
          const dateObj = new Date(postData.publish_date);
          setPublishDate(dateObj.toISOString().split('T')[0]);
          
          // Format time as HH:MM
          const hours = String(dateObj.getHours()).padStart(2, '0');
          const minutes = String(dateObj.getMinutes()).padStart(2, '0');
          setPublishTime(`${hours}:${minutes}`);
          
          if (postData.status === 'scheduled') {
            setIsScheduling(true);
          }
        } else {
          // Set default time to current time + 1 hour rounded to nearest 5 minutes
          const now = new Date();
          now.setHours(now.getHours() + 1);
          now.setMinutes(Math.ceil(now.getMinutes() / 5) * 5);
          
          const hours = String(now.getHours()).padStart(2, '0');
          const minutes = String(now.getMinutes()).padStart(2, '0');
          setPublishTime(`${hours}:${minutes}`);
          
          // Set default date to today
          setPublishDate(new Date().toISOString().split('T')[0]);
        }
        
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
        
        // Fetch media
        const mediaResponse = await fetch('/api/admin/media');
        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          setAvailableMedia(mediaData.media || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load post data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (postId) {
      fetchData();
    }
  }, [postId]);
  
  // Handle tag selection toggle
  const toggleTag = (tagId: number) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId]
    );
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Prepare publish_date if scheduling
      let finalStatus = status;
      let publishDateISOString = null;
      
      if (isScheduling && publishDate && publishTime) {
        const [hours, minutes] = publishTime.split(':').map(Number);
        const scheduleDate = new Date(publishDate);
        scheduleDate.setHours(hours, minutes, 0, 0);
        
        // If schedule date is in the future, set as scheduled
        if (scheduleDate > new Date()) {
          finalStatus = 'scheduled';
          publishDateISOString = scheduleDate.toISOString();
        } else {
          // If schedule date is in the past, publish immediately
          finalStatus = 'published';
          publishDateISOString = new Date().toISOString();
        }
      } else if (status === 'published') {
        // If publishing now
        publishDateISOString = new Date().toISOString();
      }
      
      const postData = {
        title,
        content,
        excerpt: excerpt || null,
        featured_image: featuredImage || null,
        category_id: selectedCategory || null,
        status: finalStatus,
        publish_date: publishDateISOString,
        tags: selectedTags,
      };
      
      const response = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      
      setSuccessMessage(
        finalStatus === 'draft' 
          ? 'Draft saved successfully' 
          : finalStatus === 'scheduled'
            ? `Post scheduled for ${new Date(publishDateISOString!).toLocaleString()}`
            : 'Post published successfully'
      );
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/admin/blog/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      router.push('/admin/dashboard/blog/posts');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
      setShowDeleteModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={isSubmitting}
          >
            <Trash2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard/blog/posts')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
          <button
            className="ml-auto"
            onClick={() => setError('')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block mb-1 font-medium">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Post title"
              />
            </div>
            
            {/* Content */}
            <div>
              <label htmlFor="content" className="block mb-1 font-medium">
                Content
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
            
            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block mb-1 font-medium">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Short excerpt or summary (optional)"
              ></textarea>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Publishing Options */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h3 className="font-medium mb-3">Publishing Options</h3>
              
              <div className="space-y-3">
                {/* Status */}
                <div>
                  <label className="block mb-1 text-sm">Status</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="status"
                        checked={status === 'draft' && !isScheduling}
                        onChange={() => {
                          setStatus('draft');
                          setIsScheduling(false);
                        }}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">Draft</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="status"
                        checked={status === 'published' && !isScheduling}
                        onChange={() => {
                          setStatus('published');
                          setIsScheduling(false);
                        }}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">Publish Now</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="status"
                        checked={isScheduling}
                        onChange={() => {
                          setIsScheduling(true);
                        }}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-sm">Schedule</span>
                    </label>
                  </div>
                </div>
                
                {/* Schedule Options */}
                {isScheduling && (
                  <div className="bg-white p-3 rounded border border-gray-200 mt-2">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <label htmlFor="publish-date" className="block text-sm">
                        Publish Date
                      </label>
                    </div>
                    <input
                      type="date"
                      id="publish-date"
                      value={publishDate}
                      onChange={(e) => setPublishDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
                    />
                    
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <label htmlFor="publish-time" className="block text-sm">
                        Publish Time
                      </label>
                    </div>
                    <input
                      type="time"
                      id="publish-time"
                      value={publishTime}
                      onChange={(e) => setPublishTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Featured Image */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
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
            
            {/* Category */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <h3 className="font-medium mb-3">Category</h3>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Tags */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
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
        
        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {isScheduling 
                  ? 'Schedule Post' 
                  : status === 'published'
                    ? 'Publish Post' 
                    : 'Save Draft'}
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-medium mb-4">Delete Post</h3>
            <p className="mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
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