'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes: string;
  createdAt: string;
  itinerary: any | null;
}

const SavedTrips: React.FC = () => {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTrips();
  }, []);
  
  const fetchTrips = async () => {
    setLoading(true);
    
    try {
      // Check if user is logged in
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Please log in to view your saved trips');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/user/trips', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      
      const data = await response.json();
      setTrips(data.trips || []);
    } catch (err) {
      setError('Failed to load trips. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const viewItinerary = (trip: Trip) => {
    if (!trip.itinerary) {
      // If no itinerary, redirect to create one
      router.push(`/plan?destination=${encodeURIComponent(trip.destination)}&startDate=${trip.startDate}&endDate=${trip.endDate}&budget=${trip.budget}`);
    } else {
      // Pass the trip data to the itinerary view page
      router.push(`/trips/${trip.id}`);
    }
  };
  
  const deleteTrip = async (tripId: string) => {
    // For a real app, you would implement an API call to delete the trip
    if (window.confirm('Are you sure you want to delete this trip?')) {
      alert('In a real app, this would delete the trip with ID: ' + tripId);
      // For the hackathon, just remove from local state
      setTrips(trips.filter(trip => trip.id !== tripId));
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center">
        <ExclamationCircleIcon className="w-6 h-6 mr-2" />
        <p>{error}</p>
      </div>
    );
  }
  
  if (trips.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No trips saved yet</h3>
        <p className="mt-2 text-gray-600">
          Start planning your first trip to save it here
        </p>
        <button
          onClick={() => router.push('/plan')}
          className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New Trip
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Your Saved Trips</h2>
        <button
          onClick={() => router.push('/plan')}
          className="inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Trip
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {trip.destination}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <CalendarDaysIcon className="w-5 h-5 mr-2 text-indigo-500" />
                  <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                </div>
                
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
                  <span>Budget: ${trip.budget}</span>
                </div>
                
                {trip.notes && (
                  <div className="text-gray-600 italic">
                    "{trip.notes}"
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-500">
                  Created {formatDate(trip.createdAt)}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteTrip(trip.id)}
                    className="p-1 text-gray-500 hover:text-red-500"
                    title="Delete Trip"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => router.push(`/plan?edit=${trip.id}`)}
                    className="p-1 text-gray-500 hover:text-blue-500"
                    title="Edit Trip"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => viewItinerary(trip)}
              className={`w-full py-3 px-4 text-center ${
                trip.itinerary 
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                  : 'bg-gray-100 text-indigo-600 hover:bg-gray-200'
              }`}
            >
              {trip.itinerary ? 'View Itinerary' : 'Generate Itinerary'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedTrips; 