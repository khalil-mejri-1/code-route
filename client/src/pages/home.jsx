import React, { useEffect } from 'react';
import Navbar from '../comp/navbar';
import HeroSection from '../comp/hero_section';
import CoursesSection from '../comp/CoursesSection.jsx';
import PricingSection from '../comp/pricingPlans.jsx';
import Footer from '../comp/Footer.jsx';

export default function Home() {
  
  // Logic for simple Reveal animation on Scroll
  useEffect(() => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-anim');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('section');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', direction: 'rtl' }}>
      
      {/* Dynamic Background Noise/Texture */}
      <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
          pointerEvents: 'none',
          zIndex: 9999
      }}></div>

      <Navbar/>
      
      <main>
        <HeroSection/>
        
        <section id="features">
           <CoursesSection/>
        </section>

        <section id="pricing">
           <PricingSection/>
        </section>
      </main>
      
      <Footer/>
    </div>
  );
}