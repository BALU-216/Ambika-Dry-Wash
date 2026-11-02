import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, MessageSquare, CheckCircle2, Droplets, Phone, MapPin } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { invoiceModalOrder, setInvoiceModalOrder, setWhatsAppModalOrder, settings } = useApp();

  const order = invoiceModalOrder;
  if (!order) return null;

  const onClose = () => setInvoiceModalOrder(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Top Action Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2 print:hidden shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Droplets className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="font-bold text-xs sm:text-sm tracking-wide truncate">Invoice — {order.orderId}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                onClose();
                setWhatsAppModalOrder(order);
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Share on</span> WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Content */}
        <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto" id="printable-invoice">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 pb-5 sm:pb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shrink-0">
                  A
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">{settings.shopName}</h2>
                  <p className="text-xs font-medium text-blue-600">{settings.tagline}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{settings.address}, {settings.city} - {settings.pincode}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {settings.phone || '+91 94409 66689'}
                </p>
              </div>
            </div>

            <div className="sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <span className="inline-block bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md mb-2">
                Tax Invoice / Receipt
              </span>
              <p className="text-base sm:text-lg font-extrabold text-slate-900">{order.orderId}</p>
              <p className="text-xs text-slate-500 mt-0.5">Date: {new Date(order.orderDate).toLocaleDateString('en-IN')}</p>
              <p className="text-xs text-slate-500">
                Est. Ready: <span className="font-semibold text-slate-700">{new Date(order.estimatedCompletion).toLocaleDateString('en-IN')}</span>
              </p>
            </div>
          </div>

          {/* Customer Info & Order Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Billed To</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 break-words">{order.customerName}</p>
              <p className="text-xs text-slate-600">+91 {order.customerPhone}</p>
              {order.deliveryAddress && (
                <p className="text-xs text-slate-500 mt-1 break-words">{order.deliveryAddress}</p>
              )}
            </div>
            <div className="sm:text-right flex flex-col sm:items-end justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment & Status</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {order.paymentStatus} ({order.paymentMethod})
                </span>
                <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                  {order.status}
                </span>
              </div>
              <span className="text-[11px] text-blue-600 font-medium mt-1">{order.deliveryOption}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto responsive-table-scroll">
            <table className="w-full text-left border-collapse min-w-[420px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 sm:px-4">Garment & Service</th>
                  <th className="py-2.5 px-3 sm:px-4 text-center">Qty</th>
                  <th className="py-2.5 px-3 sm:px-4 text-right">Rate</th>
                  <th className="py-2.5 px-3 sm:px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 sm:px-4">
                      <p className="font-semibold text-slate-800">{item.garmentType}</p>
                      <p className="text-xs text-slate-500">{item.serviceName}</p>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center font-medium text-slate-700">
                      {item.quantity} <span className="text-[11px] text-slate-500 font-normal">{item.unit || ''}</span>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right text-slate-600 font-mono">₹{item.unitPrice}</td>
                    <td className="py-2.5 px-3 sm:px-4 text-right font-semibold text-slate-900 font-mono">₹{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="text-xs text-slate-500 max-w-xs space-y-1">
              <p className="font-semibold text-slate-700">Terms & Care Note:</p>
              <p>1. Please bring this receipt or show WhatsApp invoice during collection.</p>
              <p>2. Delicate silk and embroidery garments are processed with specialized care.</p>
              <p className="font-medium text-slate-700 pt-1">Turnaround Window: <span className="text-blue-600 font-bold">{order.priority}</span></p>
              {order.notes && (
                <p className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 font-medium break-words">
                  Note: {order.notes}
                </p>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-2 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({order.totalGarments} items)</span>
                <span className="font-medium text-slate-800 font-mono">₹{order.subtotalAmount}</span>
              </div>
              {order.deliveryCharge && order.deliveryCharge > 0 ? (
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-medium text-slate-800 font-mono">+₹{order.deliveryCharge}</span>
                </div>
              ) : null}
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{order.loyaltyLevelApplied} Discount ({order.discountPercentage}%)</span>
                  <span className="font-mono">-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline text-base font-extrabold text-slate-900">
                <span>Final Payable</span>
                <span className="text-blue-600 text-lg font-mono">₹{order.finalAmount}</span>
              </div>
            </div>
          </div>

          {/* Footer thank you */}
          <div className="text-center border-t border-slate-200 pt-4 text-xs text-slate-500">
            Thank you for choosing <span className="font-semibold text-slate-700">{settings.shopName}</span>, {settings.city}!
          </div>
        </div>
      </div>
    </div>
  );
};
