import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { MapPin, CalendarDays, Tag, Clock } from 'lucide-react';
import { wisp } from '@/lib/wisp';
import { listDirectoryListings } from '@/app/lib/directoryDb';
import { formatDate } from '@/lib/utils';
import SearchBar from '@/components/SearchBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import FeaturedBadge from '@/components/FeaturedBadge';

export const metadata: Metadata = {
  title: 'Search Results | Australia Travel Blog',
  description: 'Search for blog posts and directory listings across Australia Travel Blog',
};

interface SearchPageProps {
  searchParams: { q?: string, type?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const defaultTab = searchParams.type || 'all';

  // Don't search if query is empty
  if (!query) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Search</h1>
        <SearchBar className="max-w-2xl mx-auto mb-12" />
        <div className="text-center py-12 text-gray-500">
          <p>Enter a search term to find blog posts and directory listings.</p>
        </div>
      </div>
    );
  }

  // Search blog posts
  let blogResults = [];
  try {
    const blogResponse = await wisp.getPosts({ query, limit: 20 });
    blogResults = blogResponse.posts || [];
  } catch (error) {
    console.error('Error searching blog posts:', error);
  }

  // Search directory listings
  let directoryResults = [];
  try {
    const directoryResponse = await listDirectoryListings({ 
      search: query,
      limit: 20
    });
    directoryResults = directoryResponse.listings || [];
  } catch (error) {
    console.error('Error searching directory listings:', error);
  }

  const totalResults = blogResults.length + directoryResults.length;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Search Results</h1>
      <p className="text-gray-500 mb-8">
        {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{query}"
      </p>
      
      <SearchBar className="max-w-2xl mb-12" />
      
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All Results ({totalResults})</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts ({blogResults.length})</TabsTrigger>
          <TabsTrigger value="directory">Directory ({directoryResults.length})</TabsTrigger>
        </TabsList>
        
        {/* All Results */}
        <TabsContent value="all">
          {totalResults > 0 ? (
            <div className="space-y-12">
              {/* Blog Posts Section */}
              {blogResults.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Blog Posts</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogResults.slice(0, 3).map((post) => (
                      <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                        {post.image && (
                          <div className="relative h-48">
                            <Image
                              src={post.image}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="text-xl font-bold mb-2">
                            <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                              {post.title}
                            </Link>
                          </h3>
                          <div className="flex items-center text-gray-500 text-sm mb-3">
                            <CalendarDays size={14} className="mr-1" />
                            <time dateTime={post.createdAt.toString()}>
                              {formatDate(post.createdAt.toString())}
                            </time>
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {post.description || post.content.substring(0, 120)}
                          </p>
                          <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline text-sm font-medium">
                            Read more →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {blogResults.length > 3 && (
                    <div className="text-center mt-6">
                      <Button variant="outline" asChild>
                        <Link 
                          href={`/search?q=${encodeURIComponent(query)}&type=blog`}
                        >
                          View all {blogResults.length} blog posts
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Directory Listings Section */}
              {directoryResults.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Directory Listings</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {directoryResults.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden group">
                        <div className="relative">
                          {listing.images && listing.images.length > 0 ? (
                            <div className="relative h-48">
                              <Image
                                src={listing.images[0].url}
                                alt={listing.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                          ) : (
                            <div className="h-48 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          {listing.featured && (
                            <div className="absolute top-2 right-2">
                              <FeaturedBadge size="sm" />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="text-xl font-bold mb-2">
                            <Link href={`/directory/${listing.slug}`} className="hover:text-blue-600">
                              {listing.name}
                            </Link>
                          </h3>
                          <div className="flex items-center text-gray-500 text-sm mb-3">
                            <MapPin size={14} className="mr-1" />
                            <span>{listing.location}</span>
                            {listing.category_name && (
                              <>
                                <span className="mx-2">•</span>
                                <Tag size={14} className="mr-1" />
                                <span>{listing.category_name}</span>
                              </>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {listing.description || 'No description available.'}
                          </p>
                          <Link href={`/directory/${listing.slug}`} className="text-blue-600 hover:underline text-sm font-medium">
                            View details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {directoryResults.length > 3 && (
                    <div className="text-center mt-6">
                      <Button variant="outline" asChild>
                        <Link 
                          href={`/search?q=${encodeURIComponent(query)}&type=directory`}
                        >
                          View all {directoryResults.length} directory listings
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">No results found for "{query}".</p>
              <p className="text-gray-500">Try a different search term or browse our content.</p>
            </div>
          )}
        </TabsContent>
        
        {/* Blog Posts Tab */}
        <TabsContent value="blog">
          {blogResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogResults.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {post.image && (
                    <div className="relative h-48">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                        {post.title}
                      </Link>
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <CalendarDays size={14} className="mr-1" />
                      <time dateTime={post.createdAt.toString()}>
                        {formatDate(post.createdAt.toString())}
                      </time>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.description || post.content.substring(0, 150)}
                    </p>
                    <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline text-sm font-medium">
                      Read more →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">No blog posts found for "{query}".</p>
              <p className="text-gray-500">Try a different search term or browse our blog.</p>
              <Button asChild className="mt-6">
                <Link href="/blog">Browse all blog posts</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Directory Tab */}
        <TabsContent value="directory">
          {directoryResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {directoryResults.map((listing) => (
                <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden group">
                  <div className="relative">
                    {listing.images && listing.images.length > 0 ? (
                      <div className="relative h-48">
                        <Image
                          src={listing.images[0].url}
                          alt={listing.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                    {listing.featured && (
                      <div className="absolute top-2 right-2">
                        <FeaturedBadge size="sm" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2">
                      <Link href={`/directory/${listing.slug}`} className="hover:text-blue-600">
                        {listing.name}
                      </Link>
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <MapPin size={14} className="mr-1" />
                      <span>{listing.location}</span>
                      {listing.category_name && (
                        <>
                          <span className="mx-2">•</span>
                          <Tag size={14} className="mr-1" />
                          <span>{listing.category_name}</span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {listing.description || 'No description available.'}
                    </p>
                    <Link href={`/directory/${listing.slug}`} className="text-blue-600 hover:underline text-sm font-medium">
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">No directory listings found for "{query}".</p>
              <p className="text-gray-500">Try a different search term or browse our directory.</p>
              <Button asChild className="mt-6">
                <Link href="/directory">Browse all listings</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 