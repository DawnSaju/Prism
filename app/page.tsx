import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import LogoSlider from '@/components/LogoSlider';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import Security from '@/components/Security';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import { Starfield } from '@/components/ui/spark';

export default function App() {
  return (
    <div className="min-h-screen bg-[rgb(15,15,15)] text-white">
      <Starfield/>
      <div className="relative">
        <Navigation />
        <div className="pt-8 md:pt-0">
          <Hero />
        </div>
        <div className="py-8 md:py-12">
          <LogoSlider />
        </div>
        <Features />
        <HowItWorks />
        <Security />
        <Pricing />
        <FAQ />
        <Footer />
      </div>
    </div>
  );
}