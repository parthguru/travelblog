'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  return function WithAuth(props: P) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      // Check for admin session
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/admin/me');
          
          if (!response.ok) {
            // Redirect to login if not authenticated
            router.push('/admin/login');
            return;
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Auth check failed:', error);
          router.push('/admin/login');
        }
      };

      checkAuth();
    }, [router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // If authenticated, render the protected component
    return <WrappedComponent {...props} />;
  };
} 