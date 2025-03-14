"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ArrowRightIcon, CalendarIcon, GlobeAltIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

type Flight = {
  id: string;
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  depart_date: string;
  depart_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  currency: string;
  stops: number;
  cabin_class: string;
};

type FlightResults = {
  outbound: Flight[];
  return: Flight[];
  cheapest_round_trip: {
    total_price: number;
    currency: string;
    outbound_flight_id: string;
    return_flight_id: string;
  } | null;
};

type FlightSearchProps = {
  origin?: string;
  destination?: string;
  departDate?: Date;
  returnDate?: Date | null;
  onFlightSelect?: (flight: any) => void;
};

export default function FlightSearch({
  origin: initialOrigin = '',
  destination: initialDestination = '',
  departDate: initialDepartDate,
  returnDate: initialReturnDate = null,
  onFlightSelect
}: FlightSearchProps) {
  const router = useRouter();
  
  // Form state
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [departDate, setDepartDate] = useState<Date | null>(initialDepartDate || null);
  const [returnDate, setReturnDate] = useState<Date | null>(initialReturnDate);
  const [isRoundTrip, setIsRoundTrip] = useState(!!initialReturnDate);
  
  // Results state
  const [flights, setFlights] = useState<FlightResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutbound, setSelectedOutbound] = useState<string | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<string | null>(null);
  
  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !destination || !departDate) {
      setError('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format dates for API
      const formattedDepartDate = format(departDate, 'yyyy-MM-dd');
      const formattedReturnDate = returnDate ? format(returnDate, 'yyyy-MM-dd') : null;
      
      // Build API URL
      let url = `/api/flights?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&departDate=${formattedDepartDate}`;
      
      if (isRoundTrip && formattedReturnDate) {
        url += `&returnDate=${formattedReturnDate}`;
      }
      
      // Fetch flights
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch flights');
      }
      
      const data = await response.json();
      
      // Set flights data
      setFlights(data.flights);
      
      // Automatically select cheapest flights if a callback is provided
      if (onFlightSelect && data.flights.outbound.length > 0) {
        const outboundId = data.flights.outbound[0].id;
        setSelectedOutbound(outboundId);
        
        if (isRoundTrip && data.flights.return.length > 0) {
          const returnId = data.flights.return[0].id;
          setSelectedReturn(returnId);
          
          onFlightSelect({
            outbound: data.flights.outbound[0],
            return: data.flights.return[0],
            totalPrice: data.flights.outbound[0].price + data.flights.return[0].price
          });
        } else {
          onFlightSelect({
            outbound: data.flights.outbound[0],
            return: null,
            totalPrice: data.flights.outbound[0].price
          });
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error searching for flights:', err);
      setError('Failed to search for flights. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle flight selection
  const handleFlightSelect = (type: 'outbound' | 'return', flightId: string) => {
    if (type === 'outbound') {
      setSelectedOutbound(flightId);
    } else {
      setSelectedReturn(flightId);
    }
    
    // If callback is provided, send selected flights
    if (onFlightSelect && flights) {
      const outboundFlight = type === 'outbound' 
        ? flights.outbound.find(f => f.id === flightId)
        : flights.outbound.find(f => f.id === selectedOutbound);
        
      const returnFlight = type === 'return'
        ? flights.return.find(f => f.id === flightId)
        : flights.return.find(f => f.id === selectedReturn);
      
      if (outboundFlight) {
        onFlightSelect({
          outbound: outboundFlight,
          return: returnFlight || null,
          totalPrice: outboundFlight.price + (returnFlight ? returnFlight.price : 0)
        });
      }
    }
  };
  
  return (
    <div className="w-full">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="bg-gray-light/30 dark:bg-gray-dark/10 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Search for Budget Flights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Origin */}
            <div>
              <label className="block text-sm font-medium mb-1">Origin</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAltIcon className="h-5 w-5 text-gray-dark" />
                </div>
                <input
                  type="text"
                  placeholder="From where?"
                  className="pl-10 w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Destination */}
            <div>
              <label className="block text-sm font-medium mb-1">Destination</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAltIcon className="h-5 w-5 text-gray-dark" />
                </div>
                <input
                  type="text"
                  placeholder="To where?"
                  className="pl-10 w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Departure Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Departure Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-dark" />
                </div>
                <DatePicker
                  selected={departDate}
                  onChange={(date) => setDepartDate(date)}
                  minDate={new Date()}
                  placeholderText="Select departure date"
                  className="pl-10 w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  required
                />
              </div>
            </div>
            
            {/* Return Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Return Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-dark" />
                </div>
                <DatePicker
                  selected={returnDate}
                  onChange={(date) => setReturnDate(date)}
                  minDate={departDate || new Date()}
                  placeholderText="Select return date"
                  className="pl-10 w-full rounded-md border-gray/50 dark:border-gray-dark/50 dark:bg-gray-dark/10"
                  disabled={!isRoundTrip}
                />
              </div>
            </div>
            
            {/* Trip Type */}
            <div className="flex items-end">
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    checked={isRoundTrip}
                    onChange={() => {
                      setIsRoundTrip(true);
                      if (!returnDate && departDate) {
                        // Set a default return date 7 days after departure
                        const newReturnDate = new Date(departDate);
                        newReturnDate.setDate(newReturnDate.getDate() + 7);
                        setReturnDate(newReturnDate);
                      }
                    }}
                  />
                  <span className="ml-2">Round Trip</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    checked={!isRoundTrip}
                    onChange={() => {
                      setIsRoundTrip(false);
                      setReturnDate(null);
                    }}
                  />
                  <span className="ml-2">One Way</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              className="btn-primary w-full sm:w-auto flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center">
                  Search Flights <ArrowRightIcon className="ml-2 h-4 w-4" />
                </span>
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
      
      {/* Flight Results */}
      {flights && !loading && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">
            {isRoundTrip ? 'Round Trip Flights' : 'One Way Flights'}
          </h3>
          
          {/* Outbound Flights */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold mb-2 flex items-center">
              <span className="flex items-center justify-center bg-primary/10 text-primary rounded-full w-6 h-6 text-sm mr-2">1</span>
              Outbound: {origin} → {destination}
            </h4>
            
            <div className="space-y-4">
              {flights.outbound.length > 0 ? (
                flights.outbound.map((flight) => (
                  <div
                    key={flight.id}
                    className={`bg-white dark:bg-gray-dark/30 border rounded-lg p-4 shadow-sm cursor-pointer transition-all ${
                      selectedOutbound === flight.id
                        ? 'border-primary dark:border-primary'
                        : 'border-gray/20 dark:border-gray-dark/50 hover:border-gray/50 dark:hover:border-gray-dark/80'
                    }`}
                    onClick={() => handleFlightSelect('outbound', flight.id)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="mb-2 sm:mb-0">
                        <p className="font-semibold">{flight.airline}</p>
                        <p className="text-sm text-gray-dark">{flight.flight_number}</p>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="text-center">
                          <p className="font-bold">{flight.depart_time}</p>
                          <p className="text-sm text-gray-dark">{flight.origin}</p>
                        </div>
                        
                        <div className="mx-4 text-center">
                          <p className="text-xs text-gray-dark">{flight.duration}</p>
                          <div className="relative w-16 h-0.5 bg-gray/20 dark:bg-gray-dark/30">
                            <ArrowRightIcon className="h-3 w-3 absolute -right-1 -top-1.5" />
                          </div>
                          <p className="text-xs text-gray-dark">
                            {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="font-bold">{flight.arrival_time}</p>
                          <p className="text-sm text-gray-dark">{flight.destination}</p>
                        </div>
                      </div>
                      
                      <div className="ml-auto mt-2 sm:mt-0 text-right">
                        <p className="font-bold text-primary">${flight.price}</p>
                        <p className="text-sm text-gray-dark">{flight.cabin_class}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 bg-gray-light/20 dark:bg-gray-dark/10 rounded-lg">
                  <p>No outbound flights found for this route.</p>
                  <p className="text-sm text-gray-dark mt-1">Try different dates or destinations.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Return Flights */}
          {isRoundTrip && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-2 flex items-center">
                <span className="flex items-center justify-center bg-primary/10 text-primary rounded-full w-6 h-6 text-sm mr-2">2</span>
                Return: {destination} → {origin}
              </h4>
              
              <div className="space-y-4">
                {flights.return.length > 0 ? (
                  flights.return.map((flight) => (
                    <div
                      key={flight.id}
                      className={`bg-white dark:bg-gray-dark/30 border rounded-lg p-4 shadow-sm cursor-pointer transition-all ${
                        selectedReturn === flight.id
                          ? 'border-primary dark:border-primary'
                          : 'border-gray/20 dark:border-gray-dark/50 hover:border-gray/50 dark:hover:border-gray-dark/80'
                      }`}
                      onClick={() => handleFlightSelect('return', flight.id)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="mb-2 sm:mb-0">
                          <p className="font-semibold">{flight.airline}</p>
                          <p className="text-sm text-gray-dark">{flight.flight_number}</p>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="text-center">
                            <p className="font-bold">{flight.depart_time}</p>
                            <p className="text-sm text-gray-dark">{flight.origin}</p>
                          </div>
                          
                          <div className="mx-4 text-center">
                            <p className="text-xs text-gray-dark">{flight.duration}</p>
                            <div className="relative w-16 h-0.5 bg-gray/20 dark:bg-gray-dark/30">
                              <ArrowRightIcon className="h-3 w-3 absolute -right-1 -top-1.5" />
                            </div>
                            <p className="text-xs text-gray-dark">
                              {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                            </p>
                          </div>
                          
                          <div className="text-center">
                            <p className="font-bold">{flight.arrival_time}</p>
                            <p className="text-sm text-gray-dark">{flight.destination}</p>
                          </div>
                        </div>
                        
                        <div className="ml-auto mt-2 sm:mt-0 text-right">
                          <p className="font-bold text-primary">${flight.price}</p>
                          <p className="text-sm text-gray-dark">{flight.cabin_class}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 bg-gray-light/20 dark:bg-gray-dark/10 rounded-lg">
                    <p>No return flights found for this route.</p>
                    <p className="text-sm text-gray-dark mt-1">Try different dates or destinations.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Summary */}
          {selectedOutbound && (isRoundTrip ? selectedReturn : true) && (
            <div className="bg-success/5 border border-success/20 rounded-lg p-4">
              <h4 className="text-lg font-bold mb-2 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-success" />
                Price Summary
              </h4>
              
              <div className="space-y-2">
                {/* Outbound flight price */}
                {selectedOutbound && (
                  <div className="flex justify-between">
                    <p>Outbound Flight</p>
                    <p className="font-medium">
                      ${flights.outbound.find(f => f.id === selectedOutbound)?.price}
                    </p>
                  </div>
                )}
                
                {/* Return flight price */}
                {isRoundTrip && selectedReturn && (
                  <div className="flex justify-between">
                    <p>Return Flight</p>
                    <p className="font-medium">
                      ${flights.return.find(f => f.id === selectedReturn)?.price}
                    </p>
                  </div>
                )}
                
                {/* Taxes and fees (mocked) */}
                <div className="flex justify-between">
                  <p>Taxes & Fees</p>
                  <p className="font-medium">$25.99</p>
                </div>
                
                <div className="border-t border-success/20 pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>
                      ${(() => {
                        const outboundPrice = flights.outbound.find(f => f.id === selectedOutbound)?.price || 0;
                        const returnPrice = isRoundTrip && selectedReturn 
                          ? flights.return.find(f => f.id === selectedReturn)?.price || 0
                          : 0;
                        return (outboundPrice + returnPrice + 25.99).toFixed(2);
                      })()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <button className="btn-success w-full">
                  Confirm Selection
                </button>
                <p className="text-xs text-center mt-2 text-gray-dark">
                  Best price guaranteed • No hidden fees
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 