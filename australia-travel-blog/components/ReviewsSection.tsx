"use client";

import React, { useState } from 'react';
import { Star, ThumbsUp, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: number;
  user_name: string;
  rating: number;
  content: string;
  created_at: string;
  helpful_count?: number;
  reported?: boolean;
  response?: {
    content: string;
    respondent_name: string;
    created_at: string;
  };
}

interface ReviewsSectionProps {
  listingId: number;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  isLoggedIn: boolean;
  onAddReview: () => void;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  averageRating,
  totalReviews,
  isLoggedIn,
  onAddReview,
}) => {
  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);
  const [helpfulReviews, setHelpfulReviews] = useState<number[]>([]);
  const [reportedReviews, setReportedReviews] = useState<number[]>([]);

  const toggleReviewExpand = (reviewId: number) => {
    if (expandedReviews.includes(reviewId)) {
      setExpandedReviews(expandedReviews.filter(id => id !== reviewId));
    } else {
      setExpandedReviews([...expandedReviews, reviewId]);
    }
  };

  const markAsHelpful = (reviewId: number) => {
    if (!isLoggedIn) {
      alert('Please log in to mark reviews as helpful');
      return;
    }

    if (helpfulReviews.includes(reviewId)) {
      setHelpfulReviews(helpfulReviews.filter(id => id !== reviewId));
    } else {
      setHelpfulReviews([...helpfulReviews, reviewId]);
    }
  };

  const reportReview = (reviewId: number) => {
    if (!isLoggedIn) {
      alert('Please log in to report reviews');
      return;
    }

    if (reportedReviews.includes(reviewId)) {
      return; // Already reported
    }
    
    setReportedReviews([...reportedReviews, reviewId]);
    alert('This review has been reported. Our team will review it. Thank you for helping us maintain quality content.');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  const isReviewExpanded = (reviewId: number) => expandedReviews.includes(reviewId);
  const isReviewHelpful = (reviewId: number) => helpfulReviews.includes(reviewId);
  const isReviewReported = (reviewId: number) => reportedReviews.includes(reviewId);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <div className="mr-4">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex mt-1">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-gray-500 mt-1">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</div>
            </div>
            
            <div className="flex flex-col gap-1">
              {[5, 4, 3, 2, 1].map(rating => {
                const reviewsCount = reviews.filter(r => r.rating === rating).length;
                const percentage = totalReviews ? (reviewsCount / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center">
                    <span className="text-sm mr-2">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-2" />
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{reviewsCount}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Button onClick={onAddReview} className="mt-4 sm:mt-0">
            Write a Review
          </Button>
        </div>
      </div>
      
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map(review => {
            const isExpanded = isReviewExpanded(review.id);
            const isHelpful = isReviewHelpful(review.id);
            const isReported = isReviewReported(review.id);
            const helpfulCount = review.helpful_count || 0;
            const adjustedHelpfulCount = isHelpful 
              ? helpfulCount + 1 
              : helpfulCount;
            
            // Determine if content needs expansion button
            const contentIsLong = review.content.length > 300;
            const displayContent = contentIsLong && !isExpanded
              ? `${review.content.substring(0, 300)}...`
              : review.content;
            
            return (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-lg mr-4 flex-shrink-0">
                    {review.user_name.substring(0, 1).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium mr-2">{review.user_name}</h3>
                      <span className="text-gray-500 text-sm">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex mt-1 mb-2">
                      {renderStars(review.rating)}
                    </div>
                    
                    <p className="text-gray-700 whitespace-pre-line">
                      {displayContent}
                    </p>
                    
                    {contentIsLong && (
                      <button
                        onClick={() => toggleReviewExpand(review.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm mt-2 flex items-center"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Read less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Read more
                          </>
                        )}
                      </button>
                    )}
                    
                    {review.response && (
                      <div className="bg-gray-50 rounded-md p-4 mt-3">
                        <p className="font-medium">{review.response.respondent_name} responded:</p>
                        <p className="text-gray-700 mt-1">{review.response.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatDate(review.response.created_at)}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center mt-3 space-x-4">
                      <button
                        onClick={() => markAsHelpful(review.id)}
                        className={`flex items-center text-sm ${
                          isHelpful ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        disabled={isReported}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful {adjustedHelpfulCount > 0 && `(${adjustedHelpfulCount})`}
                      </button>
                      
                      {!isReported ? (
                        <button
                          onClick={() => reportReview(review.id)}
                          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Report
                        </button>
                      ) : (
                        <span className="flex items-center text-sm text-gray-400">
                          <Flag className="h-4 w-4 mr-1" />
                          Reported
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No reviews yet. Be the first to share your experience!</p>
          <Button onClick={onAddReview}>
            Write a Review
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection; 