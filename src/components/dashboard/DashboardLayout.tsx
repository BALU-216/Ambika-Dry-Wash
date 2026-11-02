import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Award, 
  Shirt, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Plus, 
  Search, 
  Globe, 
  MapPin, 
  Calendar,
  Package,
  Truck,
  FileText
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { 
    currentView, 
    setCurrentView, 
    logout, 
    orders, 
    notifications, 
    currentUserRole,
    currentUserName,
    login,
    openOrderDetail
  } = useApp();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [dateRange, setDateRange] = useState('This Month (Aug 2026)');

  const pendingOrdersCount = orders.filter(o => o.status === 'Order Received' || (o.status as string) === 'Processing').length;
  const pendingDeliveriesCount = orders.filter(o => (o.deliveryRequired || o.deliveryOption !== 'Shop Pickup') && (o.status === 'Ready for Pickup' || (o.status as string) === 'Ready for Pickup / Delivery')).length;

  const navItems: { view: AppView; label: string; icon: any; badge?: number; badgeColor?: string; adminOnly?: boolean }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { view: 'orders', label: 'Orders Management', icon: ShoppingBag, badge: pendingOrdersCount, badgeColor: 'bg-blue-500' },
    { view: 'new-order', label: 'Create New Order', icon: Plus },
    { view: 'delivery', label: 'Delivery Status', icon: Truck, badge: pendingDeliveriesCount > 0 ? pendingDeliveriesCount : undefined, badgeColor: 'bg-cyan-500' },
    { view: 'customers', label: 'Customer Directory', icon: Users },
    { view: 'loyalty', label: 'Loyalty Program', icon: Award },
    { view: 'services-manage', label: 'Services & Pricing', icon: Shirt },
    { view: 'analytics', label: 'Business Analytics & Reports', icon: BarChart3 },
    { view: 'whatsapp', label: 'WhatsApp Alerts', icon: MessageSquare },
    { view: 'settings', label: 'Settings & Shop Info', icon: Settings },
  ];

  const handleNavClick = (view: AppView) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search filter results
  const searchResults = globalSearch.trim() ? {
    orders: orders.filter(o => 
      o.orderId.toLowerCase().includes(globalSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      o.customerPhone.includes(globalSearch)
    ).slice(0, 4),
  } : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand & Sidebar Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open navigation drawer"
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 shrink-0 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2 min-w-0 text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20 shrink-0">
                A
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white truncate">
                    Ambika Dry Wash
                  </span>
                  <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 font-bold shrink-0">
                    {currentUserRole === 'Owner/Admin' ? 'OWNER PORTAL' : 'STAFF DESK'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden xs:flex items-center gap-1 truncate">
                  <MapPin className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                  <span>Patamata, Vijayawada</span>
                </p>
              </div>
            </button>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search orders by Mobile, Customer, or Order ID..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-800"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Search Floating Popover */}
            {searchResults && searchResults.orders.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 text-slate-800 z-50 animate-in fade-in zoom-in-95">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                  Matching Ambika Dry Wash Orders
                </span>
                <div className="space-y-1">
                  {searchResults.orders.map((ord) => (
                    <button
                      key={ord.orderId}
                      onClick={() => {
                        openOrderDetail(ord.orderId);
                        setGlobalSearch('');
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                    >
                      <div className="min-w-0 truncate">
                        <span className="font-bold text-blue-600 font-mono">{ord.orderId}</span>
                        <span className="font-semibold text-slate-800 ml-2">{ord.customerName}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">+91 {ord.customerPhone}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0 ml-2">₹{ord.finalAmount}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Top Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick New Order Button */}
            <button
              onClick={() => setCurrentView('new-order')}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">New Order</span>
            </button>

            {/* Role Switcher for Testing/Demonstration */}
            <div className="hidden xl:flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => login('Owner/Admin', 'J. Sai Kumar')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                  currentUserRole === 'Owner/Admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Owner
              </button>
              <button
                onClick={() => login('Staff', 'J. Sai Kumar')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                  currentUserRole === 'Staff'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Staff
              </button>
            </div>

            {/* Date Range Selector */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="Today" className="bg-slate-900">Today</option>
                <option value="This Week" className="bg-slate-900">This Week</option>
                <option value="This Month (Aug 2026)" className="bg-slate-900">This Month (Aug 2026)</option>
              </select>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="View WhatsApp notifications"
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-14 sm:top-full sm:mt-2 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        WhatsApp Notification Log
                      </h4>
                      <button
                        onClick={() => {
                          setCurrentView('whatsapp');
                          setNotificationsOpen(false);
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2 space-y-2">
                      {notifications.slice(0, 4).map((notif) => (
                        <div key={notif.id} className="pt-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800 truncate">{notif.customerName}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(notif.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2 leading-relaxed whitespace-pre-line">
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px]">
                            <span className="text-emerald-600 font-medium">✓ {notif.status}</span>
                            <span className="text-slate-400 font-mono">+91 {notif.customerPhone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* View Public Website Switch */}
            <button
              onClick={() => setCurrentView('public-home')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Open Public Website"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Customer Site</span>
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-700">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {currentUserRole === 'Owner/Admin' ? 'MP' : 'TL'}
              </div>
              <div className="hidden xl:block text-left text-xs leading-tight">
                <span className="font-bold text-white block">{currentUserName}</span>
                <span className="text-[10px] text-slate-400">{currentUserRole}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Body */}
      <div className="flex-1 flex min-w-0">
        {/* Desktop Sidebar Navigation */}
        <aside
          className={`hidden lg:flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-200 shrink-0 ${
            sidebarCollapsed ? 'w-18' : 'w-64'
          }`}
        >
          {/* Navigation Links */}
          <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              const Icon = item.icon;

              return (
                <button
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  
                  {!sidebarCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}

                  {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${
                        item.badgeColor || 'bg-blue-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer: Store Info & Sign Out */}
          <div className="p-3 border-t border-slate-800 space-y-2">
            {!sidebarCollapsed && (
              <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700/60 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold mb-1">
                  <span>Ambika Dry Wash</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Open</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Patamata, Vijayawada • +91 63016 82969
                </p>
              </div>
            )}

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Mobile / Tablet Slide-in Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-slate-900 text-white p-4 shadow-2xl z-50 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    A
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-sm block truncate">Ambika Dry Wash</span>
                    <span className="text-[10px] text-slate-400 block truncate">Patamata, Vijayawada</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Role Switcher */}
              <div className="mt-3 p-2 bg-slate-800/80 rounded-xl border border-slate-700/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5 px-1">
                  Active Desk Role
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => login('Owner/Admin', 'J. Sai Kumar')}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      currentUserRole === 'Owner/Admin'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 bg-slate-900/50 hover:text-white'
                    }`}
                  >
                    Owner
                  </button>
                  <button
                    onClick={() => login('Staff', 'J. Sai Kumar')}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      currentUserRole === 'Staff'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 bg-slate-900/50 hover:text-white'
                    }`}
                  >
                    Staff
                  </button>
                </div>
              </div>

              <div className="flex-1 py-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = currentView === item.view;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.view}
                      onClick={() => handleNavClick(item.view)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-blue-500'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => {
                    setCurrentView('public-home');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Open Customer Website</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 rounded-xl cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content View Container */}
        <main className="flex-1 min-w-0 overflow-x-hidden bg-slate-50 p-3 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
