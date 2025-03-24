'use client';

import { useState, useEffect } from 'react';
import { Link2, Search, Plus, Trash2, RefreshCw, FileText, MapPin } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
}

interface DirectoryListing {
  id: number;
  name: string;
  slug: string;
}

interface IntegrationLink {
  id: number;
  blog_post_id: number;
  directory_listing_id: number;
  blog_post_title: string;
  directory_listing_name: string;
  created_at: string;
}

export default function IntegrationPage() {
  // State for existing links
  const [links, setLinks] = useState<IntegrationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for creating new links
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [directoryListings, setDirectoryListings] = useState<DirectoryListing[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [creatingLink, setCreatingLink] = useState(false);
  const [linkError, setLinkError] = useState('');
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch initial data
  useEffect(() => {
    fetchIntegrationLinks();
    fetchBlogPosts();
    fetchDirectoryListings();
  }, []);
  
  // Fetch all existing integration links
  const fetchIntegrationLinks = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/blog/directory-integration');
      if (!response.ok) {
        throw new Error('Failed to fetch integration links');
      }
      
      const data = await response.json();
      setLinks(data.links || []);
    } catch (err) {
      console.error('Error fetching integration links:', err);
      setError('Failed to load integration links');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch all blog posts for selection
  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog/posts?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      
      const data = await response.json();
      setBlogPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    }
  };
  
  // Fetch all directory listings for selection
  const fetchDirectoryListings = async () => {
    try {
      const response = await fetch('/api/admin/directory/listings?limit=100');
      if (!response.ok) {
        throw new Error('Failed to fetch directory listings');
      }
      
      const data = await response.json();
      setDirectoryListings(data.listings || []);
    } catch (err) {
      console.error('Error fetching directory listings:', err);
    }
  };
  
  // Create a new link between a blog post and a directory listing
  const createLink = async () => {
    if (!selectedPostId || !selectedListingId) {
      setLinkError('Please select both a blog post and a directory listing');
      return;
    }
    
    setLinkError('');
    setCreatingLink(true);
    
    try {
      const response = await fetch('/api/admin/blog/directory-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogPostId: selectedPostId,
          directoryListingId: selectedListingId
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create link');
      }
      
      // Reset selection and refresh links
      setSelectedPostId(null);
      setSelectedListingId(null);
      fetchIntegrationLinks();
    } catch (err) {
      console.error('Error creating link:', err);
      setLinkError((err as Error).message || 'Failed to create link');
    } finally {
      setCreatingLink(false);
    }
  };
  
  // Delete an existing link
  const deleteLink = async (blogPostId: number, directoryListingId: number) => {
    if (!confirm('Are you sure you want to remove this link?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/blog/directory-integration?blogPostId=${blogPostId}&directoryListingId=${directoryListingId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete link');
      }
      
      // Refresh links
      fetchIntegrationLinks();
    } catch (err) {
      console.error('Error deleting link:', err);
      setError((err as Error).message || 'Failed to delete link');
    }
  };
  
  // Filter links by search term
  const filteredLinks = links.filter(link => 
    link.blog_post_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.directory_listing_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter blog posts for dropdown
  const filteredBlogPosts = blogPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter directory listings for dropdown
  const filteredDirectoryListings = directoryListings.filter(listing => 
    listing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (loading && links.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Blog-Directory Integration</h1>
        <div className="text-center py-10">Loading integration data...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog-Directory Integration</h1>
        <button
          onClick={fetchIntegrationLinks}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {/* Create New Link Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Create New Link</h2>
        
        {linkError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {linkError}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="blogPost" className="block text-sm font-medium text-gray-700 mb-1">
              Blog Post
            </label>
            <select
              id="blogPost"
              value={selectedPostId || ''}
              onChange={(e) => setSelectedPostId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a blog post</option>
              {filteredBlogPosts.map((post) => (
                <option key={post.id} value={post.id}>{post.title}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="directoryListing" className="block text-sm font-medium text-gray-700 mb-1">
              Directory Listing
            </label>
            <select
              id="directoryListing"
              value={selectedListingId || ''}
              onChange={(e) => setSelectedListingId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a directory listing</option>
              {filteredDirectoryListings.map((listing) => (
                <option key={listing.id} value={listing.id}>{listing.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={createLink}
          disabled={creatingLink || !selectedPostId || !selectedListingId}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          {creatingLink ? 'Creating...' : 'Create Link'}
        </button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search links, blog posts, or directory listings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-md">
          <div className="inline-block p-3 rounded-full bg-gray-200 mb-4">
            <Link2 className="h-6 w-6 text-gray-500" />
          </div>
          <p className="text-gray-500">
            {links.length === 0 
              ? 'No links found. Create your first blog-directory connection above.' 
              : 'No links match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blog Post
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Directory Listing
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLinks.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{link.blog_post_title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-red-500 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{link.directory_listing_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(link.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => deleteLink(link.blog_post_id, link.directory_listing_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 