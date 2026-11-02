import React from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, settings } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 sm:pt-16 pb-10 sm:pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-600/20 shrink-0">
                A
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-white">Ambika Dry Wash</span>
                <p className="text-xs text-blue-400 font-medium">Patamata, Vijayawada</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Established laundry and dry cleaning business in Patamata, Vijayawada, Andhra Pradesh. Dedicated to professional fabric care, steam pressing, and timely service.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Reliable Fabric Care in Vijayawada</span>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Our Services</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('public-services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sarees
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('public-services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Pants and shirts
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('public-services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Coats
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('public-services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Dresses
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('public-services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Express 48 hours delivery [priority]
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('public-services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Darning
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('public-services');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-blue-400 font-medium text-blue-300 transition-colors cursor-pointer text-left"
                >
                  Doorstep Pickup and Delivery
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Quick Navigation</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentView('public-home')} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('public-services')} className="hover:text-white transition-colors cursor-pointer">
                  Services & Care
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('public-about')} className="hover:text-white transition-colors cursor-pointer">
                  About Our Business
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('public-contact')} className="hover:text-white transition-colors cursor-pointer">
                  Store Location & Directions
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('owner-login')} className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                  Owner / Staff Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Vijayawada Hub</h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span className="break-words">{settings.address}, {settings.city}, {settings.state} - {settings.pincode}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <a href={`tel:${settings.phone || '+916301682969'}`} className="hover:text-white transition-colors">
                {settings.phone || '+91 63016 82969'}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="break-all">{settings.email}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p>Monday – Saturday: 9:30 AM – 9:30 PM</p>
                <p>Sunday: 9:30 AM – 1:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Ambika Dry Wash • Patamata, Vijayawada. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Patamata Branch</span>
            <span>•</span>
            <button
              onClick={() => setCurrentView('owner-login')}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Staff Sign In
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
