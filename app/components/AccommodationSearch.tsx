"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Image from 'next/image';
import { CalendarIcon, MapPinIcon, UserIcon, AdjustmentsHorizontalIcon, StarIcon, WifiIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

type Accommodation = {
  id: string;
  name: string;
  type: string;
  location: string;
  price_per_night: number;
  currency: string;
  rating: number;
  rating_count: number;
  distance_from_center: number;
  amenities: string[];
  available_rooms: number;
  cancellation_policy: string;
  breakfast_included: boolean;
  thumbnail_url: string;
};

type AccommodationSearchProps = {
  destination?: string;
  checkIn?: Date;
  checkOut?: Date;
  adults?: number;
  onAccommodationSelect?: (accommodation: Accommodation) => void;
};

export default function AccommodationSearch({
  destination: initialDestination = '',
  checkIn: initialCheckIn,
  checkOut: initialCheckOut,
  adults: initialAdults = 2,
  onAccommodationSelect
}: AccommodationSearchProps) {
  // Form state
  const [destination, setDestination] = useState(initialDestination);
  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn || null);
  const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut || null);
  const [adults, setAdults] = useState(initialAdults);
  const [accommodationType, setAccommodationType] = useState<string>('all');
  
  // Results state
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<string | null>(null);
  
  // Filtering and sorting
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance'>('price');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !checkIn || !checkOut) {
      setError('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format dates for API
      const formattedCheckIn = format(checkIn, 'yyyy-MM-dd');
      const formattedCheckOut = format(checkOut, 'yyyy-MM-dd');
      
      // Build API URL
      let url = `/api/accommodations?location=${encodeURIComponent(destination)}&checkIn=${formattedCheckIn}&checkOut=${formattedCheckOut}&adults=${adults}`;
      
      if (accommodationType !== 'all') {
        url += `&type=${accommodationType}`;
      }
      
      // Fetch accommodations
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch accommodations');
      }
      
      const data = await response.json();
      
      // Set accommodations data
      setAccommodations(data.accommodations);
      
      // Automatically select the cheapest option if a callback is provided
      if (onAccommodationSelect && data.accommodations.length > 0) {
        const cheapestOption = data.accommodations[0]; // They're already sorted by price
        setSelectedAccommodation(cheapestOption.id);
        onAccommodationSelect(cheapestOption);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error searching for accommodations:', err);
      setError('Failed to search for accommodations. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle accommodation selection
  const handleAccommodationSelect = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation.id);
    
    if (onAccommodationSelect) {
      onAccommodationSelect(accommodation);
    }
  };
  
  // Filter and sort accommodations
  const filteredAccommodations = accommodations
    .filter(acc => 
      acc.price_per_night >= priceRange[0] && 
      acc.price_per_night <= priceRange[1]
    )
    .sort((a, b) => {
      if (sortBy === 'price') {
        return a.price_per_night - b.price_per_night;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else {
        return a.distance_from_center - b.distance_from_center;
      }
    });
  
  return (
    <div className="w-full">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="bg-gray-light/30 dark:bg-gray-dark/10 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Find Budget Accommodations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium mb-1">Destination</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-dark" />
                </div>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="pl-10 w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Accommodation Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Accommodation Type</label>
              <select
                className="w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                value={accommodationType}
                onChange={(e) => setAccommodationType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="hostel">Hostels</option>
                <option value="budget_hotel">Budget Hotels</option>
                <option value="apartment">Apartments</option>
                <option value="guesthouse">Guesthouses</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Check-in Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Check-in Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-dark" />
                </div>
                <DatePicker
                  selected={checkIn}
                  onChange={(date) => {
                    setCheckIn(date);
                    // If check-out is not set or is before check-in, set it to the day after
                    if (!checkOut || date && checkOut && date >= checkOut) {
                      const nextDay = new Date(date!);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setCheckOut(nextDay);
                    }
                  }}
                  minDate={new Date()}
                  placeholderText="Select check-in date"
                  className="pl-10 w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  required
                />
              </div>
            </div>
            
            {/* Check-out Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Check-out Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-dark" />
                </div>
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
                  placeholderText="Select check-out date"
                  className="pl-10 w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  required
                />
              </div>
            </div>
            
            {/* Number of Adults */}
            <div>
              <label className="block text-sm font-medium mb-1">Guests</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-dark" />
                </div>
                <select
                  className="pl-10 w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  value={adults}
                  onChange={(e) => setAdults(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Adult' : 'Adults'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                'Search Accommodations'
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-2 bg-error/10 border border-error/20 text-error rounded-md">
              {error}
            </div>
          )}
        </div>
      </form>
      
      {/* Results */}
      {accommodations.length > 0 && !loading && (
        <div>
          {/* Filters and Sorting */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h3 className="text-xl font-bold">{accommodations.length} Accommodations Found</h3>
              <p className="text-gray-dark">in {destination}</p>
            </div>
            
            <div className="mt-2 sm:mt-0 flex items-center">
              <div className="mr-4">
                <label className="block text-sm font-medium mb-1">Sort by</label>
                <select
                  className="rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="price">Price (Low to High)</option>
                  <option value="rating">Rating (High to Low)</option>
                  <option value="distance">Distance to Center</option>
                </select>
              </div>
              
              <button
                className="btn-outline flex items-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
          </div>
          
          {/* Additional Filters */}
          {showFilters && (
            <div className="bg-gray-light/30 dark:bg-gray-dark/10 rounded-lg p-4 mb-6">
              <h4 className="font-bold mb-3">Price Range</h4>
              <div className="flex items-center space-x-2">
                <span>${priceRange[0]}</span>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="flex-grow"
                />
                <span>${priceRange[1]}</span>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="flex-grow"
                />
              </div>
            </div>
          )}
          
          {/* Accommodation Cards */}
          <div className="space-y-6">
            {filteredAccommodations.length > 0 ? (
              filteredAccommodations.map((accommodation) => (
                <div
                  key={accommodation.id}
                  className={`bg-white dark:bg-gray-dark/30 border rounded-lg shadow-sm overflow-hidden transition-all ${
                    selectedAccommodation === accommodation.id
                      ? 'border-primary dark:border-primary'
                      : 'border-gray/20 dark:border-gray-dark/50 hover:border-gray/50 dark:hover:border-gray-dark/80'
                  }`}
                  onClick={() => handleAccommodationSelect(accommodation)}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-1/3 relative h-48 md:h-auto">
                      <Image
                        src={accommodation.thumbnail_url || `https://source.unsplash.com/300x200/?hotel,${accommodation.type.toLowerCase()}`}
                        alt={accommodation.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-t-lg md:rounded-none md:rounded-l-lg"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 md:p-6 flex-1">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center mb-1">
                            <span className="badge badge-sm badge-primary mr-2">
                              {accommodation.type}
                            </span>
                            {accommodation.breakfast_included && (
                              <span className="badge badge-sm badge-success">
                                Breakfast Included
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold mb-1">{accommodation.name}</h3>
                          
                          <div className="flex items-center text-sm text-gray-dark mb-2">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            <span>{accommodation.location}</span>
                            <span className="mx-2">•</span>
                            <span>{accommodation.distance_from_center} km from center</span>
                          </div>
                          
                          <div className="flex items-center mb-2">
                            <div className="flex items-center bg-primary/10 text-primary rounded px-2 py-0.5 mr-2">
                              <StarIcon className="h-4 w-4 mr-1" />
                              <span className="font-bold">{accommodation.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-sm text-gray-dark">
                              {accommodation.rating_count} reviews
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 text-right">
                          <p className="text-2xl font-bold text-primary">${accommodation.price_per_night}</p>
                          <p className="text-sm text-gray-dark">per night</p>
                          <p className="text-xs text-gray-dark mt-1">
                            {accommodation.cancellation_policy}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {accommodation.amenities.map((amenity, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-dark">
                              <CheckCircleIcon className="h-4 w-4 mr-1 text-success" />
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 md:flex justify-between items-center">
                        <div className="text-sm text-gray-dark mb-2 md:mb-0">
                          <p>{accommodation.available_rooms} rooms left at this price</p>
                        </div>
                        
                        <button 
                          className={`btn-primary ${selectedAccommodation === accommodation.id ? 'bg-primary-dark' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccommodationSelect(accommodation);
                          }}
                        >
                          {selectedAccommodation === accommodation.id ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 bg-gray-light/20 dark:bg-gray-dark/10 rounded-lg">
                <p>No accommodations found with current filters.</p>
                <p className="text-sm text-gray-dark mt-1">Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 