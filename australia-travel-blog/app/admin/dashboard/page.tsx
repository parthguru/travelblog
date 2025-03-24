'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Map, 
  Image, 
  Users,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    blogPosts: 0,
    directoryListings: 0,
    mediaItems: 0,
    users: 1 // At least one admin user
  });

  // In a real app, fetch actual statistics from the API
  useEffect(() => {
    // This is a placeholder for actual API calls
    // In a production app, you would fetch real stats
    const getStats = async () => {
      try {
        // Fetch blog post count
        // const blogResponse = await fetch('/api/admin/blog/count');
        // const blogData = await blogResponse.json();
        
        // Fetch directory listings count
        // const directoryResponse = await fetch('/api/admin/directory/count');
        // const directoryData = await directoryResponse.json();
        
        // For demo purposes, we'll use mock data
        setStats({
          blogPosts: 12,
          directoryListings: 25,
          mediaItems: 48,
          users: 3
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    getStats();
  }, []);

  const statCards = [
    {
      title: 'Blog Posts',
      count: stats.blogPosts,
      icon: <FileText className="w-8 h-8 text-blue-500" />,
      linkText: 'Manage Posts',
      linkHref: '/admin/dashboard/blog/posts',
      color: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Directory Listings',
      count: stats.directoryListings,
      icon: <Map className="w-8 h-8 text-emerald-500" />,
      linkText: 'Manage Listings',
      linkHref: '/admin/dashboard/directory/listings',
      color: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Media Items',
      count: stats.mediaItems,
      icon: <Image className="w-8 h-8 text-purple-500" />,
      linkText: 'Media Library',
      linkHref: '/admin/dashboard/media',
      color: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Users',
      count: stats.users,
      icon: <Users className="w-8 h-8 text-amber-500" />,
      linkText: 'Manage Users',
      linkHref: '/admin/dashboard/users',
      color: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  const quickActions = [
    { label: 'Create a Blog Post', href: '/admin/dashboard/blog/posts/new', },
    { label: 'Add Directory Listing', href: '/admin/dashboard/directory/listings/new', },
    { label: 'Upload Media', href: '/admin/dashboard/media/upload', },
    { label: 'Manage Users', href: '/admin/dashboard/users', },
    { label: 'Site Settings', href: '/admin/dashboard/settings', },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {session?.user?.name || 'Admin'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Here's an overview of your website's current status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.color} rounded-lg p-6 shadow-sm`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{stat.title}</h2>
                <p className="text-3xl font-bold mt-2">{stat.count}</p>
              </div>
              <div>{stat.icon}</div>
            </div>
            <div className="mt-4">
              <Link
                href={stat.linkHref}
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
              >
                {stat.linkText}
                <ArrowUpRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-600 dark:text-gray-300 italic">
          Recent activity will be displayed here in future updates.
        </p>
      </div>
    </div>
  );
} 