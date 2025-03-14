"use client";

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { MapIcon } from '@heroicons/react/24/outline';

type Location = {
  name: string;
  description?: string;
  day?: number;
  activityIndex?: number;
  type?: string;
  address: string;
  isDestination?: boolean;
};

type TripMapProps = {
  destination: string;
  locations?: Location[];
};

export default function TripMap({ destination, locations = [] }: TripMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  // Initialize Google Maps
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !destination) return;
    
    try {
      const geocoder = new google.maps.Geocoder();
      
      // First, geocode the main destination
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          // Create the map
          const mapInstance = new google.maps.Map(mapRef.current!, {
            center: results[0].geometry.location,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            fullscreenControl: true,
            streetViewControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });
          
          // Save map instance
          mapInstanceRef.current = mapInstance;
          
          // Create bounds to contain all markers
          const bounds = new google.maps.LatLngBounds();
          
          // Add destination marker
          const destinationMarker = new google.maps.Marker({
            map: mapInstance,
            position: results[0].geometry.location,
            title: destination,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new google.maps.Size(40, 40)
            },
            animation: google.maps.Animation.DROP
          });
          
          markersRef.current.push(destinationMarker);
          bounds.extend(results[0].geometry.location);
          
          // Create info window for destination
          const infoWindow = new google.maps.InfoWindow({
            content: `<div class="p-2"><h3 class="font-bold">${destination}</h3><p>Your destination</p></div>`
          });
          
          destinationMarker.addListener('click', () => {
            infoWindow.open(mapInstance, destinationMarker);
          });
          
          // Add additional location markers if provided
          if (locations.length > 0) {
            // Create a batch geocoder to handle multiple locations
            const geocodeBatch = async () => {
              for (let i = 0; i < locations.length; i++) {
                const location = locations[i];
                
                // Add a small delay between geocoding requests to avoid rate limits
                if (i > 0) {
                  await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                try {
                  const address = location.address || `${location.name}, ${destination}`;
                  
                  // Geocode the location
                  geocoder.geocode({ address }, (locResults, locStatus) => {
                    if (locStatus === google.maps.GeocoderStatus.OK && locResults && locResults[0]) {
                      const position = locResults[0].geometry.location;
                      
                      // Create marker
                      const marker = new google.maps.Marker({
                        map: mapInstance,
                        position,
                        title: location.name,
                        label: location.day !== undefined ? {
                          text: `${location.day}${location.activityIndex !== undefined ? `.${location.activityIndex}` : ''}`,
                          color: 'white'
                        } : undefined,
                        icon: {
                          url: location.isDestination 
                            ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                            : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                          scaledSize: new google.maps.Size(30, 30)
                        }
                      });
                      
                      markersRef.current.push(marker);
                      bounds.extend(position);
                      
                      // Create info window
                      const actInfoWindow = new google.maps.InfoWindow({
                        content: `
                          <div class="p-2">
                            <h3 class="font-bold">${location.name}</h3>
                            ${location.day !== undefined ? `<p class="text-sm">Day ${location.day}</p>` : ''}
                            ${location.type ? `<p class="text-sm">${location.type}</p>` : ''}
                            ${location.description ? `<p class="text-sm">${location.description}</p>` : ''}
                          </div>
                        `
                      });
                      
                      marker.addListener('click', () => {
                        actInfoWindow.open(mapInstance, marker);
                      });
                      
                      // Adjust map bounds
                      mapInstance.fitBounds(bounds);
                      
                      // Don't zoom in too far on small areas
                      if (mapInstance.getZoom()! > 15) {
                        mapInstance.setZoom(15);
                      }
                    }
                  });
                } catch (err) {
                  console.error(`Error geocoding location ${location.name}:`, err);
                }
              }
            };
            
            geocodeBatch();
          }
        } else {
          setMapError('Could not load map for this destination. Please try again later.');
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('An error occurred while loading the map.');
    }
    
    // Cleanup function
    return () => {
      // Clear markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [mapLoaded, destination, locations]);
  
  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        onLoad={() => setMapLoaded(true)}
        onError={() => setMapError('Failed to load Google Maps. Please check your internet connection.')}
      />
      
      {mapError ? (
        <div className="flex items-center justify-center h-80 bg-gray-light/30 dark:bg-gray-dark/10 rounded-lg">
          <div className="text-center p-6">
            <MapIcon className="h-16 w-16 mx-auto text-gray-dark/50 mb-4" />
            <p className="text-error">{mapError}</p>
            <button 
              onClick={() => {
                setMapError(null);
                setMapLoaded(false);
                // Reload the script
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
                script.onload = () => setMapLoaded(true);
                document.body.appendChild(script);
              }}
              className="btn-primary mt-4"
            >
              Retry Loading Map
            </button>
          </div>
        </div>
      ) : (
        <div 
          ref={mapRef} 
          className="h-80 w-full rounded-lg overflow-hidden"
          style={{ height: '400px' }}
        >
          {!mapLoaded && (
            <div className="flex items-center justify-center h-full bg-gray-light/30 dark:bg-gray-dark/10">
              <div className="animate-pulse text-center">
                <MapIcon className="h-16 w-16 mx-auto text-gray-dark/50 mb-4" />
                <p>Loading map...</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {mapLoaded && !mapError && (
        <div className="mt-4 text-sm text-gray-dark">
          <p className="mb-2"><strong>Map Legend:</strong></p>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-1"></div>
              <span>Destination</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-1"></div>
              <span>Activities (Day.Activity)</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 