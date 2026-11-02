import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LoyaltyTierRule } from '../../types';
import { 
  Award, 
  Gift, 
  Percent, 
  Save, 
  CheckCircle2,
  Sparkles,
  Users
} from 'lucide-react';
import { LoyaltyBadge } from '../common/Badge';

export const LoyaltyView: React.FC = () => {
  const { loyaltyRules, customers, updateLoyaltyRules, openCustomerProfile } = useApp();
  const [rules, setRules] = useState<LoyaltyTierRule[]>(loyaltyRules);

  const handleRuleChange = (index: number, field: keyof LoyaltyTierRule, value: number | string) => {
    const updated = [...rules];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setRules(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateLoyaltyRules(rules);
  };

  const getTierCount = (level: string) => customers.filter(c => c.loyaltyLevel === level).length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Loyalty Program & Rewards</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure automatic customer discounts and order-count milestones across Bronze, Silver, Gold, and Platinum tiers
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 sm:px-4 py-2 rounded-xl self-start sm:self-auto">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-amber-900">Automated Engine Active</span>
        </div>
      </div>

      {/* Tier Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {rules.map((rule) => {
          const count = getTierCount(rule.level);
          return (
            <div
              key={rule.level}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <LoyaltyBadge level={rule.level} size="md" showDiscount discountPercent={rule.discountPercentage} />
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{rule.level} Tier</h3>
                <p className="text-xs text-slate-500 mt-0.5">{rule.minOrders}+ completed orders</p>

                <div className="mt-3 space-y-1.5">
                  {rule.perks.slice(0, 3).map((perk, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="break-words">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Active Patrons
                </span>
                <span className="text-xl font-extrabold text-slate-900">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Form & Top Patrons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Customize Tier Thresholds & Discounts</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Changes immediately apply to the New Order billing calculator and Public Website
            </p>
          </div>

          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <div key={rule.level} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <LoyaltyBadge level={rule.level} size="md" />
                  <span className="text-xs font-semibold text-slate-500">{rule.description}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Minimum Completed Orders
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={rule.minOrders}
                      onChange={(e) => handleRuleChange(idx, 'minOrders', Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Automatic Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={rule.discountPercentage}
                        onChange={(e) => handleRuleChange(idx, 'discountPercentage', Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <Percent className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Loyalty Configuration
            </button>
          </div>
        </form>

        {/* Top Loyal Customers */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Top Loyal Patrons</h3>
            <p className="text-xs text-slate-500 mb-4">Customers actively receiving automatic loyalty benefits</p>

            <div className="space-y-3">
              {customers
                .filter(c => c.loyaltyLevel !== 'Bronze')
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 6)
                .map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => openCustomerProfile(c.id)}
                    className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/70 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {c.totalOrders} orders • ₹{c.totalSpent.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <LoyaltyBadge level={c.loyaltyLevel} />
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <div className="mt-6 bg-blue-50/70 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-1">
              <Gift className="w-4 h-4 text-blue-600 shrink-0" />
              Automatic Discount Engine
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              When an order is created at the counter, the customer's mobile number automatically looks up their completed order count and applies their eligible tier discount.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
