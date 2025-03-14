'use client';

import React, { useState } from 'react';
import { 
  CalendarDaysIcon, 
  MapPinIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  BuildingOffice2Icon,
  TruckIcon,
  LightBulbIcon,
  ShoppingBagIcon,
  MusicalNoteIcon,
  CameraIcon,
  UserGroupIcon,
  ArrowDownOnSquareIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface Activity {
  name: string;
  description: string;
  cost: string;
  type: string;
  location: string;
  duration: string;
}

interface Accommodation {
  name: string;
  location: string;
  cost: string;
}

interface Transportation {
  type: string;
  details: string;
  cost: string;
}

interface ItineraryDay {
  date: string;
  activities: Activity[];
  accommodation: Accommodation;
  transportation: Transportation;
}

interface Itinerary {
  destination: string;
  totalCost: string;
  duration: string;
  budgetMessage?: string;
  days: ItineraryDay[];
  travelTips: string[];
}

interface TravelItineraryProps {
  itinerary: Itinerary;
  onSave?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
}

const TravelItinerary: React.FC<TravelItineraryProps> = ({ 
  itinerary,
  onSave,
  onShare,
  onEdit
}) => {
  const [activeDay, setActiveDay] = useState(0);
  const [activeTab, setActiveTab] = useState<'activities' | 'accommodations' | 'transportation' | 'tips'>('activities');

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sightseeing':
        return <CameraIcon className="w-5 h-5 text-blue-500" />;
      case 'cultural':
        return <MusicalNoteIcon className="w-5 h-5 text-purple-500" />;
      case 'food':
        return <ShoppingBagIcon className="w-5 h-5 text-orange-500" />;
      case 'leisure':
        return <UserGroupIcon className="w-5 h-5 text-green-500" />;
      case 'outdoor':
        return <MapPinIcon className="w-5 h-5 text-emerald-500" />;
      default:
        return <LightBulbIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 my-4 text-center">
        <p className="text-gray-500">No itinerary data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 my-4">
      {/* Itinerary Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{itinerary.destination}</h2>
        <div className="flex flex-col sm:flex-row sm:items-center mt-2 text-gray-600 gap-3">
          <div className="flex items-center">
            <CalendarDaysIcon className="w-5 h-5 mr-2 text-indigo-500" />
            <span>{itinerary.duration}</span>
          </div>
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
            <span>Total: {itinerary.totalCost}</span>
          </div>
        </div>
        {itinerary.budgetMessage && (
          <div className="mt-2 text-sm text-gray-600">
            <p>{itinerary.budgetMessage}</p>
          </div>
        )}
      </div>

      {/* Day Selector */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-2 min-w-max">
          {itinerary.days.map((day, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`px-4 py-2 rounded-md ${
                activeDay === index
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Day {index + 1} - {formatDate(day.date)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 ${
              activeTab === 'activities'
                ? 'border-b-2 border-indigo-500 text-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab('accommodations')}
            className={`px-4 py-2 ${
              activeTab === 'accommodations'
                ? 'border-b-2 border-indigo-500 text-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Accommodation
          </button>
          <button
            onClick={() => setActiveTab('transportation')}
            className={`px-4 py-2 ${
              activeTab === 'transportation'
                ? 'border-b-2 border-indigo-500 text-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transportation
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-4 py-2 ${
              activeTab === 'tips'
                ? 'border-b-2 border-indigo-500 text-indigo-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Travel Tips
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'activities' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Day {activeDay + 1} Activities</h3>
            <div className="space-y-4">
              {itinerary.days[activeDay].activities.map((activity, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getActivityIcon(activity.type)}
                      <h4 className="text-md font-medium ml-2">{activity.name}</h4>
                    </div>
                    <span className="text-green-600 font-medium">{activity.cost}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      <span>{activity.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'accommodations' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Day {activeDay + 1} Accommodation</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <BuildingOffice2Icon className="w-5 h-5 text-indigo-500" />
                  <h4 className="text-md font-medium ml-2">
                    {itinerary.days[activeDay].accommodation.name}
                  </h4>
                </div>
                <span className="text-green-600 font-medium">
                  {itinerary.days[activeDay].accommodation.cost}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span>{itinerary.days[activeDay].accommodation.location}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transportation' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Day {activeDay + 1} Transportation</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <TruckIcon className="w-5 h-5 text-blue-500" />
                  <h4 className="text-md font-medium ml-2">
                    {itinerary.days[activeDay].transportation.type}
                  </h4>
                </div>
                <span className="text-green-600 font-medium">
                  {itinerary.days[activeDay].transportation.cost}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {itinerary.days[activeDay].transportation.details}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'tips' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Travel Tips</h3>
            <ul className="space-y-2">
              {itinerary.travelTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <LightBulbIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-6">
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
          >
            <ArrowDownOnSquareIcon className="w-5 h-5 mr-2" />
            Save Itinerary
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            <PencilSquareIcon className="w-5 h-5 mr-2" />
            Edit Preferences
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <ShareIcon className="w-5 h-5 mr-2" />
            Share
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <EnvelopeIcon className="w-5 h-5 mr-2" />
          Export
        </button>
      </div>
    </div>
  );
};

export default TravelItinerary; 