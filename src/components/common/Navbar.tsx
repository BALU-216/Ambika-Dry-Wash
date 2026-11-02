import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { Phone, Lock, Menu, X, CalendarCheck, MapPin, MessageSquare } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, setIsPublicBookingOpen, isAuthenticated, settings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { view: AppView; label: string }[] = [
    { view: 'public-home', label: 'Home' },
    { view: 'public-services', label: 'Services' },
    { view: 'public-about', label: 'About Us' },
    { view: 'public-contact', label: 'Contact & Map' },
  ];

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs w-full">
      {/* Top micro banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className="flex items-center gap-1 text-slate-300 truncate">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">Patamata, Vijayawada, AP</span>
            </span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-slate-300 hidden md:inline">Monday – Saturday: 9:30 AM – 9:30 PM | Sunday: 9:30 AM – 1:00 PM</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            <a
              href={`https://wa.me/919440966689?text=Hello%20Ambika%20Dry%20Wash,%20I%20would%20like%20to%20inquire%20about%20your%20laundry%20and%20dry%20cleaning%20services.`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Phone className="w-3 h-3 shrink-0" />
              <span>WhatsApp: +91 94409 66689</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('public-home')}
            className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer min-w-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm sm:text-base shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 truncate">
                  Ambika Dry Wash
                </span>
                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  EST. 2014
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-wide truncate">
                Laundry & Dry Cleaning • Patamata
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            {navLinks.map((link) => {
              const isActive = currentView === link.view;
              return (
                <button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs (Desktop / Tablet) */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
            <button
              onClick={() => setIsPublicBookingOpen(true)}
              className="px-3.5 lg:px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span>Book Service</span>
            </button>

            <button
              onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'owner-login')}
              className="px-3 lg:px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{isAuthenticated ? 'Dashboard' : 'Owner Login'}</span>
            </button>
          </div>

          {/* Mobile & Tablet menu button */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setIsPublicBookingOpen(true)}
              className="md:hidden px-3 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 active:scale-95 transition-transform cursor-pointer"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => handleNavClick(link.view)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  currentView === link.view
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                setIsPublicBookingOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 text-center flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Book / Request Service</span>
            </button>
            <button
              onClick={() => {
                setCurrentView(isAuthenticated ? 'dashboard' : 'owner-login');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>{isAuthenticated ? 'Go to Owner Dashboard' : 'Owner / Staff Portal Login'}</span>
            </button>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 px-1">
            <span>Patamata, Vijayawada • Mon–Sat: 9:30 AM–9:30 PM | Sun: 9:30 AM–1:00 PM</span>
            <a
              href="https://wa.me/919440966689?text=Hello%20Ambika%20Dry%20Wash,%20I%20have%20an%20inquiry."
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 font-bold flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>+91 94409 66689</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
