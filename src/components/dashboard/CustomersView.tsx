import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreCustomerService } from '../../services/apiService';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  X
} from 'lucide-react';
import { LoyaltyBadge } from '../common/Badge';

export const CustomersView: React.FC = () => {
  const { customers, openCustomerProfile, addToast, refreshData } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New customer form state
  const [newCust, setNewCust] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const filteredCustomers = customers.filter((c) => {
    if (tierFilter !== 'All' && c.loyaltyLevel !== tierFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  
const handleAddCustomer = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!newCust.phone.trim() || !newCust.name.trim()) {
    addToast('error', 'Validation Error', 'Name and Phone are mandatory.');
    return;
  }

  try {
    const created = await firestoreCustomerService.createCustomer({
      name: newCust.name,
      phone: newCust.phone,
      address: newCust.address || 'Patamata, Vijayawada',
      notes: newCust.notes,
    });

    addToast('success', 'Customer Added', `${created.name} registered successfully!`);
    setIsAddModalOpen(false);
    setNewCust({ name: '', phone: '', address: '', notes: '' });

    openCustomerProfile(created.id);
    await refreshData();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not save customer to Firebase.';
    addToast('error', 'Customer Not Saved', message);
  }
};


  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Customer Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              {customers.length} Patrons
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mobile-first patron accounts with automatic rule-based loyalty tier tracking and lifetime order metrics.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tier filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Platinum', 'Gold', 'Silver', 'Bronze'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                tierFilter === tier
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            onClick={() => openCustomerProfile(cust.id)}
            className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-4 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-base shrink-0">
                  {cust.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {cust.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>+91 {cust.phone}</span>
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <LoyaltyBadge level={cust.loyaltyLevel} size="sm" />
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{cust.address}</span>
            </div>

            {/* Metrics footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Orders</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{cust.totalOrders}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spend</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">₹{cust.totalSpent}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Active</span>
                <span className="text-slate-600 text-[11px] block">
                  {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'New'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 p-5 sm:p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400 shrink-0" />
                <h3 className="font-bold text-base">Add New Patron Record</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. S. Venkateswara Rao"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Phone (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  placeholder="e.g. 9440966689"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vijayawada Address</label>
                <input
                  type="text"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  placeholder="e.g. Near Benz Circle, M.G. Road, Vijayawada"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Save Patron
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
