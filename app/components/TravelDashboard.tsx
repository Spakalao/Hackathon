"use client";

import { useState, useEffect } from 'react';
import { MapPinIcon, CalendarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import FlightSearch from './FlightSearch';
import AccommodationSearch from './AccommodationSearch';
import WeatherForecast from './WeatherForecast';
import Image from 'next/image';

// TypeScript interfaces for trip data
interface TripDetails {
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: number;
  travelers: number;
}

interface Flight {
  id: string;
  price: number;
  currency: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  duration: string;
  stops: number;
}

interface Accommodation {
  id: string;
  name: string;
  type: string;
  location: string;
  price_per_night: number;
  currency: string;
  rating: number;
  amenities: string[];
  available_rooms: number;
  cancellation_policy: string;
  breakfast_included: boolean;
  thumbnail_url: string;
}

export default function TravelDashboard() {
  // Trip planning state
  const [step, setStep] = useState<number>(1);
  const [tripDetails, setTripDetails] = useState<TripDetails>({
    destination: '',
    startDate: null,
    endDate: null,
    budget: 1000,
    travelers: 1
  });
  
  // Selected travel options
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null);
  
  // Price and budget tracking
  const [flightCost, setFlightCost] = useState<number>(0);
  const [accommodationCost, setAccommodationCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [budgetLeft, setBudgetLeft] = useState<number>(tripDetails.budget);
  
  // Load state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tripSaved, setTripSaved] = useState<boolean>(false);
  
  // Update total cost and budget remaining when selections change
  useEffect(() => {
    // Calculate accommodation total (price per night × number of nights)
    let accommodationTotal = 0;
    if (selectedAccommodation && tripDetails.startDate && tripDetails.endDate) {
      const nights = Math.ceil(
        (tripDetails.endDate.getTime() - tripDetails.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      accommodationTotal = selectedAccommodation.price_per_night * nights;
    }
    
    // Calculate flight total
    const flightTotal = selectedFlight?.price || 0;
    
    // Update state
    setFlightCost(flightTotal);
    setAccommodationCost(accommodationTotal);
    
    const newTotalCost = flightTotal + accommodationTotal;
    setTotalCost(newTotalCost);
    setBudgetLeft(tripDetails.budget - newTotalCost);
  }, [selectedFlight, selectedAccommodation, tripDetails]);
  
  // Handle main trip info submission
  const handleTripDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripDetails.destination || !tripDetails.startDate || !tripDetails.endDate) {
      return; // Form validation should prevent this
    }
    setStep(2);
  };
  
  // Handle flight selection
  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setStep(3);
  };
  
  // Handle accommodation selection
  const handleAccommodationSelect = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation);
    setStep(4);
  };
  
  // Save the trip
  const handleSaveTrip = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, we would call an API to save the trip
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTripSaved(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving trip:', error);
      setIsLoading(false);
    }
  };
  
  // Reset and plan another trip
  const handleReset = () => {
    setTripDetails({
      destination: '',
      startDate: null,
      endDate: null,
      budget: 1000,
      travelers: 1
    });
    setSelectedFlight(null);
    setSelectedAccommodation(null);
    setFlightCost(0);
    setAccommodationCost(0);
    setTotalCost(0);
    setBudgetLeft(1000);
    setTripSaved(false);
    setStep(1);
  };
  
  // Format dates for display
  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <div className="font-bold">Plan Your Budget Trip</div>
          <div className="text-sm text-gray-dark">
            Step {step} of 4
          </div>
        </div>
        <div className="w-full bg-gray-light/50 dark:bg-gray-dark/20 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Budget Summary (fixed at top) */}
      <div className="bg-white dark:bg-gray-dark/20 rounded-lg shadow-sm p-4 mb-6 sticky top-0 z-10">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center">
            <div className="mr-6">
              <div className="text-sm text-gray-dark">Budget</div>
              <div className="font-bold">${tripDetails.budget}</div>
            </div>
            
            <div className="mr-6">
              <div className="text-sm text-gray-dark">Spent</div>
              <div className="font-bold">${totalCost}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-dark">Remaining</div>
              <div className={`font-bold ${budgetLeft < 0 ? 'text-error' : 'text-success'}`}>
                ${budgetLeft}
              </div>
            </div>
          </div>
          
          {step > 1 && (
            <div className="flex items-center mt-2 sm:mt-0">
              {tripDetails.destination && (
                <div className="mr-4">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1 text-primary" />
                    <span className="font-medium">{tripDetails.destination}</span>
                  </div>
                </div>
              )}
              
              {tripDetails.startDate && tripDetails.endDate && (
                <div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-primary" />
                    <span className="font-medium">
                      {formatDate(tripDetails.startDate)} - {formatDate(tripDetails.endDate)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Step 1: Trip Details Form */}
      {step === 1 && (
        <div className="bg-white dark:bg-gray-dark/20 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Where do you want to go?</h2>
          
          <form onSubmit={handleTripDetailsSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Destination</label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  placeholder="City, Country"
                  value={tripDetails.destination}
                  onChange={(e) => setTripDetails({...tripDetails, destination: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Budget (USD)</label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  className="w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  value={tripDetails.budget}
                  onChange={(e) => setTripDetails({...tripDetails, budget: parseInt(e.target.value)})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  value={tripDetails.startDate ? tripDetails.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : null;
                    setTripDetails({...tripDetails, startDate: newDate});
                  }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  className="w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  value={tripDetails.endDate ? tripDetails.endDate.toISOString().split('T')[0] : ''}
                  min={tripDetails.startDate ? tripDetails.startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : null;
                    setTripDetails({...tripDetails, endDate: newDate});
                  }}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Travelers</label>
                <select
                  className="w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  value={tripDetails.travelers}
                  onChange={(e) => setTripDetails({...tripDetails, travelers: parseInt(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-8">
              <button type="submit" className="btn-primary">
                Continue to Flights
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Step 2: Flight Search */}
      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Find Flights</h2>
            <button 
              onClick={() => setStep(1)} 
              className="btn-outline btn-sm"
            >
              Back to Trip Details
            </button>
          </div>
          
          <FlightSearch 
            destination={tripDetails.destination}
            departureDate={tripDetails.startDate}
            returnDate={tripDetails.endDate}
            passengers={tripDetails.travelers}
            onFlightSelect={handleFlightSelect}
          />
        </div>
      )}
      
      {/* Step 3: Accommodation Search */}
      {step === 3 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Find Accommodations</h2>
            <button 
              onClick={() => setStep(2)} 
              className="btn-outline btn-sm"
            >
              Back to Flights
            </button>
          </div>
          
          <AccommodationSearch 
            destination={tripDetails.destination}
            checkIn={tripDetails.startDate}
            checkOut={tripDetails.endDate}
            adults={tripDetails.travelers}
            onAccommodationSelect={handleAccommodationSelect}
          />
        </div>
      )}
      
      {/* Step 4: Trip Summary */}
      {step === 4 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trip Summary</h2>
            <button 
              onClick={() => setStep(3)} 
              className="btn-outline btn-sm"
            >
              Back to Accommodations
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-dark/20 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Your Trip to {tripDetails.destination}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Flight Details */}
              <div className="border-b md:border-b-0 md:border-r border-gray/20 dark:border-gray-dark/20 pb-6 md:pb-0 md:pr-8">
                <h4 className="font-bold text-lg mb-3">Flight</h4>
                
                {selectedFlight ? (
                  <div>
                    <div className="flex justify-between mb-3">
                      <div className="font-medium">{selectedFlight.airline}</div>
                      <div className="text-primary font-bold">${selectedFlight.price}</div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <div>
                          <div className="font-bold">{selectedFlight.departureTime}</div>
                          <div className="text-sm text-gray-dark">{selectedFlight.origin}</div>
                        </div>
                        <div className="text-center px-2">
                          <div className="text-xs text-gray-dark mb-1">{selectedFlight.duration}</div>
                          <div className="w-20 h-px bg-gray-dark/30 relative">
                            <div className="absolute -top-1 right-0 w-2 h-2 bg-gray-dark/30 rounded-full"></div>
                          </div>
                          <div className="text-xs text-gray-dark mt-1">
                            {selectedFlight.stops === 0 ? 'Nonstop' : `${selectedFlight.stops} stop${selectedFlight.stops > 1 ? 's' : ''}`}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{selectedFlight.arrivalTime}</div>
                          <div className="text-sm text-gray-dark">{selectedFlight.destination}</div>
                        </div>
                      </div>
                      
                      <div className="text-sm bg-primary/10 text-primary rounded p-2">
                        Flight #{selectedFlight.flightNumber}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setStep(2)} 
                      className="btn-outline btn-sm w-full"
                    >
                      Change Flight
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-dark">
                    No flight selected
                  </div>
                )}
              </div>
              
              {/* Accommodation Details */}
              <div className="pt-6 md:pt-0 md:pl-8">
                <h4 className="font-bold text-lg mb-3">Accommodation</h4>
                
                {selectedAccommodation ? (
                  <div>
                    <div className="flex justify-between mb-3">
                      <div className="font-medium">{selectedAccommodation.name}</div>
                      <div className="text-primary font-bold">${accommodationCost}</div>
                    </div>
                    
                    <div className="relative h-40 mb-3 rounded-lg overflow-hidden">
                      <Image
                        src={selectedAccommodation.thumbnail_url}
                        alt={selectedAccommodation.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm mb-1">
                        <span className="font-medium">Type:</span> {selectedAccommodation.type}
                      </div>
                      <div className="text-sm mb-1">
                        <span className="font-medium">Location:</span> {selectedAccommodation.location}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Price:</span> ${selectedAccommodation.price_per_night} per night
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setStep(3)} 
                      className="btn-outline btn-sm w-full"
                    >
                      Change Accommodation
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-dark">
                    No accommodation selected
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Weather Forecast */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Weather Forecast</h3>
            
            <WeatherForecast 
              destination={tripDetails.destination}
              startDate={tripDetails.startDate?.toISOString().split('T')[0]}
              endDate={tripDetails.endDate?.toISOString().split('T')[0]}
            />
          </div>
          
          {/* Save Trip Button */}
          <div className="flex justify-center mt-8">
            {tripSaved ? (
              <div className="text-center">
                <div className="text-xl font-bold text-success mb-2">Trip Saved Successfully!</div>
                <button 
                  onClick={handleReset} 
                  className="btn-primary mt-2 flex items-center"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Plan Another Trip
                </button>
              </div>
            ) : (
              <button
                onClick={handleSaveTrip}
                disabled={isLoading || !selectedFlight || !selectedAccommodation}
                className="btn-primary btn-lg"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Your Trip...
                  </span>
                ) : (
                  'Save Trip'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 