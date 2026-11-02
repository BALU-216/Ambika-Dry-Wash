import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Repeat,
  Download, 
  Printer, 
  Calendar,
  FileText
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { StatusBadge } from '../common/Badge';

export const AnalyticsView: React.FC = () => {
  const { orders, customers, addToast, openOrderDetail } = useApp();
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filter orders based on date range
  const now = new Date();
  const filteredOrders = orders.filter((order) => {
    if (dateRange === 'all') return true;
    const orderDate = new Date(order.orderDate);
    if (isNaN(orderDate.getTime())) return true;

    if (dateRange === 'today') {
      return orderDate.toDateString() === now.toDateString();
    }
    if (dateRange === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= sevenDaysAgo;
    }
    if (dateRange === 'month') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // Exclude cancelled for revenue and repeat customer calculations
  const qualifyingFilteredOrders = filteredOrders.filter(o => o.status !== 'Cancelled');
  const allQualifyingOrders = orders.filter(o => o.status !== 'Cancelled');

  // 1. Total Orders in period
  const totalOrders = filteredOrders.length;

  // 2. Revenue for selected period
  const periodRevenue = qualifyingFilteredOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  // Group qualifying orders by customer identity to determine Repeat Customers
  const customerOrderCounts = new Map<string, number>();
  allQualifyingOrders.forEach((o) => {
    const identity = (o.customerPhone || o.customerId || o.customerName || '').trim();
    if (identity) {
      customerOrderCounts.set(identity, (customerOrderCounts.get(identity) || 0) + 1);
    }
  });

  // Repeat Customers: at least two qualifying orders
  let repeatCustomersCount = 0;
  customerOrderCounts.forEach((count) => {
    if (count >= 2) {
      repeatCustomersCount++;
    }
  });

  // Unique customers associated with the selected period
  const periodCustomerIdentities = new Set<string>();
  filteredOrders.forEach((o) => {
    const identity = (o.customerPhone || o.customerId || o.customerName || '').trim();
    if (identity) periodCustomerIdentities.add(identity);
  });
  const totalCustomers = dateRange === 'all' 
    ? Math.max(customers.length, customerOrderCounts.size) 
    : periodCustomerIdentities.size;

  // Orders by Current Status (deterministic breakdown from filtered orders: 3 main statuses)
  const statusCounts: Record<string, number> = {
    'Order Received': 0,
    'Ready for Pickup': 0,
    'Delivered to Customer': 0,
  };

  filteredOrders.forEach((o) => {
    if (o.status === 'Order Received' || (o.status as string) === 'Processing') {
      statusCounts['Order Received'] += 1;
    } else if (o.status === 'Ready for Pickup' || (o.status as string) === 'Ready for Pickup / Delivery') {
      statusCounts['Ready for Pickup'] += 1;
    } else if (o.status === 'Delivered to Customer' || (o.status as string) === 'Delivered / Collected' || (o.status as string) === 'Delivered' || (o.status as string) === 'Completed') {
      statusCounts['Delivered to Customer'] += 1;
    }
  });

  const statusChartData = [
    { name: 'Order Received', count: statusCounts['Order Received'] },
    { name: 'Ready for Pickup', count: statusCounts['Ready for Pickup'] },
    { name: 'Delivered to Customer', count: statusCounts['Delivered to Customer'] },
  ];

  // Service Usage breakdown from filtered orders
  const serviceUsageMap: Record<string, { count: number; revenue: number }> = {};
  filteredOrders.forEach((order) => {
    order.items.forEach((item) => {
      const name = item.serviceName || 'Wash & Care';
      if (!serviceUsageMap[name]) {
        serviceUsageMap[name] = { count: 0, revenue: 0 };
      }
      serviceUsageMap[name].count += item.quantity || 1;
      serviceUsageMap[name].revenue += item.totalPrice || 0;
    });
  });

  const serviceChartData = Object.entries(serviceUsageMap).map(([name, data]) => ({
    name,
    garments: data.count,
    revenue: data.revenue,
  }));

  // Export CSV of the basic order and revenue report
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      addToast('error', 'Export Failed', 'No order records available for the selected period.');
      return;
    }

    const headers = 'Order ID,Customer Name,Phone Number,Main Service,Garments,Final Amount (INR),Status,Order Date';
    const rows = filteredOrders.map((o) => {
      const mainService = o.items[0]?.serviceName || 'Wash & Care';
      const safeName = `"${o.customerName.replace(/"/g, '""')}"`;
      return `${o.orderId},${safeName},${o.customerPhone},"${mainService}",${o.totalGarments},${o.finalAmount},"${o.status}",${o.orderDate}`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ambika_Dry_Wash_Report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Report Exported', 'CSV summary downloaded successfully.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Business Analytics & Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              Ambika Dry Wash • Patamata
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Auditable business analytics, service usage, and operational revenue reporting.
          </p>
        </div>

        {/* Date Filter & Export Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Current Month</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Print report"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* 4 Essential Summary Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Customers</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
              {totalCustomers}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              {dateRange === 'all' ? 'Registered Patamata patrons' : 'Active in selected period'}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">
              {totalOrders}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Orders in period</span>
          </div>
        </div>

        {/* Repeat Customers */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Repeat Customers</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Repeat className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono block">
              {repeatCustomersCount}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">≥2 qualifying orders</span>
          </div>
        </div>

        {/* Revenue for Selected Period */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Period Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <IndianRupee className="w-4 h-4 shrink-0" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block">
              ₹{periodRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Net payable collected</span>
          </div>
        </div>
      </div>

      {/* 2 Simple Charts: Orders by Current Status & Service Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Simple Status Distribution */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4 min-w-0">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Orders by Current Status</h3>
            <p className="text-xs text-slate-500">Actual workflow status distribution in selected period</p>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              No orders available for status aggregation.
            </div>
          ) : (
            <div className="h-52 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Simple Service Usage */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4 min-w-0">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Service Usage</h3>
            <p className="text-xs text-slate-500">Garment volume across dry wash & laundry services</p>
          </div>

          {serviceChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-400">
              No service line data in selected period.
            </div>
          ) : (
            <div className="h-52 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="garments" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Basic Order and Revenue Report Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                Order & Revenue Report
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detailed ledger records for the active period filter
            </p>
          </div>

          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            {filteredOrders.length} records • ₹{periodRevenue.toLocaleString('en-IN')} total
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No data available for the selected period.</p>
            <p className="text-xs text-slate-400">Try changing the date filter to "All Time".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4">Main Service</th>
                  <th className="py-3 px-4 text-center">Garments</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      <button
                        onClick={() => openOrderDetail(order.orderId)}
                        className="hover:underline cursor-pointer"
                      >
                        {order.orderId}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {order.customerName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      +91 {order.customerPhone}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {order.items[0]?.serviceName || 'Wash & Care'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {order.totalGarments}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{order.finalAmount}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(order.orderDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
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
