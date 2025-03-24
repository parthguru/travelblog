import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon, MapPin, DollarSign, ArrowRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface DirectoryListing {
  id: number;
  name: string;
  description: string;
  location: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  price_range?: string;
  latitude?: number;
  longitude?: number;
  category_name: string;
  category_slug: string;
  slug: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
  images?: string[]; // Array of image URLs
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams?: Record<string, string | undefined>;
}

interface DirectoryListingsProps {
  listings: DirectoryListing[];
  pagination: PaginationProps;
}

export default function DirectoryListings({ listings, pagination }: DirectoryListingsProps) {
  const { currentPage, totalPages, basePath, queryParams = {} } = pagination;
  
  // Helper function to build query string for pagination links
  const buildQueryString = (page: number) => {
    const params = new URLSearchParams();
    
    // Add the page parameter
    params.append('page', page.toString());
    
    // Add all other query parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });
    
    return params.toString();
  };
  
  if (listings.length === 0) {
    return (
      <div className="text-center py-16 border rounded-xl bg-card shadow-sm">
        <div className="max-w-md mx-auto">
          <h3 className="text-2xl font-bold mb-3">No listings found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search criteria to find what you're looking for.</p>
          <Button asChild variant="outline">
            <Link href="/directory">View all listings</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Listings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
        {listings.map((listing) => (
          <Card 
            key={listing.id} 
            className={`overflow-hidden card-hover border-0 shadow-lg rounded-xl ${
              listing.featured ? 'ring-2 ring-primary ring-offset-2' : ''
            }`}
          >
            {/* Image if available */}
            <CardHeader className="p-0">
              {listing.images && listing.images.length > 0 ? (
                <div className="relative h-56" style={{ position: 'relative', minHeight: '224px' }}>
                  <Image 
                    src={listing.images[0]} 
                    alt={listing.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {listing.featured && (
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-primary text-white px-3 py-1 font-medium shadow-md">
                        Featured
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
                </div>
              ) : (
                <div className="h-56 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                  {listing.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary text-white px-3 py-1 font-medium">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="flex items-center text-muted-foreground text-sm mb-3">
                <MapPin size={14} className="mr-1" />
                <span>{listing.location}</span>
                {listing.category_name && (
                  <>
                    <span className="mx-2">•</span>
                    <Badge variant="outline" className="font-normal">
                      {listing.category_name}
                    </Badge>
                  </>
                )}
              </div>
              
              <Link href={`/directory/${listing.category_slug}/${listing.slug}`} className="group">
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {listing.name}
                </h3>
              </Link>
              
              {listing.description && (
                <p className="text-muted-foreground mb-4 line-clamp-2">{listing.description}</p>
              )}
              
              <div className="flex justify-between items-center">
                {listing.price_range && (
                  <span className="text-sm flex items-center text-muted-foreground">
                    <DollarSign size={14} className="mr-1" />
                    {listing.price_range}
                  </span>
                )}
                
                <Link 
                  href={`/directory/${listing.category_slug}/${listing.slug}`} 
                  className="text-primary font-medium text-sm flex items-center hover:underline"
                >
                  View details <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 mb-8">
          <div className="flex items-center gap-2">
            {/* Previous page */}
            {currentPage > 1 && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-1"
              >
                <Link href={`${basePath}?${buildQueryString(currentPage - 1)}`}>
                  <ChevronLeftIcon className="w-4 h-4" />
                  Previous
                </Link>
              </Button>
            )}
            
            {/* Page numbers */}
            <div className="flex">
              {/* Show first page */}
              {currentPage > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-9 h-9 p-0"
                >
                  <Link href={`${basePath}?${buildQueryString(1)}`}>
                    1
                  </Link>
                </Button>
              )}
              
              {/* Ellipsis if needed */}
              {currentPage > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="w-9 h-9 p-0"
                >
                  ...
                </Button>
              )}
              
              {/* Current page - 1 if it exists */}
              {currentPage > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-9 h-9 p-0"
                >
                  <Link href={`${basePath}?${buildQueryString(currentPage - 1)}`}>
                    {currentPage - 1}
                  </Link>
                </Button>
              )}
              
              {/* Current page */}
              <Button
                variant="default"
                size="sm"
                className="w-9 h-9 p-0"
              >
                {currentPage}
              </Button>
              
              {/* Current page + 1 if it exists */}
              {currentPage < totalPages && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-9 h-9 p-0"
                >
                  <Link href={`${basePath}?${buildQueryString(currentPage + 1)}`}>
                    {currentPage + 1}
                  </Link>
                </Button>
              )}
              
              {/* Ellipsis if needed */}
              {currentPage < totalPages - 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="w-9 h-9 p-0"
                >
                  ...
                </Button>
              )}
              
              {/* Last page if it's not current */}
              {currentPage < totalPages - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-9 h-9 p-0"
                >
                  <Link href={`${basePath}?${buildQueryString(totalPages)}`}>
                    {totalPages}
                  </Link>
                </Button>
              )}
            </div>
            
            {/* Next page */}
            {currentPage < totalPages && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="flex items-center gap-1"
              >
                <Link href={`${basePath}?${buildQueryString(currentPage + 1)}`}>
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
