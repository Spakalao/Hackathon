"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, GlobeAltIcon, CurrencyDollarIcon, UserGroupIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline';

type TravelPreferences = {
  destination: string;
  budget: string;
  startDate: string;
  endDate: string;
  travelers: string;
  interests: string[];
  pacePreference: string;
}

const interests = [
  'History', 'Nature', 'Adventure', 'Food', 'Culture', 
  'Beaches', 'Shopping', 'Nightlife', 'Art', 'Relaxation'
];

type Props = {
  onSubmit: (preferences: TravelPreferences) => void;
  isLoading: boolean;
}

export default function TravelForm({ onSubmit, isLoading }: Props) {
  const [formState, setFormState] = useState<TravelPreferences>({
    destination: '',
    budget: '',
    startDate: '',
    endDate: '',
    travelers: '1',
    interests: [],
    pacePreference: 'moderate'
  });
  
  const [activeStep, setActiveStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleBackToChat = () => {
    window.history.back();
  };
  
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formState.destination.trim()) newErrors.destination = 'Destination is required';
      if (!formState.startDate) newErrors.startDate = 'Start date is required';
      if (!formState.endDate) newErrors.endDate = 'End date is required';
      
      // Check if end date is after start date
      if (formState.startDate && formState.endDate && new Date(formState.endDate) <= new Date(formState.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    if (step === 2) {
      if (!formState.budget.trim()) newErrors.budget = 'Budget is required';
      if (!formState.travelers || Number(formState.travelers) < 1) {
        newErrors.travelers = 'At least 1 traveler is required';
      }
    }
    
    if (step === 3) {
      if (formState.interests.length === 0) {
        newErrors.interests = 'Select at least one interest';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 4));
    }
  };
  
  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInterestToggle = (interest: string) => {
    setFormState(prev => {
      const interests = [...prev.interests];
      
      if (interests.includes(interest)) {
        return { ...prev, interests: interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...interests, interest] };
      }
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(activeStep)) {
      onSubmit(formState);
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div 
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 mb-2 ${
                  activeStep === step
                    ? 'border-primary bg-primary text-white'
                    : activeStep > step
                    ? 'border-success bg-success/10 text-success'
                    : 'border-gray bg-gray-light text-gray-dark'
                }`}
              >
                {activeStep > step ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <span className={`text-sm font-medium ${activeStep === step ? 'text-primary' : 'text-gray-dark'}`}>
                {step === 1 && "Basics"}
                {step === 2 && "Details"}
                {step === 3 && "Preferences"}
                {step === 4 && "Review"}
              </span>
              {step < 4 && (
                <div className="h-1 w-full bg-gray-light mt-2 hidden md:block">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: activeStep > step ? '100%' : '0%' }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="card p-8"
      >
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Where and When?</h3>
                <p className="text-gray-dark mt-2">
                  Let's start with your destination and travel dates
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="destination" className="form-label flex items-center">
                    <GlobeAltIcon className="h-5 w-5 mr-2 text-primary" />
                    Destination
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    placeholder="Where do you want to go?"
                    value={formState.destination}
                    onChange={handleInputChange}
                    className={`form-input ${errors.destination ? 'input-error' : ''}`}
                  />
                  {errors.destination && <p className="text-error text-sm mt-1">{errors.destination}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="startDate" className="form-label flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formState.startDate}
                      onChange={handleInputChange}
                      className={`form-input ${errors.startDate ? 'input-error' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.startDate && <p className="text-error text-sm mt-1">{errors.startDate}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="endDate" className="form-label flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formState.endDate}
                      onChange={handleInputChange}
                      className={`form-input ${errors.endDate ? 'input-error' : ''}`}
                      min={formState.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {errors.endDate && <p className="text-error text-sm mt-1">{errors.endDate}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Budget and Travelers */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Budget & Party Size</h3>
                <p className="text-gray-dark mt-2">
                  Tell us about your budget and who's coming along
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="budget" className="form-label flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-primary" />
                    Total Budget
                  </label>
                  <input
                    type="text"
                    id="budget"
                    name="budget"
                    placeholder="What's your total budget for this trip?"
                    value={formState.budget}
                    onChange={handleInputChange}
                    className={`form-input ${errors.budget ? 'input-error' : ''}`}
                  />
                  {errors.budget && <p className="text-error text-sm mt-1">{errors.budget}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="travelers" className="form-label flex items-center">
                    <UserGroupIcon className="h-5 w-5 mr-2 text-primary" />
                    Number of Travelers
                  </label>
                  <input
                    type="number"
                    id="travelers"
                    name="travelers"
                    min="1"
                    value={formState.travelers}
                    onChange={handleInputChange}
                    className={`form-input ${errors.travelers ? 'input-error' : ''}`}
                  />
                  {errors.travelers && <p className="text-error text-sm mt-1">{errors.travelers}</p>}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Travel Interests */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Your Travel Style</h3>
                <p className="text-gray-dark mt-2">
                  Tell us what you enjoy so we can create your perfect trip
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label flex items-center mb-3">
                    <HeartIcon className="h-5 w-5 mr-2 text-primary" />
                    Interests (Select all that apply)
                  </label>
                  {errors.interests && <p className="text-error text-sm mb-2">{errors.interests}</p>}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {interests.map((interest) => (
                      <div 
                        key={interest}
                        onClick={() => handleInterestToggle(interest)}
                        className={`
                          border rounded-lg py-2 px-3 text-center cursor-pointer transition-all duration-200
                          ${formState.interests.includes(interest) 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-gray hover:border-primary/50 hover:bg-primary/5'}
                        `}
                      >
                        {interest}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="pacePreference" className="form-label flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-primary" />
                    Trip Pace
                  </label>
                  <div className="flex space-x-4">
                    {['relaxed', 'moderate', 'fast-paced'].map((pace) => (
                      <div key={pace} className="flex-1">
                        <input
                          type="radio"
                          id={pace}
                          name="pacePreference"
                          value={pace}
                          checked={formState.pacePreference === pace}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <label
                          htmlFor={pace}
                          className={`
                            block border rounded-lg py-3 px-4 text-center cursor-pointer transition-all duration-200
                            ${formState.pacePreference === pace 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-gray hover:border-primary/50 hover:bg-primary/5'}
                          `}
                        >
                          {pace.charAt(0).toUpperCase() + pace.slice(1).replace('-', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Review */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Review Your Travel Plan</h3>
                <p className="text-gray-dark mt-2">
                  Look over your details before we create your personalized itinerary
                </p>
              </div>
              
              <div className="space-y-4 border-t border-b py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ReviewItem 
                    icon={<GlobeAltIcon className="h-5 w-5 text-primary" />}
                    label="Destination" 
                    value={formState.destination}
                  />
                  <ReviewItem 
                    icon={<CurrencyDollarIcon className="h-5 w-5 text-primary" />}
                    label="Total Budget" 
                    value={formState.budget}
                  />
                  <ReviewItem 
                    icon={<CalendarIcon className="h-5 w-5 text-primary" />}
                    label="Travel Dates" 
                    value={`${new Date(formState.startDate).toLocaleDateString()} - ${new Date(formState.endDate).toLocaleDateString()}`}
                  />
                  <ReviewItem 
                    icon={<UserGroupIcon className="h-5 w-5 text-primary" />}
                    label="Travelers" 
                    value={formState.travelers}
                  />
                </div>
                
                <ReviewItem 
                  icon={<HeartIcon className="h-5 w-5 text-primary" />}
                  label="Interests" 
                  value={formState.interests.join(', ')}
                />
                
                <ReviewItem 
                  icon={<ClockIcon className="h-5 w-5 text-primary" />}
                  label="Trip Pace" 
                  value={formState.pacePreference.charAt(0).toUpperCase() + formState.pacePreference.slice(1).replace('-', ' ')}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-between mt-6 pt-4 border-t">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="btn-outline"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBackToChat}
                className="btn-outline flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Return to Chat
              </button>
            )}
            
            <div className="ml-auto">
              {activeStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Create My Travel Plan'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ReviewItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start">
      <div className="mr-3 mt-1">{icon}</div>
      <div>
        <div className="text-sm text-gray-dark">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
} 