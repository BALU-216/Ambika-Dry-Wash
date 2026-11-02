import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { settingsService } from '../../services/apiService';
import { 
  Store, 
  Database, 
  Download, 
  RotateCcw
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, setSettings, addToast, refreshData } = useApp();

  const [formData, setFormData] = useState({ ...settings });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    settingsService.saveSettings(formData);
    addToast('success', 'Settings Saved', 'Shop configurations and contact details updated.');
  };

  const handleExportJSON = () => {
    const fullBackup = {
      timestamp: new Date().toISOString(),
      settings: JSON.parse(localStorage.getItem('ambika_settings_v2') || '{}'),
      orders: JSON.parse(localStorage.getItem('ambika_orders_v2') || '[]'),
      customers: JSON.parse(localStorage.getItem('ambika_customers_v2') || '[]'),
      services: JSON.parse(localStorage.getItem('ambika_services_v2') || '[]'),
      loyaltyRules: JSON.parse(localStorage.getItem('ambika_loyalty_rules_v2') || '[]'),
      notifications: JSON.parse(localStorage.getItem('ambika_notifications_v2') || '[]'),
      staff: JSON.parse(localStorage.getItem('ambika_staff_v2') || '[]'),
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Ambika_Dry_Wash_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('success', 'Backup Exported', 'Full JSON database snapshot downloaded.');
  };

  const handleResetSeedData = () => {
    settingsService.resetAllDataToDefaults();
    refreshData();
    setFormData(settingsService.getSettings());
    addToast('info', 'Database Reset', 'Default Vijayawada seed records restored (+91 63016 82969).');
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200 min-w-0">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            Shop Configuration & Data Controls
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            System Admin
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage business metadata, contact channels, tax registration numbers, and database backups.
        </p>
      </div>

      {/* Shop Details Form */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Store className="w-5 h-5 text-blue-600 shrink-0" />
          <span>Business Identity & Contact Details</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Shop / Business Name</label>
              <input
                type="text"
                required
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Business Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Street Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">City / Region</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp Official Number</label>
              <input
                type="text"
                required
                value={formData.whatsappPhone}
                onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Support Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Operating Hours</label>
              <input
                type="text"
                value={formData.businessHours}
                onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">GST / Tax Registration</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 cursor-pointer"
            >
              Save Business Details
            </button>
          </div>
        </form>
      </div>

      {/* Data Management & Backup Controls */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>Local Storage Persistence & Data Backup</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-800 block">Export Full JSON Database Backup</span>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                Download an offline snapshot containing all historical customer accounts, orders, line items, and audit logs.
              </p>
            </div>

            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3 flex flex-col justify-between">
            <div>
              <span className="font-bold text-amber-900 block">Reset / Restore Sample Seed Data</span>
              <p className="text-amber-800 text-[11px] mt-1 leading-relaxed">
                Re-populate default Vijayawada orders, staff members, and loyalty tiers for demonstration purposes.
              </p>
            </div>

            <button
              onClick={handleResetSeedData}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Re-seed Demo Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
