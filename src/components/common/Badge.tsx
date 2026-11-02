import React from 'react';
import { OrderStatus, OrderPriority, LoyaltyLevel, WhatsAppMessageStatus } from '../../types';

export const StatusBadge: React.FC<{ status: OrderStatus; size?: 'sm' | 'md' }> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';
  
  switch (status) {
    case 'Order Received':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          Order Received
        </span>
      );
    case 'Ready for Pickup':
    case 'Ready for Pickup / Delivery':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-300 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
          Ready for Pickup
        </span>
      );
    case 'Delivered to Customer':
    case 'Delivered / Collected':
    case 'Delivered':
    case 'Completed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Delivered to Customer
        </span>
      );
    case 'Processing':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Order Received
        </span>
      );
    case 'Cancelled':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export const NotificationStatusBadge: React.FC<{ status: WhatsAppMessageStatus; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px] font-bold' : 'px-2.5 py-1 text-xs font-bold';

  switch (status) {
    case 'Delivered':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          ✓✓ Delivered
        </span>
      );
    case 'Sent':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          ✓ Sent (Dispatched)
        </span>
      );
    case 'Pending':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          ⏳ Pending / Queued
        </span>
      );
    case 'Failed':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          ✕ Failed
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: OrderPriority; size?: 'sm' | 'md' }> = ({ priority, size = 'sm' }) => {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';
  switch (priority) {
    case '2 Days':
    case 'Urgent':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-bold ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          2 Days
        </span>
      );
    case '4–5 Days':
    case 'Priority':
    case 'Express':
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold ${padding}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          4–5 Days
        </span>
      );
    case '7 Days':
    case 'Normal':
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium ${padding}`}>
          7 Days
        </span>
      );
  }
};

export const LoyaltyBadge: React.FC<{ 
  level?: LoyaltyLevel; 
  size?: 'sm' | 'md' | 'lg' | string;
  showDiscount?: boolean; 
  discountPercent?: number 
}> = ({ 
  level = 'Bronze', 
  size = 'sm',
  showDiscount = false,
  discountPercent 
}) => {
  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1 text-sm' 
    : size === 'md' 
    ? 'px-2.5 py-0.5 text-xs' 
    : 'px-2 py-0.5 text-[11px]';

  switch (level) {
    case 'Platinum':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold ${sizeClasses}`}>
          👑 Platinum {showDiscount && <span className="text-indigo-500">({discountPercent ?? 15}%)</span>}
        </span>
      );
    case 'Gold':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-semibold ${sizeClasses}`}>
          ⭐ Gold {showDiscount && <span className="text-amber-600">({discountPercent ?? 10}%)</span>}
        </span>
      );
    case 'Silver':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-medium ${sizeClasses}`}>
          🥈 Silver {showDiscount && <span className="text-slate-500">({discountPercent ?? 5}%)</span>}
        </span>
      );
    case 'Bronze':
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-900/10 text-amber-900 border border-amber-900/20 font-medium ${sizeClasses}`}>
          🥉 Bronze
        </span>
      );
  }
};
