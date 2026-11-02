import React from 'react';
import { useApp } from '../../context/AppContext';
import { loyaltyService, whatsappService } from '../../services/apiService';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  MessageSquare, 
  Plus, 
  Eye, 
  ExternalLink
} from 'lucide-react';
import { LoyaltyBadge, StatusBadge } from '../common/Badge';

export const CustomerProfileView: React.FC = () => {
  const { 
    selectedCustomerId, 
    customers, 
    orders, 
    setCurrentView, 
    openOrderDetail 
  } = useApp();

  const customer = customers.find((c) => c.id === selectedCustomerId);

  if (!customer) {
    return (
      <div className="p-8 sm:p-12 bg-white rounded-3xl text-center space-y-4 max-w-lg mx-auto">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Customer Profile Not Found</h3>
        <button
          onClick={() => setCurrentView('customers')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Customers
        </button>
      </div>
    );
  }

  // Customer order history
  const customerOrders = orders.filter((o) => o.customerId === customer.id || o.customerPhone === customer.phone);
  const avgOrderValue = customer.totalOrders > 0 ? Math.round(customer.totalSpent / customer.totalOrders) : 0;

  // Loyalty Tier info
  const tierInfo = loyaltyService.calculateTier(customer.totalOrders);
  const nextTier = tierInfo.nextTier;
  const targetOrders = nextTier ? nextTier.minOrders : 20;
  const progressPercentage = Math.min(100, Math.round((customer.totalOrders / targetOrders) * 100));

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200 min-w-0">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <button
          onClick={() => setCurrentView('customers')}
          className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Customer Directory</span>
        </button>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex items-center gap-2">
          <a
            href={whatsappService.getWhatsAppWebUrl(customer.phone, `Hello ${customer.name}, greetings from Ambika Dry Wash Vijayawada!`) || '#'}
            onClick={(event) => { if (!whatsappService.normalizeWhatsAppPhone(customer.phone)) event.preventDefault(); }}
            aria-disabled={!whatsappService.normalizeWhatsAppPhone(customer.phone)}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Open WhatsApp Chat</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>

          <button
            onClick={() => setCurrentView('new-order')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* Customer Header Card */}
      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl sm:text-2xl flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              {customer.name.charAt(0)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  {customer.name}
                </h1>
                <LoyaltyBadge level={customer.loyaltyLevel} size="md" />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                <span className="font-mono text-slate-700 font-bold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>+91 {customer.phone}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="break-words">{customer.address}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Joined {new Date(customer.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-white p-4 sm:p-5 rounded-2xl border border-blue-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {nextTier
                  ? `Tier Progress: ${customer.loyaltyLevel} → ${nextTier.level}`
                  : 'Max Tier Unlocked: Platinum Patron'}
              </span>
            </span>
            <span className="font-bold text-blue-700 font-mono">
              {customer.totalOrders} / {targetOrders} Orders
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-600">
            {nextTier ? (
              <>
                Only <strong>{tierInfo.ordersToNextTier} more order(s)</strong> needed to unlock{' '}
                <strong className="text-blue-700">{nextTier.level} ({nextTier.discountPercentage}% automatic loyalty discount)</strong>!
              </>
            ) : (
              'This customer has reached our highest tier and enjoys lifetime 15% discount and priority express turnaround.'
            )}
          </p>
        </div>

        {/* Key Patron Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Orders</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono block mt-0.5">
              {customer.totalOrders}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Lifetime Spend</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono block mt-0.5">
              ₹{customer.totalSpent}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Average Order</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono block mt-0.5">
              ₹{avgOrderValue}
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Loyalty Rate</span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600 font-mono block mt-0.5">
              {tierInfo.discountPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Order History for This Customer */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Complete Order History</h3>
            <p className="text-xs text-slate-500">All historical orders registered under +91 {customer.phone}</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
            {customerOrders.length} Records
          </span>
        </div>

        {customerOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No orders found for this customer profile.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[540px]">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Services / Garments</th>
                  <th className="py-3 px-4 text-right">Net Amount</th>
                  <th className="py-3 px-4 text-center">Loyalty Applied</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerOrders.map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      <button
                        onClick={() => openOrderDetail(ord.orderId)}
                        className="hover:underline cursor-pointer"
                      >
                        {ord.orderId}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(ord.orderDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-slate-800">
                      <span className="font-semibold block">{ord.items[0]?.serviceName}</span>
                      <span className="text-slate-400 text-[11px] block">{ord.totalGarments} items total</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{ord.finalAmount}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <LoyaltyBadge level={ord.loyaltyLevelApplied} />
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={ord.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openOrderDetail(ord.orderId)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
