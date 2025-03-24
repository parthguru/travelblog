import { MetadataRoute } from 'next';
import { wisp } from '@/lib/wisp';
import { listDirectoryListings } from '@/app/lib/directoryDb';
import { config } from '@/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = config.baseUrl || 'https://australiatravelblog.com';
  
  // Start with static routes
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/destinations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ] as MetadataRoute.Sitemap;
  
  // Fetch blog posts
  const blogResult = await wisp.getPosts({ limit: 1000 });
  const blogRoutes = blogResult.posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Fetch directory listings
  const directoryResult = await listDirectoryListings({ limit: 1000 });
  const directoryRoutes = directoryResult.listings.map((listing) => ({
    url: `${baseUrl}/directory/${listing.slug}`,
    lastModified: new Date(listing.updated_at || listing.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Hardcoded directory categories for sitemap
  const categoryRoutes = [
    {
      url: `${baseUrl}/directory/category/accommodation`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/directory/category/dining`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/directory/category/attractions`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/directory/category/tours`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];
  
  // Fetch destinations data (hardcoded for now)
  const destinationRoutes = [
    {
      url: `${baseUrl}/destinations/sydney`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/destinations/melbourne`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/destinations/gold-coast`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/destinations/cairns`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];
  
  // Combine all routes
  return [
    ...staticRoutes,
    ...blogRoutes,
    ...directoryRoutes,
    ...categoryRoutes,
    ...destinationRoutes,
  ];
} 