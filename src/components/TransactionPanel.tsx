/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Trash2, Printer, CheckCircle, ShoppingCart, ShoppingBag, 
  ArrowDownLeft, ArrowUpRight, Search, FileText, Calendar, User, DollarSign, Percent, X 
} from 'lucide-react';
import { Product, Customer, Supplier, Transaction, TransactionItem, TransactionType } from '../types';

interface TransactionPanelProps {
  type: TransactionType;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'invoiceNumber' | 'date'>) => void;
}

export default function TransactionPanel({ type, products, customers, suppliers, transactions, onAddTransaction }: TransactionPanelProps) {
  const [partyId, setPartyId] = useState('');
  const [selectedItems, setSelectedItems] = useState<TransactionItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [note, setNote] = useState('');
  
  // Search state for product addition
  const [prodSearch, setProdSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [selectedProdId, setSelectedProdId] = useState('');

  // Invoice viewer / active list
  const [activeInvoice, setActiveInvoice] = useState<Transaction | null>(null);

  // Type labels
  const isSales = type === 'sales';
  const isPurchase = type === 'purchases';
  const isSalesReturn = type === 'sales_return';
  const isPurchaseReturn = type === 'purchases_return';

  const typeLabels: Record<TransactionType, { title: string; icon: any; color: string; partyLabel: string; partyList: any[] }> = {
    sales: { title: 'فاتورة مبيعات جديدة (POS)', icon: ShoppingCart, color: 'bg-[#236f60]', partyLabel: 'العميل المشتري', partyList: customers },
    purchases: { title: 'فاتورة مشتريات جديدة', icon: ShoppingBag, color: 'bg-[#3d9970]', partyLabel: 'المورد البائع', partyList: suppliers },
    sales_return: { title: 'مرتجع مبيعات جديد', icon: ArrowDownLeft, color: 'bg-orange-600', partyLabel: 'العميل المرجع', partyList: customers },
    purchases_return: { title: 'مرتجع مشتريات جديد', icon: ArrowUpRight, color: 'bg-red-600', partyLabel: 'المورد المرجع إليه', partyList: suppliers }
  };

  const currentMeta = typeLabels[type];

  // Handle selected product change to update auto price
  const handleProductSelect = (id: string) => {
    setSelectedProdId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setItemPrice(isSales || isSalesReturn ? prod.salePrice : prod.unitCost);
    }
  };

  // Add item to temporary list
  const handleAddItem = () => {
    if (!selectedProdId) return;
    const prod = products.find(p => p.id === selectedProdId);
    if (!prod) return;

    // Check stock for sales
    if ((isSales || isPurchaseReturn) && prod.currentStock < itemQty) {
      alert(`عذراً، الرصيد المتاح من ${prod.name} هو ${prod.currentStock} فقط!`);
      return;
    }

    const existingIndex = selectedItems.findIndex(i => i.productId === selectedProdId);
    if (existingIndex > -1) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += itemQty;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          productId: prod.id,
          name: prod.name,
          quantity: itemQty,
          unitPrice: itemPrice,
          total: itemQty * itemPrice
        }
      ]);
    }

    // Reset inputs
    setSelectedProdId('');
    setProdSearch('');
    setItemQty(1);
    setItemPrice(0);
    setShowSuggestions(false);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  // Update item quantity directly in the invoice table
  const handleUpdateItemQty = (index: number, newQty: number) => {
    const updated = [...selectedItems];
    const prod = products.find(p => p.id === updated[index].productId);
    
    // Check stock for sales and purchase returns
    if (prod && (isSales || isPurchaseReturn) && prod.currentStock < newQty) {
      alert(`عذراً، الرصيد المتاح من ${prod.name} هو ${prod.currentStock} فقط!`);
      return;
    }
    
    updated[index].quantity = Math.max(1, newQty);
    updated[index].total = updated[index].quantity * updated[index].unitPrice;
    setSelectedItems(updated);
  };

  // Update item unit price directly in the invoice table
  const handleUpdateItemPrice = (index: number, newPrice: number) => {
    const updated = [...selectedItems];
    updated[index].unitPrice = Math.max(0, newPrice);
    updated[index].total = updated[index].quantity * updated[index].unitPrice;
    setSelectedItems(updated);
  };

  // Calculations
  const itemsSubtotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = Math.max(0, itemsSubtotal - discount + tax);
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  // Submit invoice
  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback or explicit party selection
    let activePartyId = partyId;
    let activePartyName = 'جهة غير معرفة';

    if (!activePartyId) {
      // If none selected, default to cash party
      if (isSales || isSalesReturn) {
        activePartyId = 'cash-customer';
        activePartyName = 'زبون نقدي عام';
      } else {
        activePartyId = 'cash-supplier';
        activePartyName = 'مورد نقدي عام';
      }
    } else {
      if (activePartyId === 'cash-customer') {
        activePartyName = 'زبون نقدي عام';
      } else if (activePartyId === 'cash-supplier') {
        activePartyName = 'مورد نقدي عام';
      } else {
        const partyObj = currentMeta.partyList.find(p => p.id === activePartyId);
        activePartyName = partyObj ? partyObj.name : 'جهة غير معرفة';
      }
    }

    if (selectedItems.length === 0) {
      alert('الرجاء إضافة صنف واحد على الأقل للفاتورة');
      return;
    }

    onAddTransaction({
      type,
      partyId: activePartyId,
      partyName: activePartyName,
      items: selectedItems,
      discount,
      tax,
      totalAmount,
      paidAmount: paymentType === 'cash' ? totalAmount : paidAmount,
      remainingAmount: paymentType === 'cash' ? 0 : remainingAmount,
      paymentType,
      note
    });

    // Reset Form
    setPartyId('');
    setSelectedItems([]);
    setDiscount(0);
    setTax(0);
    setPaidAmount(0);
    setPaymentType('cash');
    setNote('');
    alert('تم حفظ وترحيل الفاتورة بنجاح!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      {/* Selector of Previous Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Invoice Generator Form */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className={`${currentMeta.color} text-white px-5 py-4 font-bold text-base flex justify-between items-center`}>
            <div className="flex items-center gap-2">
              <currentMeta.icon size={20} />
              <span>{currentMeta.title}</span>
            </div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-mono">
              بث مباشر للمخزون
            </span>
          </div>

          <form onSubmit={handleSubmitInvoice} className="p-5 flex-1 space-y-4 text-sm text-gray-700">
            {/* Row 1: Party and Payment type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-600 block mb-1">اختر {currentMeta.partyLabel}</label>
                <div className="relative">
                  <User className="absolute right-3 top-3 text-gray-400" size={16} />
                  <select
                    value={partyId}
                    onChange={(e) => setPartyId(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236f60]/30 font-bold"
                  >
                    <option value="">
                      {(isSales || isSalesReturn) ? '🛒 زبون نقدي عام (افتراضي)' : '📦 مورد نقدي عام (افتراضي)'}
                    </option>
                    {currentMeta.partyList.map(party => (
                      <option key={party.id} value={party.id}>
                        👤 {party.name} (الرصيد: {party.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">طريقة الدفع</label>
                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <button
                    type="button"
                    onClick={() => { setPaymentType('cash'); setPaidAmount(totalAmount); }}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                      paymentType === 'cash' 
                        ? 'bg-[#236f60] text-white border-[#236f60]' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    نقداً (فوري في الصندوق)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('credit')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                      paymentType === 'credit' 
                        ? 'bg-[#236f60] text-white border-[#236f60]' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    آجل (على الحساب)
                  </button>
                </div>
              </div>
            </div>

            {/* Product adding box - POS Refactored Design */}
            <div className="p-4 bg-[#236f60]/5 rounded-xl border border-[#236f60]/10 space-y-3">
              <span className="text-xs font-black text-[#236f60] block flex items-center gap-1">
                <span>🔍 البحث الذكي وتنزيل الأصناف الفوري:</span>
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                {/* Search Box - 6 columns */}
                <div className="md:col-span-6 relative">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">اسم الصنف أو الباركود</label>
                  <div className="relative">
                    <Search className="absolute right-2.5 top-2.5 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="اكتب اسم الصنف (مثال: زياتي...)"
                      value={prodSearch}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProdSearch(val);
                        setShowSuggestions(true);
                        
                        // Check if exact match exists
                        const matched = products.find(p => p.name.toLowerCase() === val.toLowerCase() || p.code === val);
                        if (matched) {
                          setSelectedProdId(matched.id);
                          setItemPrice(isSales || isSalesReturn ? matched.salePrice : matched.unitCost);
                        } else {
                          setSelectedProdId('');
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          // If there's an exact or selected product, add it
                          if (selectedProdId) {
                            handleAddItem();
                          } else {
                            // Try to pick the first matched suggestion
                            const searchLower = prodSearch.toLowerCase().trim();
                            const matched = products.filter(p => 
                              p.name.toLowerCase().includes(searchLower) || 
                              p.code.toLowerCase().includes(searchLower)
                            )[0];
                            if (matched) {
                              setSelectedProdId(matched.id);
                              setItemPrice(isSales || isSalesReturn ? matched.salePrice : matched.unitCost);
                              // Delay slightly to ensure state is registered or just add it
                              setTimeout(() => {
                                // Trigger item add with picked product
                                const existingIndex = selectedItems.findIndex(i => i.productId === matched.id);
                                if (existingIndex > -1) {
                                  const updated = [...selectedItems];
                                  updated[existingIndex].quantity += itemQty;
                                  updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
                                  setSelectedItems(updated);
                                } else {
                                  setSelectedItems(prev => [
                                    ...prev,
                                    {
                                      productId: matched.id,
                                      name: matched.name,
                                      quantity: itemQty,
                                      unitPrice: isSales || isSalesReturn ? matched.salePrice : matched.unitCost,
                                      total: itemQty * (isSales || isSalesReturn ? matched.salePrice : matched.unitCost)
                                    }
                                  ]);
                                }
                                setProdSearch('');
                                setSelectedProdId('');
                                setItemQty(1);
                                setItemPrice(0);
                                setShowSuggestions(false);
                              }, 50);
                            }
                          }
                        }
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                      className="w-full pr-8 pl-8 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#236f60]/40"
                    />
                    {prodSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setProdSearch('');
                          setSelectedProdId('');
                          setItemPrice(0);
                        }}
                        className="absolute left-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Overlay */}
                  {showSuggestions && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-64 overflow-y-auto divide-y divide-gray-50">
                      {(() => {
                        const trimmed = prodSearch.trim().toLowerCase();
                        const filtered = trimmed === '' 
                          ? products 
                          : products.filter(p => 
                              p.name.toLowerCase().includes(trimmed) || 
                              p.code.toLowerCase().includes(trimmed) ||
                              p.category.toLowerCase().includes(trimmed)
                            ).sort((a, b) => {
                              const aStarts = a.name.toLowerCase().startsWith(trimmed);
                              const bStarts = b.name.toLowerCase().startsWith(trimmed);
                              if (aStarts && !bStarts) return -1;
                              if (!aStarts && bStarts) return 1;
                              return 0;
                            });

                        if (filtered.length === 0) {
                          return (
                            <div className="p-3 text-center text-xs text-gray-400">
                              لا توجد بضاعة تطابق الاسم أو الكود
                            </div>
                          );
                        }

                        return filtered.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedProdId(p.id);
                              setProdSearch(p.name);
                              setItemPrice(isSales || isSalesReturn ? p.salePrice : p.unitCost);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-right px-3 py-2 hover:bg-[#236f60]/5 flex items-center justify-between text-xs transition-colors cursor-pointer animate-none"
                          >
                            <div className="flex flex-col">
                              <span className="font-extrabold text-gray-800">{p.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono mt-0.5">كود: {p.code} | المجموعة: {p.category}</span>
                            </div>
                            <div className="text-left flex flex-col items-end">
                              <span className={`font-black font-mono ${p.currentStock > 0 ? 'text-[#236f60]' : 'text-red-500'}`}>
                                رصيد: {p.currentStock} {p.unitType}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                                {isSales || isSalesReturn ? `سعر البيع: ${p.salePrice.toFixed(2)}` : `سعر التكلفة: ${p.unitCost.toFixed(2)}`}
                              </span>
                            </div>
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Qty Box - 2 columns */}
                <div className="md:col-span-2">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">الكمية (العدد)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="الكمية"
                    value={itemQty}
                    onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#236f60]/40"
                  />
                </div>

                {/* Live custom price editor - 2 columns */}
                <div className="md:col-span-2">
                  <label className="text-[10px] text-gray-500 font-bold block mb-1">سعر الوحدة</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="السعر"
                    value={itemPrice || ''}
                    onChange={(e) => setItemPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddItem();
                      }
                    }}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-bold font-mono text-center text-[#236f60] focus:outline-none focus:ring-2 focus:ring-[#236f60]/40"
                  />
                </div>

                {/* Add button - 2 columns */}
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full py-2 bg-[#236f60] hover:bg-[#1a5549] text-white rounded-lg text-xs font-extrabold flex items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                  >
                    <Plus size={14} className="stroke-[3]" />
                    <span>تنزيل بالكامل</span>
                  </button>
                </div>
              </div>

              {selectedProdId && (
                <div className="flex justify-between items-center text-[11px] text-[#236f60] font-bold bg-[#236f60]/5 px-3 py-1.5 rounded-lg border border-[#236f60]/10">
                  <span>الصنف المختار للتعديل المباشر قبل الإنزال</span>
                  <span>المجموع الفرعي المؤقت: <span className="font-mono text-xs">{(itemQty * itemPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
                </div>
              )}
            </div>

             {/* Selected items table - Fully Interactive POS Style */}
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-gradient-to-l from-slate-100 to-slate-50 text-slate-700 font-extrabold border-b border-gray-200">
                    <th className="p-3 text-right">الصنف التجاري</th>
                    <th className="p-3 text-center w-36">العدد (الكمية)</th>
                    <th className="p-3 text-center w-28">سعر البيع للوحدة</th>
                    <th className="p-3 text-center w-28">الإجمالي الفرعي</th>
                    <th className="p-3 text-center w-12">إزالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 font-bold">
                        🚫 لم يتم تنزيل أي بضاعة بعد في هذه الفاتورة.
                        <br />
                        <span className="text-[10px] text-gray-350 block mt-1">ابحث بالأعلى عن صنف مثل "زياتي" واضغط Enter لتنزيله هنا</span>
                      </td>
                    </tr>
                  ) : (
                    selectedItems.map((item, index) => (
                      <tr key={index} className="hover:bg-[#236f60]/5 transition-all">
                        {/* Name and description */}
                        <td className="p-3 font-extrabold text-gray-900">
                          <div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        
                        {/* Interactive Quantity Control */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1 mx-auto max-w-[120px]">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(index, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition-all cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItemQty(index, parseInt(e.target.value) || 1)}
                              className="w-12 text-center font-mono font-bold bg-gray-50 border border-gray-200 rounded py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#236f60]"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(index, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-[#236f60]/10 hover:bg-[#236f60]/20 text-[#236f60] font-bold flex items-center justify-center transition-all cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        
                        {/* Interactive Unit Price Control */}
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItemPrice(index, parseFloat(e.target.value) || 0)}
                            className="w-20 text-center font-mono font-bold bg-white border border-gray-200 rounded px-1.5 py-1 text-xs text-[#236f60] focus:outline-none focus:ring-1 focus:ring-[#236f60]"
                          />
                        </td>
                        
                        {/* Subtotal row */}
                        <td className="p-3 text-center font-mono font-black text-[#236f60] text-sm">
                          {item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        
                        {/* Remove button */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="حذف الصنف"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Invoice Summary and Discount section */}
            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/50 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">خصم تجاري مالي (تخفيض)</label>
                <div className="relative">
                  <Percent className="absolute left-2.5 top-2 text-gray-400" size={14} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-1.5 pl-7 bg-white border border-gray-200 rounded text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">الضريبة المضافة (إن وجدت)</label>
                <div className="relative">
                  <Percent className="absolute left-2.5 top-2 text-gray-400" size={14} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={tax}
                    onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-1.5 pl-7 bg-white border border-gray-200 rounded text-xs font-mono"
                  />
                </div>
              </div>

              {paymentType === 'credit' && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">المبلغ المدفوع (مقدماً)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Math.min(totalAmount, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-full p-1.5 bg-white border border-gray-200 rounded text-xs font-mono text-emerald-700 font-bold"
                  />
                </div>
              )}
            </div>

            {/* Note and totals */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">ملاحظات الفاتورة والبيان المالي</label>
                <input
                  type="text"
                  placeholder="مثال: فاتورة توريد طلاء وبضاعة دفعة يونيو..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              {/* Totals Box */}
              <div className="bg-gray-800 text-white p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-mono">
                <div>
                  <span className="text-xs text-gray-400 block font-sans">المجموع الإجمالي الصافي</span>
                  <span className="text-2xl font-black text-green-400">{totalAmount.toFixed(2)}</span>
                  <span className="text-xs text-gray-400 mr-1 font-sans">محلي</span>
                </div>
                {paymentType === 'credit' && (
                  <div className="border-r md:border-r border-gray-700 pr-4">
                    <span className="text-xs text-gray-400 block font-sans">المتبقي (آجل على الذمم)</span>
                    <span className="text-xl font-bold text-red-400">{remainingAmount.toFixed(2)}</span>
                  </div>
                )}
                <div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-2 bg-gradient-to-l from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle size={16} />
                    حفظ وترحيل المستند
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Previous Invoices Sidebar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3.5 flex justify-between items-center">
            <span className="font-bold text-gray-700 text-sm">سجل الفواتير السابقة</span>
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-mono">
              {transactions.filter(t => t.type === type).length} مستند
            </span>
          </div>

          <div className="p-3 overflow-y-auto max-h-[500px] divide-y divide-gray-50 flex-1">
            {transactions.filter(t => t.type === type).length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                لا توجد فواتير مسجلة في هذا القسم حالياً.
              </div>
            ) : (
              transactions
                .filter(t => t.type === type)
                .map((tx) => (
                  <div 
                    key={tx.id} 
                    onClick={() => setActiveInvoice(tx)}
                    className="p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="font-bold text-gray-800 font-mono">{tx.invoiceNumber}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{new Date(tx.date).toLocaleDateString('ar-LY')}</div>
                      <div className="text-gray-600 mt-1 font-semibold">{tx.partyName}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-[#236f60] font-mono">{tx.totalAmount.toFixed(2)}</div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        tx.paymentType === 'cash' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {tx.paymentType === 'cash' ? 'نقدي' : 'آجل'}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Invoice Detail Print Modal (Simulated thermal receipt printer) */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl overflow-hidden text-sm text-gray-800 font-mono border border-gray-200" dir="rtl">
            
            {/* Modal Header */}
            <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
              <span className="font-bold font-sans">معاينة فاتورة حرارية</span>
              <button 
                onClick={() => setActiveInvoice(null)}
                className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full text-xs"
              >
                إغلاق
              </button>
            </div>

            {/* Thermal Slip Content */}
            <div className="p-6 bg-[#fbfbf8] border-b border-dashed border-gray-300 select-all leading-tight">
              {/* Header */}
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-gray-300">
                <h3 className="font-bold text-base font-sans">المحاسب المحترف</h3>
                <p className="text-[10px] text-gray-500 font-sans">إدارة المخازن والمقاولات العامة</p>
                <p className="text-xs font-sans">هاتف: +967 75215158</p>
                <div className="text-[10px] text-gray-400 pt-1">
                  {new Date(activeInvoice.date).toLocaleString('ar-LY')}
                </div>
              </div>

              {/* Invoice details */}
              <div className="py-3 space-y-1 text-xs border-b border-dashed border-gray-300 font-sans">
                <div><span className="font-bold text-gray-500">رقم الفاتورة:</span> <span className="font-mono font-bold">{activeInvoice.invoiceNumber}</span></div>
                <div><span className="font-bold text-gray-500">النوع:</span> <span>{
                  activeInvoice.type === 'sales' ? 'مبيعات' : 
                  activeInvoice.type === 'purchases' ? 'مشتريات' : 
                  activeInvoice.type === 'sales_return' ? 'مرتجع مبيعات' : 'مرتجع مشتريات'
                }</span></div>
                <div><span className="font-bold text-gray-500">الجهة:</span> <span className="font-bold">{activeInvoice.partyName}</span></div>
                <div><span className="font-bold text-gray-500">طريقة الدفع:</span> <span>{activeInvoice.paymentType === 'cash' ? 'نقداً' : 'آجل على الحساب'}</span></div>
              </div>

              {/* Items List */}
              <div className="py-3 text-xs border-b border-dashed border-gray-300">
                <div className="grid grid-cols-4 font-bold text-gray-500 pb-2 text-right">
                  <span className="col-span-2">الصنف</span>
                  <span className="text-center">الكمية</span>
                  <span className="text-left">الإجمالي</span>
                </div>
                <div className="space-y-2">
                  {activeInvoice.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-4 text-gray-700">
                      <span className="col-span-2 font-sans font-semibold">{item.name}</span>
                      <span className="text-center font-mono">{item.quantity}</span>
                      <span className="text-left font-mono font-bold">{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div className="py-3 space-y-1 text-xs text-gray-700 font-sans">
                <div className="flex justify-between">
                  <span>إجمالي الأصناف:</span>
                  <span className="font-mono">{(activeInvoice.totalAmount + activeInvoice.discount - activeInvoice.tax).toFixed(2)}</span>
                </div>
                {activeInvoice.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>خصم نقدي:</span>
                    <span className="font-mono">-{activeInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                {activeInvoice.tax > 0 && (
                  <div className="flex justify-between">
                    <span>الضريبة:</span>
                    <span className="font-mono">+{activeInvoice.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 text-[#236f60]">
                  <span>الصافي المطلوب:</span>
                  <span className="font-mono">{activeInvoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>المبلغ المدفوع:</span>
                  <span className="font-mono">{activeInvoice.paidAmount.toFixed(2)}</span>
                </div>
                {activeInvoice.remainingAmount > 0 && (
                  <div className="flex justify-between text-red-500 font-bold">
                    <span>المتبقي ذمة مالية:</span>
                    <span className="font-mono">{activeInvoice.remainingAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 text-center border-t border-dashed border-gray-300 font-sans space-y-1 text-[11px] text-gray-500">
                <p className="font-bold">شكراً لتعاملكم معنا!</p>
                <p>تعتبر هذه الفاتورة مستنداً محاسبياً معتمداً</p>
                <p className="text-[9px] text-gray-400">تصميم وتطوير المحاسب المحترف v1.4</p>
              </div>
            </div>

            {/* Print Action button */}
            <div className="p-3 bg-gray-50 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-900"
              >
                <Printer size={14} />
                طباعة الفاتورة
              </button>
              <button
                onClick={() => setActiveInvoice(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300"
              >
                رجوع
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
