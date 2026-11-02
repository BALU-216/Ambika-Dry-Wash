import React from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { 
  ArrowLeft, 
  ShoppingBag, 
  Calendar, 
  MessageSquare, 
  Printer, 
  CheckCircle2, 
  Truck, 
  ShieldCheck,
  Tag
} from 'lucide-react';
import { StatusBadge, LoyaltyBadge, PriorityBadge } from '../common/Badge';
import { OrderTimeline } from '../common/Timeline';

export const OrderDetailView: React.FC = () => {
  const { 
    selectedOrderId, 
    orders, 
    setCurrentView, 
    updateOrderStatus, 
    setWhatsAppModalOrder, 
    setInvoiceModalOrder,
    openCustomerProfile
  } = useApp();

  const order = orders.find((o) => o.orderId === selectedOrderId);

  if (!order) {
    return (
      <div className="p-8 sm:p-12 bg-white rounded-3xl text-center space-y-4 max-w-lg mx-auto">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Order Not Found</h3>
        <p className="text-xs text-slate-500">The requested order ID may have been removed or does not exist.</p>
        <button
          onClick={() => setCurrentView('orders')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Orders
        </button>
      </div>
    );
  }

  const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
    'Order Received': 'Ready for Pickup',
    'Ready for Pickup': 'Delivered to Customer',
    'Delivered to Customer': null,
    'Processing': 'Ready for Pickup',
    'Ready for Pickup / Delivery': 'Delivered to Customer',
    'Delivered / Collected': null,
    'Delivered': null,
    'Completed': null,
    'Cancelled': null,
  };

  const nextStatus = nextStatusMap[order.status];

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200 min-w-0">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <button
          onClick={() => setCurrentView('orders')}
          className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to All Orders</span>
        </button>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          {/* WhatsApp Action */}
          <button
            onClick={() => setWhatsAppModalOrder(order)}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>WhatsApp Notice</span>
          </button>

          {/* Invoice Action */}
          <button
            onClick={() => setInvoiceModalOrder(order)}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-300 shrink-0" />
            <span>Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Order Card Header */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="font-mono text-xl sm:text-3xl font-black text-slate-900">
                {order.orderId}
              </span>
              <StatusBadge status={order.status} size="md" />
              <PriorityBadge priority={order.priority} />
            </div>

            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Created on {new Date(order.orderDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </p>
          </div>

          {/* Quick status stepper advance button */}
          {nextStatus && (
            <button
              onClick={() => updateOrderStatus(order.orderId, nextStatus)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Advance to "{nextStatus}"</span>
            </button>
          )}
        </div>

        {/* Customer Identity Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Customer Identity
            </span>
            <button
              onClick={() => openCustomerProfile(order.customerId)}
              className="text-sm font-extrabold text-blue-600 hover:underline block cursor-pointer text-left"
            >
              {order.customerName}
            </button>
            <span className="text-xs font-mono text-slate-600 block mt-0.5">+91 {order.customerPhone}</span>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Patron Loyalty Tier
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <LoyaltyBadge level={order.loyaltyLevelApplied} size="md" />
              {order.discountAmount > 0 && (
                <span className="text-xs text-emerald-600 font-bold">
                  {order.discountPercentage}% Off
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Fulfillment Logistics
            </span>
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{order.deliveryOption}</span>
            </span>
            {order.deliveryAddress && (
              <span className="text-[11px] text-slate-500 block break-words mt-0.5">
                {order.deliveryAddress}
              </span>
            )}
          </div>
        </div>

        {/* Interactive 4-Stage Workflow Timeline */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Workflow & Processing Audit History
          </h3>
          <OrderTimeline order={order} onStatusChange={(st) => updateOrderStatus(order.orderId, st)} interactive />
        </div>
      </div>

      {/* Garments Table & Special Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Garment Line Items (8 cols) */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4 min-w-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Garments & Services Breakdown</h3>
            <span className="text-xs text-slate-500 font-medium">
              Total: {order.totalGarments} pieces
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[440px]">
              <thead className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 pr-3">Service Type</th>
                  <th className="py-2.5 px-3">Garment Spec</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 pl-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 pr-3 font-bold text-slate-800">{item.serviceName}</td>
                    <td className="py-3 px-3 text-slate-600">{item.garmentType}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono">
                      {item.quantity} <span className="text-[10px] text-slate-500 font-normal">{item.unit || ''}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">₹{item.unitPrice}</td>
                    <td className="py-3 pl-3 text-right font-mono font-bold text-slate-900">₹{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Customer Requirements tags */}
          {order.customerRequirements && order.customerRequirements.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Special Care Requirements & Fabric Notes:
              </span>
              <div className="flex flex-wrap gap-2">
                {order.customerRequirements.map((req, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium"
                  >
                    ★ {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Financial Statement & Assignment (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 pb-2 border-b border-slate-100">
            Payment & Invoice
          </h3>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between gap-2">
              <span>Gross Subtotal:</span>
              <span className="font-bold text-slate-800 font-mono">₹{order.subtotalAmount}</span>
            </div>

            {order.deliveryCharge && order.deliveryCharge > 0 ? (
              <div className="flex justify-between gap-2 text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-bold text-slate-800 font-mono">+₹{order.deliveryCharge}</span>
              </div>
            ) : null}

            {order.discountAmount > 0 && (
              <div className="flex justify-between gap-2 text-emerald-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 shrink-0" />
                  <span>{order.loyaltyLevelApplied} ({order.discountPercentage}% off):</span>
                </span>
                <span className="font-bold font-mono">-₹{order.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between gap-2 text-slate-600">
              <span>Settlement Method:</span>
              <span className="font-semibold text-slate-900">{order.paymentMethod}</span>
            </div>

            <div className="flex justify-between gap-2 text-slate-600">
              <span>Payment Status:</span>
              <span className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {order.paymentStatus}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Final Net Amount:
              </span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                ₹{order.finalAmount}
              </span>
            </div>
          </div>

          {/* Assigned Staff */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Assigned Master Specialist
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between gap-2">
              <span className="truncate">{order.assignedStaffName || 'K. Srinivas (Master Presser)'}</span>
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            </div>
          </div>

          <button
            onClick={() => setInvoiceModalOrder(order)}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span>Generate Official Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
