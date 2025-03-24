import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getDirectoryListingBySlug } from '@/app/lib/directoryDb';
import GoogleMap from '@/components/GoogleMap';
import { notFound } from 'next/navigation';

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const listing = await getDirectoryListingBySlug(params.slug);
  
  if (!listing) {
    return {
      title: 'Listing Not Found',
    };
  }
  
  return {
    title: `${listing.name} - ${listing.category_name} | Australia Travel Directory`,
    description: listing.description || `Details about ${listing.name} in ${listing.location}, Australia.`,
    openGraph: {
      title: `${listing.name} - ${listing.category_name} | Australia Travel Directory`,
      description: listing.description || `Details about ${listing.name} in ${listing.location}, Australia.`,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/directory/${params.category}/${params.slug}`,
      type: 'website',
    },
  };
}

export default async function DirectoryListingPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const listing = await getDirectoryListingBySlug(params.slug);
  
  if (!listing || listing.category_slug !== params.category) {
    notFound();
  }
  
  // Format hours if present
  const hours = listing.hours ? JSON.parse(listing.hours) : null;
  
  // Parse images if present
  const images = listing.images ? JSON.parse(listing.images) : [];
  
  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="mb-4">
        <Link 
          href={`/directory/${listing.category_slug}`} 
          className="text-blue-600 hover:underline"
        >
          ← Back to {listing.category_name}
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          {listing.featured && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-2">
              Featured
            </span>
          )}
          <h1 className="text-3xl font-bold mb-2">{listing.name}</h1>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-100">
              {listing.category_name}
            </span>
            {listing.location && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-100">
                {listing.location}
              </span>
            )}
            {listing.price_range && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-100">
                {listing.price_range}
              </span>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Description */}
          {listing.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{listing.description}</p>
            </div>
          )}
          
          {/* Images gallery */}
          {images.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Photos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image: string, index: number) => (
                  <div key={index} className="overflow-hidden rounded-lg h-48 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={image} 
                      alt={`${listing.name} - photo ${index + 1}`}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Contact information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
              <ul className="space-y-3">
                {listing.address && (
                  <li className="flex items-start">
                    <span className="font-medium w-24">Address:</span>
                    <span>{listing.address}</span>
                  </li>
                )}
                {listing.phone && (
                  <li className="flex items-start">
                    <span className="font-medium w-24">Phone:</span>
                    <a href={`tel:${listing.phone}`} className="text-blue-600 hover:underline">
                      {listing.phone}
                    </a>
                  </li>
                )}
                {listing.email && (
                  <li className="flex items-start">
                    <span className="font-medium w-24">Email:</span>
                    <a href={`mailto:${listing.email}`} className="text-blue-600 hover:underline">
                      {listing.email}
                    </a>
                  </li>
                )}
                {listing.website && (
                  <li className="flex items-start">
                    <span className="font-medium w-24">Website:</span>
                    <a 
                      href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-words"
                    >
                      {listing.website}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Opening hours */}
            {hours && Object.keys(hours).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-3">Opening Hours</h2>
                <ul className="space-y-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <li key={day} className="flex justify-between border-b pb-1 last:border-0">
                      <span className="font-medium">{day}</span>
                      <span>{hours[day.toLowerCase()] || 'Closed'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Map */}
          {(listing.latitude && listing.longitude) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <GoogleMap 
                latitude={listing.latitude} 
                longitude={listing.longitude} 
                title={listing.name}
              />
            </div>
          )}
          
          {/* Structured data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                name: listing.name,
                description: listing.description,
                image: images.length > 0 ? images[0] : null,
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: listing.address,
                  addressLocality: listing.location,
                  addressCountry: 'Australia',
                },
                geo: listing.latitude && listing.longitude ? {
                  '@type': 'GeoCoordinates',
                  latitude: listing.latitude,
                  longitude: listing.longitude,
                } : undefined,
                telephone: listing.phone,
                email: listing.email,
                url: listing.website,
                priceRange: listing.price_range,
              }),
            }}
          />
        </div>
      </div>
    </div>
  );
} 