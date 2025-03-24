import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Destinations | Australia Travel Blog',
  description: 'Explore the diverse regions and must-visit destinations across Australia, from coastal cities to the stunning Outback.',
  openGraph: {
    title: 'Destinations | Australia Travel Blog',
    description: 'Explore the diverse regions and must-visit destinations across Australia, from coastal cities to the stunning Outback.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/destinations`,
    type: 'website',
  },
};

// Array of Australian destinations
const destinations = [
  {
    id: 'sydney',
    name: 'Sydney',
    region: 'New South Wales',
    description: 'Australia\'s iconic harbor city with the Opera House, Harbour Bridge, and beautiful beaches like Bondi and Manly.',
    image: '/images/destinations/sydney.jpg',
    slug: 'sydney',
    blogCount: 8,
    directoryCount: 24
  },
  {
    id: 'melbourne',
    name: 'Melbourne',
    region: 'Victoria',
    description: 'Cultural capital known for its coffee scene, laneways, street art, and sporting events like the Australian Open.',
    image: '/images/destinations/melbourne.jpg',
    slug: 'melbourne',
    blogCount: 6,
    directoryCount: 18
  },
  {
    id: 'gold-coast',
    name: 'Gold Coast',
    region: 'Queensland',
    description: 'Famous for its long sandy beaches, surfing spots, theme parks, and vibrant nightlife.',
    image: '/images/destinations/gold-coast.jpg',
    slug: 'gold-coast',
    blogCount: 5,
    directoryCount: 15
  },
  {
    id: 'cairns',
    name: 'Cairns & Great Barrier Reef',
    region: 'Queensland',
    description: 'Gateway to the Great Barrier Reef and Daintree Rainforest, perfect for diving and tropical adventures.',
    image: '/images/destinations/cairns.jpg',
    slug: 'cairns',
    blogCount: 7,
    directoryCount: 14
  },
  {
    id: 'uluru',
    name: 'Uluru-Kata Tjuta',
    region: 'Northern Territory',
    description: 'Sacred Aboriginal site featuring the massive red monolith, stunning sunsets, and ancient cultural history.',
    image: '/images/destinations/uluru.jpg',
    slug: 'uluru',
    blogCount: 4,
    directoryCount: 8
  },
  {
    id: 'tasmania',
    name: 'Tasmania',
    region: 'Tasmania',
    description: 'Island state with pristine wilderness, MONA museum, historic Port Arthur, and exceptional food scene.',
    image: '/images/destinations/tasmania.jpg',
    slug: 'tasmania',
    blogCount: 5,
    directoryCount: 12
  },
  {
    id: 'perth',
    name: 'Perth & Margaret River',
    region: 'Western Australia',
    description: 'Sunny city with beautiful beaches, Kings Park, and nearby wine region with world-class surfing.',
    image: '/images/destinations/perth.jpg',
    slug: 'perth',
    blogCount: 3,
    directoryCount: 10
  },
  {
    id: 'adelaide',
    name: 'Adelaide & Barossa Valley',
    region: 'South Australia',
    description: 'Elegant city surrounded by parklands, with nearby wine regions and Kangaroo Island wildlife.',
    image: '/images/destinations/adelaide.jpg',
    slug: 'adelaide',
    blogCount: 3,
    directoryCount: 9
  },
];

export default function DestinationsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6">Explore Australia</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover the diverse landscapes, vibrant cities, and natural wonders that make Australia a traveler's paradise.
        </p>
      </div>
      
      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {destinations.map((destination) => (
          <div key={destination.id} className="rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-xl transition-shadow group">
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <div className="absolute bottom-4 left-4 z-20 text-white">
                <h3 className="text-2xl font-bold">{destination.name}</h3>
                <p className="text-white/90">{destination.region}</p>
              </div>
              <div className="w-full h-full bg-gray-200 relative">
                {/* In a real app, use real images */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  [Image: {destination.name}]
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4 line-clamp-3">{destination.description}</p>
              
              <div className="flex justify-between text-sm text-muted-foreground mb-4">
                <span>{destination.blogCount} Blog Posts</span>
                <span>{destination.directoryCount} Listings</span>
              </div>
              
              <div className="flex space-x-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/blog?destination=${destination.slug}`}>
                    Read Blog
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href={`/directory?location=${destination.name}`}>
                    View Listings
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Interactive Map Section */}
      <section className="bg-muted rounded-lg p-8 mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Interactive Australia Map</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore destinations across Australia with our interactive map. Click on regions to discover travel guides, listings, and blog posts.
          </p>
        </div>
        
        <div className="relative w-full aspect-[16/9] bg-white rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Interactive map will be implemented here</p>
        </div>
      </section>
      
      {/* Travel Planning Section */}
      <section className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Plan Your Australia Adventure</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Whether you're looking to explore vibrant cities, relax on pristine beaches, or venture into the Outback, we've got resources to help plan your perfect trip.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/directory">Browse Travel Directory <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/blog">Read Travel Guides</Link>
          </Button>
        </div>
      </section>
    </div>
  );
} 