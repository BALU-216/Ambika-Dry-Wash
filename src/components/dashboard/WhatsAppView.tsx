import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { whatsappTemplateService, whatsappService } from '../../services/apiService';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  CheckCircle2, 
  ExternalLink,
  RotateCw,
  Info
} from 'lucide-react';
import { StatusBadge, NotificationStatusBadge } from '../common/Badge';

export const WhatsAppView: React.FC = () => {
  const { 
    orders, 
    notifications, 
    settings, 
    setWhatsAppModalOrder, 
    addToast, 
    openOrderDetail,
    retryWhatsAppNotification,
    sendWhatsAppMessage
  } = useApp();

  const [selectedOrderForTest, setSelectedOrderForTest] = useState(orders[0]?.orderId || '');
  const [selectedTemplateType, setSelectedTemplateType] = useState<
    'Order Confirmation' | 'Ready for Pickup' | 'Delivered to Customer'
  >('Ready for Pickup');
  const [copied, setCopied] = useState(false);

  const activeOrder = orders.find((o) => o.orderId === selectedOrderForTest) || orders[0];

  // Generated message preview
  const previewMessage = activeOrder
    ? whatsappTemplateService.formatMessage(selectedTemplateType, activeOrder, settings)
    : 'Select an order to generate WhatsApp text.';

  const handleCopy = () => {
    navigator.clipboard.writeText(previewMessage);
    setCopied(true);
    addToast('info', 'Copied to Clipboard', 'WhatsApp template text copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = async () => {
    if (!activeOrder) return;
    const recipientPhone = whatsappService.normalizeWhatsAppPhone(activeOrder.customerPhone);
    if (!recipientPhone) {
      addToast('error', 'Invalid Customer Number', 'Update this order customer’s mobile number to a valid WhatsApp number before continuing.');
      return;
    }
    
    // Record the notification against the actual customer number on this order.
    await sendWhatsAppMessage({
      phone: recipientPhone,
      message: previewMessage,
      orderId: activeOrder.orderId,
      customerName: activeOrder.customerName,
      customerId: activeOrder.customerId,
      type: selectedTemplateType,
    });

    const url = whatsappService.getWhatsAppWebUrl(recipientPhone, previewMessage);
    if (!url) {
      addToast('error', 'Invalid Customer Number', 'The customer mobile number is invalid.');
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              WhatsApp Notifications Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Patamata Desk • +91 63016 82969
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Order lifecycle communication hub for Ambika Dry Wash order intake, ready alerts, and delivery receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            Total Dispatched: <strong className="text-emerald-600 font-mono">{notifications.length}</strong>
          </span>
        </div>
      </div>

      {/* Integration Notice Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 sm:p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Messaging Service Status: WhatsApp Web handoff (customer-specific recipient)</p>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            Every notification maintains an authentic delivery lifecycle state (Pending, Sent, Delivered, or Failed). External webhook integration is not yet connected to production cloud endpoints, so messages are dispatched as 'Sent' and not falsely assumed 'Delivered'.
          </p>
        </div>
      </div>

      {/* Interactive Template Simulator / Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left: Controls & Template Selection (6 cols) */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-5 sm:space-y-6">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Customer Message Composer & Preview</span>
          </h3>

          {/* Select Target Order */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              1. Select Target Customer Order
            </label>
            <select
              value={selectedOrderForTest}
              onChange={(e) => setSelectedOrderForTest(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {orders.map((o) => (
                <option key={o.orderId} value={o.orderId}>
                  {o.orderId} – {o.customerName} (+91 {o.customerPhone}) – ₹{o.finalAmount} [{o.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Select Message Stage */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              2. Select Notification Stage / Trigger
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { type: 'Order Confirmation', label: '1. Order Received', desc: 'Intake & estimate confirmation' },
                { type: 'Ready for Pickup', label: '2. Ready for Pickup', desc: 'Clothes ready for collection/delivery' },
                { type: 'Delivered to Customer', label: '3. Delivered', desc: 'Handover receipt & patronage' },
              ].map((tmpl) => (
                <button
                  key={tmpl.type}
                  type="button"
                  onClick={() => setSelectedTemplateType(tmpl.type as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplateType === tmpl.type
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <span className="text-xs block">{tmpl.label}</span>
                  <span className="text-[10px] text-slate-500 block font-normal mt-0.5">{tmpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Target Order Info */}
          {activeOrder && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Recipient Name:</span>
                <span className="font-bold text-slate-900 text-right">{activeOrder.customerName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Customer WhatsApp:</span>
                <span className="font-mono font-bold text-emerald-700">{whatsappService.normalizeWhatsAppPhone(activeOrder.customerPhone) ? `+${whatsappService.normalizeWhatsAppPhone(activeOrder.customerPhone)}` : 'Invalid / missing number'}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500">Current Order Status:</span>
                <StatusBadge status={activeOrder.status} size="sm" />
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Logistics Fulfillment:</span>
                <span className="font-semibold text-slate-800">
                  {activeOrder.deliveryRequired || activeOrder.deliveryOption !== 'Shop Pickup' ? 'Doorstep Delivery' : 'Shop Pickup'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Net Bill Amount:</span>
                <span className="font-mono font-bold text-emerald-600">₹{activeOrder.finalAmount}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Realistic WhatsApp Mobile Mockup (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 p-4 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl flex flex-col justify-between space-y-6">
          <div>
            {/* WhatsApp Chat Header */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                  {activeOrder?.customerName.charAt(0) || 'C'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">
                    {activeOrder?.customerName || 'Customer'}
                  </h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">{activeOrder?.customerPhone ? `+${whatsappService.normalizeWhatsAppPhone(activeOrder.customerPhone) || 'Invalid number'}` : 'No customer number'}</span>
                  </span>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-md shrink-0">
                Ambika Desk
              </span>
            </div>

            {/* Chat Bubble Container */}
            <div className="py-5 sm:py-6 space-y-4">
              <div className="bg-emerald-950/80 border border-emerald-800/60 p-3.5 sm:p-4 rounded-2xl rounded-tl-xs text-xs text-emerald-100 whitespace-pre-wrap break-words leading-relaxed shadow-md font-mono">
                {previewMessage}
                <div className="text-right text-[10px] text-emerald-400 mt-2 font-mono flex items-center justify-end gap-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleOpenWhatsApp}
              disabled={!activeOrder || !whatsappService.normalizeWhatsAppPhone(activeOrder.customerPhone)}
              className="w-full py-3.5 px-4 sm:px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Open Customer WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </button>

            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              <span>{copied ? 'Copied Message!' : 'Copy Formatted Text to Clipboard'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dispatched Notification History Log */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Dispatched WhatsApp Logs</h3>
            <p className="text-xs text-slate-500">Authentic audit trail of customer messages sent from Patamata branch</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
            {notifications.length} Logs
          </span>
        </div>

        {/* Mobile Log Cards (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => notif.orderId && openOrderDetail(notif.orderId)}
                  className="font-mono font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {notif.orderId || 'Direct Notice'}
                </button>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(notif.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 block">{notif.customerName}</span>
                  <span className="text-slate-500 font-mono text-[11px] block">+91 {notif.customerPhone}</span>
                </div>
                <NotificationStatusBadge status={notif.status} size="sm" />
              </div>

              <div className="text-[11px] font-semibold text-slate-700">
                Trigger: <span className="font-mono text-blue-700">{notif.type}</span>
              </div>

              <p className="text-slate-600 font-mono text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                {notif.message}
              </p>

              {notif.errorMessage && (
                <div className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  Failure Reason: {notif.errorMessage}
                </div>
              )}

              {notif.status === 'Failed' && (
                <button
                  onClick={() => retryWhatsAppNotification(notif.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry Message</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Stage / Type</th>
                <th className="py-3 px-4">Message Snippet</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <tr key={notif.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(notif.sentAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {notif.orderId ? (
                      <button
                        onClick={() => openOrderDetail(notif.orderId)}
                        className="hover:underline cursor-pointer"
                      >
                        {notif.orderId}
                      </button>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{notif.customerName}</span>
                    <span className="text-slate-500 font-mono text-[11px] block">+91 {notif.customerPhone}</span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                      {notif.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate font-mono text-[11px]" title={notif.message}>
                    {notif.message}
                    {notif.errorMessage && (
                      <span className="block text-rose-600 text-[10px] mt-0.5">
                        Err: {notif.errorMessage}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <NotificationStatusBadge status={notif.status} size="sm" />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {notif.status === 'Failed' ? (
                        <button
                          onClick={() => retryWhatsAppNotification(notif.id)}
                          className="px-2 py-1 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Retry dispatching this message"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const ord = orders.find((o) => o.orderId === notif.orderId);
                            if (ord) setWhatsAppModalOrder(ord);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                          title="Open WhatsApp composer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
