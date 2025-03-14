"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  createdAt: string;
  preferences?: {
    travelStyle?: string[];
    budget?: string;
    interests?: string[];
    accommodation?: string;
  };
}

// Auth state interface
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Auth context interface
interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  updateUserPreferences: (preferences: User['preferences']) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // In a real app, this would check for an existing auth token in local storage
        // and validate it with the server
        const storedUser = localStorage.getItem('budgetTravelUser');
        
        if (storedUser) {
          setAuthState({
            user: JSON.parse(storedUser),
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        setAuthState({
          user: null,
          isLoading: false,
          error: 'Session expired. Please sign in again.',
        });
      }
    };

    checkAuthState();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // In a real app, this would call a backend API to authenticate
      // For the hackathon, we'll simulate a successful authentication
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if email and password match (simple demo validation)
      if (email === 'demo@example.com' && password === 'password123') {
        const user: User = {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          profileImage: 'https://source.unsplash.com/300x300/?portrait',
          createdAt: new Date().toISOString(),
          preferences: {
            travelStyle: ['budget', 'adventure'],
            budget: 'medium',
            interests: ['history', 'food', 'nature'],
            accommodation: 'hotel'
          }
        };
        
        // Store in localStorage (in a real app, you'd store a token)
        localStorage.setItem('budgetTravelUser', JSON.stringify(user));
        
        setAuthState({
          user,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to sign in',
      }));
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // In a real app, this would call a backend API to create an account
      // For the hackathon, we'll simulate a successful registration
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new user
      const user: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        createdAt: new Date().toISOString(),
        preferences: {
          travelStyle: ['budget'],
          budget: 'medium',
          interests: [],
          accommodation: 'hotel'
        }
      };
      
      // Store in localStorage (in a real app, you'd store a token)
      localStorage.setItem('budgetTravelUser', JSON.stringify(user));
      
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create account',
      }));
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // In a real app, this would call a backend API to invalidate the token
      // For the hackathon, we'll just clear the local storage
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear from localStorage
      localStorage.removeItem('budgetTravelUser');
      
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to sign out',
      }));
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<User>) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (!authState.user) {
        throw new Error('No user is signed in');
      }
      
      // In a real app, this would call a backend API to update the user profile
      // For the hackathon, we'll just update the local storage
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = {
        ...authState.user,
        ...data,
      };
      
      // Update in localStorage
      localStorage.setItem('budgetTravelUser', JSON.stringify(updatedUser));
      
      setAuthState({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      }));
    }
  };

  // Update user preferences
  const updateUserPreferences = async (preferences: User['preferences']) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (!authState.user) {
        throw new Error('No user is signed in');
      }
      
      // In a real app, this would call a backend API to update the user preferences
      // For the hackathon, we'll just update the local storage
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = {
        ...authState.user,
        preferences: {
          ...authState.user.preferences,
          ...preferences,
        },
      };
      
      // Update in localStorage
      localStorage.setItem('budgetTravelUser', JSON.stringify(updatedUser));
      
      setAuthState({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences',
      }));
    }
  };

  // Compile all the values and functions we want to expose
  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    updateUserPreferences,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 