'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Star, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function DirectoryManagementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [totalListings, setTotalListings] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sort, setSort] = useState('name');
  const [order, setOrder] = useState('ASC');
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedListings, setSelectedListings] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      // Build query string with filters
      let queryString = `?page=${page}&limit=${limit}&sort=${sort}&order=${order}`;
      
      if (searchQuery) {
        queryString += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (categoryFilter) {
        queryString += `&category=${categoryFilter}`;
      }
      
      if (locationFilter) {
        queryString += `&location=${encodeURIComponent(locationFilter)}`;
      }
      
      if (featuredFilter !== '') {
        queryString += `&featured=${featuredFilter}`;
      }
      
      const response = await fetch(`/api/admin/directory/listings${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch directory listings');
      }
      
      const data = await response.json();
      setListings(data.listings);
      setTotalListings(data.total);
      setTotalPages(data.totalPages);
      setSelectedListings([]); // Clear selected listings when refresh
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching directory listings:', error);
      setError('Failed to load directory listings. Please try again.');
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/directory/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch directory categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/admin/directory/locations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchCategories();
    fetchLocations();
  }, [page, limit, sort, order, categoryFilter, locationFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page === 1) {
        fetchListings();
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSort(field);
      setOrder('ASC');
    }
  };

  const confirmDelete = (listing) => {
    setListingToDelete(listing);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!listingToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/directory/listings/${listingToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Refresh listings
      fetchListings();
      setShowDeleteModal(false);
      setListingToDelete(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
      setError('Failed to delete listing. Please try again.');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedListings.length === 0) return;
    
    try {
      if (bulkAction === 'delete') {
        setShowBulkDeleteModal(true);
        return;
      }
      
      if (bulkAction === 'feature' || bulkAction === 'unfeature') {
        const featured = bulkAction === 'feature';
        const updates = selectedListings.map(async (id) => {
          const listing = listings.find(l => l.id === id);
          if (!listing) return null;
          
          return fetch(`/api/admin/directory/listings/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...listing,
              featured
            }),
          });
        });
        
        await Promise.all(updates);
        setSuccess(`Successfully ${featured ? 'featured' : 'unfeatured'} ${selectedListings.length} listings`);
        setSelectedListings([]);
        setBulkAction('');
        fetchListings();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError('Failed to perform bulk action. Please try again.');
    }
  };

  // Handle bulk delete action
  const handleBulkDelete = async () => {
    try {
      const deletes = selectedListings.map(id => 
        fetch(`/api/admin/directory/listings/${id}`, {
          method: 'DELETE',
        })
      );
      
      await Promise.all(deletes);
      setSuccess(`Successfully deleted ${selectedListings.length} listings`);
      setSelectedListings([]);
      setBulkAction('');
      setShowBulkDeleteModal(false);
      fetchListings();
    } catch (error) {
      console.error('Error deleting listings:', error);
      setError('Failed to delete listings. Please try again.');
    }
  };

  // Toggle select for a single listing
  const toggleSelectListing = (id) => {
    setSelectedListings(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Toggle select all listings
  const toggleSelectAll = () => {
    if (selectedListings.length === listings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(listings.map(listing => listing.id));
    }
  };

  if (isLoading && !listings.length) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Directory Management</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Directory Management</h1>
        <div className="flex space-x-2">
          <Link 
            href="/admin/dashboard/directory/listings/new" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
          </Link>
          <Link 
            href="/admin/dashboard/directory/categories" 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            Manage Categories
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
          <button 
            className="ml-auto text-red-700"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <span>{success}</span>
          <button 
            className="ml-auto text-green-700"
            onClick={() => setSuccess(null)}
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
        
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        
        <select 
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">All Locations</option>
          {locations.map((location, idx) => (
            <option key={idx} value={location}>
              {location}
            </option>
          ))}
        </select>
        
        <select 
          value={featuredFilter}
          onChange={(e) => setFeaturedFilter(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">All Listings</option>
          <option value="true">Featured Only</option>
          <option value="false">Non-Featured Only</option>
        </select>
        
        <select 
          value={`${sort}-${order}`}
          onChange={(e) => {
            const [newSort, newOrder] = e.target.value.split('-');
            setSort(newSort);
            setOrder(newOrder);
          }}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="name-ASC">Name (A-Z)</option>
          <option value="name-DESC">Name (Z-A)</option>
          <option value="created_at-DESC">Newest First</option>
          <option value="created_at-ASC">Oldest First</option>
          <option value="location-ASC">Location (A-Z)</option>
          <option value="location-DESC">Location (Z-A)</option>
        </select>
      </div>
      
      {/* Bulk Actions */}
      {selectedListings.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            {selectedListings.length} {selectedListings.length === 1 ? 'listing' : 'listings'} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">Bulk Actions</option>
              <option value="feature">Mark as Featured</option>
              <option value="unfeature">Remove Featured</option>
              <option value="delete">Delete</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className={`px-3 py-1.5 rounded-md text-sm ${
                !bulkAction
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selectedListings.length === listings.length && listings.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sort === 'name' && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('location')}
                >
                  <div className="flex items-center">
                    Location
                    {sort === 'location' && (
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <tr key={listing.id} className={`hover:bg-gray-50 ${selectedListings.includes(listing.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedListings.includes(listing.id)}
                        onChange={() => toggleSelectListing(listing.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{listing.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{listing.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{listing.location || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {listing.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {listing.featured ? (
                        <Star className="h-5 w-5 text-yellow-500 mx-auto" />
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex justify-end">
                      <Link 
                        href={`/directory/${listing.slug}`} 
                        target="_blank"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link 
                        href={`/admin/dashboard/directory/listings/${listing.id}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button 
                        onClick={() => confirmDelete(listing)} 
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No listings found. Create your first listing!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{listings.length > 0 ? (page - 1) * limit + 1 : 0}</span> to{' '}
            <span className="font-medium">
              {Math.min(page * limit, totalListings)}
            </span>{' '}
            of <span className="font-medium">{totalListings}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete "{listingToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Bulk Delete</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete {selectedListings.length} {selectedListings.length === 1 ? 'listing' : 'listings'}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
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