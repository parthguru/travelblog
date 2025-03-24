import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { listDirectoryListings } from '@/app/lib/directoryDb';
import DirectoryListings from '@/components/DirectoryListings';

export const metadata: Metadata = {
  title: 'Australia Travel Directory',
  description: 'Browse hotels, restaurants, experiences, and tourist attractions across Australia.',
  openGraph: {
    title: 'Australia Travel Directory',
    description: 'Browse hotels, restaurants, experiences, and tourist attractions across Australia.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/directory`,
    type: 'website',
  },
};

// Mock function for directory categories since it's not exported from directoryDb.ts
async function listDirectoryCategories() {
  return [
    { id: 1, name: 'Hotels', slug: 'hotels', description: 'Find the perfect place to stay' },
    { id: 2, name: 'Restaurants', slug: 'restaurants', description: 'Discover delicious dining options' },
    { id: 3, name: 'Attractions', slug: 'attractions', description: 'Explore top tourist destinations' },
    { id: 4, name: 'Tours', slug: 'tours', description: 'Book guided experiences and adventures' }
  ];
}

export default async function DirectoryPage() {
  // Fetch categories
  const categories = await listDirectoryCategories();
  
  // Fetch featured listings (limited to 6)
  const featuredListingsResult = await listDirectoryListings({
    featured: true,
    limit: 6,
    sort: 'created_at'
  });
  
  const featuredListings = featuredListingsResult.listings;
  
  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="my-12 text-center">
        <h1 className="text-5xl font-bold mb-6">Australia Travel Directory</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Discover the best hotels, restaurants, experiences, and attractions across Australia.
        </p>
      </div>
      
      {/* Categories section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Browse by Category</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/directory/${category.slug}`}
              className="block p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700 text-center"
            >
              <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
              {category.description && (
                <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                  {category.description}
                </p>
              )}
              <span className="inline-block mt-4 text-blue-600 hover:underline">
                Browse {category.name} →
              </span>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Featured listings section */}
      {featuredListings && featuredListings.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Listings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <div 
                key={listing.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border-yellow-400 border-2"
              >
                <div className="p-4">
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-2">
                    Featured
                  </span>
                  <h3 className="text-xl font-bold mb-2">{listing.name}</h3>
                  {listing.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{listing.description}</p>
                  )}
                  <div className="text-sm space-y-1 mb-3">
                    {listing.location && (
                      <p className="text-gray-600">
                        <span className="font-medium">Location:</span> {listing.location}
                      </p>
                    )}
                    {listing.category_name && (
                      <p className="text-gray-600">
                        <span className="font-medium">Category:</span>{' '}
                        <Link href={`/directory/${listing.category_slug}`} className="text-blue-600 hover:underline">
                          {listing.category_name}
                        </Link>
                      </p>
                    )}
                  </div>
                  <Link 
                    href={`/directory/${listing.category_slug}/${listing.slug}`} 
                    className="inline-block mt-2 text-blue-600 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              href="/directory?featured=true" 
              className="inline-block px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              View All Featured Listings
            </Link>
          </div>
        </section>
      )}
      
      {/* Search all listings */}
      <section className="mb-16">
        <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Search All Listings</h2>
          <p className="text-xl mb-6">Looking for something specific? Use our advanced search to find the perfect place.</p>
          <Link 
            href="/directory" 
            className="inline-block px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Search Directory
          </Link>
        </div>
      </section>
    </div>
  );
}
