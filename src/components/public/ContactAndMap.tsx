import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, ExternalLink, Navigation } from 'lucide-react';

export const ContactAndMap: React.FC = () => {
  const { settings, addToast } = useApp();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Sarees',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    addToast('success', 'Message Received', 'Thank you! Our front desk will contact you on WhatsApp shortly.');
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', phone: '', service: 'Sarees', message: '' });
    }, 4000);
  };

  return (
    <section className="py-14 sm:py-20 bg-slate-50 border-t border-slate-200/80" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Visit or Contact
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            Conveniently Located in Patamata, Vijayawada
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Drop off your laundry at our shop in Patamata or get in touch for doorstep pickup across Vijayawada.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Contact Details & Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Shop Information</span>
              </h3>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 block text-sm">{settings.shopName}</span>
                    <p className="mt-0.5 leading-relaxed break-words">
                      {settings.address}, {settings.city}, {settings.state} - {settings.pincode}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Location: Patamata Main Road, Vijayawada</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-slate-400 block">Phone Support</span>
                    <a
                      href={`tel:${settings.phone || '+919440966689'}`}
                      className="font-bold text-slate-800 hover:text-blue-600 text-sm block truncate"
                    >
                      {settings.phone || '+91 94409 66689'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-slate-400 block">WhatsApp Desk</span>
                    <a
                      href={`https://wa.me/919440966689?text=Hi%20Ambika%20Dry%20Wash%20Vijayawada,%20I%20have%20an%20inquiry.`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-emerald-600 hover:underline text-sm inline-flex items-center gap-1"
                    >
                      <span>{settings.whatsappPhone || '+91 94409 66689'}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-slate-400 block">Email Inquiries</span>
                    <a
                      href={`mailto:${settings.email}`}
                      className="font-semibold text-slate-800 hover:text-blue-600 block truncate"
                    >
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-slate-400 block">Operating Hours</span>
                    <span className="font-semibold text-slate-800 block">Monday – Saturday: 9:30 AM – 9:30 PM</span>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">Sunday: 9:30 AM – 1:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Get Directions Button */}
              <div className="pt-2">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Ambika+Dry+Wash+Patamata+Vijayawada+Andhra+Pradesh"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <Navigation className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Visual + Quick Inquiry (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Google Maps Visual Embed / Interactive Simulator */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80">
              <div className="bg-slate-100 p-3.5 sm:p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 min-w-0">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="truncate">Ambika Dry Wash – Patamata Hub (Vijayawada)</span>
                </div>
                <span className="text-[10px] sm:text-[11px] bg-white px-2.5 py-0.5 rounded-full text-slate-600 border border-slate-200 font-medium shrink-0">
                  Patamata, Vijayawada - 520010
                </span>
              </div>

              {/* Map Canvas Visual Simulation */}
              <div className="relative h-56 sm:h-72 bg-slate-200 w-full overflow-hidden flex items-center justify-center group">
                {/* SVG styled map representation */}
                <div className="absolute inset-0 bg-blue-50/60 opacity-80" />
                
                {/* Visual road grid representation */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
                
                {/* River Krishna & Road Lines styling */}
                <div className="absolute top-1/2 left-0 right-0 h-12 bg-blue-200/50 -rotate-6 transform -translate-y-8" />
                <div className="absolute inset-y-0 left-1/3 w-8 bg-amber-100/70 rotate-12 transform" />
                <div className="absolute inset-x-0 top-1/3 h-6 bg-slate-300/80" />

                {/* Animated Pin */}
                <div className="relative z-10 flex flex-col items-center px-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xl ring-4 ring-rose-200 animate-bounce">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="mt-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xl border border-white/20 text-center">
                    Ambika Dry Wash
                    <span className="block text-[10px] font-normal text-slate-300">Patamata, Vijayawada</span>
                  </div>
                </div>

                {/* Overlay prompt */}
                <div className="absolute bottom-3 right-3 z-10">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Ambika+Dry+Wash+Patamata+Vijayawada+Andhra+Pradesh"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm hover:bg-white text-slate-800 text-xs font-bold shadow-md border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Open Live Maps</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Contact Form */}
            <div className="bg-white p-5 sm:p-7 rounded-3xl shadow-sm border border-slate-200/80">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Send a Message or Inquiry
              </h3>

              {formSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-950 text-base">Inquiry Dispatched Successfully!</h4>
                  <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                    J. Sai Kumar and our Vijayawada front desk team will contact you via WhatsApp/Call within 15 minutes.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Varma"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Number (WhatsApp)</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 9440966689"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Service Interested In</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Sarees">Sarees Care & Roll Pressing</option>
                      <option value="Pants and shirts">Pants and shirts (Steam Press & Wash)</option>
                      <option value="Coats">Coats & Blazers (Specialty Dry Clean)</option>
                      <option value="Dresses">Dresses & Designer Wear</option>
                      <option value="Express 48 hours delivery [priority]">Express 48 hours delivery [priority]</option>
                      <option value="Darning">Darning (Hole & Tear Repair)</option>
                      <option value="Doorstep Pickup and Delivery">Doorstep Pickup and Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Message or Special Request</label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your garments, location in Vijayawada, or preferred pickup time..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 shrink-0" />
                    <span>Submit Inquiry to Ambika Front Desk</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
