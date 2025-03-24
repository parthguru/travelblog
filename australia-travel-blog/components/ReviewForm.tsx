"use client";

import React, { useState } from 'react';
import { Star, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewFormProps {
  listingId: number;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  listingId,
  onClose,
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    if (review.trim().length < 10) {
      setError('Please write a review (minimum 10 characters)');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Make API call to submit review
      const response = await fetch('/api/directory/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listingId,
          rating,
          content: review,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
      
      // Reset form
      setRating(0);
      setReview('');
      
      // Notify parent component of successful submission
      onSubmitSuccess();
    } catch (err) {
      setError((err as Error).message || 'An error occurred while submitting your review');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Write a Review</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Rating *
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </div>
          </div>
          
          <div>
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">
              Your Review *
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your experience with this place. What did you like or dislike? Would you recommend it to others?"
              required
              minLength={10}
            ></textarea>
            <p className="mt-1 text-sm text-gray-500">
              {review.length} characters (minimum 10)
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm; 