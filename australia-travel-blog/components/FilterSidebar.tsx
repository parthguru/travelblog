'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FilterIcon, XIcon } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterSidebarProps {
  options: {
    locations: FilterOption[];
    priceRanges: FilterOption[];
    sortOptions: FilterOption[];
  };
  currentFilters: {
    location: string;
    priceRange: string;
    sort: string;
  };
  categorySlug: string;
}

export default function FilterSidebar({ 
  options, 
  currentFilters,
  categorySlug 
}: FilterSidebarProps) {
  const router = useRouter();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // State for the filter form
  const [location, setLocation] = useState(currentFilters.location);
  const [priceRange, setPriceRange] = useState(currentFilters.priceRange);
  const [sortOption, setSortOption] = useState(currentFilters.sort);
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (location) {
      params.append('location', location);
    }
    
    if (priceRange) {
      params.append('price', priceRange);
    }
    
    // Handle sort option
    if (sortOption) {
      const [field, order] = sortOption.split('-');
      params.append('sort', field);
      params.append('order', order.toUpperCase());
    }
    
    // Reset to page 1 when filters change
    params.append('page', '1');
    
    // Navigate to the filtered URL
    router.push(`/directory/${categorySlug}?${params.toString()}`);
    
    // Close mobile filters if open
    setMobileFiltersOpen(false);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setLocation('');
    setPriceRange('');
    setSortOption('name-asc');
    
    router.push(`/directory/${categorySlug}`);
    
    // Close mobile filters if open
    setMobileFiltersOpen(false);
  };
  
  // Split the sort option to get field and order
  const getSortFieldAndOrder = (sortOption: string) => {
    const [field, order] = sortOption.split('-');
    return { field, order };
  };
  
  // Filter content
  const filterContent = (
    <div className="space-y-6">
      {/* Sort options */}
      <div>
        <h3 className="font-medium mb-4">Sort By</h3>
        <select 
          className="w-full p-2 border rounded-md"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          {options.sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Location filter */}
      {options.locations.length > 0 && (
        <div>
          <h3 className="font-medium mb-4">Location</h3>
          <select
            className="w-full p-2 border rounded-md"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {options.locations.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Price range filter */}
      {options.priceRanges.length > 0 && (
        <div>
          <h3 className="font-medium mb-4">Price Range</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="price-all"
                name="price-range"
                value=""
                checked={priceRange === ''}
                onChange={() => setPriceRange('')}
                className="mr-2"
              />
              <label htmlFor="price-all">All Prices</label>
            </div>
            
            {options.priceRanges.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`price-${option.value}`}
                  name="price-range"
                  value={option.value}
                  checked={priceRange === option.value}
                  onChange={() => setPriceRange(option.value)}
                  className="mr-2"
                />
                <label htmlFor={`price-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Apply/Reset buttons */}
      <div className="flex space-x-2 pt-4">
        <button
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={applyFilters}
        >
          Apply Filters
        </button>
        
        <button
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>
    </div>
  );
  
  return (
    <>
      {/* Desktop filter sidebar */}
      <div className="hidden lg:block">
        <div className="p-4 border rounded-lg bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-6">Filters</h2>
          {filterContent}
        </div>
      </div>
      
      {/* Mobile filter button */}
      <div className="lg:hidden mb-6">
        <button
          className="w-full flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border rounded-md"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <FilterIcon className="w-5 h-5 mr-2" />
          <span>Filters & Sort</span>
        </button>
      </div>
      
      {/* Mobile filter overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMobileFiltersOpen(false)} />
          
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-xl">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Filters</h2>
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="overflow-y-auto flex-1 p-6">
                  {filterContent}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 