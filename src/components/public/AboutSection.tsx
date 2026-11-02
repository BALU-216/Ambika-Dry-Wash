import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Award, Users, HeartHandshake } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <section className="py-14 sm:py-20 bg-white" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left Imagery / Stats grid (5 cols) */}
          <div className="lg:col-span-5 relative space-y-4">
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-4 border-slate-50 aspect-4/3">
              <img
  src="/images/shop_2.png"
  alt="Ambika Dry Wash shop in Vijayawada"
  className="w-full h-full object-cover object-center"
/>
            </div>

            {/* Heritage stats strip */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/70 border border-blue-100 p-3.5 sm:p-4 rounded-2xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono block">10+</span>
                <span className="text-xs font-semibold text-slate-700">Years of Service</span>
                <span className="text-[10px] text-slate-500 block">Est. 2014 in Vijayawada</span>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 p-3.5 sm:p-4 rounded-2xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block">45,000+</span>
                <span className="text-xs font-semibold text-slate-700">Garments Handled</span>
                <span className="text-[10px] text-slate-500 block">With individual care</span>
              </div>
            </div>
          </div>

          {/* Right Text Content (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Our 10-Year Heritage
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              An Established Fabric Care Institution in Vijayawada
            </h2>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Serving the Patamata neighborhood of Vijayawada, <strong>Ambika Dry Wash</strong> has earned a strong reputation for meticulous fabric care craftsmanship, specialized stain treatment, and master steam-finishing standards.
            </p>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We understand that clothes are not merely textiles — they represent your professional presence, your festive heritage, and your daily comfort. That is why our experienced master pressers inspect and care for each garment individually rather than treating them like bulk industrial loads.
            </p>

            {/* Core Values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Careful Fabric Handling</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Individual pH-balanced wash formulas and vacuum table steam pressing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Dedicated Master Staff</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Our key pressers and stain specialists have been with us for 7–10 years.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Loyalty Rewarded</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Automatic discounts up to 15% for our returning patrons.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Reliable Community Partner</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Trusted by local doctors, advocates, corporate executives, and families.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setCurrentView('public-contact')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Visit Our Vijayawada Shop
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
