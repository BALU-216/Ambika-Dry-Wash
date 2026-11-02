import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { firestoreCustomerService, loyaltyService } from '../../services/apiService';import { OrderItem, OrderPriority, Customer } from '../../types';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ArrowLeft,
  Calendar,
  Truck,
  IndianRupee,
  Clock,
  Sparkles
} from 'lucide-react';
import { LoyaltyBadge } from '../common/Badge';

interface FormItem {
  serviceId: string;
  serviceName: string;
  garmentType: string;
  quantity: number;
  unitPrice: number | '';
  totalPrice: number;
  unit: string;
}

export const NewOrderView: React.FC = () => {
const {
  services, staff, customers, createOrder,
  setCurrentView, openOrderDetail, addToast, refreshData
} = useApp();
  // 1. Customer Lookup State (Mobile Number is primary identifier)
  const [phoneSearch, setPhoneSearch] = useState('');
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('Patamata, Vijayawada');

  // 2. Order Line Items - Strictly manual staff rate entry (rates start empty, NO predefined prices)
  const [items, setItems] = useState<FormItem[]>([
    {
      serviceId: services[0]?.id || 'srv-sarees',
      serviceName: services[0]?.name || 'Sarees',
      garmentType: '',
      quantity: 1,
      unitPrice: '', // STARTS EMPTY
      totalPrice: 0,
      unit: 'pieces',
    },
  ]);

  // 3. Priority & Special Requirements - Exact 3 turnaround options
  const [priority, setPriority] = useState<OrderPriority>('7 Days');
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(['Steam press only']);
  const [customReq, setCustomReq] = useState('');

  // 4. Logistics: Delivery Required YES / NO & Manual Delivery Charge
  const [deliveryRequired, setDeliveryRequired] = useState<boolean>(false);
  const [deliveryOption, setDeliveryOption] = useState<'Shop Pickup' | 'Doorstep Delivery'>('Shop Pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('Patamata, Vijayawada');
  const [deliveryCharge, setDeliveryCharge] = useState<number | ''>(''); // STARTS EMPTY

  // 5. Payment & Staff
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI / QR' | 'Card' | 'Pending'>('UPI / QR');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [assignedStaffId, setAssignedStaffId] = useState<string>(staff[0]?.id || 'stf-01');

  // Estimated Turnaround calculation based on the 3 options
  // 7 Days = 168h, 4–5 Days = 108h, 2 Days = 48h
  const initialEstHours = 168;
  const initialEstDate = new Date(Date.now() + initialEstHours * 60 * 60 * 1000);
  const [estimatedDateStr, setEstimatedDateStr] = useState<string>(
    initialEstDate.toISOString().slice(0, 16)
  );

  // Exact Care & Handling preset options requested:
  // - Light Starch (Added)
  // - More Starch (Added)
  // - Removed Stain Removal on Collar/Cuff
  // - Removed Hanger Packing with Polybag
  // - Preserved all other existing care options
  const presetRequirements = [
    'Handle with care',
    'Light Starch',
    'More Starch',
    'Steam press only',
    'Separate whites',
    'Delicate silk saree handling',
  ];

  // Auto Search effect on typing phone number
  useEffect(() => {
    const cleanPhone = phoneSearch.replace(/\D/g, '');
    if (cleanPhone.length >= 6) {
const match = customers.find(
  (c) => c.phone.replace(/\D/g, '').slice(-10) === cleanPhone.slice(-10)
);      if (match) {
        setFoundCustomer(match);
        setIsNewCustomer(false);
        if (match.address) {
          setDeliveryAddress(match.address);
        }
      } else {
        setFoundCustomer(null);
        setIsNewCustomer(true);
      }
    } else {
      setFoundCustomer(null);
      setIsNewCustomer(false);
    }
}, [phoneSearch, customers]);
  // Recalculate estimated turnaround on turnaround priority change
  useEffect(() => {
    const hours = priority === '2 Days' ? 48 : priority === '4–5 Days' ? 108 : 168;
    const est = new Date(Date.now() + hours * 60 * 60 * 1000);
    setEstimatedDateStr(est.toISOString().slice(0, 16));
  }, [priority]);

  // Line item handlers - Preserves manual rate when changing service
  const handleItemServiceChange = (index: number, serviceId: string) => {
    const srv = services.find((s) => s.id === serviceId);
    if (!srv) return;

    const newItems = [...items];
    const preservedRate = newItems[index].unitPrice;
    const numericRate = typeof preservedRate === 'number' ? preservedRate : 0;
    newItems[index] = {
      ...newItems[index],
      serviceId: srv.id,
      serviceName: srv.name,
      // Retain manually entered rate and recalculate line total
      unitPrice: preservedRate,
      totalPrice: newItems[index].quantity * numericRate,
      unit: newItems[index].unit || 'pieces',
    };
    setItems(newItems);
  };

  const handleItemGarmentDescChange = (index: number, desc: string) => {
    const newItems = [...items];
    newItems[index].garmentType = desc;
    setItems(newItems);
  };

  const handleItemQuantityChange = (index: number, qtyStr: string) => {
    const newItems = [...items];
    const val = parseInt(qtyStr, 10);
    const validQty = isNaN(val) ? 1 : Math.max(1, val);
    newItems[index].quantity = validQty;
    const numericRate = typeof newItems[index].unitPrice === 'number' ? newItems[index].unitPrice : 0;
    newItems[index].totalPrice = validQty * numericRate;
    setItems(newItems);
  };

  const handleItemUnitPriceChange = (index: number, rateStr: string) => {
    const newItems = [...items];
    if (rateStr === '') {
      newItems[index].unitPrice = '';
      newItems[index].totalPrice = 0;
    } else {
      const val = parseFloat(rateStr);
      const cleanVal = isNaN(val) || val < 0 ? 0 : val;
      newItems[index].unitPrice = cleanVal;
      newItems[index].totalPrice = newItems[index].quantity * cleanVal;
    }
    setItems(newItems);
  };

  const handleItemUnitChange = (index: number, unit: string) => {
    const newItems = [...items];
    newItems[index].unit = unit;
    setItems(newItems);
  };

  const addItemRow = () => {
    const defaultSrv = services[0] || { id: 'srv-sarees', name: 'Sarees' };
    setItems([
      ...items,
      {
        serviceId: defaultSrv.id,
        serviceName: defaultSrv.name,
        garmentType: '',
        quantity: 1,
        unitPrice: '', // STARTS EMPTY FOR EVERY NEW ITEM
        totalPrice: 0,
        unit: 'pieces',
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const toggleRequirement = (req: string) => {
    if (selectedRequirements.includes(req)) {
      setSelectedRequirements(selectedRequirements.filter((r) => r !== req));
    } else {
      setSelectedRequirements([...selectedRequirements, req]);
    }
  };

  const addCustomRequirement = () => {
    if (!customReq.trim()) return;
    if (!selectedRequirements.includes(customReq.trim())) {
      setSelectedRequirements([...selectedRequirements, customReq.trim()]);
    }
    setCustomReq('');
  };

  // Logistics delivery toggle handlers
  const handleSelectShopPickup = () => {
    setDeliveryRequired(false);
    setDeliveryOption('Shop Pickup');
    setDeliveryCharge(''); // Charge must be zero and immediately excluded
  };

  const handleSelectDoorstepDelivery = () => {
    setDeliveryRequired(true);
    setDeliveryOption('Doorstep Delivery');
    setDeliveryCharge(''); // Reset to empty; requires staff entry
  };

  // Financial Calculations according to exact specifications:
  // Line Amount = Quantity × Rate
  // Subtotal = Sum of all item line amounts
  // Total Before Discounts = Subtotal + Applicable Delivery Charge
  // Final Total = Total Before Discounts − Valid Discount
  const totalGarments = items.reduce((sum, item) => sum + (typeof item.quantity === 'number' ? item.quantity : 0), 0);
  const subtotalAmount = items.reduce((sum, item) => sum + (typeof item.unitPrice === 'number' ? item.quantity * item.unitPrice : 0), 0);

  const appliedDeliveryCharge = (deliveryRequired && typeof deliveryCharge === 'number' && deliveryCharge >= 0) ? deliveryCharge : 0;
  const totalBeforeDiscounts = subtotalAmount + appliedDeliveryCharge;

  // Deterministic loyalty calculations based on order count
  const totalOrders = foundCustomer ? foundCustomer.totalOrders : 0;
  const tierInfo = loyaltyService.calculateTier(totalOrders);
  const effectiveLoyaltyLevel = foundCustomer ? foundCustomer.loyaltyLevel : tierInfo.tier;
  const discountPct = tierInfo.discountPercent;
  const discountAmount = Math.round((subtotalAmount * discountPct) / 100);
  const finalAmount = Math.max(0, totalBeforeDiscounts - discountAmount);

  // Submit Handler with strict validations
const handleSaveOrder = async (e: React.FormEvent) => {    e.preventDefault();

    if (!phoneSearch.trim()) {
      addToast('error', 'Validation Error', 'Customer Mobile Number is required.');
      return;
    }

    let customerToUse: Customer;

    if (foundCustomer) {
  customerToUse = foundCustomer;
} else if (isNewCustomer && newCustomerName.trim()) {
  try {
    customerToUse = await firestoreCustomerService.createCustomer({
      name: newCustomerName.trim(),
      phone: phoneSearch.trim(),
      address: newCustomerAddress.trim(),
    });
    await refreshData();
  } catch (error) {
    console.error(error);
    addToast('error', 'Customer Error', 'Could not save customer to Firebase.');
    return;
  }
} else {
  addToast('error', 'Validation Error', 'Please enter customer name.');
  return;
}

    // Validate that items are not empty
    if (!items || items.length === 0) {
      addToast('error', 'Validation Error', 'Please add at least one garment line item.');
      return;
    }

    // Validate that staff entered a manual rate for every line item (cannot be empty, NaN, or <= 0)
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.quantity || it.quantity <= 0) {
        addToast('error', 'Validation Error', `Quantity must be 1 or more for item #${i + 1}.`);
        return;
      }
      if (it.unitPrice === '' || typeof it.unitPrice !== 'number' || it.unitPrice <= 0) {
        addToast(
          'error',
          'Manual Rate Required',
          `Please enter a valid rate (₹) greater than 0 for item #${i + 1} (${it.garmentType || it.serviceName}). Per shop policy, staff must manually enter each garment rate.`
        );
        return;
      }
    }

    // Validate delivery charge if Doorstep Delivery is selected
    if (deliveryRequired) {
      if (deliveryCharge === '' || typeof deliveryCharge !== 'number' || deliveryCharge < 0) {
        addToast(
          'error',
          'Delivery Charge Required',
          'Please enter the manual Delivery Charge (₹) for Doorstep Delivery. It cannot be left empty.'
        );
        return;
      }
      if (!deliveryAddress.trim()) {
        addToast('error', 'Validation Error', 'Delivery Address is required for Doorstep Delivery.');
        return;
      }
    }

    const assignedStaff = staff.find((s) => s.id === assignedStaffId);

    const sanitizedItems: OrderItem[] = items.map((it) => ({
      serviceId: it.serviceId,
      serviceName: it.serviceName,
      garmentType: it.garmentType.trim() || it.serviceName,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
      totalPrice: Number(it.quantity) * Number(it.unitPrice),
      unit: it.unit || 'pieces',
    }));

const newOrder = await createOrder({    
  customerId: customerToUse.id,
      customerName: customerToUse.name,
      customerPhone: customerToUse.phone,
      items: sanitizedItems,
      totalGarments,
      subtotalAmount,
      deliveryCharge: deliveryRequired ? Number(deliveryCharge) : 0,
      loyaltyLevelApplied: customerToUse.loyaltyLevel,
      discountPercentage: discountPct,
      discountAmount,
      finalAmount,
      priority,
      customerRequirements: selectedRequirements,
      status: 'Order Received',
      estimatedCompletion: new Date(estimatedDateStr).toISOString(),
      deliveryRequired,
      deliveryOption: deliveryRequired ? 'Doorstep Delivery' : 'Shop Pickup',
      deliveryAddress: deliveryRequired ? deliveryAddress : undefined,
      paymentMethod,
      paymentStatus: paymentMethod === 'Pending' ? 'Unpaid' : paymentStatus,
      assignedStaffName: assignedStaff ? `${assignedStaff.name} (${assignedStaff.role})` : 'Front Desk Staff',
    });

    refreshData();
    

    openOrderDetail(newOrder.orderId);
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200 min-w-0">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setCurrentView('orders')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Orders List</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Patamata Intake Counter</span>
          <p className="text-xs font-bold text-blue-600">Ambika Dry Wash</p>
        </div>
      </div>

      <form onSubmit={handleSaveOrder} className="space-y-5 sm:space-y-6">
        {/* SECTION 1: CUSTOMER IDENTIFICATION VIA MOBILE */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customer Identification (Mobile Number)</h3>
                <p className="text-xs text-slate-500">Search existing patrons or automatically register new customer</p>
              </div>
            </div>
            {foundCustomer && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Returning Patron ({foundCustomer.totalOrders} Orders)</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-mono">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}href="https://wa.me/6301682969..."
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value.replace(/\D/g, ''))}
                  placeholder="6301682969"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Enter 10-digit mobile number</span>
            </div>

            {/* Existing Customer Found Card */}
            {foundCustomer && (
              <div className="md:col-span-2 bg-blue-50/70 border border-blue-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{foundCustomer.name}</span>
                    <LoyaltyBadge level={foundCustomer.loyaltyLevel} />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 truncate">{foundCustomer.address || 'Patamata, Vijayawada'}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-blue-700 block">
                    {tierInfo.discountPercent}% Loyalty Discount
                  </span>
                  <span className="text-[10px] text-slate-500">Tier: {effectiveLoyaltyLevel}</span>
                </div>
              </div>
            )}

            {/* New Customer Form */}
            {isNewCustomer && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-emerald-600 font-medium mt-1 block">New Bronze tier account</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Locality / Address
                  </label>
                  <input
                    type="text"
                    value={newCustomerAddress}
                    onChange={(e) => setNewCustomerAddress(e.target.value)}
                    placeholder="Patamata, Vijayawada"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECTION 2: GARMENTS & SERVICES INTAKE — STRICTLY MANUAL RATES */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Garment & Service Intake</h3>
                <p className="text-xs text-slate-500">
                  Manual pricing: Select service type, enter fabric details, and specify custom unit rate for each garment
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addItemRow}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span>Add Garment Line</span>
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
              >
                {/* Row Header with Item Number */}
                <div className="flex items-center justify-between gap-2 pb-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Garment Item #{idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Service Selector (No predefined prices in dropdown) */}
                  <div className="md:col-span-5">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Garment / Service Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={item.serviceId}
                      onChange={(e) => handleItemServiceChange(idx, e.target.value)}
                      className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {s.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Garment Description / Fabric Note */}
                  <div className="md:col-span-7">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Garment Description & Fabric Details
                    </label>
                    <input
                      type="text"
                      value={item.garmentType}
                      onChange={(e) => handleItemGarmentDescChange(idx, e.target.value)}
                      placeholder="e.g. Silk Saree with zari, Linen Shirts, Formal Trousers, Woolen Coat"
                      className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Quantitative Details: Billing Unit, Quantity, Manual Rate, Line Amount */}
                <div className="flex flex-wrap items-end justify-between gap-3 pt-2 border-t border-slate-200/60">
                  <div className="flex flex-wrap items-end gap-3">
                    {/* Unit Selector */}
                    <div className="w-28">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Billing Unit</label>
                      <select
                        value={item.unit || 'pieces'}
                        onChange={(e) => handleItemUnitChange(idx, e.target.value)}
                        className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="pieces">pieces</option>
                        <option value="kg">kg</option>
                        <option value="garment">garment</option>
                        <option value="saree">saree</option>
                        <option value="pair">pair</option>
                        <option value="set">set</option>
                        <option value="meter">meter</option>
                        <option value="service unit">service unit</option>
                      </select>
                    </div>

                    {/* Quantity Input */}
                    <div className="w-20">
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemQuantityChange(idx, e.target.value)}
                        className="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-center text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    {/* Manual Rate Input (Starts Empty, No Preset Value) */}
                    <div className="w-32">
                      <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                        Rate (₹/{item.unit || 'pc'}) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          placeholder="Enter rate"
                          value={item.unitPrice}
                          onChange={(e) => handleItemUnitPriceChange(idx, e.target.value)}
                          className={`w-full pl-6 pr-2 py-1.5 bg-white border rounded-xl font-mono font-bold text-right text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                            item.unitPrice === '' || item.unitPrice <= 0
                              ? 'border-amber-400 bg-amber-50/50 text-amber-900 placeholder:text-amber-400'
                              : 'border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Calculated Line Amount: Quantity × Rate */}
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Line Amount</span>
                    <span className="font-mono font-black text-slate-900 text-sm sm:text-base">
                      ₹{item.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-600 gap-2">
            <span className="text-slate-500">
              Total Garments: <strong className="text-slate-900 font-extrabold">{totalGarments} items</strong>
            </span>
            <span className="text-sm font-mono text-slate-900">
              Subtotal: <strong className="font-black text-base text-blue-600 font-mono">₹{subtotalAmount}</strong>
            </span>
          </div>
        </div>

        {/* SECTION 3: CUSTOMER INSTRUCTIONS & TURNAROUND OPTIONS (7 Days, 4–5 Days, 2 Days) */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Instructions & Turnaround Priority</h3>
              <p className="text-xs text-slate-500">Select target completion timeframe and care requirements</p>
            </div>
          </div>

          {/* Turnaround Options: 7 Days, 4–5 Days, 2 Days */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Turnaround Window</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {(['7 Days', '4–5 Days', '2 Days'] as OrderPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`p-3.5 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                    priority === p
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs ring-1 ring-blue-600'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-black text-sm">{p}</span>
                  <span className="text-[10px] font-normal text-slate-500 mt-0.5 block">
                    {p === '2 Days' ? 'Express Fast-Track' : p === '4–5 Days' ? 'Expedited Priority' : 'Standard 5–7 Days Cycle'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Requirements Chips (Light Starch, More Starch, etc.) */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Care & Handling Requirements</label>
            <div className="flex flex-wrap gap-2">
              {presetRequirements.map((req) => {
                const isSelected = selectedRequirements.includes(req);
                return (
                  <button
                    key={req}
                    type="button"
                    onClick={() => toggleRequirement(req)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {req}
                  </button>
                );
              })}
            </div>

            {/* Custom instruction note */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 mt-3">
              <input
                type="text"
                value={customReq}
                onChange={(e) => setCustomReq(e.target.value)}
                placeholder="Add custom customer note (e.g. Iron crease on sleeves)..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomRequirement}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer shrink-0"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: DELIVERY REQUIREMENT AND CHARGES */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Delivery Requirement</h3>
                <p className="text-xs text-slate-500">Patamata counter collection or doorstep drop-off</p>
              </div>
            </div>

            {/* Delivery Toggle: No — Shop Pickup / Yes — Doorstep Delivery */}
            <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={handleSelectShopPickup}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  !deliveryRequired
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                No — Shop Pickup
              </button>
              <button
                type="button"
                onClick={handleSelectDoorstepDelivery}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  deliveryRequired
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Yes — Doorstep Delivery
              </button>
            </div>
          </div>

          {deliveryRequired && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-200 animate-in fade-in duration-150">
              {/* Delivery Charge (Starts empty, manual input required) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Delivery Charge (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-mono">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required={deliveryRequired}
                    placeholder="Enter delivery charge"
                    value={deliveryCharge}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value));
                      setDeliveryCharge(val);
                    }}
                    className={`w-full pl-8 pr-3 py-2 bg-white border rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      deliveryCharge === '' || deliveryCharge < 0
                        ? 'border-amber-400 bg-amber-50/50 text-amber-900 placeholder:text-amber-400'
                        : 'border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Staff decides fee based on Vijayawada location distance
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Delivery Address in Vijayawada <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required={deliveryRequired}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street / Flat, Patamata, Vijayawada"
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Turnaround Estimate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Estimated Ready Date & Time</span>
              </label>
              <input
                type="datetime-local"
                value={estimatedDateStr}
                onChange={(e) => setEstimatedDateStr(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Front Desk Staff</label>
              <select
                value={assignedStaffId}
                onChange={(e) => setAssignedStaffId(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                {staff.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 5: FINAL BILL SUMMARY & CONFIRMATION */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Final Bill Summary</h3>
              <p className="text-xs text-slate-400">
                Item Line Amounts + Delivery Charge − Loyalty Discount = Final Total
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 shrink-0">Payment:</span>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="flex-1 sm:flex-none bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
              >
                <option value="UPI / QR">UPI / QR Code</option>
                <option value="Cash">Cash at Counter</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Pending">Pay on Delivery</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-xs">
            {/* Subtotal */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-slate-400 block text-[11px]">Subtotal (Garments)</span>
              <span className="text-base sm:text-lg font-black font-mono mt-1 block">₹{subtotalAmount}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{totalGarments} items</span>
            </div>

            {/* Delivery Charge */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-slate-400 block text-[11px]">Delivery Charge</span>
              <span className="text-base sm:text-lg font-black font-mono mt-1 block">
                {deliveryRequired ? `₹${appliedDeliveryCharge}` : '₹0'}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {deliveryRequired ? 'Doorstep Delivery' : 'Shop Pickup (Free)'}
              </span>
            </div>

            {/* Total Before Discounts */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-slate-400 block text-[11px]">Total Before Disc.</span>
              <span className="text-base sm:text-lg font-black font-mono mt-1 block">₹{totalBeforeDiscounts}</span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Subtotal + Delivery</span>
            </div>

            {/* Loyalty Discount */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-slate-400 block text-[11px]">
                Loyalty ({effectiveLoyaltyLevel})
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-1 block">
                -{discountPct}% (₹{discountAmount})
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Applied to subtotal</span>
            </div>

            {/* Final Total Payable */}
            <div className="bg-blue-600/30 p-3 rounded-2xl border border-blue-500/40 col-span-2 sm:col-span-1">
              <span className="text-blue-300 block text-[11px] font-bold">Final Total Payable</span>
              <span className="text-lg sm:text-2xl font-black font-mono text-white mt-0.5 block">
                ₹{finalAmount}
              </span>
              <span className="text-[10px] text-blue-200 mt-0.5 block">Net payable in ₹</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400 text-center sm:text-left">
              Ambika Dry Wash receipt and WhatsApp confirmation draft will be generated automatically.
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCurrentView('orders')}
                className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Confirm & Register Order</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
