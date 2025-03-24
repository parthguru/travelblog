"use client";

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  listingId: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  listingId,
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  
  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };
  
  // Load favorites from localStorage on component mount
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(listingId));
  }, [listingId]);
  
  const toggleFavorite = () => {
    // Get current favorites
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // Toggle this listing
    let newFavorites;
    if (favorites.includes(listingId)) {
      newFavorites = favorites.filter(id => id !== listingId);
    } else {
      newFavorites = [...favorites, listingId];
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }
    
    // Save back to localStorage
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(newFavorites.includes(listingId));
  };
  
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite();
      }}
      className={`
        flex items-center justify-center rounded-full
        transition-all duration-200
        ${sizeClasses[size]}
        ${isFavorite 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
        ${className}
      `}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={`
          ${isFavorite ? 'fill-red-500' : ''} 
          ${isAnimating ? 'animate-heartbeat' : ''}
        `} 
        size={iconSizes[size]} 
      />
      
      {showText && (
        <span className="ml-2">
          {isFavorite ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};

export default FavoriteButton; 