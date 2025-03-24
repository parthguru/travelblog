import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Link2, Phone, Mail, Clock, DollarSign, Calendar, Tag } from 'lucide-react';
import { getDirectoryListingBySlug, listDirectoryListings } from '@/app/lib/directoryDb';
import GoogleMap from '@/components/GoogleMap';
import ImageGallery from '@/components/ImageGallery';
import FeaturedBadge from '@/components/FeaturedBadge';
import SocialShareButtons from '@/components/SocialShareButtons';
import FavoriteButton from '@/components/FavoriteButton';
import ReviewsWrapper from '@/components/ReviewsWrapper';
import { Metadata } from 'next';
import { config } from '@/config';

// Interface for the page's parameters
interface DirectoryListingPageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params: paramsPromise }: DirectoryListingPageProps): Promise<Metadata> {
  try {
    const params = await paramsPromise;
    const { id } = params;
    const listing = await getDirectoryListingBySlug(id);
    
    if (!listing) {
      return {
        title: "Listing Not Found",
        description: "The requested directory listing could not be found."
      };
    }
    
    const title = `${listing.name} | ${listing.category_name} | Australia Travel Directory`;
    const description = listing.description 
      ? (listing.description.length > 160 ? listing.description.substring(0, 157) + '...' : listing.description)
      : `Details about ${listing.name} in ${listing.location || 'Australia'}`;
    
    const url = `${config.baseUrl}/directory/listing/${id}`;
    const images = listing.images && listing.images.length > 0 
      ? listing.images.slice(0, 5) 
      : [`${config.baseUrl}/og-image.jpg`];
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type: 'business.business',
        images: images.map(img => ({
          url: img,
          width: 1200,
          height: 630,
          alt: listing.name,
        })),
        siteName: 'Australia Travel Directory',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [images[0]],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for directory listing', error);
    return {
      title: "Directory Listing",
      description: "Find top travel services and attractions in Australia",
    };
  }
}

export default async function DirectoryListingPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const listing = await getDirectoryListingBySlug(id);
  
  if (!listing) {
    notFound();
  }
  
  // Load related listings from the same category and location
  const relatedListingsData = await listDirectoryListings({
    categoryId: listing.category_id,
    limit: 4,
    location: listing.location,
  });
  
  const relatedListings = relatedListingsData.listings.filter(item => item.id !== listing.id).slice(0, 3);
  
  // Extract hours from the listing
  const hours = listing.hours || {};
  
  // Format images for gallery
  const images = Array.isArray(listing.images) ? listing.images : [];
  
  // Page URL for sharing
  const pageUrl = `${config.baseUrl}/directory/listing/${id}`;
  
  // Create structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": listing.name,
    "image": images.length > 0 ? images : undefined,
    "description": listing.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": listing.location,
      "addressCountry": "Australia"
    },
    "geo": listing.coordinates ? {
      "@type": "GeoCoordinates",
      "latitude": listing.coordinates.lat,
      "longitude": listing.coordinates.lng
    } : undefined,
    "telephone": listing.phone,
    "email": listing.email,
    "url": pageUrl,
    "priceRange": listing.price_range,
    "openingHoursSpecification": Object.entries(hours).map(([day, hourRange]) => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": day,
      "opens": hourRange.open,
      "closes": hourRange.close
    })),
    "category": listing.category_name
  };
  
  return (
    <>
      {/* Add the structured data script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-4">
          <Link 
            href="/directory"
            className="text-blue-600 hover:underline flex items-center"
          >
            <span className="mr-1">←</span> Back to Directory
          </Link>
        </div>

        <div className="flex justify-end items-center space-x-2 mb-4">
          <FavoriteButton listingId={listing.id} showText={true} />
          <SocialShareButtons 
            url={pageUrl}
            title={listing.name}
            description={listing.description || `Check out ${listing.name} in our Australia Travel Directory`}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800">
          {/* Header */}
          <div className="relative">
            {images.length > 0 ? (
              <div className="h-64 sm:h-80 md:h-96 w-full relative">
                <ImageGallery images={images} listingName={listing.name} />
                {listing.featured && (
                  <div className="absolute top-4 right-4 z-10">
                    <FeaturedBadge />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No images available</span>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="md:w-2/3 md:pr-8">
                <h1 className="text-3xl font-bold mb-4 dark:text-white">{listing.name}</h1>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-blue-900 dark:text-blue-100">
                    <Tag size={14} className="mr-1" />
                    {listing.category_name}
                  </span>
                  {listing.price_range && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-green-900 dark:text-green-100">
                      <DollarSign size={14} className="mr-1" />
                      {listing.price_range}
                    </span>
                  )}
                </div>
                
                {listing.description && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 dark:text-white">About</h2>
                    <p className="text-gray-700 whitespace-pre-line dark:text-gray-300">{listing.description}</p>
                  </div>
                )}
                
                {/* Reviews Section */}
                <div className="mt-8">
                  <ReviewsWrapper listingId={listing.id} />
                </div>
              </div>
              
              <div className="md:w-1/3 mt-6 md:mt-0">
                <div className="bg-gray-50 p-5 rounded-lg shadow-sm dark:bg-gray-700">
                  <h2 className="text-lg font-semibold mb-4 dark:text-white">Contact & Info</h2>
                  
                  <div className="space-y-4">
                    {listing.location && (
                      <div className="flex">
                        <MapPin className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{listing.location}</span>
                      </div>
                    )}
                    
                    {listing.website && (
                      <div className="flex">
                        <Link2 className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5 dark:text-gray-400" />
                        <a 
                          href={listing.website.startsWith('http') ? listing.website : `https://${listing.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {listing.website}
                        </a>
                      </div>
                    )}
                    
                    {listing.phone && (
                      <div className="flex">
                        <Phone className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5 dark:text-gray-400" />
                        <a 
                          href={`tel:${listing.phone}`} 
                          className="text-gray-700 hover:text-blue-600 dark:text-gray-300"
                        >
                          {listing.phone}
                        </a>
                      </div>
                    )}
                    
                    {listing.email && (
                      <div className="flex">
                        <Mail className="text-gray-500 mr-3 flex-shrink-0 h-5 w-5 dark:text-gray-400" />
                        <a 
                          href={`mailto:${listing.email}`} 
                          className="text-gray-700 hover:text-blue-600 dark:text-gray-300"
                        >
                          {listing.email}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Opening Hours */}
                  {Object.keys(hours).length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-base font-semibold mb-3 flex items-center dark:text-white">
                        <Clock size={16} className="mr-2" /> 
                        Opening Hours
                      </h3>
                      <div className="space-y-2 text-sm">
                        {Object.entries(hours).map(([day, hoursData]) => (
                          <div key={day} className="flex justify-between">
                            <span className="font-medium dark:text-gray-300">{day}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {hoursData.open === 'Closed' ? 'Closed' : `${hoursData.open} - ${hoursData.close}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Map */}
                {listing.coordinates && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3 dark:text-white">Location</h3>
                    <div className="h-64 rounded-lg overflow-hidden">
                      <GoogleMap 
                        lat={listing.coordinates.lat} 
                        lng={listing.coordinates.lng} 
                        name={listing.name}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">More in {listing.location}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedListings.map((relatedListing) => (
                <Link
                  key={relatedListing.id}
                  href={`/directory/listing/${relatedListing.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group dark:bg-gray-800"
                >
                  <div className="relative">
                    {relatedListing.images && relatedListing.images.length > 0 ? (
                      <img
                        src={relatedListing.images[0]}
                        alt={relatedListing.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center dark:bg-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">No image</span>
                      </div>
                    )}
                    {relatedListing.featured && (
                      <div className="absolute top-2 right-2">
                        <FeaturedBadge size="sm" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <FavoriteButton listingId={relatedListing.id} size="sm" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1 group-hover:text-blue-600 transition-colors dark:text-white">
                      {relatedListing.name}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mb-2 dark:text-gray-400">
                      <MapPin size={14} className="mr-1" />
                      <span>{relatedListing.location}</span>
                      {relatedListing.category_name && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{relatedListing.category_name}</span>
                        </>
                      )}
                    </div>
                    {relatedListing.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2 dark:text-gray-300">
                        {relatedListing.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
} 