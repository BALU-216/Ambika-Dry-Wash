export type OrderStatus = 
  | 'Order Received' 
  | 'Ready for Pickup' 
  | 'Delivered to Customer' 
  | 'Processing' // backward-compat alias
  | 'Ready for Pickup / Delivery' // backward-compat alias
  | 'Delivered / Collected' // backward-compat alias
  | 'Delivered' // backward-compat alias
  | 'Completed' // backward-compat alias
  | 'Cancelled';

export type OrderPriority = '7 Days' | '4–5 Days' | '2 Days' | 'Normal' | 'Priority' | 'Express' | 'Urgent';

export type DeliveryOption = 'Shop Pickup' | 'Doorstep Delivery' | 'Customer Delivery' | 'Pickup + Delivery';

export type PaymentMethod = 'Cash' | 'UPI / QR' | 'Card' | 'Pending';

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial';

export type LoyaltyLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type CustomerSegment = 'High-Value Regular' | 'Frequent Customer' | 'Occasional' | 'New Customer' | 'At-Risk Inactive';

export type UserRole = 'Owner/Admin' | 'Staff';

export interface AppUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  phone: string;
  active: boolean;
  lastLogin?: string;
}

export interface OrderItem {
  serviceId: string;
  serviceName: string;
  garmentType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit?: string;
  notes?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

export interface Order {
  orderId: string; // e.g. "ORD0001", "ORD0101"
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalGarments: number;
  subtotalAmount: number;
  deliveryCharge?: number; // Delivery fee for Doorstep Delivery
  loyaltyLevelApplied: LoyaltyLevel;
  discountPercentage: number;
  discountAmount: number;
  finalAmount: number;
  priority: OrderPriority;
  customerRequirements: string[];
  status: OrderStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  orderDate: string; // ISO date string
  estimatedCompletion: string; // ISO date string
  actualCompletion?: string;
  deliveryRequired?: boolean; // Direct Yes/No
  deliveryOption: DeliveryOption;
  deliveryAddress?: string;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  timeline: OrderTimelineEvent[];
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string; // Primary identity
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  totalSpend?: number; // Alias for backward compatibility
  loyaltyLevel: LoyaltyLevel;
  customerSegment: CustomerSegment;
  createdAt: string;
  lastOrderDate?: string;
  favoriteServices: string[];
  notes?: string;
  avgOrderValue: number;
  orderFrequencyDays?: number;
}

export interface LoyaltyTierRule {
  level: LoyaltyLevel;
  minOrders: number;
  maxOrders?: number;
  discountPercentage: number;
  badgeColor: string;
  perks: string[];
  description: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'Wash & Care' | 'Ironing' | 'Specialty' | 'Dry Cleaning' | string;
  shortDesc: string;
  fullDesc?: string;
  startingPrice: number;
  unit: string; // e.g., 'per kg', 'per piece', 'per pair'
  turnaroundHours: number;
  iconName?: string;
  isPopular?: boolean;
  active: boolean;
  isActive?: boolean;
  image?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  phone: string;
  role: string;
  status: 'Active' | 'Inactive';
  dateJoined?: string;
}

export type WhatsAppMessageStatus = 'Pending' | 'Sent' | 'Delivered' | 'Failed';

export interface NotificationItem {
  id: string;
  orderId?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  channel: 'WhatsApp' | 'SMS' | 'System';
  type: 
    | 'Order Confirmation' 
    | 'Ready for Pickup' 
    | 'Delivered to Customer' 
    | 'Ready for Pickup / Delivery' // backward compat
    | 'Delivered / Collected' // backward compat
    | 'Loyalty Milestone';
  message: string;
  status: WhatsAppMessageStatus;
  sentAt: string;
  deliveredAt?: string;
  errorMessage?: string;
}

export type ReportType = 
  | 'daily-orders'
  | 'weekly-orders'
  | 'monthly-orders'
  | 'revenue-summary'
  | 'customer-analysis'
  | 'service-usage'
  | 'loyalty-patrons';

export interface ShopSettings {
  shopName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  whatsappPhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  businessHours: string;
  currency: string;
  taxRatePercent: number;
  enableAutoWhatsApp: boolean;
}
