'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPinIcon, 
  CalendarDaysIcon, 
  CurrencyDollarIcon, 
  BuildingOffice2Icon,
  TruckIcon,
  ShoppingBagIcon,
  UserIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import TravelItinerary from './TravelItinerary';

interface FormData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  preferences: {
    accommodationType: 'budget' | 'standard' | 'luxury';
    transportationPreference: 'public' | 'rental' | 'taxi';
    mealPreference: 'street food' | 'casual dining' | 'fine dining';
    activityPreference: 'culture' | 'adventure' | 'relaxation' | 'shopping';
  };
}

interface Itinerary {
  destination: string;
  totalCost: string;
  duration: string;
  budgetMessage?: string;
  days: any[];
  travelTips: string[];
}

const ItineraryGenerator: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 1000,
    preferences: {
      accommodationType: 'standard',
      transportationPreference: 'public',
      mealPreference: 'casual dining',
      activityPreference: 'culture'
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'budget' ? Number(value) : value
      }));
    }
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate basic info
      if (!formData.destination || !formData.startDate || !formData.endDate) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Validate dates
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        setError('End date cannot be before start date');
        return;
      }
    }
    
    setError(null);
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const generateItinerary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/itineraries/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate itinerary');
      }
      
      const data = await response.json();
      setGeneratedItinerary(data.itinerary);
      setStep(3);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const saveItinerary = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setError('Please log in to save your itinerary');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/user/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: formData.budget,
          notes: '',
          itinerary: generatedItinerary
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save itinerary');
      }
      
      // Show success message or redirect
      alert('Itinerary saved successfully!');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const shareItinerary = () => {
    // Implementation would depend on the sharing functionality you want to provide
    alert('Sharing functionality would be implemented here');
  };

  const editPreferences = () => {
    setStep(2);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">AI Travel Planner</h1>
        <p className="text-gray-600 mt-2">
          Generate a personalized travel itinerary in minutes
        </p>
      </div>
      
      {/* Progress Indicators */}
      <div className="flex items-center justify-center mb-8">
        <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
          step >= 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          1
        </div>
        <div className={`h-1 w-12 ${
          step >= 2 ? 'bg-indigo-500' : 'bg-gray-200'
        }`}></div>
        <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
          step >= 2 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          2
        </div>
        <div className={`h-1 w-12 ${
          step >= 3 ? 'bg-indigo-500' : 'bg-gray-200'
        }`}></div>
        <div className={`rounded-full h-10 w-10 flex items-center justify-center ${
          step >= 3 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          3
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Step 1: Basic Trip Info */}
      {step === 1 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Trip Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                <div className="flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2 text-indigo-500" />
                  Destination
                </div>
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g. Paris, France"
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    Start Date
                  </div>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="w-5 h-5 mr-2 text-indigo-500" />
                    End Date
                  </div>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-indigo-500" />
                  Budget (USD)
                </div>
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="100"
                step="100"
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: Preferences */}
      {step === 2 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Travel Preferences</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                <div className="flex items-center">
                  <BuildingOffice2Icon className="w-5 h-5 mr-2 text-indigo-500" />
                  Accommodation Type
                </div>
              </label>
              <select
                name="preferences.accommodationType"
                value={formData.preferences.accommodationType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="budget">Budget (Hostels, Guesthouses)</option>
                <option value="standard">Standard (3-star Hotels)</option>
                <option value="luxury">Luxury (4-5 star Hotels)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">
                <div className="flex items-center">
                  <TruckIcon className="w-5 h-5 mr-2 text-indigo-500" />
                  Transportation Preference
                </div>
              </label>
              <select
                name="preferences.transportationPreference"
                value={formData.preferences.transportationPreference}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="public">Public Transport</option>
                <option value="rental">Car Rental</option>
                <option value="taxi">Taxi/Rideshare</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">
                <div className="flex items-center">
                  <ShoppingBagIcon className="w-5 h-5 mr-2 text-indigo-500" />
                  Meal Preference
                </div>
              </label>
              <select
                name="preferences.mealPreference"
                value={formData.preferences.mealPreference}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="street food">Street Food & Markets</option>
                <option value="casual dining">Casual Restaurants</option>
                <option value="fine dining">Fine Dining</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">
                <div className="flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-indigo-500" />
                  Activity Preference
                </div>
              </label>
              <select
                name="preferences.activityPreference"
                value={formData.preferences.activityPreference}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="culture">Cultural (Museums, Historical Sites)</option>
                <option value="adventure">Adventure (Hiking, Sports)</option>
                <option value="relaxation">Relaxation (Beaches, Spas)</option>
                <option value="shopping">Shopping & Entertainment</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={prevStep}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={generateItinerary}
              className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Generate Itinerary
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Step 3: Generated Itinerary */}
      {step === 3 && generatedItinerary && (
        <div>
          <TravelItinerary 
            itinerary={generatedItinerary}
            onSave={saveItinerary}
            onShare={shareItinerary}
            onEdit={editPreferences}
          />
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-4"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setGeneratedItinerary(null);
                setStep(1);
                setFormData({
                  destination: '',
                  startDate: '',
                  endDate: '',
                  budget: 1000,
                  preferences: {
                    accommodationType: 'standard',
                    transportationPreference: 'public',
                    mealPreference: 'casual dining',
                    activityPreference: 'culture'
                  }
                });
              }}
              className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
            >
              Create New Itinerary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryGenerator; 