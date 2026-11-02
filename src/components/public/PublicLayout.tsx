import React from 'react';
import { useApp } from '../../context/AppContext';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';
import { HeroSection } from './HeroSection';
import { ServicesSection } from './ServicesSection';
import { AboutSection } from './AboutSection';
import { ContactAndMap } from './ContactAndMap';
import { PublicOrderModal } from './PublicOrderModal';

export const PublicLayout: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {currentView === 'public-home' && (
          <>
            <HeroSection />
            <ServicesSection />
            <AboutSection />
            <ContactAndMap />
          </>
        )}

        {currentView === 'public-services' && (
          <>
            <div className="bg-slate-900 text-white py-12 px-4 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold">Our Fabric Care Services</h1>
              <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                Discover our specialized care for sarees, pants and shirts, coats, and designer dresses in Vijayawada.
              </p>
            </div>
            <ServicesSection />
            <ContactAndMap />
          </>
        )}

        {currentView === 'public-pricing' && (
          <>
            <div className="bg-slate-900 text-white py-12 px-4 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold">Garment Services & Care</h1>
              <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                Discover our specialized care for sarees, pants and shirts, coats, and designer dresses in Vijayawada.
              </p>
            </div>
            <ServicesSection />
            <ContactAndMap />
          </>
        )}

        {currentView === 'public-about' && (
          <>
            <div className="bg-slate-900 text-white py-12 px-4 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold">About Ambika Dry Wash</h1>
              <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                Established in Patamata, Vijayawada • Fabric Care Heritage & Master Pressing
              </p>
            </div>
            <AboutSection />
            <ContactAndMap />
          </>
        )}

        {currentView === 'public-contact' && (
          <>
            <div className="bg-slate-900 text-white py-12 px-4 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold">Visit Our Shop & Contact Us</h1>
              <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
                Located in Patamata, Vijayawada • Mon–Sat: 9:30 AM–9:30 PM | Sun: 9:30 AM–1:00 PM
              </p>
            </div>
            <ContactAndMap />
          </>
        )}
      </main>

      <Footer />
      <PublicOrderModal />
    </div>
  );
};
