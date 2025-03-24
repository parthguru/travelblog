'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DirectoryPage from '../page';

export default function DirectoryListingsPage() {
  const router = useRouter();
  
  // This page is just a wrapper for the main directory page
  // It redirects users to the main directory page
  useEffect(() => {
    router.push('/admin/dashboard/directory');
  }, [router]);

  return <DirectoryPage />;
} 