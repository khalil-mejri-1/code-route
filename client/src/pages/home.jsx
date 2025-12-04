// ملف Home.jsx
import React from 'react';
import Navbar from '../comp/navbar';
import HeroSection from '../comp/hero_section';
import CoursesSection from '../comp/CoursesSection.jsx';
import PricingSection from '../comp/pricingPlans.jsx';
import Footer from '../comp/Footer.jsx';

export default function Home() {
  return (
    <div>
    
     <Navbar/>
     <HeroSection/>
    <CoursesSection/>
 <PricingSection/>
    
    <Footer/>
    </div>
  );
}