import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

import { 
  Customer, 
  Order, 
  OrderStatus, 
  LoyaltyTierRule, 
  ServiceItem, 
  StaffMember, 
  NotificationItem, 
  ShopSettings,
  AppUser,
  UserRole
} from '../types';

import {
  firestoreCustomerService,
  firestoreOrderService,
  orderService,
  loyaltyService,
  serviceCatalogService,
  staffService,
  whatsappService,
  settingsService,
  userService
} from '../services/apiService';
import confetti from 'canvas-confetti';

export type AppView = 
  | 'public-home' 
  | 'public-services' 
  | 'public-pricing' 
  | 'public-about' 
  | 'public-contact' 
  | 'owner-login'
  | 'dashboard' 
  | 'orders' 
  | 'new-order' 
  | 'order-detail' 
  | 'customers' 
  | 'customer-profile' 
  | 'services-manage' 
  | 'delivery'
  | 'loyalty' 
  | 'analytics' 
  | 'whatsapp' 
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export interface AppContextType {
  // Navigation & Auth
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isAuthenticated: boolean;
  isOwnerAuthenticated: boolean;
  currentUserRole: UserRole;
  currentUserName: string;
  login: (role: UserRole, name?: string) => void;
  loginAsOwner: () => void;
  loginAsStaff: () => void;
  logout: () => void;
  
  // Selection drill-down state
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  openOrderDetail: (orderId: string) => void;
  openCustomerProfile: (customerId: string) => void;

  // Active Data State
  orders: Order[];
  customers: Customer[];
  loyaltyRules: LoyaltyTierRule[];
  services: ServiceItem[];
  staff: StaffMember[];
  users: AppUser[];
  notifications: NotificationItem[];
  settings: ShopSettings;

  // Actions
  refreshData: () => Promise<void>;
createOrder: (orderData: any) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, staffName?: string, notes?: string) => void;
  updateLoyaltyRules: (rules: LoyaltyTierRule[]) => void;
  updateLoyaltyRule: (rule: LoyaltyTierRule) => void;
  updateServices: (services: ServiceItem[]) => void;
  addStaffMember: (staff: any) => void;
  updateStaffMember: (staff: StaffMember) => void;
  toggleStaffStatus: (id: string) => void;
  sendWhatsAppMessage: (payload: { phone: string; message: string; orderId?: string; customerName: string; customerId?: string; type?: NotificationItem['type']; allowDuplicate?: boolean }) => Promise<boolean>;
  retryWhatsAppNotification: (id: string) => void;
  updateSettings: (settings: ShopSettings) => void;
  setSettings: (settings: ShopSettings) => void;
  resetAllData: () => void;

  // Toast UI
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Modals
  whatsAppModalOrder: Order | null;
  setWhatsAppModalOrder: (order: Order | null) => void;
  invoiceModalOrder: Order | null;
  setInvoiceModalOrder: (order: Order | null) => void;
  isPublicBookingOpen: boolean;
  setIsPublicBookingOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentViewState] = useState<AppView>('public-home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Owner/Admin');
  const [currentUserName, setCurrentUserName] = useState<string>('J. Sai Kumar');
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isPublicBookingOpen, setIsPublicBookingOpen] = useState<boolean>(false);

  // Safe view switcher handling legacy views
  const setCurrentView = (view: any) => {
    if (view === 'inventory' || view === 'staff') {
      setCurrentViewState('dashboard');
    } else if (view === 'reports') {
      setCurrentViewState('analytics');
    } else {
      setCurrentViewState(view as AppView);
    }
  };

  // Data states
  const [orders, setOrders] = useState<Order[]>(() => orderService.getOrders());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loyaltyRules, setLoyaltyRules] = useState<LoyaltyTierRule[]>(() => loyaltyService.getRules());
  const [services, setServices] = useState<ServiceItem[]>(() => serviceCatalogService.getServices());
  const [staff, setStaff] = useState<StaffMember[]>(() => staffService.getStaff());
  const [users, setUsers] = useState<AppUser[]>(() => userService.getUsers());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => whatsappService.getNotifications());
  const [settings, setSettingsState] = useState<ShopSettings>(() => settingsService.getSettings());

  // UI Modals
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  const refreshData = async (): Promise<void> => {
    setOrders(orderService.getOrders());
    setLoyaltyRules(loyaltyService.getRules());
    setServices(serviceCatalogService.getServices());
    setStaff(staffService.getStaff());
    setUsers(userService.getUsers());
    setNotifications(whatsappService.getNotifications());
    setSettingsState(settingsService.getSettings());

    // Customer data is read from Firestore only after Firebase authentication.
    if (!auth.currentUser) {
      setCustomers([]);
      return;
    }

    try {
      const [firestoreCustomers, firestoreOrders] = await Promise.all([
  firestoreCustomerService.getCustomers(),
  firestoreOrderService.getOrders(),
]);



setCustomers(firestoreCustomers);
setOrders(firestoreOrders);
    } catch (error) {
      console.error('Failed to load customers from Firestore:', error);
      setCustomers([]);
      addToast(
        'error',
        'Customer Loading Failed',
        'Firebase blocked customer access. Check your Firestore rules and signed-in account.'
      );
    }
  };

  useEffect(() => {
    try {
      localStorage.removeItem('ambika_services_v2');
      localStorage.removeItem('ambika_services_v3');
      localStorage.removeItem('ambika_services_v4');
    } catch (_) {}

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        setCurrentUserRole('Owner/Admin');
        setCurrentUserName(firebaseUser.displayName || 'J. Sai Kumar');
        await refreshData();
      } else {
        setIsAuthenticated(false);
        setCustomers([]);
      }
    });

    // Load non-customer demo data at startup; customer reads wait for auth.
    setOrders(orderService.getOrders());
    setLoyaltyRules(loyaltyService.getRules());
    setServices(serviceCatalogService.getServices());
    setStaff(staffService.getStaff());
    setUsers(userService.getUsers());
    setNotifications(whatsappService.getNotifications());
    setSettingsState(settingsService.getSettings());

    return unsubscribe;
  }, []);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = (role: UserRole, name?: string) => {
    // This is UI role selection only; Firebase Authentication must already be active.
    if (!auth.currentUser) {
      addToast('error', 'Authentication Required', 'Sign in with your Firebase account first.');
      return;
    }

    setIsAuthenticated(true);
    setCurrentUserRole(role);
    const resolvedName = name || (role === 'Owner/Admin' ? 'J. Sai Kumar' : 'J. Sai Kumar');
    setCurrentUserName(resolvedName);
    setCurrentView('dashboard');
    addToast('success', `Signed in as ${role}`, `Welcome, ${resolvedName} (${role})`);
    void refreshData();
  };

  const loginAsOwner = () => {
    if (!auth.currentUser) {
      addToast('error', 'Login Required', 'Sign in with your registered email and password.');
      return;
    }
    login('Owner/Admin', auth.currentUser.displayName || 'J. Sai Kumar');
  };

  const loginAsStaff = () => {
    // Staff role is not separately authorized yet. Do not grant it via a local button.
    addToast('error', 'Staff Login Not Configured', 'A separate Firebase staff account and role rule must be configured first.');
  };

  const logout = () => {
    void signOut(auth).then(() => {
      setIsAuthenticated(false);
      setCurrentUserRole('Owner/Admin');
      setCurrentUserName('J. Sai Kumar');
      setCustomers([]);
      setCurrentView('public-home');
      addToast('info', 'Logged Out', 'Signed out from Ambika Dry Wash management system.');
    }).catch((error) => {
      console.error('Firebase logout failed:', error);
      addToast('error', 'Logout Failed', 'Could not sign out. Please try again.');
    });
  };

  const openOrderDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentView('order-detail');
  };

  const openCustomerProfile = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setCurrentView('customer-profile');
  };

  const createOrder = async (orderData: any): Promise<Order> => {
  const newOrder = orderService.createOrder(orderData);

  try {
    // Wait until Firebase confirms the order is saved.
    await firestoreOrderService.saveOrder(newOrder);

    // Refresh application data after successful save.
    await refreshData();

    addToast(
      'success',
      'Order Registered',
      `Order ${newOrder.orderId} saved successfully to Firebase.`
    );

    try {
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.85 } });
    } catch (_) {}

    return newOrder;

  } catch (error) {
    console.error('FIRESTORE ORDER ERROR:', error);

    addToast(
      'error',
      'Firebase Order Failed',
      `Order ${newOrder.orderId} could not be saved. Check the browser console.`
    );

    throw error;
  }
};

  const updateOrderStatus = (
  orderId: string,
  status: OrderStatus,
  staffName?: string,
  notes?: string
) => {
  const activeStaff = staffName || currentUserName || 'Front Desk Staff';

  const updated = orderService.updateOrderStatus(
    orderId,
    status,
    activeStaff,
    notes
  );

  if (!updated) return;

  // Update the screen immediately
  setOrders((previous) =>
    previous.map((order) =>
      order.orderId === orderId ? updated : order
    )
  );

  // Persist status and timeline in Firestore
  void firestoreOrderService.saveOrder(updated)
    .then(async () => {
      await refreshData();

      addToast(
        'success',
        'Status Updated',
        `Order ${orderId} and its timeline saved successfully.`
      );
    })
    .catch((error) => {
      console.error('Firestore status update failed:', error);

      addToast(
        'error',
        'Firebase Update Failed',
        'Could not save the order status. Check the browser console.'
      );
    });
};

  const updateLoyaltyRules = (rules: LoyaltyTierRule[]) => {
    loyaltyService.saveRules(rules);
    refreshData();
    addToast('success', 'Loyalty Rules Saved', 'Discount tiers updated.');
  };

  const updateLoyaltyRule = (rule: LoyaltyTierRule) => {
    const current = loyaltyService.getRules();
    const updated = current.map((r) => (r.level === rule.level ? rule : r));
    loyaltyService.saveRules(updated);
    refreshData();
  };

  const updateServices = (newServices: ServiceItem[]) => {
    serviceCatalogService.saveServices(newServices);
    refreshData();
    addToast('success', 'Services Updated', 'Service price catalog saved.');
  };

  const addStaffMember = (newMember: any) => {
    staffService.addStaff(newMember);
    refreshData();
    addToast('success', 'Staff Added', `${newMember.name} registered.`);
  };

  const updateStaffMember = (member: StaffMember) => {
    staffService.updateStaff(member);
    refreshData();
    addToast('info', 'Staff Updated', `${member.name}'s details saved.`);
  };

  const toggleStaffStatus = (id: string) => {
    const updated = staffService.toggleStaffStatus(id);
    refreshData();
    if (updated) {
      addToast('info', 'Status Updated', `${updated.name} is now ${updated.status}.`);
    }
  };

  const sendWhatsAppMessage = async (payload: {
    phone: string;
    message: string;
    orderId?: string;
    customerName: string;
    customerId?: string;
    type?: NotificationItem['type'];
    allowDuplicate?: boolean;
  }): Promise<boolean> => {
    const result = whatsappService.sendNotification({
      orderId: payload.orderId,
      customerId: payload.customerId,
      customerName: payload.customerName,
      customerPhone: payload.phone,
      type: payload.type || 'Ready for Pickup',
      message: payload.message,
      allowDuplicate: payload.allowDuplicate,
    });
    refreshData();
    if (result.isDuplicate) {
      addToast('info', 'Already Dispatched', `WhatsApp notification for ${payload.orderId || payload.customerName} was recently sent.`);
    } else {
      addToast('success', 'WhatsApp Draft Recorded', `Notification prepared for ${payload.customerName}. WhatsApp opens separately; delivery is not confirmed by this app.`);
    }
    return true;
  };

  const retryWhatsAppNotification = (notificationId: string) => {
    const updated = whatsappService.retryNotification(notificationId);
    refreshData();
    if (updated) {
      addToast('success', 'Notification Retried', `Re-dispatched notification to ${updated.customerName}.`);
    } else {
      addToast('error', 'Retry Failed', 'Notification record not found.');
    }
  };

  const updateSettings = (newSettings: ShopSettings) => {
    settingsService.saveSettings(newSettings);
    refreshData();
    addToast('success', 'Settings Saved', 'Shop configuration updated successfully.');
  };

  const setSettings = (newSettings: ShopSettings) => {
    updateSettings(newSettings);
  };

  const resetAllData = () => {
    localStorage.clear();
    refreshData();
    addToast('warning', 'Data Reset', 'All database tables restored to initial demonstration dataset.');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        isAuthenticated,
        isOwnerAuthenticated: currentUserRole === 'Owner/Admin',
        currentUserRole,
        currentUserName,
        login,
        loginAsOwner,
        loginAsStaff,
        logout,
        selectedOrderId,
        setSelectedOrderId,
        selectedCustomerId,
        setSelectedCustomerId,
        openOrderDetail,
        openCustomerProfile,
        orders,
        customers,
        loyaltyRules,
        services,
        staff,
        users,
        notifications,
        settings,
        refreshData,
        createOrder,
        updateOrderStatus,
        updateLoyaltyRules,
        updateLoyaltyRule,
        updateServices,
        addStaffMember,
        updateStaffMember,
        toggleStaffStatus,
        sendWhatsAppMessage,
        retryWhatsAppNotification,
        updateSettings,
        setSettings,
        resetAllData,
        toasts,
        addToast,
        removeToast,
        whatsAppModalOrder,
        setWhatsAppModalOrder,
        invoiceModalOrder,
        setInvoiceModalOrder,
        isPublicBookingOpen,
        setIsPublicBookingOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
