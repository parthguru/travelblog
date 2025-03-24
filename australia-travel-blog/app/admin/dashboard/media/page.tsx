'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { XIcon, TrashIcon, PencilIcon, UploadIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { toast } from 'react-toastify';

interface MediaItem {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function MediaLibrary() {
  const router = useRouter();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch media items
  const fetchMediaItems = async (retryCount = 0) => {
    setLoading(true);
    try {
      let url = `/api/admin/media?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (activeType) {
        url += `&type=${encodeURIComponent(activeType)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Server returned ${response.status}`;
        throw new Error(`Failed to fetch media items: ${errorMessage}`);
      }
      
      const data = await response.json();
      setMediaItems(data.media);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching media items:', error);
      // Try up to 2 retries on network errors
      if (retryCount < 2 && (error instanceof TypeError || error.message.includes('network'))) {
        setTimeout(() => fetchMediaItems(retryCount + 1), 1000);
        return;
      }
      toast.error(`Error fetching media items: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaItems();
  }, [pagination.page, search, activeType]);

  // Handle file upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (altText) {
        formData.append('alt_text', altText);
      }
      
      if (caption) {
        formData.append('caption', caption);
      }
      
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload media');
      }
      
      const data = await response.json();
      toast.success('Media uploaded successfully');
      fetchMediaItems();
      setUploadModalOpen(false);
      resetUploadForm();
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Error uploading media');
    } finally {
      setUploading(false);
    }
  };

  // Handle media deletion
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this media item?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete media item');
      }
      
      toast.success('Media deleted successfully');
      fetchMediaItems();
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Error deleting media');
    }
  };

  // Handle media update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMedia) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/media/${currentMedia.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alt_text: altText,
          caption: caption
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update media item');
      }
      
      toast.success('Media updated successfully');
      fetchMediaItems();
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('Error updating media');
    }
  };

  // Open edit modal
  const openEditModal = (media: MediaItem) => {
    setCurrentMedia(media);
    setAltText(media.alt_text || '');
    setCaption(media.caption || '');
    setEditModalOpen(true);
  };

  // Reset upload form
  const resetUploadForm = () => {
    setFile(null);
    setAltText('');
    setCaption('');
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Media Library</h1>
        
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search media..."
              className="pl-10 pr-4 py-2 border rounded-md w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <div className="flex space-x-2">
            <button
              className={`px-3 py-2 border rounded-md ${activeType === null ? 'bg-blue-100 text-blue-700 border-blue-300' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveType(null)}
            >
              All
            </button>
            <button
              className={`px-3 py-2 border rounded-md ${activeType === 'image' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveType('image')}
            >
              Images
            </button>
            <button
              className={`px-3 py-2 border rounded-md ${activeType === 'video' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveType('video')}
            >
              Videos
            </button>
            <button
              className={`px-3 py-2 border rounded-md ${activeType === 'document' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'hover:bg-gray-100'}`}
              onClick={() => setActiveType('document')}
            >
              Documents
            </button>
          </div>
          
          <button
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => setUploadModalOpen(true)}
          >
            <UploadIcon className="h-5 w-5 mr-2" />
            Upload New
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {mediaItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No media items found</p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setUploadModalOpen(true)}
              >
                Upload your first media
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {mediaItems.map((media) => (
                  <div
                    key={media.id}
                    className="border rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    {media.file_type === 'image' ? (
                      <div className="relative h-40 bg-gray-100">
                        <Image
                          src={media.file_path}
                          alt={media.alt_text || media.original_filename}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    ) : media.file_type === 'video' ? (
                      <div className="relative h-40 bg-gray-800 flex items-center justify-center">
                        <span className="text-white">Video</span>
                      </div>
                    ) : (
                      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500">Document</span>
                      </div>
                    )}
                    
                    <div className="p-3">
                      <p className="font-medium truncate" title={media.original_filename}>
                        {media.original_filename}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(media.created_at).toLocaleDateString()}
                      </p>
                      
                      <div className="flex mt-3 space-x-2">
                        <button
                          className="p-1 text-gray-500 hover:text-blue-600"
                          onClick={() => openEditModal(media)}
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-red-600"
                          onClick={() => handleDelete(media.id)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex space-x-1">
                    <button
                      className={`px-4 py-2 border rounded-md ${pagination.page <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`px-4 py-2 border rounded-md ${pagination.page === page ? 'bg-blue-100 text-blue-700 border-blue-300' : 'hover:bg-gray-100'}`}
                        onClick={() => setPagination(prev => ({ ...prev, page }))}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      className={`px-4 py-2 border rounded-md ${pagination.page >= pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Media</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setUploadModalOpen(false);
                  resetUploadForm();
                }}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
                  File
                </label>
                <input
                  id="file"
                  type="file"
                  className="w-full border p-2 rounded-md"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="alt-text">
                  Alt Text
                </label>
                <input
                  id="alt-text"
                  type="text"
                  className="w-full border p-2 rounded-md"
                  placeholder="Describe the media for accessibility"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="caption">
                  Caption
                </label>
                <textarea
                  id="caption"
                  className="w-full border p-2 rounded-md"
                  rows={3}
                  placeholder="Add a caption for this media"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md mr-2"
                  onClick={() => {
                    setUploadModalOpen(false);
                    resetUploadForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={uploading || !file}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}
      {editModalOpen && currentMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Media</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditModalOpen(false)}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <p className="text-gray-700 font-bold mb-2">Filename</p>
                <p>{currentMedia.original_filename}</p>
              </div>
              
              {currentMedia.file_type === 'image' && (
                <div className="mb-4 flex justify-center">
                  <Image
                    src={currentMedia.file_path}
                    alt={currentMedia.alt_text || currentMedia.original_filename}
                    width={200}
                    height={200}
                    objectFit="contain"
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-alt-text">
                  Alt Text
                </label>
                <input
                  id="edit-alt-text"
                  type="text"
                  className="w-full border p-2 rounded-md"
                  placeholder="Describe the media for accessibility"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-caption">
                  Caption
                </label>
                <textarea
                  id="edit-caption"
                  className="w-full border p-2 rounded-md"
                  rows={3}
                  placeholder="Add a caption for this media"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md mr-2"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 