import React from 'react';
import { Star } from 'lucide-react';

interface FeaturedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FeaturedBadge: React.FC<FeaturedBadgeProps> = ({ 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-3',
    lg: 'text-base py-1.5 px-4'
  };
  
  return (
    <div className={`
      inline-flex items-center bg-amber-100 text-amber-800 
      font-medium rounded-full ${sizeClasses[size]} ${className}
    `}>
      <Star className={`
        ${size === 'sm' ? 'h-3 w-3 mr-1' : 
          size === 'md' ? 'h-4 w-4 mr-1.5' : 
          'h-5 w-5 mr-2'} 
        fill-current
      `} />
      Featured
    </div>
  );
};

export default FeaturedBadge; 