"use client";

import React, { useState, useEffect } from 'react';
import ReviewsSection from './ReviewsSection';
import ReviewForm from './ReviewForm';
import { Button } from '@/components/ui/button';

interface ReviewsWrapperProps {
  listingId: number;
  mockReviews: any[]; // Using any for demo purposes, would be properly typed in production
  averageRating: number;
  totalReviews: number;
}

const ReviewsWrapper: React.FC<ReviewsWrapperProps> = ({
  listingId,
  mockReviews,
  averageRating: initialAverageRating,
  totalReviews: initialTotalReviews
}) => {
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviews, setReviews] = useState(mockReviews);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [totalReviews, setTotalReviews] = useState(initialTotalReviews);

  useEffect(() => {
    // Check if user is logged in - this would connect to your auth system
    // For demo, just setting a mock value
    setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    // Load the real reviews from the API
    const fetchReviews = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/directory/reviews?listing_id=${listingId}`);
        
        if (!response.ok) {
          // If the API is not available or returns an error, use mock data
          console.log('Falling back to mock reviews');
          setReviews(mockReviews);
          setAverageRating(initialAverageRating);
          setTotalReviews(initialTotalReviews);
          return;
        }
        
        const data = await response.json();
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Using sample data instead.');
        // Fall back to mock data
        setReviews(mockReviews);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviews();
  }, [listingId, mockReviews, initialAverageRating, initialTotalReviews]);

  const handleAddReview = () => {
    if (isLoggedIn) {
      setIsReviewFormOpen(true);
    } else {
      // Redirect to login or show login prompt
      alert('Please log in to submit a review');
      // In a production app, redirect to login page or open login modal
    }
  };

  const handleSubmitSuccess = () => {
    setIsReviewFormOpen(false);
    
    // In a real app, you would refresh the reviews list from the API
    // For demo, let's just add a mock review
    const newReview = {
      id: reviews.length + 1,
      user_name: "You",
      rating: 5,
      content: "Just submitted this review! In a real app, this would be fetched from the server.",
      created_at: new Date().toISOString(),
      helpful_count: 0,
    };
    
    const newReviews = [newReview, ...reviews];
    setReviews(newReviews);
    
    // Recalculate average rating
    const sum = newReviews.reduce((acc, review) => acc + review.rating, 0);
    const newAverage = sum / newReviews.length;
    setAverageRating(newAverage);
    setTotalReviews(newReviews.length);
  };

  if (isLoading) {
    return <div className="py-8 text-center">Loading reviews...</div>;
  }

  return (
    <div>
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reviews & Ratings</h2>
        <Button onClick={handleAddReview}>Write a Review</Button>
      </div>
      
      <ReviewsSection
        listingId={listingId}
        reviews={reviews}
        averageRating={averageRating}
        totalReviews={totalReviews}
        isLoggedIn={isLoggedIn}
        onAddReview={handleAddReview}
      />
      
      {isReviewFormOpen && (
        <ReviewForm
          listingId={listingId}
          onClose={() => setIsReviewFormOpen(false)}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
};

export default ReviewsWrapper; 