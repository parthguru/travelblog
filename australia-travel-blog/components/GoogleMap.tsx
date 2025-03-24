"use client";

import React, { useEffect, useRef } from 'react';

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  title: string;
  zoom?: number;
  height?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude,
  longitude,
  title,
  zoom = 15,
  height = '400px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    // Check if the Google Maps script is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
    } else {
      // Load the Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);

      return () => {
        // Clean up the script when the component unmounts
        document.head.removeChild(script);
      };
    }
  }, []);

  // Re-initialize map when coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const position = new google.maps.LatLng(latitude, longitude);
      mapInstanceRef.current.setCenter(position);
      markerRef.current.setPosition(position);
    }
  }, [latitude, longitude]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    // Check if coordinates are valid
    if (!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) {
      console.error('Invalid coordinates:', { latitude, longitude });
      return;
    }

    const position = { lat: latitude, lng: longitude };
    
    // Create the map
    const mapOptions: google.maps.MapOptions = {
      center: position,
      zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }],
        },
      ],
    };

    const map = new google.maps.Map(mapRef.current, mapOptions);
    mapInstanceRef.current = map;

    // Add a marker
    const marker = new google.maps.Marker({
      position,
      map,
      title,
      animation: google.maps.Animation.DROP,
    });
    markerRef.current = marker;

    // Add an info window
    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="font-weight: 500; padding: 5px;">${title}</div>`,
    });

    marker.addListener('click', () => {
      infoWindow.open(map, marker);
    });
  };

  // Helper function to validate coordinates
  const isValidCoordinate = (coord: number): boolean => {
    return !isNaN(coord) && isFinite(coord);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200">
      {(!isValidCoordinate(latitude) || !isValidCoordinate(longitude)) ? (
        <div 
          className="flex items-center justify-center bg-gray-100 text-gray-500"
          style={{ height }}
        >
          Location coordinates not available
        </div>
      ) : (
        <div ref={mapRef} style={{ height, width: '100%' }} />
      )}
    </div>
  );
};

export default GoogleMap; 