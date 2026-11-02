import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  Users, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  Repeat, 
  Plus, 
  Eye, 
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';

export const DashboardOverview: React.FC = () => {
  const { 
    orders, 
    customers, 
    setCurrentView, 
    openOrderDetail, 
    openCustomerProfile 
  } = useApp();

  // 1. Total Orders
  const totalOrders = orders.length;

  // 2. Qualifying orders (exclude Cancelled)
  const qualifyingOrders = orders.filter(o => o.status !== 'Cancelled');

  // Customer identity grouping for Repeat Customers calculation
  const customerOrderCounts = new Map<string, number>();
  qualifyingOrders.forEach(o => {
    const identity = (o.customerPhone || o.customerId || o.customerName || '').trim();
    if (identity) {
      customerOrderCounts.set(identity, (customerOrderCounts.get(identity) || 0) + 1);
    }
  });

  // Total unique customers
  const totalCustomers = Math.max(customers.length, customerOrderCounts.size);

  // Repeat Customers: At least 2 qualifying orders grouped by customer identity
  let repeatCustomersCount = 0;
  customerOrderCounts.forEach(count => {
    if (count >= 2) {
      repeatCustomersCount++;
    }
  });

  // 3. Orders In Progress (Order Received + Processing)
  const ordersInProgress = orders.filter(o => o.status === 'Order Received' || o.status === 'Processing').length;

  // 4. Ready for Pickup / Delivery
  const readyOrdersCount = orders.filter(o => o.status === 'Ready for Pickup' || (o.status as string) === 'Ready for Pickup / Delivery').length;

  // 5. Total Revenue (Net payable from qualifying orders)
  const totalRevenue = qualifyingOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  // Recent 6 orders
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200 min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Ambika Dry Wash Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Patamata, Vijayawada
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store operations overview, live order intake, and customer fulfillment tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setCurrentView('analytics')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-slate-600 shrink-0" />
            <span>Analytics & Reports</span>
          </button>

          <button
            onClick={() => setCurrentView('new-order')}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* 6 Essential Dashboard Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* 1. Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
              {totalOrders}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">All logged orders</span>
          </div>
        </div>

        {/* 2. Total Customers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Customers</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
              {totalCustomers}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Patamata patrons</span>
          </div>
        </div>

        {/* 3. Orders In Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">In Progress</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono block">
              {ordersInProgress}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Received & processing</span>
          </div>
        </div>

        {/* 4. Ready for Pickup / Delivery */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ready for Pickup</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-cyan-600 font-mono block">
              {readyOrdersCount}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Awaiting collection</span>
          </div>
        </div>

        {/* 5. Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono block">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Non-cancelled orders</span>
          </div>
        </div>

        {/* 6. Repeat Customers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Repeat Customers</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Repeat className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono block">
              {repeatCustomersCount}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">≥2 qualifying orders</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Current active workload and counter order intake</p>
          </div>
          <button
            onClick={() => setCurrentView('orders')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({orders.length}) Orders</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No orders available in the database.
          </div>
        ) : (
          <>
            {/* Mobile Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <div key={order.orderId} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => openOrderDetail(order.orderId)}
                      className="font-mono font-bold text-blue-600 text-sm hover:underline cursor-pointer"
                    >
                      {order.orderId}
                    </button>
                    <StatusBadge status={order.status} size="sm" />
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <button
                        onClick={() => openCustomerProfile(order.customerId)}
                        className="font-bold text-slate-900 text-xs hover:text-blue-600 block text-left truncate cursor-pointer"
                      >
                        {order.customerName}
                      </button>
                      <span className="font-mono text-slate-500 text-[11px] block">+91 {order.customerPhone}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-black text-slate-900 text-sm block">₹{order.finalAmount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-600 truncate">
                      {order.items[0]?.serviceName || 'Wash & Care'} • {order.totalGarments} items
                    </span>
                    <button
                      onClick={() => openOrderDetail(order.orderId)}
                      className="px-2.5 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors cursor-pointer text-xs flex items-center gap-1 shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop / Tablet Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer Identity</th>
                    <th className="py-3 px-4">Main Service</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4">Current Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        <button
                          onClick={() => openOrderDetail(order.orderId)}
                          className="hover:underline cursor-pointer"
                        >
                          {order.orderId}
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => openCustomerProfile(order.customerId)}
                          className="font-bold text-slate-900 hover:text-blue-600 block text-left cursor-pointer"
                        >
                          {order.customerName}
                        </button>
                        <span className="font-mono text-slate-500 text-[11px] block">+91 {order.customerPhone}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {order.items[0]?.serviceName || 'Wash & Care'}
                        </span>
                        <span className="text-slate-500 text-[11px] block">
                          {order.totalGarments} items total
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                        ₹{order.finalAmount}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={order.status} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openOrderDetail(order.orderId)}
                          className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
