  import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    doc,
    runTransaction,
  } from 'firebase/firestore';
  import { db } from '../firebase';
  import { 
    Customer, 
    Order, 
    OrderStatus, 
    LoyaltyTierRule, 
    LoyaltyLevel, 
    ServiceItem, 
    StaffMember, 
    NotificationItem, 
    ShopSettings,
    AppUser,
    UserRole,
    ReportType
  } from '../types';
  import { 
    INITIAL_CUSTOMERS, 
    INITIAL_ORDERS, 
    INITIAL_LOYALTY_RULES, 
    INITIAL_SERVICES, 
    INITIAL_STAFF, 
    INITIAL_NOTIFICATIONS, 
    INITIAL_SHOP_SETTINGS,
    INITIAL_USERS
  } from './mockData';
  // Local storage key names for state persistence
  const STORAGE_KEYS = {
    CUSTOMERS: 'ambika_customers_v2',
    ORDERS: 'ambika_orders_v3',
    LOYALTY_RULES: 'ambika_loyalty_rules_v2',
    SERVICES: 'ambika_services_v5',
    STAFF: 'ambika_staff_v2',
    NOTIFICATIONS: 'ambika_notifications_v3',
    SETTINGS: 'ambika_settings_v2',
    USERS: 'ambika_users_v2',
  };

  // Helper: Get stored item or fallback
  function getStored<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn(`LocalStorage read error for ${key}:`, e);
      return fallback;
    }
  }

  // Helper: Save stored item
  function setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`LocalStorage write error for ${key}:`, e);
    }
  }

  /* ==========================================================================
    1. DETERMINISTIC LOYALTY & DISCOUNT LOGIC (RULE-BASED BUSINESS ENGINE)
    ========================================================================== */
  export const loyaltyService = {
    getRules(): LoyaltyTierRule[] {
      return getStored<LoyaltyTierRule[]>(STORAGE_KEYS.LOYALTY_RULES, INITIAL_LOYALTY_RULES);
    },

    saveRules(rules: LoyaltyTierRule[]): void {
      setStored(STORAGE_KEYS.LOYALTY_RULES, rules);
    },

    /**
     * Deterministically calculates customer loyalty level and discount percent
     * strictly based on the customer's total confirmed order count.
     */
    calculateTier(orderCount: number, rules?: LoyaltyTierRule[]): {
      tier: LoyaltyLevel;
      discountPercent: number;
      rule: LoyaltyTierRule;
      nextTier?: LoyaltyTierRule;
      ordersToNextTier: number;
    } {
      const defaultRule: LoyaltyTierRule = {
        level: 'Bronze',
        minOrders: 0,
        discountPercentage: 0,
        badgeColor: 'amber',
        perks: ['Standard turnaround'],
        description: 'Bronze tier membership',
      };

      const activeRules = (rules && rules.length > 0) ? rules : this.getRules();
      const safeRules = (activeRules && activeRules.length > 0) ? activeRules : INITIAL_LOYALTY_RULES;
      
      // Sort descending by minOrders
      const sorted = [...safeRules].sort((a, b) => (b.minOrders || 0) - (a.minOrders || 0));
      
      // Find matching tier
      const matched = sorted.find(r => r && orderCount >= (r.minOrders || 0)) || sorted[sorted.length - 1] || defaultRule;
      
      // Find next tier for milestone calculation
      const ascSorted = [...safeRules].sort((a, b) => (a.minOrders || 0) - (b.minOrders || 0));
      const currentIndex = ascSorted.findIndex(r => r && matched && r.level === matched.level);
      const nextTier = (currentIndex >= 0 && currentIndex < ascSorted.length - 1) ? ascSorted[currentIndex + 1] : undefined;
      const ordersToNextTier = nextTier ? Math.max(0, (nextTier.minOrders || 0) - orderCount) : 0;

      return {
        tier: matched?.level || 'Bronze',
        discountPercent: matched?.discountPercentage || 0,
        rule: matched || defaultRule,
        nextTier,
        ordersToNextTier,
      };
    },
  };

  /* ==========================================================================
    2. CUSTOMER REPOSITORY & LOOKUP (MOBILE NUMBER IS PRIMARY IDENTITY)
    ========================================================================== */
    
  export const firestoreCustomerService = {
    async getCustomers(): Promise<Customer[]> {
      const snapshot = await getDocs(collection(db, 'customers'));

      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      } as Customer));
    },

    async createCustomer(data: {
      name: string;
      phone: string;
      email?: string;
      address?: string;
      notes?: string;
    }): Promise<Customer> {
      const cleanPhone = data.phone.replace(/\D/g, '').slice(-10);

      if (!cleanPhone) {
        throw new Error('Enter a valid customer phone number.');
      }

      const customersRef = collection(db, 'customers');
      const existing = await getDocs(
        query(customersRef, where('phoneNormalized', '==', cleanPhone))
      );

      if (!existing.empty) {
        throw new Error('A customer with this phone number already exists.');
      }

      const customer: Omit<Customer, 'id'> & { phoneNormalized: string } = {
        name: data.name.trim(),
        phone: data.phone.trim(),
        phoneNormalized: cleanPhone,
        email: data.email?.trim() || '',
        address: data.address?.trim() || 'Patamata, Vijayawada',
        totalOrders: 0,
        totalSpent: 0,
        loyaltyLevel: 'Bronze',
        customerSegment: 'New Customer',
        createdAt: new Date().toISOString().split('T')[0],
        favoriteServices: [],
        notes: data.notes || '',
        avgOrderValue: 0,
        orderFrequencyDays: 0,
      };

      const created = await addDoc(customersRef, customer);
      return { ...customer, id: created.id };
    },
  };
  export const firestoreOrderService = {
    // Retrieve all orders from Firestore
    async getOrders(): Promise<Order[]> {
      const snapshot = await getDocs(collection(db, 'orders'));

      return snapshot.docs
        .map((item) => ({
          ...item.data(),
          orderId: item.id,
        } as Order))
        .sort(
          (a, b) =>
            new Date(b.orderDate).getTime() -
            new Date(a.orderDate).getTime()
        );
    },

    // Save new orders and update customer statistics
    async saveOrder(order: Order): Promise<void> {
  const orderRef = doc(db, 'orders', order.orderId);
  const customerRef = doc(db, 'customers', order.customerId);

  const { actualCompletion, ...orderWithoutCompletion } = order;

  const orderToSave =
    actualCompletion === undefined
      ? orderWithoutCompletion
      : order;

  await runTransaction(db, async (transaction) => {
    const existingOrder = await transaction.get(orderRef);

    if (existingOrder.exists()) {
      transaction.set(orderRef, orderToSave);
      return;
    }

    const customerSnapshot = await transaction.get(customerRef);

    if (!customerSnapshot.exists()) {
      throw new Error('Customer not found in Firestore.');
    }

    const customer = customerSnapshot.data();

    const newTotalOrders = (customer.totalOrders || 0) + 1;
    const newTotalSpent =
      (customer.totalSpent || 0) + order.finalAmount;

    transaction.set(orderRef, orderToSave);

    transaction.update(customerRef, {
      totalOrders: newTotalOrders,
      totalSpent: newTotalSpent,
      avgOrderValue: newTotalSpent / newTotalOrders,
      lastOrderDate: new Date().toISOString().split('T')[0],
    });
  });
},
  };

  export const customerService = {
    getCustomers(): Customer[] {
      return getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    },

    getCustomerById(id: string): Customer | undefined {
      const customers = this.getCustomers();
      return customers.find(c => c.id === id);
    },

    getCustomerByPhone(phone: string): Customer | undefined {
      const customers = this.getCustomers();
      const cleanInput = phone.replace(/\D/g, '').slice(-10);
      return customers.find(c => {
        const cleanCustomerPhone = c.phone.replace(/\D/g, '').slice(-10);
        return cleanCustomerPhone === cleanInput;
      });
    },

    searchCustomers(query: string): Customer[] {
      const customers = this.getCustomers();
      const q = query.toLowerCase().trim();
      if (!q) return customers;
      return customers.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        c.loyaltyLevel.toLowerCase().includes(q)
      );
    },

    saveCustomer(customer: Customer): Customer {
      const customers = this.getCustomers();
      const index = customers.findIndex(c => c.id === customer.id);
      let updated: Customer[];
      if (index >= 0) {
        updated = [...customers];
        updated[index] = customer;
      } else {
        updated = [customer, ...customers];
      }
      setStored(STORAGE_KEYS.CUSTOMERS, updated);
      return customer;
    },

    createCustomer(data: {
      name: string;
      phone: string;
      email?: string;
      address?: string;
      notes?: string;
    }): Customer {
      const newId = `CUST-${String(this.getCustomers().length + 1).padStart(3, '0')}`;
      const newCustomer: Customer = {
        id: newId,
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || '',
        address: data.address?.trim() || 'Patamata, Vijayawada',
        totalOrders: 0,
        totalSpent: 0,
        loyaltyLevel: 'Bronze',
        customerSegment: 'New Customer',
        createdAt: new Date().toISOString().split('T')[0],
        favoriteServices: [],
        notes: data.notes || '',
        avgOrderValue: 0,
        orderFrequencyDays: 0,
      };

      return this.saveCustomer(newCustomer);
    },

    recordNewOrder(customerId: string, orderAmount: number, serviceName: string): Customer | undefined {
      const customer = this.getCustomerById(customerId);
      if (!customer) return undefined;

      const newTotalOrders = (customer.totalOrders || 0) + 1;
      const newTotalSpent = (customer.totalSpent || 0) + orderAmount;
      const tierResult = loyaltyService.calculateTier(newTotalOrders);

      let segment = customer.customerSegment;
      if (newTotalOrders >= 10) segment = 'High-Value Regular';
      else if (newTotalOrders >= 4) segment = 'Frequent Customer';
      else if (newTotalOrders > 1) segment = 'Occasional';
      else segment = 'New Customer';

      const favServices = [...(customer.favoriteServices || [])];
      if (serviceName && !favServices.includes(serviceName)) {
        favServices.push(serviceName);
      }

      const updatedCustomer: Customer = {
        ...customer,
        totalOrders: newTotalOrders,
        totalSpent: newTotalSpent,
        loyaltyLevel: tierResult.tier,
        customerSegment: segment,
        lastOrderDate: new Date().toISOString().split('T')[0],
        favoriteServices: favServices.slice(0, 3),
        avgOrderValue: Math.round(newTotalSpent / newTotalOrders),
      };

      return this.saveCustomer(updatedCustomer);
    },
  };

  /* ==========================================================================
    3. ORDER REPOSITORY & WORKFLOW ENGINE (INCREMENTAL UNIQUE IDS)
    ========================================================================== */
  export const orderService = {
    getOrders(): Order[] {
      return getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    },

    getOrderById(orderId: string): Order | undefined {
      const orders = this.getOrders();
      return orders.find(o => o.orderId.toUpperCase() === orderId.toUpperCase());
    },

    getOrdersByCustomerId(customerId: string): Order[] {
      const orders = this.getOrders();
      return orders.filter(o => o.customerId === customerId);
    },

    generateNextOrderId(): string {
      const orders = this.getOrders();
      const numericIds = orders
        .map(o => {
          const match = o.orderId.match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        })
        .filter(n => !isNaN(n));
      
      const max = numericIds.length > 0 ? Math.max(...numericIds) : 0;
      const nextNum = max + 1;
      return `ORD${String(nextNum).padStart(4, '0')}`;
    },

    saveOrder(order: Order): Order {
      const orders = this.getOrders();
      const index = orders.findIndex(o => o.orderId === order.orderId);
      let updated: Order[];
      if (index >= 0) {
        updated = [...orders];
        updated[index] = order;
      } else {
        updated = [order, ...orders];
      }
      setStored(STORAGE_KEYS.ORDERS, updated);
      return order;
    },

    createOrder(orderData: Omit<Order, 'orderId' | 'orderDate' | 'timeline'>): Order {
      const orderId = this.generateNextOrderId();
      const orderDate = new Date().toISOString();
      const newOrder: Order = {
        ...orderData,
        orderId,
        orderDate,
        timeline: [
          {
            status: 'Order Received',
            timestamp: orderDate,
            updatedBy: orderData.assignedStaffName || 'Front Desk Staff',
            notes: `Order registered at Ambika Dry Wash counter. Loyalty discount: ${orderData.discountPercentage}% applied.`,
          },
        ],
      };

      this.saveOrder(newOrder);

      // Update customer stats
      const primaryService = orderData.items[0]?.serviceName || 'Wash & Care';
      customerService.recordNewOrder(orderData.customerId, orderData.finalAmount, primaryService);

      return newOrder;
    },

    updateOrderStatus(
      orderId: string, 
      newStatus: OrderStatus, 
      staffName: string = 'Staff', 
      notes?: string
    ): Order | undefined {
      const order = this.getOrderById(orderId);
      if (!order) return undefined;

      const now = new Date().toISOString();
      const updatedTimeline = [
        ...order.timeline,
        {
          status: newStatus,
          timestamp: now,
          updatedBy: staffName,
          notes: notes || `Status updated to ${newStatus}`,
        },
      ];

      const isComplete = newStatus === 'Delivered / Collected' || newStatus === 'Delivered' || newStatus === 'Completed';

      const updatedOrder: Order = {
        ...order,
        status: newStatus,
        timeline: updatedTimeline,
        actualCompletion: isComplete ? now : order.actualCompletion,
      };

      this.saveOrder(updatedOrder);

      // If shop settings enable auto WhatsApp notification, dispatch corresponding template
      const shop = settingsService.getSettings();
      if (shop.enableAutoWhatsApp) {
        if (newStatus === 'Ready for Pickup' || (newStatus as string) === 'Ready for Pickup / Delivery') {
          const msg = whatsappTemplateService.formatMessage('Ready for Pickup', updatedOrder, shop);
          whatsappService.sendNotification({
            orderId: updatedOrder.orderId,
            customerId: updatedOrder.customerId,
            customerName: updatedOrder.customerName,
            customerPhone: updatedOrder.customerPhone,
            type: 'Ready for Pickup',
            message: msg,
          });
        } else if (newStatus === 'Delivered to Customer' || (newStatus as string) === 'Delivered / Collected') {
          const msg = whatsappTemplateService.formatMessage('Delivered to Customer', updatedOrder, shop);
          whatsappService.sendNotification({
            orderId: updatedOrder.orderId,
            customerId: updatedOrder.customerId,
            customerName: updatedOrder.customerName,
            customerPhone: updatedOrder.customerPhone,
            type: 'Delivered to Customer',
            message: msg,
          });
        }
      }

      return updatedOrder;
    },

    getDeliveryOrders(): Order[] {
      const orders = this.getOrders();
      return orders.filter(o => o.deliveryRequired === true || o.deliveryOption !== 'Shop Pickup');
    }
  };

  /* ==========================================================================
    5. USER & ROLE-BASED ACCESS CONTROL (STAFF & OWNER/ADMIN)
    ========================================================================== */
  export const userService = {
    getUsers(): AppUser[] {
      return getStored<AppUser[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    },

    getUserById(id: string): AppUser | undefined {
      return this.getUsers().find(u => u.id === id);
    },

    saveUser(user: AppUser): AppUser {
      const users = this.getUsers();
      const index = users.findIndex(u => u.id === user.id);
      let updated: AppUser[];
      if (index >= 0) {
        updated = [...users];
        updated[index] = user;
      } else {
        updated = [user, ...users];
      }
      setStored(STORAGE_KEYS.USERS, updated);
      return user;
    },

    addUser(data: Omit<AppUser, 'id' | 'lastLogin'>): AppUser {
      const users = this.getUsers();
      const id = `usr-${String(users.length + 1).padStart(2, '0')}`;
      const newUser: AppUser = {
        ...data,
        id,
        lastLogin: new Date().toISOString(),
      };
      return this.saveUser(newUser);
    }
  };

  /* ==========================================================================
    6. WHATSAPP NOTIFICATION ENGINE & TEMPLATES (DETERMINISTIC)
    ========================================================================== */
  export const whatsappTemplateService = {
    formatMessage(type: NotificationItem['type'], order: Order, shop: ShopSettings): string {
      const isDoorstep = order.deliveryRequired || order.deliveryOption === 'Doorstep Delivery' || order.deliveryOption === 'Customer Delivery' || order.deliveryOption === 'Pickup + Delivery';

      switch (type) {
        case 'Order Confirmation': {
          const deliveryText = order.deliveryCharge && order.deliveryCharge > 0 ? `\nDelivery Charge: ₹${order.deliveryCharge}` : '';
          return `Namaste ${order.customerName} garu!\n\nThank you for choosing Ambika Dry Wash (Patamata, Vijayawada). Your order #${order.orderId} with ${order.totalGarments} garment(s) has been safely received.\n\nSubtotal: ₹${order.subtotalAmount}${deliveryText}\nLoyalty Discount (${order.loyaltyLevelApplied}): -₹${order.discountAmount}\nTotal Payable: ₹${order.finalAmount}\n\nTurnaround Window: ${order.priority}\nEstimated Ready Date: ${new Date(order.estimatedCompletion).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}\nPickup Location: ${shop.address}, Patamata.\nFor queries call: ${shop.phone}`;
        }

        case 'Ready for Pickup':
        case 'Ready for Pickup / Delivery':
          if (isDoorstep) {
            return `Hello ${order.customerName} garu!\n\nGood news! Your garments for order #${order.orderId} are cleaned, inspected, and READY FOR DELIVERY to your doorstep (${order.deliveryAddress || 'Patamata, Vijayawada'}).\n\nFinal Bill: ₹${order.finalAmount} (${order.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid - Please keep Cash/UPI ready'}).\nAmbika Dry Wash Patamata: ${shop.phone}`;
          }
          return `Hello ${order.customerName} garu!\n\nYour order #${order.orderId} (${order.totalGarments} items) is freshly cleaned, steam-pressed, and READY FOR PICKUP at our Patamata store.\n\nFinal Amount: ₹${order.finalAmount} (${order.paymentStatus === 'Paid' ? 'PAID' : 'PAYABLE AT COUNTER'})\nStore Timings: Monday – Saturday: 9:30 AM – 9:30 PM, Sunday: 9:30 AM – 1:00 PM\nLocation: ${shop.address}\nAmbika Dry Wash: ${shop.phone}`;

        case 'Delivered to Customer':
        case 'Delivered / Collected':
          return `Thank you ${order.customerName} garu for choosing Ambika Dry Wash, Patamata. Your order #${order.orderId} has been successfully delivered/collected.\n\nWe appreciate your patronage. As our valued ${order.loyaltyLevelApplied} member, every order earns you closer to exclusive privileges!\nContact: ${shop.phone}`;

        case 'Loyalty Milestone':
          return `Congratulations ${order.customerName} garu!\n\nYou have unlocked the ${order.loyaltyLevelApplied} Tier at Ambika Dry Wash, Patamata! Enjoy ${order.discountPercentage}% flat savings on your future dry cleaning & laundry services.`;

        default:
          return `Hello ${order.customerName} garu, this is an update regarding your order #${order.orderId} at Ambika Dry Wash, Patamata. For queries call ${shop.phone}.`;
      }
    },
  };

  export const whatsappService = {
    getNotifications(): NotificationItem[] {
      return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    },

    saveNotification(notification: NotificationItem): NotificationItem {
      const list = this.getNotifications();
      const updated = [notification, ...list];
      setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
      return notification;
    },

    /**
     * Dispatches WhatsApp notification with duplicate prevention and accurate message state tracking.
     * If a notification with the same orderId and type was sent successfully within 2 minutes, avoid duplicate.
     */
    sendNotification(data: {
      orderId?: string;
      customerId?: string;
      customerName: string;
      customerPhone: string;
      type: NotificationItem['type'];
      message: string;
      allowDuplicate?: boolean;
    }): { notification: NotificationItem; isDuplicate: boolean } {
      const list = this.getNotifications();

      if (!data.allowDuplicate && data.orderId) {
        const recentExisting = list.find(
          (n) =>
            n.orderId === data.orderId &&
            n.type === data.type &&
            (n.status === 'Sent' || n.status === 'Delivered') &&
            Date.now() - new Date(n.sentAt).getTime() < 120000 // 2 minutes window
        );
        if (recentExisting) {
          return { notification: recentExisting, isDuplicate: true };
        }
      }

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        orderId: data.orderId,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        channel: 'WhatsApp',
        type: data.type,
        message: data.message,
        status: 'Sent', // Dispatched to WhatsApp link/service; not falsely claimed 'Delivered'
        sentAt: new Date().toISOString(),
      };

      const saved = this.saveNotification(newNotif);
      return { notification: saved, isDuplicate: false };
    },

    /**
     * Retries a failed notification without duplicating successful ones
     */
    retryNotification(notificationId: string): NotificationItem | null {
      const list = this.getNotifications();
      const index = list.findIndex((n) => n.id === notificationId);
      if (index === -1) return null;

      const notif = list[index];
      const updatedNotif: NotificationItem = {
        ...notif,
        status: 'Sent',
        sentAt: new Date().toISOString(),
        errorMessage: undefined,
      };

      list[index] = updatedNotif;
      setStored(STORAGE_KEYS.NOTIFICATIONS, [...list]);
      return updatedNotif;
    },

    /** Normalize a customer's phone for WhatsApp Web. Indian 10-digit numbers are prefixed with 91. */
    normalizeWhatsAppPhone(phone: string | undefined | null): string | null {
      const digits = String(phone || '').replace(/\D/g, '');
      if (!digits) return null;
      if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
      if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2))) return digits;
      if (digits.length === 11 && digits.startsWith('0') && /^[6-9]\d{9}$/.test(digits.slice(1))) return `91${digits.slice(1)}`;
      // Accept an explicitly international number (country code + national number), but reject local/short numbers.
      if (digits.length >= 11 && digits.length <= 15 && !digits.startsWith('0')) return digits;
      return null;
    },

    getWhatsAppWebUrl(phone: string, text: string): string | null {
      const recipient = this.normalizeWhatsAppPhone(phone);
      if (!recipient) return null;
      return `https://wa.me/${recipient}?text=${encodeURIComponent(text)}`;
    }
  };

  /* ==========================================================================
    7. REPORTS SERVICE (BUSINESS AGGREGATIONS)
    ========================================================================== */
  export const reportService = {
    generateReport(type: ReportType, startDate?: string, endDate?: string) {
      const orders = orderService.getOrders();
      const customers = customerService.getCustomers();

      switch (type) {
        case 'daily-orders': {
          const today = new Date().toISOString().split('T')[0];
          const dailyOrders = orders.filter(o => o.orderDate.startsWith(today) || o.orderDate.startsWith('2026-08-18'));
          const totalAmount = dailyOrders.reduce((sum, o) => sum + o.finalAmount, 0);
          return {
            title: "Daily Order Report (Patamata)",
            period: today,
            orderCount: dailyOrders.length,
            totalRevenue: totalAmount,
            orders: dailyOrders,
            summary: `Total of ${dailyOrders.length} orders processed with ₹${totalAmount} collected today.`
          };
        }
        case 'weekly-orders': {
          const totalAmount = orders.reduce((sum, o) => sum + o.finalAmount, 0);
          return {
            title: "Weekly Order Performance Report",
            period: "Current Week (Aug 2026)",
            orderCount: orders.length,
            totalRevenue: totalAmount,
            orders: orders,
            summary: `Current week total intake: ${orders.length} orders across Patamata & surrounding areas.`
          };
        }
        case 'monthly-orders': {
          const monthlyRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
          return {
            title: "Monthly Operations & Order Report",
            period: "August 2026",
            orderCount: orders.length,
            totalRevenue: monthlyRevenue,
            orders: orders,
            summary: `Monthly intake summary: ${orders.length} orders with ₹${monthlyRevenue} revenue.`
          };
        }
        case 'revenue-summary': {
          const totalGross = orders.reduce((sum, o) => sum + o.subtotalAmount, 0);
          const totalDiscounts = orders.reduce((sum, o) => sum + o.discountAmount, 0);
          const netRevenue = orders.reduce((sum, o) => sum + o.finalAmount, 0);
          return {
            title: "Revenue & Discount Summary",
            period: "Fiscal Year 2026",
            orderCount: orders.length,
            grossRevenue: totalGross,
            totalDiscounts,
            netRevenue,
            orders: orders,
            summary: `Net Revenue: ₹${netRevenue} | Total Loyalty Discounts Granted: ₹${totalDiscounts}.`
          };
        }
        case 'customer-analysis': {
          const repeatCount = customers.filter(c => c.totalOrders > 1).length;
          const totalSpentAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
          return {
            title: "Customer Directory & Repeat Patron Analysis",
            period: "All-Time",
            customerCount: customers.length,
            repeatCount,
            repeatPercentage: Math.round((repeatCount / customers.length) * 100),
            totalSpentAll,
            customers,
            summary: `${repeatCount} of ${customers.length} registered customers in Patamata are repeat clients (${Math.round((repeatCount / customers.length) * 100)}%).`
          };
        }
        case 'service-usage': {
          const serviceMap: Record<string, { count: number; revenue: number }> = {};
          orders.forEach(o => {
            o.items.forEach(item => {
              if (!serviceMap[item.serviceName]) {
                serviceMap[item.serviceName] = { count: 0, revenue: 0 };
              }
              serviceMap[item.serviceName].count += item.quantity;
              serviceMap[item.serviceName].revenue += item.totalPrice;
            });
          });
          return {
            title: "Service Popularity & Utilization Report",
            period: "All-Time",
            breakdown: Object.entries(serviceMap).map(([name, data]) => ({ name, ...data })),
            orders,
            summary: `Highest demand services: Wash & Iron and Dry Cleaning.`
          };
        }
        case 'loyalty-patrons': {
          const loyaltyGroups = {
            Platinum: customers.filter(c => c.loyaltyLevel === 'Platinum'),
            Gold: customers.filter(c => c.loyaltyLevel === 'Gold'),
            Silver: customers.filter(c => c.loyaltyLevel === 'Silver'),
            Bronze: customers.filter(c => c.loyaltyLevel === 'Bronze'),
          };
          return {
            title: "Loyalty Program Patrons Report",
            period: "Current Standing",
            loyaltyGroups,
            summary: `Platinum: ${loyaltyGroups.Platinum.length}, Gold: ${loyaltyGroups.Gold.length}, Silver: ${loyaltyGroups.Silver.length}, Bronze: ${loyaltyGroups.Bronze.length}.`
          };
        }
        default:
          return {
            title: "Standard Laundry Business Report",
            period: "General",
            orderCount: orders.length,
            orders,
          };
      }
    }
  };

  /* ==========================================================================
    8. STAFF REPOSITORY
    ========================================================================== */
  export const staffService = {
    getStaff(): StaffMember[] {
      const stored = getStored<StaffMember[] | null>(STORAGE_KEYS.STAFF, null);
      if (!stored || stored.length > 2) {
        setStored(STORAGE_KEYS.STAFF, INITIAL_STAFF);
        return INITIAL_STAFF;
      }
      return stored;
    },

    getStaffById(id: string): StaffMember | undefined {
      return this.getStaff().find(s => s.id === id);
    },

    saveStaff(member: StaffMember): StaffMember {
      const list = this.getStaff();
      const idx = list.findIndex(s => s.id === member.id);
      let updated: StaffMember[];
      if (idx >= 0) {
        updated = [...list];
        updated[idx] = member;
      } else {
        updated = [member, ...list];
      }
      setStored(STORAGE_KEYS.STAFF, updated);
      return member;
    },

    addStaff(data: Omit<StaffMember, 'id'>): StaffMember {
      const list = this.getStaff();
      const id = `stf-${String(list.length + 1).padStart(2, '0')}`;
      const newMember: StaffMember = {
        ...data,
        id,
        status: data.status || 'Active',
        dateJoined: data.dateJoined || new Date().toISOString().split('T')[0],
      };
      return this.saveStaff(newMember);
    },

    updateStaff(member: StaffMember): StaffMember {
      return this.saveStaff(member);
    },

    toggleStaffStatus(id: string): StaffMember | undefined {
      const member = this.getStaffById(id);
      if (!member) return undefined;
      const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
      const updated = { ...member, status: newStatus as 'Active' | 'Inactive' };
      return this.saveStaff(updated);
    }
  };

  /* ==========================================================================
    9. SERVICES CATALOG REPOSITORY
    ========================================================================== */
  export const serviceCatalogService = {
    getServices(): ServiceItem[] {
      try {
        localStorage.removeItem('ambika_services_v2');
        localStorage.removeItem('ambika_services_v3');
        localStorage.removeItem('ambika_services_v4');
      } catch (_) {}

      const raw = getStored<ServiceItem[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
      const migrated = raw.map(s => {
        if (s.id === 'srv-wf' || s.name === 'Wash & Fold') {
          return {
            ...s,
            name: 'Darning',
            category: 'Garment Repair',
            shortDesc: 'Repairing holes, tears, or worn fabric areas to help extend the life of garments.',
            fullDesc: 'Repairing holes, tears, or worn fabric areas to help extend the life of garments.',
            unit: s.unit === 'per kg' ? 'per garment' : s.unit,
          };
        }
        if (s.id === 'srv-wi' || s.name === 'Wash & Iron') {
          return {
            ...s,
            name: 'Sarees',
            category: 'Ethnic Care',
            shortDesc: 'Fabric-appropriate care for sarees, with attention to delicate materials, embellishments, and fabric finish.',
            fullDesc: 'Fabric-appropriate care for sarees, with attention to delicate materials, embellishments, and fabric finish.',
          };
        }
        if (s.id === 'srv-sr' || s.name === 'Stain Removal & Special Care' || s.name === 'Stain Removal & Specialty Care') {
          return {
            ...s,
            name: 'Colours Removal',
            category: 'Specialty Care',
            shortDesc: 'Colour stain removal or colour-related stain treatment, using appropriate methods for the fabric.',
            fullDesc: 'Colour stain removal or colour-related stain treatment, using appropriate methods for the fabric.',
          };
        }
        if (s.id === 'srv-ex' || s.name === 'Express 24-Hour Service') {
          return {
            ...s,
            name: 'Express 48-Hour Service',
            category: 'Priority Care',
            turnaroundHours: 48,
            shortDesc: 'Priority laundry service with a target turnaround of 48 hours for urgent requirements.',
            fullDesc: 'Priority laundry service with a target turnaround of 48 hours for urgent requirements.',
          };
        }
        return s;
      });

      // Ensure all services like Coats, Dresses, Pants & Shirts are present
      const existingNames = new Set(migrated.map(s => s.name.toLowerCase()));
      for (const initSrv of INITIAL_SERVICES) {
        if (!existingNames.has(initSrv.name.toLowerCase())) {
          migrated.push(initSrv);
          existingNames.add(initSrv.name.toLowerCase());
        }
      }

      setStored(STORAGE_KEYS.SERVICES, migrated);
      return migrated;
    },

    saveServices(services: ServiceItem[]): void {
      setStored(STORAGE_KEYS.SERVICES, services);
    },

    updateService(service: ServiceItem): ServiceItem {
      const list = this.getServices();
      const idx = list.findIndex(s => s.id === service.id);
      let updated: ServiceItem[];
      if (idx >= 0) {
        updated = [...list];
        updated[idx] = service;
      } else {
        updated = [service, ...list];
      }
      this.saveServices(updated);
      return service;
    },

    createService(data: Omit<ServiceItem, 'id' | 'active'> & { isActive?: boolean }): ServiceItem {
      const list = this.getServices();
      const id = `srv-${Date.now()}`;
      const newService: ServiceItem = {
        ...data,
        id,
        active: data.isActive ?? true,
        isActive: data.isActive ?? true,
      };
      const updated = [...list, newService];
      this.saveServices(updated);
      return newService;
    },
  };

  export const serviceRepo = serviceCatalogService;

  /* ==========================================================================
    10. SETTINGS & REPOSITORY
    ========================================================================== */
  export const settingsService = {
    getSettings(): ShopSettings {
      const s = getStored<ShopSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SHOP_SETTINGS);
      const desiredHours = 'Monday – Saturday: 9:30 AM – 9:30 PM, Sunday: 9:30 AM – 1:00 PM';
      if (s.businessHours !== desiredHours) {
        s.businessHours = desiredHours;
        setStored(STORAGE_KEYS.SETTINGS, s);
      }
      return s;
    },

    saveSettings(settings: ShopSettings): void {
      setStored(STORAGE_KEYS.SETTINGS, settings);
    },

    resetAllDataToDefaults(): void {
      Object.values(STORAGE_KEYS).forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch (e) {
          console.warn(`Failed to remove ${k}`, e);
        }
      });
    },
  };
