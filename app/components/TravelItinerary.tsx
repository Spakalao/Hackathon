"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Image from 'next/image';
import { MapPinIcon, CalendarIcon, CurrencyDollarIcon, StarIcon, ChevronDownIcon, ChevronUpIcon, MapIcon, PhotoIcon, BoltIcon } from '@heroicons/react/24/outline';

type Activity = {
  name: string;
  description: string;
  cost: string;
  type: string;
  location: string;
  duration: string;
  imageUrl?: string;
};

type Day = {
  date: string;
  activities: Activity[];
  accommodation: {
    name: string;
    location: string;
    cost: string;
    imageUrl?: string;
  };
  transportation: {
    type: string;
    details: string;
    cost: string;
  };
  alternativeActivities?: Activity[];
};

type Itinerary = {
  destination: string;
  totalCost: string;
  duration: string;
  days: Day[];
  travelTips: string[];
};

type TravelItineraryProps = {
  itinerary: Itinerary;
  onRequestAlternatives: () => void;
  showAlternatives: boolean;
};

export default function TravelItinerary({ itinerary, onRequestAlternatives, showAlternatives }: TravelItineraryProps) {
  const [expandedDays, setExpandedDays] = useState<number[]>([0]); // First day expanded by default
  
  const toggleDay = (index: number) => {
    setExpandedDays(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleBack = () => {
    window.history.back();
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={handleBack}
          className="btn-outline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Search
        </button>
      </div>
    
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="relative h-80 rounded-3xl overflow-hidden mb-8">
          <Image
            src={`https://source.unsplash.com/1600x900/?${itinerary.destination.replace(/\s+/g, ',')}`}
            alt={itinerary.destination}
            fill
            style={{ objectFit: 'cover' }}
            className="brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center mb-1">
              <MapPinIcon className="h-5 w-5 mr-2" />
              <span className="text-lg">Your destination</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{itinerary.destination}</h1>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span>{itinerary.duration}</span>
              </div>
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                <span>Total Budget: {itinerary.totalCost}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 bg-primary/5 border-primary/10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Budget</h3>
                <p className="text-2xl font-bold text-primary">{itinerary.totalCost}</p>
              </div>
            </div>
            <p className="text-gray-dark">
              This budget includes all accommodations, activities, and transportation costs in this itinerary.
            </p>
          </div>
          
          <div className="card p-6 bg-secondary/5 border-secondary/10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mr-4">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Duration</h3>
                <p className="text-2xl font-bold text-secondary">{itinerary.duration}</p>
              </div>
            </div>
            <p className="text-gray-dark">
              {itinerary.days.length} days of amazing experiences tailored to your preferences.
            </p>
          </div>
          
          <div className="card p-6 bg-success/5 border-success/10">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success mr-4">
                <MapIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Destination</h3>
                <p className="text-2xl font-bold text-success">{itinerary.destination}</p>
              </div>
            </div>
            <p className="text-gray-dark">
              Explore the best this destination has to offer with our curated itinerary.
            </p>
          </div>
        </div>
        
        {!showAlternatives && (
          <div className="card p-6 bg-accent/5 border-accent/10 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mr-4">
                  <BoltIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Budget-Friendly Options</h3>
                  <p className="text-gray-dark">Want to see more affordable alternatives?</p>
                </div>
              </div>
              <button
                onClick={onRequestAlternatives}
                className="btn-outline-accent"
              >
                Show Budget Alternatives
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <div className="mb-12">
        <h2 className="section-title mb-6">Your Daily Itinerary</h2>
        
        <div className="space-y-6">
          {itinerary.days.map((day, dayIndex) => (
            <motion.div 
              key={dayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: dayIndex * 0.1 }}
              className="card overflow-hidden"
            >
              <div 
                className={`flex items-center justify-between p-6 cursor-pointer ${
                  expandedDays.includes(dayIndex) ? 'border-b border-gray' : ''
                }`}
                onClick={() => toggleDay(dayIndex)}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-4">
                    <span className="font-bold">D{dayIndex + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Day {dayIndex + 1}: {day.date}</h3>
                    <p className="text-gray-dark">{day.activities.length} activities</p>
                  </div>
                </div>
                <div className={`transition-transform duration-300 ${expandedDays.includes(dayIndex) ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon className="h-6 w-6" />
                </div>
              </div>
              
              {expandedDays.includes(dayIndex) && (
                <div className="p-6">
                  <div className="space-y-8">
                    {/* Activities */}
                    <div>
                      <h4 className="text-lg font-bold mb-4 flex items-center">
                        <MapPinIcon className="h-5 w-5 mr-2 text-primary" />
                        Activities
                      </h4>
                      <div className="space-y-6">
                        {day.activities.map((activity, actIndex) => (
                          <ActivityCard 
                            key={actIndex} 
                            activity={activity} 
                            index={actIndex} 
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Accommodation */}
                    <div>
                      <h4 className="text-lg font-bold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        Accommodation
                      </h4>
                      <div className="card bg-gray-light/30 dark:bg-gray-dark/10 p-4 flex flex-col md:flex-row items-start gap-4">
                        {day.accommodation.imageUrl && (
                          <div className="relative h-40 w-full md:w-48 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={day.accommodation.imageUrl || `https://source.unsplash.com/300x200/?hotel,room`}
                              alt={day.accommodation.name}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="text-lg font-bold mb-1">{day.accommodation.name}</h5>
                          <div className="flex items-center text-sm text-gray-dark mb-2">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            <span>{day.accommodation.location}</span>
                          </div>
                          <div className="flex items-center mb-4">
                            {[...Array(4)].map((_, i) => (
                              <StarIcon key={i} className="h-4 w-4 text-accent" />
                            ))}
                            <StarIcon className="h-4 w-4 text-gray" />
                          </div>
                          <div className="flex items-center">
                            <span className="text-lg font-bold text-primary mr-2">{day.accommodation.cost}</span>
                            <span className="text-sm text-gray-dark">per night</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Transportation */}
                    <div>
                      <h4 className="text-lg font-bold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M13 5h-6a1 1 0 00-1 1v8a1 1 0 001 1h6a1 1 0 001-1V6a1 1 0 00-1-1zm-1 7a1 1 0 11-2 0 1 1 0 012 0zm-3 0a1 1 0 11-2 0 1 1 0 012 0zm-3-3a1 1 0 100-2 1 1 0 000 2zm6-2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Transportation
                      </h4>
                      <div className="card bg-gray-light/30 dark:bg-gray-dark/10 p-4">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div>
                            <h5 className="font-bold">{day.transportation.type}</h5>
                            <p className="text-gray-dark">{day.transportation.details}</p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className="text-lg font-bold text-primary">{day.transportation.cost}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Budget Alternatives */}
                    {showAlternatives && day.alternativeActivities && day.alternativeActivities.length > 0 && (
                      <div>
                        <h4 className="text-lg font-bold mb-4 flex items-center">
                          <CurrencyDollarIcon className="h-5 w-5 mr-2 text-accent" />
                          Budget-Friendly Alternatives
                        </h4>
                        <div className="space-y-6">
                          {day.alternativeActivities.map((activity, actIndex) => (
                            <ActivityCard 
                              key={actIndex} 
                              activity={activity} 
                              index={actIndex}
                              isBudgetAlternative={true}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Travel Tips */}
      <div className="mb-12">
        <h2 className="section-title mb-6">Travel Tips</h2>
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {itinerary.travelTips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                  <span className="font-bold">{index + 1}</span>
                </div>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Map Preview - In a real app, this would be an interactive map */}
      <div className="mb-12">
        <h2 className="section-title mb-6">Map Preview</h2>
        <div className="card p-6">
          <div className="relative h-80 w-full rounded-lg overflow-hidden bg-gray-light dark:bg-gray-dark">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <PhotoIcon className="h-16 w-16 mx-auto text-gray-dark/50 mb-4" />
                <p className="text-gray-dark">Interactive map would be displayed here in the full application</p>
                <p className="text-sm text-gray-dark mt-2">Showing all locations from your itinerary</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityCard({ activity, index, isBudgetAlternative = false }: { activity: Activity, index: number, isBudgetAlternative?: boolean }) {
  return (
    <div className={`card ${isBudgetAlternative ? 'bg-accent/5 border-accent/20' : 'bg-gray-light/30 dark:bg-gray-dark/10'}`}>
      <div className="flex flex-col md:flex-row">
        {activity.imageUrl && (
          <div className="relative h-48 md:h-auto md:w-48 md:flex-shrink-0">
            <Image
              src={activity.imageUrl || `https://source.unsplash.com/300x200/?${activity.type}`}
              alt={activity.name}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
            />
          </div>
        )}
        <div className="p-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <span className={`badge badge-sm ${isBudgetAlternative ? 'badge-accent' : 'badge-primary'} mb-2`}>
                {activity.type}
              </span>
              <h5 className="text-lg font-bold mb-1">{activity.name}</h5>
            </div>
            <div className="text-right">
              <span className={`text-lg font-bold ${isBudgetAlternative ? 'text-accent' : 'text-primary'}`}>
                {activity.cost}
              </span>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-dark mb-3">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{activity.location}</span>
            <span className="mx-2">•</span>
            <span>{activity.duration}</span>
          </div>
          
          <p className="text-gray-dark text-sm">{activity.description}</p>
          
          {isBudgetAlternative && (
            <div className="mt-3 pt-3 border-t border-accent/10">
              <div className="flex items-center text-accent text-sm">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                <span>Budget-friendly alternative</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 