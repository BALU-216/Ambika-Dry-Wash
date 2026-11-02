import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PublicLayout } from './components/public/PublicLayout';
import { OwnerLogin } from './components/auth/OwnerLogin';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { OrdersView } from './components/dashboard/OrdersView';
import { NewOrderView } from './components/dashboard/NewOrderView';
import { OrderDetailView } from './components/dashboard/OrderDetailView';
import { CustomersView } from './components/dashboard/CustomersView';
import { CustomerProfileView } from './components/dashboard/CustomerProfileView';
import { LoyaltyView } from './components/dashboard/LoyaltyView';
import { ServicesManageView } from './components/dashboard/ServicesManageView';
import { AnalyticsView } from './components/dashboard/AnalyticsView';
import { WhatsAppView } from './components/dashboard/WhatsAppView';
import { DeliveryView } from './components/dashboard/DeliveryView';
import { SettingsView } from './components/dashboard/SettingsView';
import { ToastContainer } from './components/common/Toast';
import { WhatsAppModal } from './components/common/WhatsAppModal';
import { InvoiceModal } from './components/common/InvoiceModal';

const AppContent: React.FC = () => {
  const { currentView, isAuthenticated, whatsAppModalOrder, setWhatsAppModalOrder } = useApp();

  // Public website views
  if (
    currentView === 'public-home' ||
    currentView === 'public-services' ||
    currentView === 'public-pricing' ||
    currentView === 'public-about' ||
    currentView === 'public-contact'
  ) {
    return <PublicLayout />;
  }

  // Owner / Staff authentication screen
  if (currentView === 'owner-login' || !isAuthenticated) {
    return <OwnerLogin />;
  }

  // Owner & Staff management portal views
  return (
    <>
      <DashboardLayout>
        {currentView === 'dashboard' && <DashboardOverview />}
        {currentView === 'orders' && <OrdersView />}
        {currentView === 'new-order' && <NewOrderView />}
        {currentView === 'order-detail' && <OrderDetailView />}
        {currentView === 'customers' && <CustomersView />}
        {currentView === 'customer-profile' && <CustomerProfileView />}
        {currentView === 'loyalty' && <LoyaltyView />}
        {currentView === 'services-manage' && <ServicesManageView />}
        {currentView === 'delivery' && <DeliveryView />}
        {currentView === 'analytics' && <AnalyticsView />}
        {currentView === 'whatsapp' && <WhatsAppView />}
        {currentView === 'settings' && <SettingsView />}
      </DashboardLayout>
      <WhatsAppModal order={whatsAppModalOrder} onClose={() => setWhatsAppModalOrder(null)} />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <ToastContainer />
      <InvoiceModal />
    </AppProvider>
  );
}
