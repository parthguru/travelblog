'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Tag,
  Calendar,
  User,
  PlusCircle,
  ArrowUpDown
} from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  views_count: number;
  category_name?: string;
  category_slug?: string;
  author_name?: string;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  status: 'draft' | 'published';
}

interface PaginatedPosts {
  posts: BlogPost[];
  total: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

export default function BlogPostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [publishedFilter, setPublishedFilter] = useState<boolean | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(10);
  
  // Delete confirmation
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch blog posts with filters
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', postsPerPage.toString());
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('categoryId', selectedCategory.toString());
      if (selectedTag) params.append('tagId', selectedTag.toString());
      if (publishedFilter !== null) params.append('published', publishedFilter.toString());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/blog/posts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      
      const data: PaginatedPosts = await response.json();
      setPosts(data.posts);
      setTotalPosts(data.total);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories and tags for filters
  const fetchFilters = async () => {
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
    } catch (err) {
      console.error('Error fetching filters:', err);
    }
  };

  // Load data on initial render and when filters change
  useEffect(() => {
    fetchPosts();
    // Only fetch filter options once
    if (categories.length === 0 || tags.length === 0) {
      fetchFilters();
    }
  }, [currentPage, postsPerPage, searchTerm, selectedCategory, selectedTag, publishedFilter, statusFilter]);

  // Handle delete confirmation
  const confirmDelete = (postId: number) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  // Handle delete post
  const deletePost = async () => {
    if (!postToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/blog/posts/${postToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete post (Status: ${response.status})`);
      }
      
      // Refresh the posts list
      fetchPosts();
      
      // Close the modal
      setShowDeleteModal(false);
      setPostToDelete(null);
      
      // Show success message
      setError('');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError((err as Error).message || 'Failed to delete the post');
      // Keep modal open if there's an error
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchPosts();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedTag(null);
    setPublishedFilter(null);
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link
          href="/admin/dashboard/blog/posts/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          
          <select
            value={selectedTag || ''}
            onChange={(e) => setSelectedTag(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
          
          <select
            value={publishedFilter === null ? '' : publishedFilter.toString()}
            onChange={(e) => {
              if (e.target.value === '') {
                setPublishedFilter(null);
              } else {
                setPublishedFilter(e.target.value === 'true');
              }
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Filter className="w-4 h-4 sm:mr-2 inline" />
            <span className="hidden sm:inline">Filter</span>
          </button>
          
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Reset
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-2">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-2 text-lg font-medium">No posts found</p>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || selectedCategory || selectedTag || publishedFilter !== null
                ? 'Try adjusting your filters or create a new post.'
                : 'Create your first blog post to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {post.featured_image ? (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img 
                              src={post.featured_image} 
                              alt={post.title}
                              className="h-10 w-10 object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-10 w-10 mr-3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded">
                            <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center flex-wrap gap-2 mt-1">
                            <User className="w-3 h-3" />
                            <span>{post.author_name || 'Unknown'}</span>

                            {post.tags && post.tags.length > 0 && (
                              <>
                                <Tag className="w-3 h-3 ml-2" />
                                <span>{post.tags.map(tag => tag.name).join(', ')}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {post.category_name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.published
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.published ? post.published_at : post.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {post.views_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/admin/dashboard/blog/posts/${post.id}/edit`}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => confirmDelete(post.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && posts.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * postsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * postsPerPage, totalPosts)}
                  </span>{' '}
                  of <span className="font-medium">{totalPosts}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                      currentPage === 1
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                        : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Only show a few page numbers
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    
                    // Show ellipsis for gaps
                    if (
                      (pageNum === 2 && currentPage > 3) ||
                      (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span
                          key={i}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                      currentPage === totalPages
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                        : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={deletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 