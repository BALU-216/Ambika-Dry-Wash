import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_SERVICES } from '../../services/mockData';
import { X, Calendar, MapPin, Phone, User, CheckCircle2, MessageSquare } from 'lucide-react';

export const PublicOrderModal: React.FC = () => {
  const { isPublicBookingOpen, setIsPublicBookingOpen, addToast, settings } = useApp();

  // Helper to format the exact local date based on current timestamp
  // Helper to format today's date (for min selectable date constraint)
  const getTodayLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to calculate exactly one week (7 days) after current date based on timestamp
  const getOneWeekAfterCurrentDate = () => {
    const target = new Date();
    target.setDate(target.getDate() + 7);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('Patamata, Vijayawada');
  const [service, setService] = useState('Sarees');
  const [pickupOption, setPickupOption] = useState<'Pickup + Delivery' | 'Shop Pickup'>('Pickup + Delivery');
  const [preferredDate, setPreferredDate] = useState<string>(getOneWeekAfterCurrentDate);
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // When a person opens the modal, immediately initialize preferredDate to one week after the current date
  useEffect(() => {
    if (isPublicBookingOpen) {
      setPreferredDate(getOneWeekAfterCurrentDate());
    }
  }, [isPublicBookingOpen]);

  if (!isPublicBookingOpen) return null;

  const getWhatsAppUrl = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    const messageText = `*Ambika Dry Wash Service Booking Request*\n\n` +
      `*Name:* ${name.trim()}\n` +
      `*Mobile:* +91 ${cleanPhone.slice(-10)}\n` +
      `*Service:* ${service}\n` +
      `*Preference:* ${pickupOption}\n` +
      `*Date:* ${preferredDate}\n` +
      `*Address:* ${address.trim()}\n` +
      (notes.trim() ? `*Special Notes:* ${notes.trim()}\n\n` : `\n`) +
      `Please confirm my scheduled pickup/drop. Thank you!`;

    const shopWhatsApp = (settings?.whatsappPhone || settings?.phone || '6301682969').replace(/\D/g, '');
    const fullShopPhone = shopWhatsApp.startsWith('91') ? shopWhatsApp : `91${shopWhatsApp}`;
    return `https://wa.me/${fullShopPhone}?text=${encodeURIComponent(messageText)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      addToast('error', 'Missing Information', 'Please enter your name and phone number.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      addToast('error', 'Invalid Phone', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const waUrl = getWhatsAppUrl();
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsSubmitted(true);
    addToast('success', 'Booking Request Sent', 'Your request has been prepared for WhatsApp direct dispatch.');
  };

  const handleClose = () => {
    setIsPublicBookingOpen(false);
    setIsSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
              A
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm sm:text-base tracking-tight truncate">Request Laundry & Dry Wash</h2>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate">Ambika Dry Wash • Patamata, Vijayawada</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSubmitted ? (
          <div className="p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Request Dispatched!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                Thank you, <span className="font-bold text-slate-800">{name}</span>! Your service inquiry has been sent to Ambika Dry Wash Patamata (+91 63016 82969) on WhatsApp. Our desk will confirm your schedule promptly.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between gap-2 text-slate-600">
                <span>Selected Service:</span>
                <span className="font-bold text-slate-800 text-right">{service}</span>
              </div>
              <div className="flex justify-between gap-2 text-slate-600">
                <span>Option:</span>
                <span className="font-bold text-slate-800 text-right">{pickupOption}</span>
              </div>
              <div className="flex justify-between gap-2 text-slate-600">
                <span>Location:</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[180px]">{address}</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone (WhatsApp) *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 6301682969"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Garment Care / Service</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                <label className="font-bold text-slate-700 block mb-1">Fulfillment Mode</label>
                <select
                  value={pickupOption}
                  onChange={(e) => setPickupOption(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Pickup + Delivery">Doorstep Pickup & Delivery</option>
                  <option value="Shop Pickup">I will drop/collect at Patamata store</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Pickup / Drop Address in Vijayawada</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Landmark, Patamata, Vijayawada"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Preferred Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    min={getTodayLocalDate()}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Special Garment Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Silk saree stain, fast delivery"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>Submit Request & Connect on WhatsApp</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Opens WhatsApp directly to Ambika Dry Wash counter desk (+91 63016 82969)
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
