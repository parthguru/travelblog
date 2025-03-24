'use client';

import dynamic from 'next/dynamic';

// Dynamically import CommentSection to avoid SSR issues with client components
const CommentSection = dynamic(() => import('@/components/CommentSection'), {
  loading: () => <div className="py-10 text-center">Loading comments...</div>
});

interface ClientCommentSectionProps {
  postId: string;
  postSlug: string;
}

export default function ClientCommentSection({ postId, postSlug }: ClientCommentSectionProps) {
  return <CommentSection postId={postId} postSlug={postSlug} />;
}
