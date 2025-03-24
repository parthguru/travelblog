'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface CommentSectionProps {
  postId: string;
  postSlug: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, postSlug }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate submission
    console.log('Submitting comment:', { name, email, content, postId, postSlug });
    
    // Reset form
    setName('');
    setEmail('');
    setContent('');
    setSubmitting(false);
  };
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>
      
      {/* Comment Form */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email (not displayed)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium mb-1">Comment</label>
              <textarea
                id="content"
                placeholder="Share your thoughts..."
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </form>
      </Card>
      
      {/* Comments Display */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">No comments yet</h3>
        <div className="text-center py-12">
          <p className="mt-2 text-gray-500">Be the first to comment on this post</p>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
