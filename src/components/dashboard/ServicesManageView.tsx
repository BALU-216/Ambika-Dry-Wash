import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { serviceCatalogService } from '../../services/apiService';
import { ServiceItem } from '../../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  X,
  Save
} from 'lucide-react';

export const ServicesManageView: React.FC = () => {
  const { services, updateServices, refreshData, addToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Wash & Care');
  const [newUnit, setNewUnit] = useState<string>('per piece');
  const [newPrice, setNewPrice] = useState(100);
  const [newTurnaround, setNewTurnaround] = useState(36);
  const [newDesc, setNewDesc] = useState('');

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];

  const filtered = services.filter(s => selectedCategory === 'All' || s.category === selectedCategory);

  const handleStartEdit = (id: string, currentPrice: number) => {
    setEditingId(id);
    setEditPrice(currentPrice);
  };

  const handleSaveEdit = (item: ServiceItem) => {
    serviceCatalogService.updateService({
      ...item,
      startingPrice: editPrice,
    });
    setEditingId(null);
    refreshData();
    addToast('success', 'Price Updated', `${item.name} rate updated to ₹${editPrice}.`);
  };

  const handleToggleActive = (item: ServiceItem) => {
    const nextActive = !item.active;
    serviceCatalogService.updateService({
      ...item,
      active: nextActive,
      isActive: nextActive,
    });
    refreshData();
    addToast('info', 'Service Updated', `${item.name} is now ${nextActive ? 'active' : 'disabled'}.`);
  };

  const handleDelete = (id: string, name: string) => {
    const remaining = services.filter(s => s.id !== id);
    updateServices(remaining);
    addToast('info', 'Service Removed', `${name} removed from service catalog.`);
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    serviceCatalogService.createService({
      name: newName.trim(),
      category: newCategory,
      shortDesc: newDesc.trim() || `Professional ${newCategory.toLowerCase()} service for ${newName.trim()}.`,
      fullDesc: newDesc.trim() || `Specialized ${newCategory.toLowerCase()} care with quality inspection and protective packaging.`,
      startingPrice: Number(newPrice),
      unit: newUnit,
      turnaroundHours: Number(newTurnaround),
      iconName: 'Shirt',
      isPopular: false,
      isActive: true,
    });
    refreshData();
    addToast('success', 'Service Added', `Added ${newName} to catalog.`);
    setIsAddModalOpen(false);
    setNewName('');
    setNewDesc('');
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Services & Pricing Catalog</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage garment pricing, turnaround hours, and active services on website & billing
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map(item => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
              item.active ? 'border-slate-200 shadow-xs' : 'border-slate-200/60 bg-slate-50/60 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {item.category}
                </span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                  {item.unit}
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 mb-1 break-words">{item.name}</h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">{item.shortDesc}</p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{item.turnaroundHours} hrs turnaround</span>
                </div>

                {editingId === item.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={editPrice}
                      onChange={e => setEditPrice(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm font-bold border border-blue-400 rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveEdit(item)}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                      title="Save Price"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl font-extrabold text-slate-900">₹{item.startingPrice}</span>
                    <span className="text-[11px] text-slate-400">/{item.unit.replace('per ', '')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    item.active
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {item.active ? 'Active' : 'Disabled'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(item.id, item.startingPrice)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Price"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Add New Garment Service</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddService} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service / Garment Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g., Silk Saree Rolling & Polish"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white"
                  >
                    <option value="Wash & Care">Wash & Care</option>
                    <option value="Specialty">Specialty</option>
                    <option value="Dry Cleaning">Dry Cleaning</option>
                    <option value="Ironing">Ironing</option>
                    <option value="Logistics">Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pricing Unit</label>
                  <select
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-white"
                  >
                    <option value="per piece">per piece</option>
                    <option value="per garment">per garment</option>
                    <option value="per kg">per kg</option>
                    <option value="per pair">per pair</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Starting Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPrice}
                    onChange={e => setNewPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Turnaround (Hours)</label>
                  <input
                    type="number"
                    required
                    min={2}
                    value={newTurnaround}
                    onChange={e => setNewTurnaround(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Short service care description"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
