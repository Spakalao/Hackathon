"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-gray-light/95 backdrop-blur-sm shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 group">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white"
          >
            <GlobeAltIcon className="h-6 w-6" />
          </motion.div>
          <motion.div 
            className="flex flex-col"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="font-bold text-lg md:text-xl text-primary group-hover:text-primary-dark transition-colors">BudgetTravel</span>
            <span className="text-xs text-gray-dark hidden sm:block">Smart trips for smart travelers</span>
          </motion.div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex space-x-8">
          <NavLink href="/" label="Home" />
          <NavLink href="/about" label="About" />
          <NavLink href="/how-it-works" label="How It Works" />
          <NavLink href="/contact" label="Contact" />
          <button className="btn-primary py-1.5">Get Started</button>
        </nav>

        {/* Mobile menu button */}
        <button 
          className="md:hidden rounded-full p-2 text-gray-dark hover:bg-gray-light transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? 
            <XMarkIcon className="h-6 w-6" /> : 
            <Bars3Icon className="h-6 w-6" />
          }
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <motion.div 
          className="md:hidden py-6 px-4 bg-white dark:bg-gray-light border-t border-gray shadow-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col space-y-6">
            <MobileNavLink href="/" label="Home" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/about" label="About" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/how-it-works" label="How It Works" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink href="/contact" label="Contact" onClick={() => setMobileMenuOpen(false)} />
            <button 
              className="btn-primary w-full justify-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </button>
          </div>
        </motion.div>
      )}
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link 
      href={href} 
      className="text-gray-dark hover:text-primary font-medium transition-colors duration-200 relative group"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link 
      href={href} 
      className="text-gray-dark hover:text-primary font-medium transition-colors duration-200 flex items-center"
      onClick={onClick}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
      {label}
    </Link>
  );
} 