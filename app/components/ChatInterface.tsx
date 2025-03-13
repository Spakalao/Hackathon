"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { PaperAirplaneIcon, ArrowPathIcon, SparklesIcon } from '@heroicons/react/24/outline';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

type Props = {
  onSendMessage: (message: string) => Promise<string>;
  onFinished: () => void;
  isFirstTime?: boolean;
};

const initialMessage = "Hi there! I'm your AI travel assistant. Tell me about your dream vacation, and I'll help you plan a budget-friendly trip. What type of trip are you thinking about?";

export default function ChatInterface({ onSendMessage, onFinished, isFirstTime = false }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: initialMessage,
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(isFirstTime);
  
  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);
    
    try {
      // Get AI response
      const response = await onSendMessage(newMessage);
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setShowSuggestions(false);
    }
  };
  
  const suggestedMessages = [
    "I'm planning a beach vacation on a budget. Any suggestions?",
    "I want to visit Europe for 10 days with a $3000 budget. Is it possible?",
    "What are some affordable family-friendly destinations?",
    "I'm looking for adventure travel options that won't break the bank."
  ];
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };
  
  const handleBack = () => {
    window.history.back();
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative w-10 h-10 mr-3 bg-white rounded-full overflow-hidden flex-shrink-0">
              <SparklesIcon className="absolute inset-0 m-auto h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Travel Assistant</h2>
              <p className="text-sm opacity-90">I'll help you plan your budget-friendly trip</p>
            </div>
          </div>
          
          <button 
            onClick={handleBack}
            className="text-white hover:text-gray-light transition-colors flex items-center text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Return to Home
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-light/30 dark:bg-gray-dark/10">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-6 ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}
              >
                <div className="flex items-start">
                  {message.role === 'assistant' && (
                    <div className="relative w-8 h-8 mr-2 rounded-full overflow-hidden flex-shrink-0 bg-primary flex items-center justify-center">
                      <SparklesIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div 
                    className={`rounded-xl p-4 shadow-sm flex-1 ${
                      message.role === 'user' 
                        ? 'bg-primary/10 rounded-tr-none ml-auto' 
                        : 'bg-white dark:bg-gray-light rounded-tl-none'
                    }`}
                  >
                    <div className="prose max-w-none dark:prose-invert">
                      {message.content.split('\n').map((paragraph, i) => (
                        <p key={i} className={`${i > 0 ? 'mt-3' : 'mt-0'} ${message.role === 'user' ? 'text-primary-dark' : ''}`}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <div className="text-xs text-gray-dark mt-2 text-right">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="w-8 h-8 ml-2 rounded-full overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
                      <span className="text-white text-sm font-bold">You</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 mr-12"
              >
                <div className="flex items-start">
                  <div className="relative w-8 h-8 mr-2 rounded-full overflow-hidden flex-shrink-0 bg-primary flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="rounded-xl p-4 bg-white dark:bg-gray-light shadow-sm rounded-tl-none">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div ref={endOfMessagesRef} />
        </div>
      </div>
      
      {showSuggestions && (
        <div className="p-3 bg-white dark:bg-gray border-t">
          <p className="text-sm text-gray-dark mb-2">Try asking about:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedMessages.map((suggestion, index) => (
              <button
                key={index}
                className="bg-primary/5 hover:bg-primary/10 text-primary text-sm py-1 px-3 rounded-full transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t bg-white dark:bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end">
            <div className="relative flex-1 mr-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="form-input resize-none w-full py-3 pr-12 min-h-[60px] max-h-32"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={newMessage.trim() === '' || isTyping}
                className={`absolute right-3 bottom-3 text-primary hover:text-primary-dark transition-colors ${
                  newMessage.trim() === '' || isTyping ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>
            <button 
              onClick={onFinished}
              className="btn-primary flex items-center space-x-2 py-3"
            >
              <span>Continue to Planning</span>
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-dark mt-2 text-center">
            Press Enter to send, Shift+Enter for a new line
          </p>
        </div>
      </div>
    </div>
  );
} 