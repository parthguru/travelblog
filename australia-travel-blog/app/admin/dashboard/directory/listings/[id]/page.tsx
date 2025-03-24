'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Save, 
  ArrowLeft, 
  MapPin, 
  Link2, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign, 
  Star, 
  AlertCircle, 
  Image as ImageIcon,
  Trash2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function DirectoryListingEdit({ params }) {
  const id = params.id;
  const isNewListing = id === 'new';
  const router = useRouter();
  const mapRef = useRef(null);
  let mapInstance = null;
  let markerInstance = null;

  // Days of week for opening hours
  const daysOfWeek = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [listing, setListing] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    latitude: null,
    longitude: null,
    website: '',
    phone: '',
    email: '',
    price_range: '',
    hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    images: [],
    category_id: '',
    slug: '',
    featured: false
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [availableMedia, setAvailableMedia] = useState([]);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaPage, setMediaPage] = useState(1);
  const [totalMediaPages, setTotalMediaPages] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchMedia();
    
    if (!isNewListing) {
      fetchListing();
    } else {
      setIsLoading(false);
    }
    
    // Initialize Google Maps
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      }
    };
    
    loadGoogleMaps();
    
    return () => {
      if (mapInstance) {
        // Cleanup if needed
      }
    };
  }, [id]);
  
  // Generate slug from name
  useEffect(() => {
    if (isNewListing && listing.name && !listing.slug) {
      const generatedSlug = listing.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      
      setListing(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [listing.name, isNewListing, listing.slug]);

  const initializeMap = () => {
    if (!mapRef.current) return;
    
    const defaultLocation = { lat: -25.3444, lng: 131.0369 }; // Australia center
    
    mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 4,
    });
    
    // If editing and we have coordinates, set the marker
    if (!isNewListing && listing.latitude && listing.longitude) {
      const position = { lat: parseFloat(listing.latitude), lng: parseFloat(listing.longitude) };
      mapInstance.setCenter(position);
      mapInstance.setZoom(15);
      
      markerInstance = new window.google.maps.Marker({
        position,
        map: mapInstance,
        draggable: true,
      });
      
      // Update lat/lng when marker is dragged
      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        setListing(prev => ({
          ...prev,
          latitude: position.lat(),
          longitude: position.lng(),
        }));
      });
    }
    
    // Add search box for location
    const searchInput = document.getElementById('address');
    if (searchInput) {
      const searchBox = new window.google.maps.places.Autocomplete(searchInput);
      searchBox.addListener('place_changed', () => {
        const place = searchBox.getPlace();
        if (!place.geometry) return;
        
        const location = place.geometry.location;
        
        setListing(prev => ({
          ...prev,
          address: place.formatted_address,
          latitude: location.lat(),
          longitude: location.lng(),
        }));
        
        mapInstance.setCenter(location);
        mapInstance.setZoom(15);
        
        if (markerInstance) {
          markerInstance.setPosition(location);
        } else {
          markerInstance = new window.google.maps.Marker({
            position: location,
            map: mapInstance,
            draggable: true,
          });
          
          markerInstance.addListener('dragend', () => {
            const position = markerInstance.getPosition();
            setListing(prev => ({
              ...prev,
              latitude: position.lat(),
              longitude: position.lng(),
            }));
          });
        }
      });
    }
  };

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/admin/directory/listings/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listing');
      }
      
      const data = await response.json();
      
      // Parse hours if it's a string
      let hoursData = data.hours || {};
      if (typeof hoursData === 'string') {
        try {
          hoursData = JSON.parse(hoursData);
        } catch (e) {
          console.error('Error parsing hours:', e);
          hoursData = {};
        }
      }
      
      // Parse images if it's a string
      let imagesData = data.images || [];
      if (typeof imagesData === 'string') {
        try {
          imagesData = JSON.parse(imagesData);
        } catch (e) {
          console.error('Error parsing images:', e);
          imagesData = [];
        }
      }
      
      setListing({
        ...data,
        hours: hoursData,
        images: imagesData
      });
      
      setIsLoading(false);
      
      // Update map marker if coordinates exist
      if (data.latitude && data.longitude && window.google) {
        setTimeout(() => {
          if (mapInstance) {
            const position = { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) };
            mapInstance.setCenter(position);
            mapInstance.setZoom(15);
            
            if (markerInstance) {
              markerInstance.setPosition(position);
            } else {
              markerInstance = new window.google.maps.Marker({
                position,
                map: mapInstance,
                draggable: true,
              });
              
              markerInstance.addListener('dragend', () => {
                const position = markerInstance.getPosition();
                setListing(prev => ({
                  ...prev,
                  latitude: position.lat(),
                  longitude: position.lng(),
                }));
              });
            }
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Failed to load listing. Please try again.');
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/directory/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
    }
  };

  const fetchMedia = async (page = 1) => {
    try {
      const response = await fetch(`/api/admin/media?page=${page}&limit=12`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch media');
      }
      
      const data = await response.json();
      setAvailableMedia(data.media || []);
      setTotalMediaPages(data.totalPages || 1);
      setMediaPage(page);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const handleMediaSearch = (e) => {
    setSearchQuery(e.target.value);
    // Implement debounced search if needed
  };

  const handleMediaPageChange = (newPage) => {
    fetchMedia(newPage);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setListing(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setListing(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Auto-generate slug from name
    if (name === 'name' && (isNewListing || !listing.slug)) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
        
      setListing(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleHoursChange = (day, value) => {
    setListing(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!listing.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!listing.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(listing.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    
    if (!listing.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!listing.category_id) {
      newErrors.category_id = 'Category is required';
    }
    
    // Validate website format if provided
    if (listing.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(listing.website)) {
      newErrors.website = 'Please enter a valid URL';
    }
    
    // Validate email format if provided
    if (listing.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(listing.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate phone format if provided (simple check)
    if (listing.phone && !/^[+\d\s()-]{7,20}$/.test(listing.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.text-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Prepare data
      const formData = {
        ...listing,
        hours: listing.hours || {},
        images: listing.images || []
      };
      
      // API URL and method
      const url = isNewListing 
        ? '/api/admin/directory/listings' 
        : `/api/admin/directory/listings/${id}`;
      
      const method = isNewListing ? 'POST' : 'PUT';
      
      // Send request
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save listing');
      }
      
      const savedListing = await response.json();
      
      // Show success message and redirect
      setSuccess(isNewListing ? 'Listing created successfully!' : 'Listing updated successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/dashboard/directory');
      }, 1500);
    } catch (error) {
      console.error('Error saving listing:', error);
      setError(error.message || 'Failed to save listing. Please try again.');
      setIsSaving(false);
      
      // Scroll to error message
      const errorElement = document.querySelector('.bg-red-100');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const openMediaSelector = () => {
    setIsMediaSelectorOpen(true);
  };

  const closeMediaSelector = () => {
    setIsMediaSelectorOpen(false);
    setSearchQuery('');
  };

  const addImage = (media) => {
    setListing(prev => ({
      ...prev,
      images: [...prev.images, media]
    }));
  };

  const removeImage = (index) => {
    setListing(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const filteredMedia = searchQuery
    ? availableMedia.filter(media => 
        media.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (media.alt_text && media.alt_text.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : availableMedia;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            {isNewListing ? 'Add New Listing' : 'Edit Listing'}
          </h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/admin/dashboard/directory" className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">
          {isNewListing ? 'Add New Listing' : 'Edit Listing'}
        </h1>
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
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={listing.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={listing.slug}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category_id"
                name="category_id"
                value={listing.category_id}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={listing.location}
                onChange={handleChange}
                placeholder="e.g., Melbourne, Sydney, Gold Coast"
                className={`w-full p-2 border rounded-md ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={listing.description || ''}
                onChange={handleChange}
                rows={5}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={listing.featured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Featured Listing
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Link2 className="h-4 w-4 mr-1" />
                Website
              </label>
              <input
                type="text"
                id="website"
                name="website"
                value={listing.website || ''}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={listing.phone || ''}
                onChange={handleChange}
                placeholder="+61 123 456 789"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={listing.email || ''}
                onChange={handleChange}
                placeholder="contact@example.com"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="price_range" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Price Range
              </label>
              <select
                id="price_range"
                name="price_range"
                value={listing.price_range || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select price range</option>
                <option value="$">$ (Budget)</option>
                <option value="$$">$$ (Moderate)</option>
                <option value="$$$">$$$ (Expensive)</option>
                <option value="$$$$">$$$$ (Very Expensive)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Location</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={listing.address || ''}
                onChange={handleChange}
                placeholder="123 Example St, Melbourne VIC 3000"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Start typing to search for an address and place a marker on the map
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  id="latitude"
                  name="latitude"
                  value={listing.latitude || ''}
                  onChange={handleChange}
                  placeholder="-37.8136"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  id="longitude"
                  name="longitude"
                  value={listing.longitude || ''}
                  onChange={handleChange}
                  placeholder="144.9631"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="h-80 relative">
              <div ref={mapRef} className="absolute inset-0 rounded-md border border-gray-300"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Opening Hours</h2>
          
          <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              {Object.entries(daysOfWeek).map(([day, label]) => (
                <div key={day} className="p-3 grid grid-cols-6 gap-4 items-center">
                  <div className="col-span-2 font-medium">{label}</div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={listing.hours[day] || ''}
                      onChange={(e) => handleHoursChange(day, e.target.value)}
                      placeholder="9:00 AM - 5:00 PM (or 'Closed')"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Format: "9:00 AM - 5:00 PM" or "Closed" for days when the location is not open
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images
          </label>
          <div className="border border-gray-300 rounded-md p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {listing.images && listing.images.length > 0 ? (
                listing.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative group border rounded-md overflow-hidden bg-gray-100"
                  >
                    <div className="aspect-w-16 aspect-h-9 relative">
                      <img 
                        src={image.url} 
                        alt={image.name || `Image ${index + 1}`} 
                        className="object-cover absolute inset-0 w-full h-full"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-white bg-opacity-75 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                        Featured
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-gray-500 border border-dashed rounded-md">
                  No images added yet. Click "Add Images" to select images.
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={openMediaSelector}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <div className="flex items-center justify-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Add Images
              </div>
            </button>
          </div>
          {errors.images && (
            <p className="mt-1 text-sm text-red-500">{errors.images}</p>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/dashboard/directory"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
              isSaving ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Listing
              </>
            )}
          </button>
        </div>
      </form>
      
      {/* Media Selector Modal */}
      {isMediaSelectorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select Media</h3>
              <button 
                onClick={closeMediaSelector}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={handleMediaSearch}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex-1 overflow-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {availableMedia.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No media found. Upload images in the Media Library.
                </div>
              ) : (
                availableMedia.map((media) => (
                  <div 
                    key={media.id} 
                    className="border rounded-md overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => addImage(media)}
                  >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                      <img 
                        src={media.url} 
                        alt={media.name || 'Media item'} 
                        className="object-cover absolute inset-0 w-full h-full"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                    </div>
                    <div className="p-2 text-sm truncate">{media.name || 'Untitled'}</div>
                  </div>
                ))
              )}
            </div>
            
            {totalMediaPages > 1 && (
              <div className="p-4 border-t flex justify-center items-center space-x-2">
                <button
                  onClick={() => handleMediaPageChange(mediaPage - 1)}
                  disabled={mediaPage === 1}
                  className={`p-2 rounded ${
                    mediaPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="text-sm">
                  Page {mediaPage} of {totalMediaPages}
                </span>
                
                <button
                  onClick={() => handleMediaPageChange(mediaPage + 1)}
                  disabled={mediaPage === totalMediaPages}
                  className={`p-2 rounded ${
                    mediaPage === totalMediaPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 