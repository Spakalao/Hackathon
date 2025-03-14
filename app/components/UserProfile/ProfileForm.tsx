'use client';

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  BuildingOffice2Icon,
  TruckIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const ProfileForm: React.FC = () => {
  const { user, updateUserProfile, updateUserPreferences } = useContext(AuthContext);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [preferences, setPreferences] = useState({
    accommodationType: 'standard',
    transportationPreference: 'public',
    mealPreference: 'casual dining',
    activityPreference: 'culture'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfileImage(user.profileImage || '');
      
      if (user.preferences) {
        setPreferences({
          accommodationType: user.preferences.accommodationType || 'standard',
          transportationPreference: user.preferences.transportationPreference || 'public',
          mealPreference: user.preferences.mealPreference || 'casual dining',
          activityPreference: user.preferences.activityPreference || 'culture'
        });
      }
    }
  }, [user]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!name.trim()) {
        throw new Error('Name is required');
      }
      
      const result = await updateUserProfile({
        name,
        profileImage
      });
      
      if (result) {
        setSuccess('Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await updateUserPreferences(preferences);
      
      if (result) {
        setSuccess('Preferences updated successfully');
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
        <p>Please log in to view or edit your profile.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
          <ExclamationCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-start">
          <CheckCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}
      
      {/* Profile Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                id="name" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="pl-10 w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                placeholder="Your Name" 
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                id="email" 
                type="email" 
                value={email} 
                disabled 
                className="pl-10 w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-600" 
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>
          
          <div>
            <label htmlFor="profileImage" className="block text-gray-700 mb-2">Profile Image URL</label>
            <input 
              id="profileImage" 
              type="text" 
              value={profileImage} 
              onChange={(e) => setProfileImage(e.target.value)} 
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="https://example.com/your-image.jpg" 
            />
            <p className="mt-1 text-xs text-gray-500">Enter a URL to an image (optional)</p>
          </div>
          
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
      
      {/* Travel Preferences Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Travel Preferences</h2>
        
        <form onSubmit={handleUpdatePreferences} className="space-y-5">
          <div>
            <label htmlFor="accommodationType" className="block text-gray-700 mb-2">
              <div className="flex items-center">
                <BuildingOffice2Icon className="w-5 h-5 mr-2 text-indigo-500" />
                Accommodation Type
              </div>
            </label>
            <select
              id="accommodationType"
              name="accommodationType"
              value={preferences.accommodationType}
              onChange={handlePreferenceChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="budget">Budget (Hostels, Guesthouses)</option>
              <option value="standard">Standard (3-star Hotels)</option>
              <option value="luxury">Luxury (4-5 star Hotels)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="transportationPreference" className="block text-gray-700 mb-2">
              <div className="flex items-center">
                <TruckIcon className="w-5 h-5 mr-2 text-indigo-500" />
                Transportation Preference
              </div>
            </label>
            <select
              id="transportationPreference"
              name="transportationPreference"
              value={preferences.transportationPreference}
              onChange={handlePreferenceChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="public">Public Transport</option>
              <option value="rental">Car Rental</option>
              <option value="taxi">Taxi/Rideshare</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="mealPreference" className="block text-gray-700 mb-2">
              <div className="flex items-center">
                <ShoppingBagIcon className="w-5 h-5 mr-2 text-indigo-500" />
                Meal Preference
              </div>
            </label>
            <select
              id="mealPreference"
              name="mealPreference"
              value={preferences.mealPreference}
              onChange={handlePreferenceChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="street food">Street Food & Markets</option>
              <option value="casual dining">Casual Restaurants</option>
              <option value="fine dining">Fine Dining</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="activityPreference" className="block text-gray-700 mb-2">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-indigo-500" />
                Activity Preference
              </div>
            </label>
            <select
              id="activityPreference"
              name="activityPreference"
              value={preferences.activityPreference}
              onChange={handlePreferenceChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="culture">Cultural (Museums, Historical Sites)</option>
              <option value="adventure">Adventure (Hiking, Sports)</option>
              <option value="relaxation">Relaxation (Beaches, Spas)</option>
              <option value="shopping">Shopping & Entertainment</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="defaultBudget" className="block text-gray-700 mb-2">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2 text-indigo-500" />
                Default Trip Budget (USD)
              </div>
            </label>
            <input 
              id="defaultBudget" 
              type="number" 
              min="0"
              className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder="1000" 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm; 