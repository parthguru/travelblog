'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface MapLocationPickerProps {
  initialLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  onLocationSelected: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  label?: string;
  required?: boolean;
}

interface GoogleMapInstance {
  setCenter: (latLng: google.maps.LatLng | google.maps.LatLngLiteral) => void;
  setZoom: (zoom: number) => void;
}

const DEFAULT_CENTER = { lat: -25.2744, lng: 133.7751 }; // Center of Australia
const DEFAULT_ZOOM = 4;
const SELECTED_ZOOM = 14;

export default function MapLocationPicker({
  initialLocation,
  onLocationSelected,
  label = "Location",
  required = false
}: MapLocationPickerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<GoogleMapInstance | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  
  // Initialize the Google Maps
  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps API if not already loaded
    const script = document.createElement('script');
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Google Maps API');
    document.head.appendChild(script);

    return () => {
      // Clean up script if component unmounts before loading completes
      if (!isLoaded) {
        document.head.removeChild(script);
      }
    };
  }, [isLoaded]);

  // Initialize map when API is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const center = initialLocation 
      ? { lat: initialLocation.lat, lng: initialLocation.lng } 
      : DEFAULT_CENTER;
    
    const zoom = initialLocation ? SELECTED_ZOOM : DEFAULT_ZOOM;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    setMap(mapInstance);
    geocoderRef.current = new google.maps.Geocoder();

    // Add marker if there's an initial location
    if (initialLocation) {
      const newMarker = new google.maps.Marker({
        position: { lat: initialLocation.lat, lng: initialLocation.lng },
        map: mapInstance,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });
      
      setMarker(newMarker);
      
      // Add event listener for marker drag end
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        if (position) {
          const newLocation = {
            lat: position.lat(),
            lng: position.lng(),
            address: initialLocation.address // Will be updated by geocoding
          };
          
          // Reverse geocode to get address
          reverseGeocode(position.lat(), position.lng(), (address) => {
            const locationWithAddress = {
              ...newLocation,
              address,
            };
            setSelectedLocation(locationWithAddress);
            onLocationSelected(locationWithAddress);
          });
        }
      });
    }

    // Add click event to map
    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      const position = e.latLng;
      if (!position) return;
      
      // Update marker position or create a new one
      if (marker) {
        marker.setPosition(position);
      } else {
        const newMarker = new google.maps.Marker({
          position,
          map: mapInstance,
          draggable: true,
          animation: google.maps.Animation.DROP,
        });
        
        setMarker(newMarker);
        
        // Add event listener for marker drag end
        newMarker.addListener('dragend', () => {
          const newPosition = newMarker.getPosition();
          if (newPosition) {
            // Reverse geocode to get address
            reverseGeocode(newPosition.lat(), newPosition.lng(), (address) => {
              const newLocation = {
                lat: newPosition.lat(),
                lng: newPosition.lng(),
                address,
              };
              setSelectedLocation(newLocation);
              onLocationSelected(newLocation);
            });
          }
        });
      }
      
      // Zoom in to the selected location
      mapInstance.setZoom(SELECTED_ZOOM);
      
      // Reverse geocode to get address
      reverseGeocode(position.lat(), position.lng(), (address) => {
        const newLocation = {
          lat: position.lat(),
          lng: position.lng(),
          address,
        };
        setSelectedLocation(newLocation);
        onLocationSelected(newLocation);
      });
    });
    
  }, [isLoaded, initialLocation, onLocationSelected]);

  // Function to reverse geocode coordinates to address
  const reverseGeocode = useCallback((lat: number, lng: number, callback: (address: string) => void) => {
    if (!geocoderRef.current) return;
    
    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          callback(results[0].formatted_address);
        } else {
          callback(`Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
          console.error('Geocoder failed due to: ' + status);
        }
      }
    );
  }, []);

  // Function to search for a location by address
  const searchLocation = useCallback(() => {
    if (!geocoderRef.current || !map || !searchInput.trim()) return;
    
    setIsSearching(true);
    
    geocoderRef.current.geocode(
      { address: searchInput },
      (results, status) => {
        setIsSearching(false);
        
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const address = results[0].formatted_address;
          
          // Update map view
          map.setCenter(location);
          map.setZoom(SELECTED_ZOOM);
          
          // Update or create marker
          if (marker) {
            marker.setPosition(location);
          } else {
            const newMarker = new google.maps.Marker({
              position: location,
              map: map,
              draggable: true,
              animation: google.maps.Animation.DROP,
            });
            
            setMarker(newMarker);
            
            // Add event listener for marker drag end
            newMarker.addListener('dragend', () => {
              const position = newMarker.getPosition();
              if (position) {
                reverseGeocode(position.lat(), position.lng(), (newAddress) => {
                  const newLocation = {
                    lat: position.lat(),
                    lng: position.lng(),
                    address: newAddress,
                  };
                  setSelectedLocation(newLocation);
                  onLocationSelected(newLocation);
                });
              }
            });
          }
          
          // Update selected location
          const newLocation = {
            lat: location.lat(),
            lng: location.lng(),
            address,
          };
          setSelectedLocation(newLocation);
          onLocationSelected(newLocation);
          
          // Update search input with formatted address
          setSearchInput(address);
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      }
    );
  }, [geocoderRef, map, marker, searchInput, onLocationSelected, reverseGeocode]);

  // Handle pressing Enter in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="location-search" className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
          {label}
        </Label>
        <div className="flex mt-1">
          <Input
            id="location-search"
            type="text"
            placeholder="Search for a location"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="rounded-r-none"
            disabled={!isLoaded}
            required={required}
          />
          <Button 
            type="button"
            onClick={searchLocation}
            disabled={!isLoaded || !searchInput.trim() || isSearching}
            className="rounded-l-none"
          >
            {isSearching ? <Loader className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-md border overflow-hidden bg-gray-100"
      >
        {!isLoaded && (
          <div className="w-full h-full flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
      </div>
      
      {selectedLocation && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Selected location: {selectedLocation.address}</p>
          <p className="text-xs">
            Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
} 