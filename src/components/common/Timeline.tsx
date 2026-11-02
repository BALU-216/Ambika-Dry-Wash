import React from 'react';
import { Order, OrderStatus } from '../../types';
import { CheckCircle2, Clock, Truck } from 'lucide-react';

interface TimelineProps {
  order: Order;
  onStatusChange?: (status: OrderStatus) => void;
  interactive?: boolean;
}

const STAGES: { status: OrderStatus; label: string; icon: any; description: string }[] = [
  {
    status: 'Order Received',
    label: 'Order Received',
    icon: Clock,
    description: 'Intake registered & tagged at Patamata counter',
  },
  {
    status: 'Ready for Pickup',
    label: 'Ready for Pickup',
    icon: CheckCircle2,
    description: 'Cleaned, inspected & packaged for collection/delivery',
  },
  {
    status: 'Delivered to Customer',
    label: 'Delivered to Customer',
    icon: Truck,
    description: 'Handed over at counter or delivered to doorstep',
  },
];

export const OrderTimeline: React.FC<TimelineProps> = ({ order, onStatusChange, interactive = false }) => {
  // Map any legacy status aliases to the 3 main statuses for stage highlighting
  const normalizedStatus = ((): OrderStatus => {
    if (order.status === 'Processing') return 'Order Received';
    if (order.status === 'Ready for Pickup / Delivery') return 'Ready for Pickup';
    if (order.status === 'Delivered / Collected' || order.status === 'Delivered' || order.status === 'Completed') return 'Delivered to Customer';
    return order.status;
  })();

  const currentStageIndex = STAGES.findIndex((s) => s.status === normalizedStatus);

  return (
    <div className="w-full">
      <div className="relative flex flex-col md:flex-row items-start justify-between gap-4 md:gap-2">
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute top-6 left-8 right-8 h-0.5 bg-slate-200 -z-0" />
        
        {STAGES.map((stage, idx) => {
          const isCompleted = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const Icon = stage.icon;
          
          // Find matching event in history
          const event = order.timeline?.find((e) => {
            if (e.status === stage.status) return true;
            if (stage.status === 'Ready for Pickup' && e.status === 'Ready for Pickup / Delivery') return true;
            if (stage.status === 'Delivered to Customer' && (e.status === 'Delivered / Collected' || e.status === 'Delivered' || e.status === 'Completed')) return true;
            return false;
          });

          return (
            <div
              key={stage.status}
              className="relative z-10 flex md:flex-col items-center md:text-center gap-3 md:gap-2 flex-1 w-full md:w-auto"
            >
              <button
                disabled={!interactive || !onStatusChange}
                onClick={() => onStatusChange && onStatusChange(stage.status)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0 ${
                  isCompleted
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-50'
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                } ${interactive && onStatusChange ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
              >
                <Icon className="w-5 h-5" />
              </button>

              <div className="flex-1 md:flex-none">
                <div className="flex items-center gap-2 md:justify-center">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    Stage {idx + 1}
                  </span>
                  {isCurrent && (
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  )}
                </div>

                <p
                  className={`text-sm font-semibold mt-0.5 ${
                    isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </p>

                {event ? (
                  <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                    <p className="font-medium text-slate-600">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      • {new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[11px] text-slate-400">By {event.updatedBy}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-1 italic">{stage.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline event log */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Workflow Audit Log ({order.timeline.length} entries)
          </h4>
          <div className="space-y-3">
            {order.timeline.map((event, index) => (
              <div key={index} className="flex items-start gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{event.status}</span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(event.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{event.notes}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">Staff: {event.updatedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
