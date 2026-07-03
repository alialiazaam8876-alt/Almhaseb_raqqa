/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Plus, Filter, Edit, Trash2, Package, Archive, AlertTriangle, ArrowUpDown, ChevronDown 
} from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAdjustStock: (productId: string, newStock: number) => void;
}

export default function Inventory({ products, onAddProduct, onEditProduct, onDeleteProduct, onAdjustStock }: InventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');
  const [stockFilter, setStockFilter] = useState('الكل'); // 'الكل', 'نفذت', 'منخفضة', 'متوفرة'
  
  // From Screenshot 3, additional inputs at the bottom/top:
  const [salesInvoiceNum, setSalesInvoiceNum] = useState('');
  const [purchaseInvoiceNum, setPurchaseInvoiceNum] = useState('');

  const categories = ['الكل', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products
  const filteredProducts = products.filter(product => {
    // Search query matches name or barcode
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.code.includes(searchTerm);
    
    const matchesCategory = categoryFilter === 'الكل' || product.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'نفذت') {
      matchesStock = product.currentStock === 0;
    } else if (stockFilter === 'منخفضة') {
      matchesStock = product.currentStock > 0 && product.currentStock <= 10;
    } else if (stockFilter === 'متوفرة') {
      matchesStock = product.currentStock > 10;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalInventoryValue = filteredProducts.reduce((sum, p) => sum + (p.currentStock * p.unitCost), 0);
  const totalItemsCount = filteredProducts.reduce((sum, p) => sum + p.currentStock, 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      {/* Inventory Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-l from-teal-50 to-white p-4 rounded-xl border border-teal-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">إجمالي قيمة المخزون بسعر التكلفة</span>
            <span className="text-xl font-black text-[#236f60] font-mono">{totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs text-gray-400 mr-1">محلي</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#236f60]/10 text-[#236f60] flex items-center justify-center">
            <Archive size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-l from-blue-50 to-white p-4 rounded-xl border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">إجمالي كمية البضائع (حبات)</span>
            <span className="text-xl font-black text-blue-700 font-mono">{totalItemsCount}</span>
            <span className="text-xs text-gray-400 mr-1">حبة متوفرة</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-100/60 text-blue-600 flex items-center justify-center">
            <Package size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-l from-amber-50 to-white p-4 rounded-xl border border-amber-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">أصناف قاربت على النفاد (أقل من 10)</span>
            <span className="text-xl font-black text-amber-600 font-mono">
              {products.filter(p => p.currentStock > 0 && p.currentStock <= 10).length}
            </span>
            <span className="text-xs text-gray-400 mr-1">صنف بحاجة لإعادة طلب</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-100/60 text-amber-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Main Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Main search field from Screenshot 3 */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="اسم الصنف او الرقم او نهاية رقم الصنف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#236f60]/30 focus:border-[#236f60]"
            />
          </div>

          <div className="flex gap-2">
            {/* Category selection */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#236f60]/30"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'الكل' ? 'كل المجموعات' : c}</option>
              ))}
            </select>

            {/* Stock filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#236f60]/30"
            >
              <option value="الكل">كل الكميات</option>
              <option value="متوفرة">متوفر بالمستودع</option>
              <option value="منخفضة">كميات منخفضة</option>
              <option value="نفذت">نفذت (صفر حبة)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section matching Screenshot 3 styling */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-[#2e7d6c] text-white px-4 py-3 font-bold text-sm flex justify-between items-center">
          <span>قائمة جرد وتفاصيل المخزون</span>
          <button 
            onClick={onAddProduct}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-3 py-1 text-xs font-semibold transition-all flex items-center gap-1"
          >
            <Plus size={14} />
            إضافة صنف
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                <th className="p-3">رقم الصنف</th>
                <th className="p-3">اسم الصنف</th>
                <th className="p-3 text-center">المخزون</th>
                <th className="p-3 text-center">تكلفة الوحدة</th>
                <th className="p-3 text-center">آخر شراء</th>
                <th className="p-3 text-center">سعر البيع</th>
                <th className="p-3 text-center">القيمة الكلية</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400 font-medium">
                    لا توجد أصناف مطابقة لخيارات البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow = product.currentStock > 0 && product.currentStock <= 10;
                  const isOut = product.currentStock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3 font-mono text-xs text-gray-500">#{product.code}</td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-800">{product.name}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{product.category} ({product.origin})</div>
                      </td>
                      <td className="p-3 text-center font-bold">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                          isOut ? 'bg-red-50 text-red-600' : 
                          isLow ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-700'
                        }`}>
                          {product.currentStock} {product.unitType}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-gray-800">{product.unitCost.toFixed(2)}</td>
                      <td className="p-3 text-center font-mono text-gray-800">{product.lastPurchasePrice.toFixed(2)}</td>
                      <td className="p-3 text-center font-mono text-emerald-600 font-semibold">{product.salePrice.toFixed(2)}</td>
                      <td className="p-3 text-center font-mono font-bold text-gray-900">
                        {(product.currentStock * product.unitCost).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="تعديل تفاصيل الصنف"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              const amountStr = prompt(`أدخل الكمية الجديدة لـ ${product.name}:`, product.currentStock.toString());
                              if (amountStr !== null) {
                                const amount = parseInt(amountStr, 10);
                                if (!isNaN(amount) && amount >= 0) {
                                  onAdjustStock(product.id, amount);
                                } else {
                                  alert('الرجاء إدخال كمية صحيحة أكبر من أو تساوي الصفر');
                                }
                              }
                            }}
                            className="p-1 text-emerald-600 hover:bg-green-50 rounded-md transition-colors text-xs font-bold px-1.5"
                            title="جرد سريع للكمية"
                          >
                            جرد سريع
                          </button>
                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="حذف الصنف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice filter search inputs from Screenshot 3 */}
      <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
        <h4 className="text-xs font-bold text-gray-500 mb-3 block">البحث بالربط مع المستندات والفواتير:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">رقم فاتورة البيع المرجعية</label>
            <input
              type="text"
              placeholder="مثال: SINV-001"
              value={salesInvoiceNum}
              onChange={(e) => setSalesInvoiceNum(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#236f60]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">رقم فاتورة الشراء المرجعية</label>
            <input
              type="text"
              placeholder="مثال: PINV-001"
              value={purchaseInvoiceNum}
              onChange={(e) => setPurchaseInvoiceNum(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#236f60]"
            />
          </div>
        </div>
        {(salesInvoiceNum || purchaseInvoiceNum) && (
          <div className="mt-3 p-2 bg-yellow-50 text-yellow-800 text-xs rounded-lg border border-yellow-100 flex items-center justify-between">
            <span>تصفية المخزون حسب الأصناف الواردة في المستند المختار...</span>
            <button 
              onClick={() => { setSalesInvoiceNum(''); setPurchaseInvoiceNum(''); }}
              className="text-[10px] underline font-bold"
            >
              إلغاء التصفية
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
