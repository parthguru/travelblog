import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { 
  getDirectoryCategoryBySlug, 
  listDirectoryListings,
  countDirectoryListingsByLocation,
  getDistinctPriceRanges
} from '@/app/lib/directoryDb';
import DirectoryListings from '@/components/DirectoryListings';
import FilterSidebar from '@/components/FilterSidebar';

interface CategoryPageProps {
  params: { category: string };
  searchParams: { 
    page?: string; 
    location?: string;
    price?: string;
    sort?: string;
    order?: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getDirectoryCategoryBySlug(params.category);
  
  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category does not exist',
    };
  }
  
  return {
    title: `${category.name} in Australia | Travel Directory`,
    description: category.description || `Browse ${category.name.toLowerCase()} across Australia.`,
    openGraph: {
      title: `${category.name} in Australia | Travel Directory`,
      description: category.description || `Browse ${category.name.toLowerCase()} across Australia.`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/directory/${category.slug}`,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await getDirectoryCategoryBySlug(params.category);
  
  if (!category) {
    notFound();
  }
  
  // Get query parameters with defaults
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const location = searchParams.location || '';
  const priceRange = searchParams.price || '';
  const sortField = searchParams.sort || 'name';
  const sortOrder = searchParams.order || 'ASC';
  
  // Get all distinct locations for filtering
  const locationCounts = await countDirectoryListingsByLocation(category.id);
  
  // Get all price ranges for filtering
  const priceRanges = await getDistinctPriceRanges(category.id);
  
  // Fetch listings with filters
  const listingsResult = await listDirectoryListings({
    categoryId: category.id,
    page,
    limit: 9,
    location: location || undefined,
    priceRange: priceRange || undefined,
    sort: sortField,
    order: sortOrder
  });
  
  const listings = listingsResult.listings;
  const totalListings = listingsResult.total;
  const totalPages = Math.ceil(totalListings / 9);
  
  // Filter options for the sidebar
  const filterOptions = {
    locations: locationCounts.map(loc => ({
      value: loc.location,
      label: loc.location,
      count: loc.count
    })),
    priceRanges: priceRanges.map(price => ({
      value: price,
      label: price
    })),
    sortOptions: [
      { value: 'name-asc', label: 'Name (A-Z)' },
      { value: 'name-desc', label: 'Name (Z-A)' },
      { value: 'newest', label: 'Newest First' },
      { value: 'oldest', label: 'Oldest First' }
    ]
  };
  
  // Current filter state for the UI
  const currentFilters = {
    location,
    priceRange,
    sort: `${sortField}-${sortOrder.toLowerCase()}`
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-gray-600 dark:text-gray-300">{category.description}</p>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar with filters */}
        <div className="lg:w-1/4">
          <FilterSidebar 
            options={filterOptions} 
            currentFilters={currentFilters} 
            categorySlug={category.slug}
          />
        </div>
        
        {/* Main content */}
        <div className="lg:w-3/4">
          {/* Results count */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              Showing {listings.length > 0 ? (page - 1) * 9 + 1 : 0} - {
                Math.min(page * 9, totalListings)
              } of {totalListings} {category.name}
              {location && ` in ${location}`}
              {priceRange && ` with price range ${priceRange}`}
            </p>
          </div>
          
          {/* Listings */}
          <DirectoryListings 
            listings={listings} 
            pagination={{
              currentPage: page,
              totalPages,
              basePath: `/directory/${category.slug}`,
              queryParams: {
                location,
                price: priceRange,
                sort: sortField,
                order: sortOrder
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
