import React, { useState, useEffect } from 'react';
import { Order, NotificationItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { whatsappService, whatsappTemplateService } from '../../services/apiService';
import { X, MessageSquare, Send, Copy, CheckCircle2, ExternalLink } from 'lucide-react';

interface WhatsAppModalProps {
  order: Order | null;
  onClose: () => void;
}

const TEMPLATE_TYPES: NotificationItem['type'][] = [
  'Order Confirmation',
  'Ready for Pickup',
  'Delivered to Customer',
  'Loyalty Milestone',
];

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ order, onClose }) => {
  const { settings, sendWhatsAppMessage, addToast } = useApp();
  const [selectedType, setSelectedType] = useState<NotificationItem['type']>('Ready for Pickup');
  const [messageText, setMessageText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order) return;
    if (order.status === 'Order Received' || order.status === 'Processing') {
      setSelectedType('Order Confirmation');
    } else if (order.status === 'Ready for Pickup' || order.status === 'Ready for Pickup / Delivery') {
      setSelectedType('Ready for Pickup');
    } else if (order.status === 'Delivered to Customer' || order.status === 'Delivered / Collected' || order.status === 'Delivered' || order.status === 'Completed') {
      setSelectedType('Delivered to Customer');
    } else {
      setSelectedType('Ready for Pickup');
    }
  }, [order]);

  useEffect(() => {
    if (!order) return;
    const formatted = whatsappTemplateService.formatMessage(selectedType, order, settings);
    setMessageText(formatted);
  }, [selectedType, order, settings]);

  if (!order) return null;

  // Always use the mobile number stored on this order's customer record.
  const targetPhone = whatsappService.normalizeWhatsAppPhone(order.customerPhone);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = async () => {
    if (!targetPhone) {
      addToast('error', 'Invalid Customer Number', 'Update this customer’s mobile number to a valid WhatsApp number before continuing.');
      return;
    }
    await sendWhatsAppMessage({
      phone: targetPhone,
      message: messageText,
      orderId: order.orderId,
      customerName: order.customerName,
      customerId: order.customerId,
      type: selectedType,
    });

    const url = whatsappService.getWhatsAppWebUrl(targetPhone, messageText);
    if (!url) {
      addToast('error', 'Invalid Customer Number', 'The customer mobile number is invalid.');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onClose();
  };

  const handleLogOnly = async () => {
    if (!targetPhone) {
      addToast('error', 'Invalid Customer Number', 'Update this customer’s mobile number before recording this notification.');
      return;
    }
    await sendWhatsAppMessage({
      phone: targetPhone,
      message: messageText,
      orderId: order.orderId,
      customerName: order.customerName,
      customerId: order.customerId,
      type: selectedType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-emerald-600 rounded-xl shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate">Send WhatsApp Update</h3>
              <p className="text-[11px] sm:text-xs text-emerald-100 truncate">
                Order #{order.orderId} • {order.customerName} ({targetPhone ? `+${targetPhone}` : 'Invalid mobile number'})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-200 hover:text-white rounded-lg cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Notification Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    selectedType === type
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Message Preview (Editable)
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
            <div className="bg-[#e5ddd5] p-3 sm:p-4 rounded-xl border border-slate-300">
              <div className="bg-white rounded-xl p-3 shadow-xs relative">
                <textarea
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full text-xs sm:text-sm text-slate-800 bg-transparent focus:outline-none resize-none leading-relaxed"
                />
                <div className="text-right text-[10px] text-slate-400 mt-1">
                  Ambika Dry Wash • Automated Alert
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleLogOnly}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Record in Log Only
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!targetPhone}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Open WhatsApp {targetPhone ? `(+${targetPhone})` : '(invalid customer number)'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
