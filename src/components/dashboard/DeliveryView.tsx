import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { orderService } from '../../services/apiService';
import { Order, OrderStatus } from '../../types';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  Navigation,
  MessageSquare,
  PackageCheck,
  Search
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';

const DISPATCH_STATUSES: OrderStatus[] = [
  'Order Received',
  'Ready for Pickup',
  'Delivered to Customer',
];

export const DeliveryView: React.FC = () => {
  const {
    orders,
    staff,
    updateOrderStatus,
    refreshData,
    addToast,
    setWhatsAppModalOrder,
    openOrderDetail,
  } = useApp();
  const [filterStage, setFilterStage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders that require pickup/delivery or match search
  const deliveryOrders = orders.filter((o) => {
    const isDeliveryOrder = o.deliveryRequired || o.deliveryOption !== 'Shop Pickup';
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.deliveryAddress || '').toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStage = filterStage === 'All';
    if (!matchesStage) {
      if (filterStage === 'Order Received') {
        matchesStage = o.status === 'Order Received' || (o.status as string) === 'Processing';
      } else if (filterStage === 'Ready for Pickup') {
        matchesStage = o.status === 'Ready for Pickup' || (o.status as string) === 'Ready for Pickup / Delivery';
      } else if (filterStage === 'Delivered to Customer') {
        matchesStage = o.status === 'Delivered to Customer' || (o.status as string) === 'Delivered / Collected' || (o.status as string) === 'Delivered' || (o.status as string) === 'Completed';
      } else {
        matchesStage = o.status === filterStage;
      }
    }

    return (isDeliveryOrder || searchQuery.trim() !== '') && matchesSearch && matchesStage;
  });

  // KPI metrics
  const pendingPickups = orders.filter(
    (o) => (o.deliveryRequired || o.deliveryOption !== 'Shop Pickup') && (o.status === 'Order Received' || (o.status as string) === 'Processing')
  ).length;
  const outForDelivery = orders.filter(
    (o) => (o.deliveryRequired || o.deliveryOption !== 'Shop Pickup') && (o.status === 'Ready for Pickup' || (o.status as string) === 'Ready for Pickup / Delivery')
  ).length;
  const completedDeliveries = orders.filter(
    (o) =>
      (o.deliveryRequired || o.deliveryOption !== 'Shop Pickup') &&
      (o.status === 'Delivered to Customer' || (o.status as string) === 'Delivered / Collected' || (o.status as string) === 'Delivered' || (o.status as string) === 'Completed')
  ).length;

  const handleAssignStaff = (order: Order, staffName: string) => {
    const staffMember = staff.find((s) => s.name === staffName);
    orderService.saveOrder({
      ...order,
      assignedStaffId: staffMember?.id,
      assignedStaffName: staffName,
    });
    refreshData();
    addToast('info', 'Executive Assigned', `${staffName} assigned to order ${order.orderId}.`);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Pickup & Delivery Management</h1>
            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200 shrink-0">
              Live Dispatch
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Assign delivery staff, manage doorstep pickups, and track real-time order dispatch across Patamata, Vijayawada
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Pickups</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">{pendingPickups}</p>
            <p className="text-xs text-slate-500 mt-1">Doorstep requests waiting</p>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100 shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready for Delivery</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">{outForDelivery}</p>
            <p className="text-xs text-slate-500 mt-1">Active dispatch routes</p>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shrink-0">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Deliveries</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{completedDeliveries}</p>
            <p className="text-xs text-slate-500 mt-1">Successfully handed over</p>
          </div>
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
            <PackageCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {['All', ...DISPATCH_STATUSES].map((stage) => (
            <button
              key={stage}
              onClick={() => setFilterStage(stage)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterStage === stage
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, order ID, area..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Delivery Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {deliveryOrders.map((order) => (
          <div
            key={order.orderId}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-blue-300 transition-all"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openOrderDetail(order.orderId)}
                    className="text-sm font-extrabold text-blue-600 hover:underline cursor-pointer"
                  >
                    #{order.orderId}
                  </button>
                  <StatusBadge status={order.status} />
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {order.deliveryOption}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 break-words">{order.customerName}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="flex items-center gap-1 hover:text-blue-600 font-medium"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      +91 {order.customerPhone}
                    </a>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      Est: {new Date(order.estimatedCompletion).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <p className="text-sm font-extrabold text-slate-900">₹{order.finalAmount}</p>
                  <p
                    className={`text-[11px] font-bold ${
                      order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {order.paymentStatus} ({order.paymentMethod})
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2.5 mb-4">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block mb-0.5">Pickup / Delivery Address:</span>
                  <span className="break-words">
                    {order.deliveryAddress || 'Patamata, Vijayawada (Doorstep Service)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Driver Assignment & Stage Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Update Order Status
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.orderId, e.target.value as OrderStatus)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {DISPATCH_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Assigned Staff / Rider
                  </label>
                  <select
                    value={order.assignedStaffName || ''}
                    onChange={(e) => handleAssignStaff(order, e.target.value)}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Rider...</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.name}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-end gap-2 sm:self-end pt-1 sm:pt-0">
                <button
                  onClick={() => setWhatsAppModalOrder(order)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors cursor-pointer text-xs font-bold"
                  title="Send Delivery Update on WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="sm:hidden">WhatsApp Alert</span>
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    order.deliveryAddress || 'Patamata, Vijayawada'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition-colors text-xs font-bold"
                  title="Open Route in Google Maps"
                >
                  <Navigation className="w-4 h-4 shrink-0" />
                  <span className="sm:hidden">Map Route</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deliveryOrders.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
          <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching delivery orders</h3>
          <p className="text-xs text-slate-500 mt-1">Try changing your stage filter or search query.</p>
        </div>
      )}
    </div>
  );
};
