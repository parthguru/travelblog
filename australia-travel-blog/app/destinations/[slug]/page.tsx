import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ChevronRight, MapPin, Calendar, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { wisp } from '@/lib/wisp';
import { formatDate } from '@/lib/utils';

// This would normally come from a database
const destinations = [
  {
    id: 'sydney',
    name: 'Sydney',
    region: 'New South Wales',
    description: 'Australia\'s iconic harbor city with the Opera House, Harbour Bridge, and beautiful beaches like Bondi and Manly.',
    fullDescription: `Sydney, the vibrant capital of New South Wales, is a city that perfectly blends urban sophistication with natural beauty. The iconic Sydney Opera House and Harbour Bridge create one of the world's most recognizable skylines, set against the sparkling waters of Sydney Harbour.

The city boasts numerous beaches, including the famous Bondi Beach, where locals and tourists alike enjoy swimming, surfing, and soaking up the sun. The historic Rocks district offers a glimpse into Sydney's colonial past, while neighborhoods like Surry Hills and Newtown showcase the city's thriving food, art, and music scenes.

Nature lovers will appreciate the Royal Botanic Garden, Blue Mountains National Park just outside the city, and the coastal walks that offer stunning ocean views. Sydney's multicultural population has created a diverse culinary landscape, with world-class restaurants and bustling food markets.

Whether you're climbing the Harbour Bridge, watching a performance at the Opera House, or exploring the many museums and galleries, Sydney offers a perfect blend of relaxation and adventure.`,
    image: '/images/destinations/sydney.jpg',
    keywords: ['Sydney', 'Opera House', 'Harbour Bridge', 'Bondi Beach', 'New South Wales'],
    highlights: [
      { name: 'Sydney Opera House', description: 'Iconic architectural masterpiece and performing arts venue.' },
      { name: 'Sydney Harbour Bridge', description: 'Famous steel arch bridge offering bridge climbs and panoramic views.' },
      { name: 'Bondi Beach', description: 'Iconic beach known for its golden sand, surfing, and coastal walks.' },
      { name: 'Taronga Zoo', description: 'Zoo with Australian and exotic animals with spectacular harbour views.' },
      { name: 'The Rocks', description: 'Historic area with cobblestone streets, markets, and colonial-era buildings.' }
    ],
    bestTimeToVisit: 'September to November and March to May offer pleasant temperatures and fewer crowds.',
    listings: [
      { id: 101, name: 'Sydney Harbour YHA', category: 'Accommodation', slug: 'sydney-harbour-yha' },
      { id: 102, name: 'Opera Bar', category: 'Dining', slug: 'opera-bar' },
      { id: 103, name: 'BridgeClimb Sydney', category: 'Attractions', slug: 'bridgeclimb-sydney' },
      { id: 104, name: 'Bondi to Coogee Coastal Walk', category: 'Activities', slug: 'bondi-to-coogee-walk' }
    ]
  },
  {
    id: 'melbourne',
    name: 'Melbourne',
    region: 'Victoria',
    description: 'Cultural capital known for its coffee scene, laneways, street art, and sporting events like the Australian Open.',
    fullDescription: `Melbourne, Victoria's coastal capital, is a city of art, culture, and culinary delights. Often referred to as Australia's cultural capital, the city is known for its vibrant laneways filled with street art, boutique shops, and hidden cafes and bars.

The city's European-influenced architecture stands alongside modern skyscrapers, creating a unique urban landscape. The Yarra River flows through the heart of the city, with walking paths and parks along its banks providing green spaces within the urban environment.

Melbourne is famous for its coffee culture, with skilled baristas serving excellent brews in cafes throughout the city. The food scene is equally impressive, with influences from around the world reflecting the city's multicultural population.

Sports play a significant role in Melbourne's identity, with the Melbourne Cricket Ground (MCG) hosting cricket in summer and Australian Rules Football in winter. The city also hosts international events like the Australian Open tennis tournament and the Formula 1 Grand Prix.

With its thriving arts scene, world-class museums and galleries, and vibrant neighborhoods each with their own distinct character, Melbourne offers a dynamic and engaging visitor experience.`,
    image: '/images/destinations/melbourne.jpg',
    keywords: ['Melbourne', 'Victoria', 'Laneways', 'Coffee', 'Great Ocean Road'],
    highlights: [
      { name: 'Melbourne Laneways', description: 'Graffiti-decorated alleyways filled with cafes, bars, and boutiques.' },
      { name: 'Federation Square', description: 'Modern piazza and cultural center with museums and events.' },
      { name: 'Queen Victoria Market', description: 'Historic market selling fresh produce, specialty foods, and crafts.' },
      { name: 'Royal Botanic Gardens', description: 'Extensive gardens featuring thousands of plant species and Aboriginal heritage walks.' },
      { name: 'Great Ocean Road', description: 'Scenic coastal drive with the famous Twelve Apostles rock formations.' }
    ],
    bestTimeToVisit: 'March to May and September to November for mild weather and fewer tourists.',
    listings: [
      { id: 105, name: 'The Langham Melbourne', category: 'Accommodation', slug: 'langham-melbourne' },
      { id: 106, name: 'Chin Chin', category: 'Dining', slug: 'chin-chin' },
      { id: 107, name: 'National Gallery of Victoria', category: 'Attractions', slug: 'ngv' },
      { id: 108, name: 'Melbourne Cricket Ground Tour', category: 'Activities', slug: 'mcg-tour' }
    ]
  },
  {
    id: 'gold-coast',
    name: 'Gold Coast',
    region: 'Queensland',
    description: 'Stunning coastal city known for its long sandy beaches, surfing spots, theme parks, and vibrant nightlife.',
    fullDescription: `The Gold Coast is a coastal city in Queensland, Australia, known for its stunning beaches, surfing spots, intricate canal system, and vibrant atmosphere. With over 57 kilometers of coastline, it offers some of Australia's most iconic beaches including Surfers Paradise, Broadbeach, and Burleigh Heads.

Beyond its famous shoreline, the Gold Coast is home to Australia's biggest concentration of theme parks, including Dreamworld, Sea World, Warner Bros. Movie World, and Wet'n'Wild, making it a perfect destination for family adventures.

The city offers a diverse range of experiences from the bustling urban center of Surfers Paradise with its high-rise skyline and vibrant nightlife, to the laid-back atmosphere of southern beaches and the lush hinterland. Just a short drive inland, the Gold Coast Hinterland features subtropical rainforest, cascading waterfalls, and wineries across Tamborine Mountain and Springbrook National Park.

The Gold Coast has evolved from a beach holiday spot to a sophisticated city with excellent dining options, boutique shopping, cultural festivals, and sporting events like the annual Gold Coast Marathon and professional surfing competitions.

With its perfect combination of natural beauty, adventure activities, and urban attractions, the Gold Coast offers an ideal Australian holiday experience for travelers of all ages and interests.`,
    image: '/images/destinations/gold-coast.jpg',
    keywords: ['Gold Coast', 'Queensland', 'Surfers Paradise', 'Theme Parks', 'Beaches'],
    highlights: [
      { name: 'Surfers Paradise Beach', description: 'Iconic stretch of golden sand with high-rise backdrop and vibrant atmosphere.' },
      { name: 'Theme Parks', description: 'Home to major attractions including Dreamworld, Movie World, and Sea World.' },
      { name: 'Burleigh Heads', description: 'Popular surfing spot with national park, offering coastal walks and wildlife.' },
      { name: 'Gold Coast Hinterland', description: 'Subtropical rainforest with walking trails, waterfalls, and stunning views.' },
      { name: 'Broadbeach', description: 'Sophisticated dining precinct with restaurants, cafes, and entertainment venues.' }
    ],
    bestTimeToVisit: 'April to May and September to October for pleasant temperatures and fewer crowds.',
    listings: [
      { id: 109, name: 'Palazzo Versace', category: 'Accommodation', slug: 'palazzo-versace' },
      { id: 110, name: 'Rick Shores', category: 'Dining', slug: 'rick-shores' },
      { id: 111, name: 'Warner Bros. Movie World', category: 'Attractions', slug: 'movie-world' },
      { id: 112, name: 'Currumbin Wildlife Sanctuary', category: 'Activities', slug: 'currumbin-wildlife-sanctuary' }
    ]
  },
];

export async function generateMetadata(props: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await props.params;
  const destination = destinations.find(d => d.id === slug);
  
  if (!destination) {
    return {
      title: 'Destination Not Found',
      description: 'The requested destination could not be found.',
    };
  }
  
  return {
    title: `${destination.name} | Australia Travel Guide`,
    description: destination.description,
    openGraph: {
      title: `${destination.name} | Australia Travel Guide`,
      description: destination.description,
      images: destination.image ? [{ url: destination.image }] : undefined,
      type: 'article',
    },
  };
}

export default async function DestinationPage(props: { params: { slug: string } }) {
  const { slug } = await props.params;
  const destination = destinations.find(d => d.id === slug);
  
  if (!destination) {
    notFound();
  }
  
  // Fetch related blog posts using the destination keywords
  const relatedBlogPostsResponse = await wisp.getPosts({
    query: destination.keywords.join(' OR '),
    limit: 6
  });
  
  const relatedBlogPosts = relatedBlogPostsResponse.posts || [];
  
  // Find other destinations to recommend
  const otherDestinations = destinations.filter(d => d.id !== slug).slice(0, 3);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link href="/destinations" className="ml-1 text-gray-700 hover:text-blue-600">
                  Destinations
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-gray-500">{destination.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-12">
        <div className="relative h-96 w-full bg-gray-200">
          {/* In a real app, use actual images */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xl">
            [Hero Image: {destination.name}]
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <p className="text-xl mb-2">{destination.region}</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{destination.name}</h1>
            <p className="text-lg max-w-3xl">{destination.description}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
              <TabsTrigger value="blog">Blog Posts</TabsTrigger>
              <TabsTrigger value="travel-directory">Travel Directory</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <h2 className="text-3xl font-bold mb-4">About {destination.name}</h2>
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-line">{destination.fullDescription}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="highlights">
              <h2 className="text-3xl font-bold mb-6">Top Highlights in {destination.name}</h2>
              <div className="space-y-6">
                {destination.highlights.map((highlight, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-2">{highlight.name}</h3>
                    <p className="text-gray-700">{highlight.description}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="blog">
              <h2 className="text-3xl font-bold mb-6">Blog Posts about {destination.name}</h2>
              {relatedBlogPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedBlogPosts.map((post) => (
                    <Link 
                      key={post.id} 
                      href={`/blog/${post.slug}`}
                      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {post.image && (
                        <div className="relative h-48 w-full">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center text-gray-500 mb-2 text-sm">
                          <Calendar className="w-4 h-4 mr-2" /> 
                          <time dateTime={post.createdAt?.toString()}>
                            {formatDate(post.createdAt?.toString() || '')}
                          </time>
                          {/* Reading time would be added here if available */}
                        </div>
                        <h3 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h3>
                        {post.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">{post.description}</p>
                        )}
                        <span className="text-blue-600 hover:underline flex items-center">
                          Read Post <ArrowRight className="ml-2 w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No blog posts available for {destination.name} yet.</p>
              )}
              
              <div className="mt-8">
                <Button asChild>
                  <Link href={`/blog?q=${encodeURIComponent(destination.name)}`}>
                    View All {destination.name} Blog Posts
                  </Link>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="travel-directory">
              <h2 className="text-3xl font-bold mb-6">{destination.name} Travel Directory</h2>
              {destination.listings.length > 0 ? (
                <div className="space-y-6">
                  {destination.listings.map((listing) => (
                    <Link 
                      key={listing.id} 
                      href={`/directory/${listing.slug}`}
                      className="block bg-white rounded-lg p-6 shadow hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-500 mb-1 block">{listing.category}</span>
                          <h3 className="text-xl font-bold hover:text-blue-600 transition-colors">{listing.name}</h3>
                        </div>
                        <span className="text-blue-600 hover:underline flex items-center">
                          View <ArrowRight className="ml-2 w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No listings available for {destination.name} yet.</p>
              )}
              
              <div className="mt-8">
                <Button asChild>
                  <Link href={`/directory?location=${encodeURIComponent(destination.name)}`}>
                    View All {destination.name} Listings
                  </Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-8">
          {/* Travel Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Travel Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Best Time to Visit</h4>
                <p className="text-gray-700">{destination.bestTimeToVisit}</p>
              </div>
              
              <div>
                <h4 className="font-semibold">Getting There</h4>
                <p className="text-gray-700">
                  {destination.name} has an international airport with regular flights from major cities.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold">Getting Around</h4>
                <p className="text-gray-700">
                  Public transportation, taxis, and ride-sharing services are widely available.
                </p>
              </div>
            </div>
          </div>
          
          {/* Related Destinations */}
          {otherDestinations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Related Destinations</h3>
              <div className="space-y-4">
                {otherDestinations.map((relDest) => (
                  <Link 
                    key={relDest.id} 
                    href={`/destinations/${relDest.id}`}
                    className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative h-16 w-16 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                        {/* In a real app, use actual images */}
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                          [Image]
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold hover:text-blue-600 transition-colors">
                          {relDest.name}
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relDest.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link 
                  href="/destinations"
                  className="text-blue-600 hover:underline flex items-center text-sm font-medium"
                >
                  Explore all destinations <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
