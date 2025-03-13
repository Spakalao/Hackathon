"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-light dark:bg-gray py-8 mt-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <motion.div 
              className="flex items-center space-x-2 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-2xl">✈️</span>
              <span className="font-bold text-xl text-primary">BudgetTravel</span>
            </motion.div>
            <p className="text-sm text-gray-dark mb-4">
              Plan your perfect trip within your budget using AI-powered recommendations.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon="twitter" />
              <SocialIcon icon="facebook" />
              <SocialIcon icon="instagram" />
              <SocialIcon icon="youtube" />
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              <FooterLink href="/about" label="About Us" />
              <FooterLink href="/team" label="Our Team" />
              <FooterLink href="/careers" label="Careers" />
              <FooterLink href="/press" label="Press" />
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <FooterLink href="/blog" label="Travel Blog" />
              <FooterLink href="/tips" label="Travel Tips" />
              <FooterLink href="/guides" label="Destination Guides" />
              <FooterLink href="/faq" label="FAQ" />
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <FooterLink href="/terms" label="Terms of Service" />
              <FooterLink href="/privacy" label="Privacy Policy" />
              <FooterLink href="/cookies" label="Cookie Policy" />
              <FooterLink href="/contact" label="Contact Us" />
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray mt-8 pt-8 text-center text-sm text-gray-dark">
          <p>&copy; {currentYear} BudgetTravel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-gray-dark hover:text-primary transition-colors duration-200"
      >
        {label}
      </Link>
    </li>
  );
}

function SocialIcon({ icon }: { icon: string }) {
  return (
    <a 
      href={`https://${icon}.com`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors duration-200"
    >
      <span className="sr-only">{icon}</span>
      {/* We're using emoji as placeholders, but you could use proper icons here */}
      {icon === 'twitter' && '𝕏'}
      {icon === 'facebook' && 'f'}
      {icon === 'instagram' && '📸'}
      {icon === 'youtube' && '▶️'}
    </a>
  );
} 