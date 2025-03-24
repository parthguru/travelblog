'use client';

import { redirect } from 'next/navigation';
import { useParams } from 'next/navigation';
import EditPostPage from '../../../edit/[id]/page';

export default function RedirectEditPage() {
  const params = useParams();
  const id = params.id;
  
  // This page acts as a redirect/wrapper for the correctly structured route
  return <EditPostPage params={{ id }} />;
} 