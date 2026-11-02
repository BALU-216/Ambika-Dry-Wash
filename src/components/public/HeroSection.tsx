import React from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarCheck, Phone, ShieldCheck, CheckCircle2, Clock, Truck, Award } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { setCurrentView, setIsPublicBookingOpen } = useApp();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-28">
      {/* Decorative background blur bubbles */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-200/30 to-cyan-200/20 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Text Content (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200 text-[11px] sm:text-xs font-semibold shadow-xs max-w-full">
              <Award className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate sm:whitespace-normal">10+ Years of Master Fabric Craftsmanship in Vijayawada</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Fresh Clothes, <br />
              <span className="text-blue-600">Happy Life</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Professional laundry care with reliable service, transparent pricing, and convenient pickup and delivery. Trusted by over 4,500 families and professionals across Vijayawada.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                onClick={() => setIsPublicBookingOpen(true)}
                className="w-full sm:w-auto px-6 sm:px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 shrink-0" />
                <span>Book / Request Service</span>
              </button>

              <button
                onClick={() => setCurrentView('public-services')}
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>View Services</span>
              </button>

              <button
                onClick={() => setCurrentView('public-contact')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-slate-600 hover:text-blue-600 font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Contact Us</span>
              </button>
            </div>

            {/* Trust Highlights Strip */}
            <div className="pt-6 sm:pt-8 border-t border-slate-200/80 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 text-left">
              <div className="flex items-start gap-2.5 bg-white/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-slate-100 sm:border-0">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Quality Care</h4>
                  <p className="text-[11px] text-slate-500">Fabric-safe solvents & steam</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-slate-100 sm:border-0">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Reliable Service</h4>
                  <p className="text-[11px] text-slate-500">5–7 Days Turnaround</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-slate-100 sm:border-0">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Safe & Secure</h4>
                  <p className="text-[11px] text-slate-500">Hygienic individual processing</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-white/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-slate-100 sm:border-0">
                <Truck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Doorstep Pickup</h4>
                  <p className="text-[11px] text-slate-500">Convenient Vijayawada routes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Image & Live Highlights (5 cols) */}
          <div className="lg:col-span-5 relative px-1 sm:px-4 lg:px-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Image Container */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-4/3 sm:aspect-square">
                <img
src="/images/Ambika_Dry_Wash_Shop.png"
alt="Neatly pressed fresh laundry garments"
                  className="w-full h-full object-contain object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white p-2.5 sm:p-3 rounded-xl bg-slate-900/65 backdrop-blur-md border border-white/20">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Ambika Care Standard</p>
                      <p className="text-[10px] text-slate-200 truncate">Vacuum Steam Press • Zero Crease Promise</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/90 text-white text-[10px] font-bold shrink-0">
                      100% Inspected
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Callout Badges - Responsive positioning so they never overflow 320px viewports */}
              <div className="mt-3 sm:mt-0 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:block">
                {/* Floating Badge 1: Loyalty discount callout */}
                

                {/* Floating Badge 2: Doorstep delivery */}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
