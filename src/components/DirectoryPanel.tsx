/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Truck, Plus, Search, Phone, Mail, FileText, 
  Trash2, UserPlus, FileSpreadsheet, ArrowLeft, ArrowDownLeft, ArrowUpRight 
} from 'lucide-react';
import { Customer, Supplier, Transaction, Voucher } from '../types';

interface DirectoryPanelProps {
  initialSubTab?: 'customers' | 'suppliers';
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
  vouchers: Voucher[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'balance'>) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'balance'>) => void;
  onDeleteCustomer: (id: string) => void;
  onDeleteSupplier: (id: string) => void;
}

interface StatementRow {
  date: string;
  docNo: string;
  type: string;
  description: string;
  debit: number;  // مدين (حركة تزيد ما لنا أو تقلل ما علينا)
  credit: number; // دائن (حركة تقلل ما لنا أو تزيد ما علينا)
}

export default function DirectoryPanel({ 
  initialSubTab = 'customers', 
  customers, 
  suppliers, 
  transactions, 
  vouchers, 
  onAddCustomer, 
  onAddSupplier, 
  onDeleteCustomer, 
  onDeleteSupplier 
}: DirectoryPanelProps) {
  const [subTab, setSubTab] = useState<'customers' | 'suppliers'>(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for adding
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Ledger / Account Statement viewing states
  const [selectedParty, setSelectedParty] = useState<{ id: string; name: string; type: 'customer' | 'supplier' } | null>(null);

  const isCust = subTab === 'customers';

  // Filters
  const filteredList = (isCust ? customers : suppliers).filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (isCust) {
      onAddCustomer({ name, phone, email });
    } else {
      onAddSupplier({ name, phone, email });
    }

    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setShowAddForm(false);
    alert('تمت الإضافة بنجاح!');
  };

  // Generate detailed account statement (كشف حساب تفصيلي)
  const generateStatement = (partyId: string, partyType: 'customer' | 'supplier'): StatementRow[] => {
    const rows: StatementRow[] = [];

    // 1. Get transactions
    transactions
      .filter(t => t.partyId === partyId)
      .forEach(t => {
        let debit = 0;
        let credit = 0;
        let desc = '';

        if (partyType === 'customer') {
          // For customers:
          // Sales (مبيعات) makes them debtor (مدين) for the totalAmount
          // Sales Return (مرتجع مبيعات) makes them creditor (دائن)
          if (t.type === 'sales') {
            debit = t.totalAmount;
            desc = `فاتورة مبيعات رقم ${t.invoiceNumber}`;
          } else if (t.type === 'sales_return') {
            credit = t.totalAmount;
            desc = `مرتجع مبيعات رقم ${t.invoiceNumber}`;
          }
        } else {
          // For suppliers:
          // Purchases (مشتريات) makes us debtor to them (i.e., they are dائن/credit for totalAmount)
          // Purchases Return (مرتجع مشتريات) makes them debtor (مدين)
          if (t.type === 'purchases') {
            credit = t.totalAmount;
            desc = `فاتورة مشتريات رقم ${t.invoiceNumber}`;
          } else if (t.type === 'purchases_return') {
            debit = t.totalAmount;
            desc = `مرتجع مشتريات رقم ${t.invoiceNumber}`;
          }
        }

        rows.push({
          date: t.date,
          docNo: t.invoiceNumber,
          type: t.type === 'sales' ? 'مبيعات' : t.type === 'purchases' ? 'مشتريات' : 'مرتجع',
          description: desc + (t.note ? ` - ${t.note}` : ''),
          debit,
          credit
        });
      });

    // 2. Get vouchers
    vouchers
      .filter(v => v.partyId === partyId)
      .forEach(v => {
        let debit = 0;
        let credit = 0;

        if (partyType === 'customer') {
          // For customer receipt voucher (سند قبض): decreases their debt to us (credit dائن)
          if (v.type === 'receipt') {
            credit = v.amount;
          }
        } else {
          // For supplier payment voucher (سند صرف): decreases our debt to them (debit مدين)
          if (v.type === 'payment') {
            debit = v.amount;
          }
        }

        rows.push({
          date: v.date,
          docNo: v.voucherNumber,
          type: v.type === 'receipt' ? 'سند قبض' : 'سند صرف',
          description: v.note,
          debit,
          credit
        });
      });

    // Sort by date ascending
    return rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-gray-700" dir="rtl">
      
      {selectedParty ? (
        /* Account Statement Detail Screen */
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden space-y-4">
          <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} />
              <span className="font-bold">كشف حساب تفصيلي: {selectedParty.name}</span>
              <span className="text-xs bg-gray-700 px-2.5 py-0.5 rounded-full font-sans">
                {selectedParty.type === 'customer' ? 'عميل' : 'مورد'}
              </span>
            </div>
            <button
              onClick={() => setSelectedParty(null)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              رجوع للدليل
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Statement Table */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">المستند</th>
                    <th className="p-3">نوع الحركة</th>
                    <th className="p-3">البيان والشرح</th>
                    <th className="p-3 text-center text-green-700">مدين (+)</th>
                    <th className="p-3 text-center text-red-600">دائن (-)</th>
                    <th className="p-3 text-center bg-gray-50 text-gray-700">الرصيد التراكمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {generateStatement(selectedParty.id, selectedParty.type).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                        لا توجد حركات أو قيود مسجلة لهذا الحساب حالياً.
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      let runningBalance = 0;
                      return generateStatement(selectedParty.id, selectedParty.type).map((row, index) => {
                        // For customers: balance = debit - credit
                        // For suppliers: balance = credit - debit
                        if (selectedParty.type === 'customer') {
                          runningBalance += (row.debit - row.credit);
                        } else {
                          runningBalance += (row.credit - row.debit);
                        }

                        return (
                          <tr key={index} className="hover:bg-gray-50/50">
                            <td className="p-3 font-mono text-[11px] text-gray-400">
                              {new Date(row.date).toLocaleDateString('ar-LY')}
                            </td>
                            <td className="p-3 font-mono text-gray-500 font-semibold">{row.docNo}</td>
                            <td className="p-3 font-semibold">{row.type}</td>
                            <td className="p-3 text-gray-600">{row.description}</td>
                            <td className="p-3 text-center font-mono font-bold text-green-700">
                              {row.debit > 0 ? row.debit.toFixed(2) : '-'}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-red-600">
                              {row.credit > 0 ? row.credit.toFixed(2) : '-'}
                            </td>
                            <td className="p-3 text-center font-mono font-black bg-gray-50/50 text-gray-800">
                              {runningBalance.toFixed(2)}
                            </td>
                          </tr>
                        );
                      });
                    })()
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end p-2 text-xs text-gray-400 font-sans italic">
              * رصيد كشف الحساب التراكمي يخضع لقواعد القيد المزدوج لنظام المحاسب المحترف.
            </div>
          </div>
        </div>
      ) : (
        /* Regular Directory Listing Tab */
        <div className="space-y-4">
          
          {/* Sub tabs switches */}
          <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex gap-2">
              <button
                onClick={() => { setSubTab('customers'); setSearchTerm(''); }}
                className={`py-2 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  subTab === 'customers' 
                    ? 'bg-[#236f60] text-white' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users size={16} />
                دليل ومستندات العملاء ({customers.length})
              </button>
              
              <button
                onClick={() => { setSubTab('suppliers'); setSearchTerm(''); }}
                className={`py-2 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  subTab === 'suppliers' 
                    ? 'bg-[#236f60] text-white' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Truck size={16} />
                دليل ومستندات الموردين ({suppliers.length})
              </button>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <UserPlus size={14} />
              {isCust ? 'إضافة عميل جديد' : 'إضافة مورد جديد'}
            </button>
          </div>

          {/* Collapsible Add Form */}
          {showAddForm && (
            <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 text-sm">
                {isCust ? 'تسجيل عميل تجاري جديد في الدفاتر' : 'تسجيل مورد معتمد جديد في الدفاتر'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="الاسم الكامل للجهة / الفرد..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#236f60] md:col-span-1.5"
                />
                <input
                  type="text"
                  placeholder="رقم الهاتف للتواصل..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#236f60]"
                />
                <input
                  type="email"
                  placeholder="عنوان البريد الإلكتروني..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#236f60]"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    حفظ وإضافة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute right-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={isCust ? "البحث باسم العميل أو الهاتف..." : "البحث باسم المورد أو الهاتف..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#236f60]/20"
            />
          </div>

          {/* List Display */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-100">
                    <th className="p-3">الاسم الجهة</th>
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3">البريد الإلكتروني</th>
                    <th className="p-3 text-center">الرصيد المالي الحالي</th>
                    <th className="p-3 text-center">الإجراءات والبيانات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">
                        لا توجد سجلات مسجلة حالياً تطابق البحث.
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3 font-semibold text-gray-800">{item.name}</td>
                        <td className="p-3 font-mono text-xs text-gray-500">
                          {item.phone ? (
                            <span className="flex items-center gap-1 justify-end font-mono">
                              <span>{item.phone}</span>
                              <Phone size={12} className="text-gray-400" />
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-3 text-gray-400 text-xs">
                          {item.email ? (
                            <span className="flex items-center gap-1 justify-end font-mono">
                              <span>{item.email}</span>
                              <Mail size={12} className="text-gray-400" />
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${
                            item.balance > 0 
                              ? isCust ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600 font-extrabold'
                              : item.balance < 0 
                                ? isCust ? 'bg-red-50 text-red-600 font-extrabold' : 'bg-green-50 text-green-700'
                                : 'bg-gray-50 text-gray-400'
                          }`}>
                            {item.balance.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedParty({ id: item.id, name: item.name, type: isCust ? 'customer' : 'supplier' })}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-[#236f60] hover:text-white rounded-md text-xs font-bold text-[#236f60] flex items-center gap-1 transition-all"
                              title="عرض كشف حساب تفصيلي"
                            >
                              <FileText size={12} />
                              كشف حساب
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من رغبتك في حذف ${item.name} من الدليل؟`)) {
                                  if (isCust) {
                                    onDeleteCustomer(item.id);
                                  } else {
                                    onDeleteSupplier(item.id);
                                  }
                                }
                              }}
                              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
