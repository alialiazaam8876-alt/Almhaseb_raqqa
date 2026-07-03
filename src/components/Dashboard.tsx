/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  DollarSign, ArrowUpRight, ArrowDownLeft, TrendingUp, ShoppingCart, 
  ShoppingBag, ClipboardList, Wallet, FileSpreadsheet, RefreshCw 
} from 'lucide-react';
import { AppState, Customer, Supplier } from '../types';

interface DashboardProps {
  state: AppState;
  setActiveTab: (tab: string) => void;
  onOpenVoucherModal: (type: 'receipt' | 'payment') => void;
  onOpenQuickTx: (type: 'sales' | 'purchases' | 'sales_return' | 'purchases_return') => void;
}

export default function Dashboard({ state, setActiveTab, onOpenVoucherModal, onOpenQuickTx }: DashboardProps) {
  // Calculate stats
  const totalReceivables = state.customers.reduce((sum, c) => c.balance > 0 ? sum + c.balance : sum, 0);
  const totalPayables = state.suppliers.reduce((sum, s) => s.balance > 0 ? sum + s.balance : sum, 0);

  // Calculate detailed revenues, expenses, cost of goods sold, profit
  const salesTransactions = state.transactions.filter(t => t.type === 'sales');
  const salesReturnTransactions = state.transactions.filter(t => t.type === 'sales_return');
  const purchaseTransactions = state.transactions.filter(t => t.type === 'purchases');
  const purchaseReturnTransactions = state.transactions.filter(t => t.type === 'purchases_return');

  const totalSalesRevenue = salesTransactions.reduce((sum, t) => sum + t.totalAmount, 0) - 
                             salesReturnTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

  const totalPurchasesExpense = purchaseTransactions.reduce((sum, t) => sum + t.totalAmount, 0) - 
                                 purchaseReturnTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

  // For profit calculation, let's calculate: Revenues - Cost of Goods Sold (COGS)
  // We'll map product sales to their average unitCost
  let cogs = 0;
  salesTransactions.forEach(t => {
    t.items.forEach(item => {
      const product = state.products.find(p => p.id === item.productId);
      const cost = product ? product.unitCost : 0;
      cogs += item.quantity * cost;
    });
  });
  salesReturnTransactions.forEach(t => {
    t.items.forEach(item => {
      const product = state.products.find(p => p.id === item.productId);
      const cost = product ? product.unitCost : 0;
      cogs -= item.quantity * cost;
    });
  });

  // Profit from sales
  const profitFromSales = totalSalesRevenue - cogs;

  // Other revenues (from generic revenue vouchers)
  const otherRevenues = state.vouchers
    .filter(v => v.type === 'revenue')
    .reduce((sum, v) => sum + v.amount, 0);

  // Other expenses (from generic expense vouchers)
  const otherExpenses = state.vouchers
    .filter(v => v.type === 'expense')
    .reduce((sum, v) => sum + v.amount, 0);

  const finalNetProfit = profitFromSales + otherRevenues - otherExpenses;

  // Safe box dynamic calculation or actual state value
  const formattedSafeBalance = state.safeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedNetProfit = finalNetProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedReceivables = totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedPayables = totalPayables.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      {/* Dynamic Top Grid for quick sales/purchases triggers */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Sales / POS */}
        <motion.button
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('sales')}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-[#2e7d6c] to-[#236f60] text-white rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all"
        >
          <ShoppingCart size={28} className="mb-2" />
          <span className="font-bold text-base md:text-lg">فاتورة المبيعات</span>
          <span className="text-xs text-green-100 mt-1">نظام المبيعات ونقاط البيع (POS)</span>
        </motion.button>

        {/* Purchases */}
        <motion.button
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('purchases')}
          className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-[#3d9970] to-[#2e7d6c] text-white rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all"
        >
          <ShoppingBag size={28} className="mb-2" />
          <span className="font-bold text-base md:text-lg">فاتورة المشتريات</span>
          <span className="text-xs text-green-100 mt-1">تسجيل بضاعة جديدة للمخزن</span>
        </motion.button>

        {/* Stock management */}
        <motion.button
          whileHover={{ scale: 1.02, translateY: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('inventory')}
          className="col-span-2 md:col-span-1 flex flex-col items-center justify-center p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all"
        >
          <ClipboardList size={28} className="mb-2" />
          <span className="font-bold text-base md:text-lg">المخزون والجرد</span>
          <span className="text-xs text-green-100 mt-1">جرد الأصناف وتعديل الكميات</span>
        </motion.button>
      </div>

      {/* Main Stats widgets mirroring Screenshot 2 */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 rounded-lg text-[#236f60]">
            <DollarSign size={24} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold block">رصيد الصندوق المتوفر حالياً</span>
            <span className="text-2xl font-black text-gray-800 font-mono">{formattedSafeBalance}</span>
            <span className="text-xs text-gray-400 mr-1">{state.currency}</span>
          </div>
        </div>
        <div className="bg-[#236f60]/10 text-[#236f60] font-extrabold text-sm px-4 py-2 rounded-lg">
          الصندوق
        </div>
      </div>

      {/* Customers and Suppliers Card section from Screenshot 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customers card */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-bold">العملاء - لك</h3>
              <p className="text-3xl font-black font-mono text-gray-800 mt-2">{formattedReceivables}</p>
              <p className="text-xs text-gray-400 mt-1">{state.currency}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#236f60] text-white flex items-center justify-center text-sm font-bold">
              {state.customers.length}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <span className="text-xs text-gray-400 block mb-2">إجراء سريع تحصيل:</span>
            <button 
              onClick={() => onOpenVoucherModal('receipt')}
              className="w-full py-2.5 bg-gradient-to-l from-[#3d9970] to-[#236f60] hover:bg-opacity-95 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1"
            >
              <Wallet size={16} />
              سند قبض (تحصيل عملاء)
            </button>
          </div>
        </div>

        {/* Suppliers card */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-bold">الموردون - عليك</h3>
              <p className="text-3xl font-black font-mono text-red-600 mt-2">{formattedPayables}</p>
              <p className="text-xs text-gray-400 mt-1">{state.currency}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">
              {state.suppliers.length}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <span className="text-xs text-gray-400 block mb-2">إجراء سريع سداد:</span>
            <button 
              onClick={() => onOpenVoucherModal('payment')}
              className="w-full py-2.5 bg-gradient-to-l from-red-600 to-[#b83321] hover:bg-opacity-95 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1"
            >
              <Wallet size={16} />
              سند صرف (سداد موردين)
            </button>
          </div>
        </div>
      </div>

      {/* Return Transactions grid from Screenshot 2 */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onOpenQuickTx('sales_return')}
          className="p-4 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 text-gray-700 transition-colors"
        >
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
            <ArrowDownLeft size={20} />
          </div>
          <span className="font-bold text-sm">مرتجع مبيعات</span>
        </button>

        <button 
          onClick={() => onOpenQuickTx('purchases_return')}
          className="p-4 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 text-gray-700 transition-colors"
        >
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
            <ArrowUpRight size={20} />
          </div>
          <span className="font-bold text-sm">مرتجع مشتريات</span>
        </button>
      </div>

      {/* Financial Reports panel (الإيرادات والمصروفات والصافي) from Screenshot 2 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-[#2e7d6c] text-white px-5 py-3.5 font-bold text-base flex justify-between items-center">
          <span>الإيرادات والمصروفات والصافي والربح</span>
          <TrendingUp size={18} />
        </div>
        <div className="p-5 space-y-4">
          {/* Main Profit Display */}
          <div className="bg-green-50/50 p-4 rounded-lg flex justify-between items-center border border-green-100">
            <div>
              <span className="text-xs text-gray-500 font-bold block mb-1">صافي الأرباح المحققة (من المبيعات)</span>
              <span className="text-2xl font-black text-[#236f60] font-mono">{formattedNetProfit}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 font-semibold block">معدل هامش الربح</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">
                {totalSalesRevenue > 0 ? ((finalNetProfit / totalSalesRevenue) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>

          {/* Detailed stats table */}
          <div className="grid grid-cols-2 gap-4 text-sm mt-2">
            <div className="border border-gray-50 rounded-lg p-3 space-y-1">
              <span className="text-xs text-gray-400 font-bold block">رأس المال الافتتاحي</span>
              <div className="flex justify-between items-baseline">
                <span className="font-extrabold text-gray-700 font-mono">{state.openingCapital.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400">{state.currency}</span>
              </div>
            </div>

            <div className="border border-gray-50 rounded-lg p-3 space-y-1">
              <span className="text-xs text-gray-400 font-bold block">إجمالي الإيرادات (المبيعات + الأخرى)</span>
              <div className="flex justify-between items-baseline text-green-600">
                <span className="font-extrabold font-mono">{(totalSalesRevenue + otherRevenues).toLocaleString()}</span>
                <span className="text-[10px]">{state.currency}</span>
              </div>
            </div>

            <div className="border border-gray-50 rounded-lg p-3 space-y-1">
              <span className="text-xs text-gray-400 font-bold block">إجمالي المصروفات والمشتريات</span>
              <div className="flex justify-between items-baseline text-red-600">
                <span className="font-extrabold font-mono">{(totalPurchasesExpense + otherExpenses).toLocaleString()}</span>
                <span className="text-[10px]">{state.currency}</span>
              </div>
            </div>

            <div className="border border-gray-50 rounded-lg p-3 space-y-1">
              <span className="text-xs text-gray-400 font-bold block">رصيد كلي (رأس المال + الأرباح)</span>
              <div className="flex justify-between items-baseline text-[#236f60]">
                <span className="font-extrabold font-mono">{(state.openingCapital + finalNetProfit).toLocaleString()}</span>
                <span className="text-[10px]">{state.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
