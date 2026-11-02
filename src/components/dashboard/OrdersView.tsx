import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Eye, 
  ArrowRight
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { OrderStatus } from '../../types';

export const OrdersView: React.FC = () => {
  const { 
    orders, 
    setCurrentView, 
    openOrderDetail, 
    openCustomerProfile, 
    updateOrderStatus 
  } = useApp();

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [logisticsFilter, setLogisticsFilter] = useState<string>('All');
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // 1. Order Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Order Received') {
        if (order.status !== 'Order Received' && (order.status as string) !== 'Processing') return false;
      } else if (statusFilter === 'Ready for Pickup') {
        if (order.status !== 'Ready for Pickup' && (order.status as string) !== 'Ready for Pickup / Delivery') return false;
      } else if (statusFilter === 'Delivered to Customer') {
        if (order.status !== 'Delivered to Customer' && (order.status as string) !== 'Delivered / Collected' && (order.status as string) !== 'Delivered' && (order.status as string) !== 'Completed') return false;
      } else if (order.status !== statusFilter) {
        return false;
      }
    }

    // 2. Priority filter (matches 7 Days, 4–5 Days, 2 Days with backwards compat)
    if (priorityFilter !== 'All') {
      if (priorityFilter === '7 Days') {
        if (order.priority !== '7 Days' && order.priority !== 'Normal') return false;
      } else if (priorityFilter === '4–5 Days') {
        if (order.priority !== '4–5 Days' && order.priority !== 'Priority' && order.priority !== 'Express') return false;
      } else if (priorityFilter === '2 Days') {
        if (order.priority !== '2 Days' && order.priority !== 'Urgent') return false;
      } else if (order.priority !== priorityFilter) {
        return false;
      }
    }

    // 3. Logistics filter
    if (logisticsFilter === 'Shop Pickup') {
      if (order.deliveryRequired || (order.deliveryOption !== 'Shop Pickup')) return false;
    } else if (logisticsFilter === 'Doorstep Delivery') {
      if (!order.deliveryRequired && order.deliveryOption === 'Shop Pickup') return false;
    }

    // Search query by mobile, customer, or order ID
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.orderId.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      if (!matchId && !matchName && !matchPhone) return false;
    }

    return true;
  }).sort((a, b) => {
    // 4. Order Date sorting (using actual orderDate, not Order ID)
    const timeA = new Date(a.orderDate).getTime();
    const timeB = new Date(b.orderDate).getTime();
    return dateSort === 'newest' ? timeB - timeA : timeA - timeB;
  });

  // Next lifecycle status helper (strictly 3 main statuses)
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case 'Order Received':
      case 'Processing':
        return 'Ready for Pickup';
      case 'Ready for Pickup':
      case 'Ready for Pickup / Delivery':
        return 'Delivered to Customer';
      case 'Delivered to Customer':
      case 'Delivered / Collected':
      case 'Delivered':
      case 'Completed':
      default:
        return null;
    }
  };

  const getNextStatusLabel = (nextStatus: OrderStatus): string => {
    switch (nextStatus) {
      case 'Ready for Pickup':
        return 'Mark Ready';
      case 'Delivered to Customer':
        return 'Mark Delivered';
      default:
        return 'Advance';
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Order Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 font-mono">
              {filteredOrders.length} orders
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track garment intake, update operational lifecycle stages, and manage customer orders.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('new-order')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>New Order</span>
        </button>
      </div>

      {/* Single Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer Mobile, Name, or Order ID..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* 4 Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* 1. Order Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Order Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Order Received">Order Received</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Delivered to Customer">Delivered to Customer</option>
            </select>
          </div>

          {/* 2. Priority Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="7 Days">7 Days</option>
              <option value="4–5 Days">4–5 Days</option>
              <option value="2 Days">2 Days</option>
            </select>
          </div>

          {/* 3. Logistics Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Logistics
            </label>
            <select
              value={logisticsFilter}
              onChange={(e) => setLogisticsFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Logistics</option>
              <option value="Shop Pickup">Shop Pickup</option>
              <option value="Doorstep Delivery">Doorstep Delivery</option>
            </select>
          </div>

          {/* 4. Order Date Sorting */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Order Date Sort
            </label>
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value as 'newest' | 'oldest')}
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No orders match your filter criteria.</p>
            <button
              onClick={() => {
                setStatusFilter('All');
                setPriorityFilter('All');
                setLogisticsFilter('All');
                setDateSort('newest');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Record Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const nextStatus = getNextStatus(order.status);
                const isDoorstep = order.deliveryRequired || order.deliveryOption !== 'Shop Pickup';

                return (
                  <div key={order.orderId} className="p-4 space-y-3">
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
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 block text-left truncate cursor-pointer"
                        >
                          {order.customerName}
                        </button>
                        <span className="font-mono text-slate-500 text-xs block">+91 {order.customerPhone}</span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-slate-900 text-base block">₹{order.finalAmount}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 block truncate">
                          {order.items[0]?.serviceName || 'Wash & Care'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Logistics: {isDoorstep ? 'Doorstep Delivery' : 'Shop Pickup'}
                        </span>
                      </div>
                      <PriorityBadge priority={order.priority} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                      <div>
                        {nextStatus && (
                          <button
                            onClick={() => updateOrderStatus(order.orderId, nextStatus)}
                            className="px-2.5 py-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-bold transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                          >
                            <span>{getNextStatusLabel(nextStatus)}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => openOrderDetail(order.orderId)}
                        className="px-3 py-1.5 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop & Tablet Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Customer Identity</th>
                    <th className="py-3.5 px-4">Main Service</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4">Priority</th>
                    <th className="py-3.5 px-4">Logistics</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const nextStatus = getNextStatus(order.status);
                    const isDoorstep = order.deliveryRequired || order.deliveryOption !== 'Shop Pickup';

                    return (
                      <tr key={order.orderId} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. Order ID */}
                        <td className="py-4 px-4 font-mono font-bold text-blue-600">
                          <button
                            onClick={() => openOrderDetail(order.orderId)}
                            className="hover:underline cursor-pointer"
                          >
                            {order.orderId}
                          </button>
                        </td>

                        {/* 2. Customer Identity */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => openCustomerProfile(order.customerId)}
                            className="font-bold text-slate-900 hover:text-blue-600 block text-left cursor-pointer"
                          >
                            {order.customerName}
                          </button>
                          <span className="font-mono text-slate-500 text-[11px] block mt-0.5">
                            +91 {order.customerPhone}
                          </span>
                        </td>

                        {/* 3. Main Service */}
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {order.items[0]?.serviceName || 'Wash & Care'}
                          </span>
                          <span className="text-slate-400 text-[11px] block">
                            {order.totalGarments} items
                          </span>
                        </td>

                        {/* 4. Amount */}
                        <td className="py-4 px-4 text-right font-bold text-slate-900 font-mono text-sm">
                          ₹{order.finalAmount}
                        </td>

                        {/* 5. Priority */}
                        <td className="py-4 px-4">
                          <PriorityBadge priority={order.priority} size="sm" />
                        </td>

                        {/* 6. Logistics */}
                        <td className="py-4 px-4 text-slate-600">
                          <span className="text-xs font-medium">
                            {isDoorstep ? 'Doorstep Delivery' : 'Shop Pickup'}
                          </span>
                        </td>

                        {/* 7. Current Status */}
                        <td className="py-4 px-4">
                          <StatusBadge status={order.status} size="sm" />
                        </td>

                        {/* 8. Action (View Details & permitted status updates) */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {nextStatus && (
                              <button
                                onClick={() => updateOrderStatus(order.orderId, nextStatus)}
                                className="px-2.5 py-1 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-bold transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                                title={`Advance to ${nextStatus}`}
                              >
                                <span>{getNextStatusLabel(nextStatus)}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              onClick={() => openOrderDetail(order.orderId)}
                              className="px-2.5 py-1 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-bold transition-colors cursor-pointer text-xs flex items-center gap-1"
                              title="View Order Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
