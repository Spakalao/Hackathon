"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Header from './components/Header';
import Footer from './components/Footer';
import TravelForm from './components/TravelForm';
import TravelItinerary from './components/TravelItinerary';
import ChatInterface from './components/ChatInterface';
import TravelDashboard from './components/TravelDashboard';
import { ArrowRightIcon, LightBulbIcon, CurrencyDollarIcon, MapIcon, CalendarIcon } from '@heroicons/react/24/outline';

// Sample data for development - in production, this would come from API
const sampleItinerary = {
  destination: "Barcelona, Spain",
  budget: "1500",
  dateRange: "Jun 15 - Jun 22, 2024",
  overview: "Barcelona offers a perfect blend of beach, culture, and cuisine for budget travelers. Your 7-day trip includes affordable accommodations in the Gothic Quarter, easy public transportation, and a mix of free attractions and select paid experiences.",
  flights: {
    outbound: "New York (JFK) to Barcelona (BCN) - Jun 15, 9:40 PM - 11:15 AM (next day)",
    return: "Barcelona (BCN) to New York (JFK) - Jun 22, 1:20 PM - 4:05 PM",
    price: "520",
    airline: "Norwegian Air"
  },
  accommodation: {
    name: "Gothic Quarter Hostel",
    type: "Hostel - Private Room",
    location: "Gothic Quarter",
    price: "55",
    amenities: ["Free WiFi", "Breakfast included", "Rooftop terrace", "24-hour reception", "Lockers"]
  },
  activities: [
    {
      name: "Sagrada Familia Tour",
      description: "Skip-the-line entrance to Gaudí's masterpiece with an audio guide to explore at your own pace.",
      price: "26",
      category: "Culture"
    },
    {
      name: "Park Güell",
      description: "Explore this colorful park designed by Gaudí with panoramic views of the city.",
      price: "10",
      category: "Outdoors"
    },
    {
      name: "Gothic Quarter Walking Tour",
      description: "Free walking tour through the historic Gothic Quarter with local guides (tip-based).",
      price: "10",
      category: "History"
    },
    {
      name: "Barceloneta Beach",
      description: "Relax on Barcelona's popular city beach and enjoy the Mediterranean sun.",
      price: "0",
      category: "Relaxation"
    },
    {
      name: "La Boqueria Market",
      description: "Explore this famous public market and sample local foods and fresh produce.",
      price: "15",
      category: "Food"
    }
  ],
  transportation: [
    {
      type: "Metro Pass",
      cost: "40",
      details: "10-trip metro ticket valid for all public transportation within the city zones."
    },
    {
      type: "Airport Transfer",
      cost: "11",
      details: "Aerobus shuttle service from airport to city center (one way)."
    }
  ],
  food: {
    budget: "300",
    recommendations: [
      {
        name: "La Cova Fumada",
        type: "Traditional Tapas",
        priceRange: "$-$$"
      },
      {
        name: "Bar del Pla",
        type: "Modern Catalan",
        priceRange: "$$"
      },
      {
        name: "Bo de B",
        type: "Sandwiches",
        priceRange: "$"
      },
      {
        name: "Mercado de La Boqueria",
        type: "Food Market",
        priceRange: "$-$$"
      }
    ]
  },
  totalCost: {
    amount: "1298",
    breakdown: [
      {
        category: "Flights",
        amount: "520",
        percentage: 40
      },
      {
        category: "Accommodation",
        amount: "385",
        percentage: 30
      },
      {
        category: "Food",
        amount: "300",
        percentage: 23
      },
      {
        category: "Activities",
        amount: "61",
        percentage: 5
      },
      {
        category: "Transportation",
        amount: "32",
        percentage: 2
      }
    ]
  },
  tips: [
    "Visit museums on their free days - many offer free entry on the first Sunday of each month.",
    "Get the T-10 metro ticket for cost-effective transportation around the city.",
    "Bring a reusable water bottle, as Barcelona tap water is safe to drink.",
    "Try the 'Menu del Día' (daily menu) at restaurants for an affordable 3-course lunch.",
    "Download the Barcelona public transportation app 'TMB' for easy navigation."
  ],
  alternativeOptions: [
    {
      title: "Budget Hostel Dorm",
      description: "Switch to a shared hostel dorm room instead of a private room for your entire stay.",
      savingsAmount: "175"
    },
    {
      title: "Self-Guided Tours",
      description: "Skip the guided tours and use free audio guides or apps to explore attractions independently.",
      savingsAmount: "35"
    },
    {
      title: "Local Transportation",
      description: "Use regular bus service instead of the Aerobus for airport transfers.",
      savingsAmount: "6"
    }
  ]
};

// App stages
enum AppStage {
  WELCOME = 'welcome',
  CHAT = 'chat',
  FORM = 'form',
  LOADING = 'loading',
  RESULT = 'result',
  DASHBOARD = 'dashboard'
}

export default function Home() {
  const [appStage, setAppStage] = useState<AppStage>(AppStage.WELCOME);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [itinerary, setItinerary] = useState(sampleItinerary);
  
  // Synchroniser l'état de l'application avec l'historique du navigateur
  useEffect(() => {
    // Gestionnaire pour les événements popstate (quand l'utilisateur clique sur retour/avant)
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.appStage) {
        setAppStage(event.state.appStage);
        
        // Restaurer d'autres états si nécessaire
        if (event.state.showAlternatives !== undefined) {
          setShowAlternatives(event.state.showAlternatives);
        }
      }
    };

    // Ajouter l'état initial dans l'historique
    const state = { appStage };
    window.history.replaceState(state, '', getUrlForStage(appStage));
    
    // Écouter les événements popstate
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Ajouter une URL unique pour chaque étape
  const getUrlForStage = (stage: AppStage): string => {
    switch (stage) {
      case AppStage.WELCOME:
        return '/';
      case AppStage.CHAT:
        return '/?stage=chat';
      case AppStage.FORM:
        return '/?stage=form';
      case AppStage.LOADING:
        return '/?stage=loading';
      case AppStage.RESULT:
        return '/?stage=result';
      case AppStage.DASHBOARD:
        return '/?stage=dashboard';
      default:
        return '/';
    }
  };
  
  // Fonction helper pour mettre à jour l'état et l'historique
  const updateAppStage = (newStage: AppStage, additionalState = {}) => {
    const state = { 
      appStage: newStage,
      ...additionalState
    };
    
    // Ajouter le nouvel état à l'historique
    window.history.pushState(state, '', getUrlForStage(newStage));
    
    // Mettre à jour l'état local
    setAppStage(newStage);
    
    // Mettre à jour les états additionnels
    if ('showAlternatives' in additionalState) {
      setShowAlternatives(additionalState.showAlternatives as boolean);
    }
  };
  
  const handleStartPlanning = () => {
    updateAppStage(AppStage.CHAT);
  };
  
  const handleStartDashboard = () => {
    updateAppStage(AppStage.DASHBOARD);
  };
  
  const handleChatFinished = () => {
    updateAppStage(AppStage.FORM);
  };
  
  const handleFormSubmit = (preferences: any) => {
    console.log('Form submitted with:', preferences);
    updateAppStage(AppStage.LOADING);
    
    // In a real app, this would call an API to generate the itinerary
    setTimeout(() => {
      // For this demo, we'll just use the sample data
      setItinerary(sampleItinerary);
      updateAppStage(AppStage.RESULT);
      toast.success('Your travel plan is ready!');
    }, 3000);
  };
  
  const handleRequestAlternatives = () => {
    updateAppStage(AppStage.RESULT, { showAlternatives: true });
    toast.info('Budget alternatives have been added to your plan.');
  };
  
  const handleSendChatMessage = async (message: string): Promise<string> => {
    // In a real app, this would call an API to process the message with AI
    console.log('Message sent:', message);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return "That sounds like an exciting trip! I'd be happy to help you plan a budget-friendly vacation. Could you tell me more about your interests, preferred destinations, or any specific constraints you have in mind?";
  };

  // Vérifier l'URL au chargement de la page pour synchroniser l'état initial
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stageParam = params.get('stage');
    
    if (stageParam) {
      switch (stageParam) {
        case 'chat':
          setAppStage(AppStage.CHAT);
          break;
        case 'form':
          setAppStage(AppStage.FORM);
          break;
        case 'loading':
          setAppStage(AppStage.LOADING);
          break;
        case 'result':
          setAppStage(AppStage.RESULT);
          // Vérifier également si des alternatives doivent être affichées
          if (params.get('alternatives') === 'true') {
            setShowAlternatives(true);
          }
          break;
        case 'dashboard':
          setAppStage(AppStage.DASHBOARD);
          break;
        default:
          setAppStage(AppStage.WELCOME);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-light/30 dark:bg-gray-dark/10">
      <Header />
      
      <main className="flex-1 pt-16">
        {appStage === AppStage.WELCOME && (
          <WelcomePage onStartPlanning={handleStartPlanning} />
        )}
        
        {appStage === AppStage.CHAT && (
          <div className="container mx-auto px-4 py-16 flex-1 flex flex-col h-[80vh]">
            <ChatInterface 
              onSendMessage={handleSendChatMessage}
              onFinished={handleChatFinished}
              isFirstTime={true}
            />
          </div>
        )}
        
        {appStage === AppStage.FORM && (
          <div className="container mx-auto px-4 py-8 md:py-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gradient">Design Your Perfect Trip</h2>
            <TravelForm 
              onSubmit={handleFormSubmit}
              isLoading={false}
            />
          </div>
        )}
        
        {appStage === AppStage.LOADING && (
          <div className="container mx-auto px-4 py-16 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <motion.div 
                className="text-6xl mb-6 inline-block animate-float"
                initial={{ y: 0 }}
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <div className="w-24 h-24 bg-travel-gradient rounded-full flex items-center justify-center text-white">
                  <MapIcon className="h-12 w-12" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold mb-4">Creating Your Travel Plan</h2>
              <p className="text-gray-dark mb-8">We're finding the best options based on your preferences...</p>
              <div className="loading-dots scale-150 mb-8">
                <div></div>
                <div></div>
                <div></div>
              </div>
              <p className="text-sm text-gray-dark max-w-md mx-auto">
                Our AI is analyzing thousands of options for flights, accommodations, activities, and more to create your personalized travel plan.
              </p>
            </motion.div>
          </div>
        )}
        
        {appStage === AppStage.RESULT && (
          <div className="container mx-auto px-4 py-8">
            <TravelItinerary 
              itinerary={itinerary}
              onRequestAlternatives={handleRequestAlternatives}
              showAlternatives={showAlternatives}
            />
            
            <div className="text-center mt-8 mb-16">
              <button
                onClick={() => updateAppStage(AppStage.FORM, { showAlternatives: false })}
                className="btn-primary mx-2"
              >
                Plan Another Trip
              </button>
              <button
                onClick={() => window.print()}
                className="btn-outline mx-2"
              >
                Print Itinerary
              </button>
            </div>
        </div>
        )}
        
        {appStage === AppStage.DASHBOARD && (
          <div className="md:mt-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Budget Travel Dashboard</h2>
              <button 
                onClick={() => updateAppStage(AppStage.WELCOME)}
                className="btn-outline btn-sm"
              >
                Back to Home
              </button>
            </div>
            
            <TravelDashboard />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

function WelcomePage({ onStartPlanning }: { onStartPlanning: () => void }) {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative min-h-[85vh] flex items-center">
        {/* Background with gradients and pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-white to-secondary/10"></div>
          <div className="absolute top-0 right-0 w-1/3 h-2/3 bg-secondary/5 rounded-bl-full"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-primary/5 rounded-tr-full"></div>
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10" 
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}>
          </div>
        </div>
      
        <div className="container mx-auto px-4 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-3"
              >
                <span className="badge badge-primary py-1 px-3">AI-Powered Travel Planning</span>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <span className="text-foreground">Travel Smart, </span>
                <span className="text-gradient">Spend Less</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl max-w-xl mb-8 text-gray-dark"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                AI-powered travel planning tailored to your budget, preferences, and travel style.
                Discover perfect itineraries that maximize experiences without breaking the bank.
              </motion.p>
              
              <motion.div
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <button
                  className="btn-primary flex items-center justify-center space-x-2 px-8 py-3 text-lg"
                  onClick={onStartPlanning}
                >
                  <span>Start Planning</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
                <a 
                  href="#how-it-works" 
                  className="btn-outline flex items-center justify-center space-x-2"
                >
                  <span>Learn More</span>
                </a>
              </motion.div>
              
              <motion.div
                className="flex items-center space-x-6 text-sm text-gray-dark"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="flex items-center space-x-1">
                  <span className="text-success">✓</span>
                  <span>100% Free</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-success">✓</span>
                  <span>No Sign Up Required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-success">✓</span>
                  <span>AI-Powered</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
          <Image
                  src="https://images.unsplash.com/photo-1504542982118-59308b40fe0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Travel planning"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-2xl"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                
                {/* Price tag */}
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-light rounded-full py-2 px-4 shadow-lg">
                  <div className="flex items-center text-primary font-bold">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    <span>Save up to 40%</span>
                  </div>
                </div>
                
                {/* AI assistant badge */}
                <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-light rounded-lg p-3 shadow-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white mr-3">
                      <LightBulbIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">AI Travel Assistant</div>
                      <div className="text-xs text-gray-dark">Powered by advanced AI</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="container mx-auto px-4 py-20" id="how-it-works">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How It Works</h2>
          <p className="text-lg text-gray-dark max-w-2xl mx-auto">
            Our AI-powered platform makes budget travel planning simple, quick, and personalized 
            to your preferences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <FeatureCard 
            icon={<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary"><LightBulbIcon className="h-6 w-6" /></div>}
            title="Tell Us Your Preferences"
            description="Chat with our AI about your travel preferences, budget constraints, and dream destinations."
            step="01"
          />
          <FeatureCard 
            icon={<div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary"><CalendarIcon className="h-6 w-6" /></div>}
            title="AI Creates Your Plan"
            description="Our AI analyzes thousands of options to create a personalized travel itinerary within your budget."
            step="02"
          />
          <FeatureCard 
            icon={<div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center text-success"><MapIcon className="h-6 w-6" /></div>}
            title="Enjoy Your Trip"
            description="Get a complete travel plan with flights, accommodations, activities, and budget-friendly tips."
            step="03"
          />
        </div>
      </div>
      
      {/* Benefits Section */}
      <div className="bg-gray-light dark:bg-gray py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="flex flex-col justify-center"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4">Budget-Optimized Travel</h3>
              <p className="text-gray-dark mb-6">
                Our AI doesn't just find cheap options – it optimizes your entire trip to maximize 
                experiences while staying within your budget. Get personalized recommendations 
                for accommodations, activities, and dining that match your travel style.
              </p>
              
              <ul className="space-y-3">
                <BenefitItem text="Real-time price tracking and comparison" />
                <BenefitItem text="Budget breakdown and expense tracking" />
                <BenefitItem text="Alternative options to save money" />
                <BenefitItem text="Local insider tips to avoid tourist traps" />
              </ul>
            </motion.div>
            
            <motion.div 
              className="rounded-2xl overflow-hidden shadow-xl relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="aspect-w-4 aspect-h-3 relative h-[400px]">
          <Image
                  src="https://images.unsplash.com/photo-1504542982118-59308b40fe0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Travel planning"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl"></div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-light/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white mr-3">
                    <CurrencyDollarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-foreground font-bold">Save on Average 30%</div>
                    <div className="text-sm text-gray-dark">Compared to traditional travel planning</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">What Travelers Say</h2>
          <p className="text-lg text-gray-dark max-w-2xl mx-auto">
            Thousands of travelers have already used our platform to plan their budget-friendly trips.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="I saved over $400 on my trip to Japan thanks to the budget alternatives suggested by this app. Amazing experience!"
            author="Sarah K."
            location="New York, USA"
            rating={5}
          />
          <TestimonialCard 
            quote="As a student traveler, finding affordable options is crucial. This app created a perfect itinerary within my limited budget."
            author="Miguel R."
            location="Madrid, Spain"
            rating={5}
          />
          <TestimonialCard 
            quote="The AI suggested local spots I never would have found on my own. Made my trip authentic without overspending."
            author="Aisha J."
            location="London, UK"
            rating={5}
          />
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-travel-gradient"></div>
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Plan Your Budget-Friendly Trip?</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Start planning today and discover how affordable your dream vacation can be!
            </p>
            <button
              className="bg-white text-primary font-bold px-8 py-3 rounded-lg text-lg shadow-lg hover:bg-opacity-90 transition-all duration-200 flex items-center space-x-2 mx-auto"
              onClick={onStartPlanning}
            >
              <span>Plan My Trip Now</span>
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, step }: { icon: React.ReactNode, title: string, description: string, step: string }) {
  return (
    <motion.div 
      className="card p-6 relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-lg">
        {step}
      </div>
      <div className="mb-5">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-dark">{description}</p>
    </motion.div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-start">
      <div className="text-primary mr-2 mt-1">✓</div>
      <p>{text}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, location, rating }: { quote: string, author: string, location: string, rating: number }) {
  return (
    <motion.div 
      className="card p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {/* Rating stars */}
      <div className="flex mb-3 text-accent">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="text-lg">★</span>
        ))}
      </div>
      
      <p className="italic mb-4 text-gray-dark">{quote}</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-light flex items-center justify-center mr-3 text-primary font-bold">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-bold">{author}</p>
          <p className="text-sm text-gray-dark">{location}</p>
        </div>
      </div>
    </motion.div>
  );
}
