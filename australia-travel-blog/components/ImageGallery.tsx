"use client";

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface Image {
  url: string;
  alt_text?: string;
  name?: string;
}

interface ImageGalleryProps {
  images: Image[];
  alt?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt = 'Gallery image' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-60 bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div 
        className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden cursor-pointer" 
        onClick={() => openLightbox(activeIndex)}
      >
        <img
          src={images[activeIndex].url}
          alt={images[activeIndex].alt_text || images[activeIndex].name || `${alt} ${activeIndex + 1}`}
          className="object-cover w-full h-full transition-opacity duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Image+Not+Available';
          }}
        />
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
              aria-label="Previous image"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all"
              aria-label="Next image"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex overflow-x-auto space-x-2 py-2">
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 cursor-pointer rounded-md overflow-hidden ${
                index === activeIndex ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt_text || image.name || `${alt} thumbnail ${index + 1}`}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Error';
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 z-10"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div className="relative w-full max-w-6xl mx-auto px-4">
            <img
              src={images[activeIndex].url}
              alt={images[activeIndex].alt_text || images[activeIndex].name || `${alt} ${activeIndex + 1}`}
              className="max-h-[85vh] max-w-full mx-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
              }}
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-3 transition-all"
                  aria-label="Next image"
                >
                  <ArrowRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnails in lightbox */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0">
              <div className="flex justify-center overflow-x-auto space-x-2 px-4 py-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`relative flex-shrink-0 w-16 h-16 cursor-pointer rounded-md overflow-hidden ${
                      index === activeIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt_text || image.name || `${alt} thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Error';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery; 