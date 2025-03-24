import { BlogPostsPreview } from "@/components/BlogPostPreview";
import { BlogPostsPagination } from "@/components/BlogPostsPagination";
import { wisp } from "@/lib/wisp";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Star, Calendar } from "lucide-react";
import { listDirectoryListings } from "@/app/lib/directoryDb";
import FeaturedBadge from "@/components/FeaturedBadge";

export default async function Home({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await searchParamsPromise;
  const pageParam = searchParams.page;
  const page = pageParam ? parseInt(pageParam as string) : 1;
  
  // Fetch blog posts with a higher limit for the homepage
  const result = await wisp.getPosts({ limit: 6, page });
  
  // Fetch featured directory listings
  const directoryResult = await listDirectoryListings({ 
    featured: true,
    limit: 3
  });
  
  // Featured destinations
  const featuredDestinations = [
    {
      id: 'sydney',
      name: 'Sydney',
      image: '/images/destinations/sydney.jpg',
      description: 'Discover iconic landmarks like the Opera House and Harbour Bridge'
    },
    {
      id: 'melbourne',
      name: 'Melbourne',
      image: '/images/destinations/melbourne.jpg',
      description: 'Explore the cultural capital with its laneways, coffee and arts'
    },
    {
      id: 'gold-coast',
      name: 'Gold Coast',
      image: '/images/destinations/gold-coast.jpg',
      description: 'Experience stunning beaches and thrilling theme parks'
    }
  ];
  
  return (
    <main>
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[600px] max-h-[800px] overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/australia-hero.jpg" 
            alt="Australia landscape" 
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-hero-pattern" />
        </div>
        
        <div className="container px-4 md:px-6 relative z-10 h-full flex items-center">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-block text-white bg-primary/80 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-4 shadow-lg">
              Discover the Land Down Under
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-md">
              Explore Australia's <span className="text-primary-foreground">Hidden Treasures</span>
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 max-w-2xl drop-shadow-md">
              Discover breathtaking landscapes, vibrant cities, and authentic local experiences with our comprehensive travel guides and insider tips.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="px-6 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                <Link href="/destinations">
                  Explore Destinations <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="px-6 py-6 text-lg bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 shadow-lg">
                <Link href="/directory">Browse Travel Directory</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-center justify-center">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-slide-in-bottom"></div>
          </div>
        </div>
      </section>
      
      {/* Featured Destinations */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Destinations</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Explore some of Australia's most iconic and breathtaking destinations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDestinations.map((destination) => (
              <Link 
                key={destination.id}
                href={`/destinations/${destination.id}`}
                className="group overflow-hidden rounded-xl shadow-lg bg-card card-hover"
              >
                <div className="relative h-72" style={{ position: 'relative', minHeight: '288px' }}>
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-card-gradient" />
                  <div className="absolute bottom-0 p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{destination.name}</h3>
                    <p className="text-white/90">{destination.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg" className="shadow-sm">
              <Link href="/destinations" className="flex items-center">
                View all destinations <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Latest Blog Posts */}
      <section className="container mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Latest Adventures</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Read about our recent travels and get inspired for your next Australian adventure</p>
        </div>
        
        <BlogPostsPreview posts={result.posts} />
        
        <div className="text-center mt-10">
          <Button asChild variant="outline" size="lg" className="shadow-sm">
            <Link href="/blog" className="flex items-center">
              View all articles <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Featured Directory Listings */}
      {directoryResult.listings && directoryResult.listings.length > 0 && (
        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Places to Visit</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Discover the best accommodations, restaurants, and attractions across Australia</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {directoryResult.listings.map((listing) => (
                <Link 
                  key={listing.id}
                  href={`/directory/${listing.slug}`}
                  className="group bg-card rounded-xl shadow-lg overflow-hidden flex flex-col h-full card-hover"
                >
                  <div className="relative">
                    {listing.images && listing.images.length > 0 ? (
                      <div className="relative h-56" style={{ position: 'relative', minHeight: '224px' }}>
                        <Image
                          src={listing.images[0].url}
                          alt={listing.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-2 right-2">
                          <FeaturedBadge />
                        </div>
                      </div>
                    ) : (
                      <div className="h-56 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image available</span>
                        <div className="absolute top-2 right-2">
                          <FeaturedBadge />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center text-muted-foreground text-sm mb-3">
                      <MapPin size={14} className="mr-1" />
                      <span>{listing.location}</span>
                      {listing.category_name && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{listing.category_name}</span>
                        </>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {listing.name}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2 flex-grow">
                      {listing.description || 'No description available.'}
                    </p>
                    
                    <span className="text-primary font-medium inline-flex items-center">
                      View details <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Button asChild variant="outline" size="lg" className="shadow-sm">
                <Link href="/directory" className="flex items-center">
                  Explore full directory <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
      
      {/* Call to Action Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="/images/australia-hero.jpg" 
            alt="Australia landscape" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-5 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Plan Your Australian Adventure</h2>
          <p className="max-w-2xl mx-auto mb-10 text-primary-foreground/90 text-lg">
            From the stunning beaches of the Gold Coast to the rugged Outback, we've got all the resources you need to plan an unforgettable trip.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Button asChild size="lg" variant="secondary" className="px-8 py-6 text-lg shadow-lg">
              <Link href="/destinations">Browse Destinations</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg shadow-lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
