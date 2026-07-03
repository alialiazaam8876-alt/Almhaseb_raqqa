/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, CheckCircle, Wallet, ArrowDownLeft, ArrowUpRight, 
  Trash2, FileText, Printer, ShieldAlert, Calendar, DollarSign 
} from 'lucide-react';
import { AppState, Customer, Supplier, Voucher, VoucherType } from '../types';

interface VouchersPanelProps {
  vouchers: Voucher[];
  customers: Customer[];
  suppliers: Supplier[];
  onAddVoucher: (voucher: Omit<Voucher, 'id' | 'voucherNumber' | 'date'>) => void;
  onDeleteVoucher: (id: string) => void;
}

export default function VouchersPanel({ vouchers, customers, suppliers, onAddVoucher, onDeleteVoucher }: VouchersPanelProps) {
  const [type, setType] = useState<VoucherType>('receipt');
  const [partyId, setPartyId] = useState('');
  const [customPartyName, setCustomPartyName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('نقداً');
  const [note, setNote] = useState('');

  // Active viewing voucher for print simulation
  const [activeVoucherSlip, setActiveVoucherSlip] = useState<Voucher | null>(null);

  const voucherTypes: Record<VoucherType, { label: string; icon: any; color: string; desc: string }> = {
    receipt: { 
      label: 'سند قبض (تحصيل مالي)', 
      icon: ArrowDownLeft, 
      color: 'bg-emerald-600', 
      desc: 'تسجيل مبلغ مقبوض من عميل، يقلل رصيد العميل المدين ويزيد الصندوق' 
    },
    payment: { 
      label: 'سند صرف (دفعة مالية)', 
      icon: ArrowUpRight, 
      color: 'bg-red-600', 
      desc: 'تسجيل دفعة مسددة لمورد، يقلل رصيد المورد الدائن ويقلل الصندوق' 
    },
    expense: { 
      label: 'سند مصروف عام', 
      icon: ShieldAlert, 
      color: 'bg-amber-600', 
      desc: 'تسجيل مصروفات تشغيلية (رواتب، إيجار، كهرباء) يخصم مباشرة من الصندوق' 
    },
    revenue: { 
      label: 'سند إيراد آخر متفرع', 
      icon: Wallet, 
      color: 'bg-blue-600', 
      desc: 'تسجيل أي إيراد خارجي غير ناتج عن المبيعات يزيد رصيد الصندوق' 
    }
  };

  const handleTypeChange = (newType: VoucherType) => {
    setType(newType);
    setPartyId('');
    setCustomPartyName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }

    let resolvedPartyName = '';
    if (type === 'receipt') {
      const cust = customers.find(c => c.id === partyId);
      if (!cust) {
        alert('الرجاء اختيار العميل المسدد');
        return;
      }
      resolvedPartyName = cust.name;
    } else if (type === 'payment') {
      const supp = suppliers.find(s => s.id === partyId);
      if (!supp) {
        alert('الرجاء اختيار المورد المستحق');
        return;
      }
      resolvedPartyName = supp.name;
    } else {
      if (!customPartyName) {
        alert('الرجاء كتابة اسم الجهة أو المستلم');
        return;
      }
      resolvedPartyName = customPartyName;
    }

    onAddVoucher({
      type,
      partyId: type === 'receipt' || type === 'payment' ? partyId : undefined,
      partyName: resolvedPartyName,
      amount,
      paymentMethod,
      note
    });

    // Reset Form
    setAmount(0);
    setNote('');
    setCustomPartyName('');
    setPartyId('');
    alert('تم تسجيل وترحيل السند المحاسبي بنجاح!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Form Column */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gradient-to-l from-[#236f60] to-[#2e7d6c] text-white px-5 py-4 font-bold text-base flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Wallet size={18} />
              تسجيل السندات المالية والقيود المحاسبية
            </span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">
              ترقية مزدوجة القيد
            </span>
          </div>

          {/* Quick types selection */}
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <span className="text-xs font-bold text-gray-400 block mb-2">اختر نوع الحركة المحاسبية:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(voucherTypes) as VoucherType[]).map((key) => {
                const meta = voucherTypes[key];
                const active = type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTypeChange(key)}
                    className={`py-2 px-2 rounded-lg border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                      active 
                        ? `${meta.color} text-white border-transparent shadow-sm` 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <meta.icon size={14} />
                    {key === 'receipt' ? 'سند قبض' : key === 'payment' ? 'سند صرف' : key === 'expense' ? 'مصروف' : 'إيراد إضافي'}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-500 mt-2 italic font-sans">
              * {voucherTypes[type].desc}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-5 flex-1 space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dynamic Party Selection */}
              {type === 'receipt' && (
                <div>
                  <label className="font-bold text-gray-600 block mb-1">العميل المسدد</label>
                  <select
                    value={partyId}
                    onChange={(e) => setPartyId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#236f60]"
                  >
                    <option value="">-- اختر العميل --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (المستحق عليه: {c.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {type === 'payment' && (
                <div>
                  <label className="font-bold text-gray-600 block mb-1">المورد المستلم</label>
                  <select
                    value={partyId}
                    onChange={(e) => setPartyId(e.target.value)}
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#236f60]"
                  >
                    <option value="">-- اختر المورد --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (المستحق له: {s.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(type === 'expense' || type === 'revenue') && (
                <div>
                  <label className="font-bold text-gray-600 block mb-1">الجهة / المستلم / المستفيد</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شركة الكهرباء، رواتب الموظفين، إلخ"
                    value={customPartyName}
                    onChange={(e) => setCustomPartyName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#236f60]"
                  />
                </div>
              )}

              {/* Amount input */}
              <div>
                <label className="font-bold text-gray-600 block mb-1">المبلغ المالي</label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-3 text-[#236f60]" size={16} />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="أدخل قيمة السند المالية"
                    value={amount || ''}
                    onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-[#236f60]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#236f60]/30 font-mono font-bold text-gray-850"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment Method */}
              <div>
                <label className="font-bold text-gray-600 block mb-1">طريقة الدفع / الدفع عبر</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#236f60]"
                >
                  <option value="نقداً">نقداً (كاش من الصندوق الرئيسي)</option>
                  <option value="تحويل بنكي">تحويل بنكي / إلكتروني</option>
                  <option value="شيك بنكي">شيك بنكي مؤجل</option>
                  <option value="بوابة الدفع">بوابة الدفع الإلكترونية</option>
                </select>
              </div>

              {/* Date preview */}
              <div>
                <label className="font-bold text-gray-400 block mb-1">تاريخ ووقت المعاملة</label>
                <div className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-xs flex items-center gap-2 font-mono text-gray-500">
                  <Calendar size={14} />
                  <span>{new Date().toLocaleString('ar-LY')}</span>
                </div>
              </div>
            </div>

            {/* Voucher note */}
            <div>
              <label className="font-bold text-gray-600 block mb-1">البيان والشرح (ملاحظات السند)</label>
              <textarea
                placeholder="يرجى كتابة شرح وافي لسبب المعاملة المالية لضبط الدفاتر..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
                rows={3}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#236f60]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-l from-[#236f60] to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <CheckCircle size={16} />
                حفظ وترحيل القيود للحسابات والصندوق
              </button>
            </div>
          </form>
        </div>

        {/* List of Previous Vouchers */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3.5 flex justify-between items-center">
            <span className="font-bold text-gray-700 text-sm">سجل السندات والوصولات</span>
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-mono">
              {vouchers.length} سند مرجعي
            </span>
          </div>

          <div className="p-3 overflow-y-auto max-h-[500px] divide-y divide-gray-50 flex-1">
            {vouchers.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                لا توجد سندات مسجلة حالياً في النظام.
              </div>
            ) : (
              vouchers
                .slice()
                .reverse()
                .map((vouch) => {
                  const meta = voucherTypes[vouch.type];
                  return (
                    <div 
                      key={vouch.id}
                      onClick={() => setActiveVoucherSlip(vouch)}
                      className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors flex justify-between items-start gap-2 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            vouch.type === 'receipt' ? 'bg-emerald-500' :
                            vouch.type === 'payment' ? 'bg-red-500' :
                            vouch.type === 'expense' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <span className="font-bold text-gray-800 font-mono">{vouch.voucherNumber}</span>
                        </div>
                        <div className="text-[9px] text-gray-400 font-mono">{new Date(vouch.date).toLocaleDateString('ar-LY')}</div>
                        <div className="font-bold text-gray-700">{vouch.partyName}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-1">{vouch.note}</div>
                      </div>

                      <div className="text-left space-y-1">
                        <div className="font-black font-mono text-gray-950">{(vouch.amount).toFixed(2)}</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('هل أنت متأكد من رغبتك في حذف وإلغاء هذا السند من الصندوق والحسابات؟')) {
                              onDeleteVoucher(vouch.id);
                            }
                          }}
                          className="text-red-400 hover:text-red-600 p-0.5 rounded transition-all inline-block"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Voucher slip printer simulation */}
      {activeVoucherSlip && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl overflow-hidden text-sm text-gray-800 font-mono border border-gray-200" dir="rtl">
            <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
              <span className="font-bold font-sans">طباعة سند مالي مرجعي</span>
              <button 
                onClick={() => setActiveVoucherSlip(null)}
                className="text-white/80 hover:text-white bg-white/10 p-1 rounded-full text-xs"
              >
                إغلاق
              </button>
            </div>

            <div className="p-6 bg-[#fbfbf8] border-b border-dashed border-gray-300">
              {/* Header */}
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-gray-300">
                <h3 className="font-bold text-base font-sans">المحاسب المحترف</h3>
                <p className="text-[10px] text-gray-500 font-sans">برنامج المحاسبة وإدارة المخازن المتكامل</p>
                <div className="text-[11px] font-bold text-gray-700 bg-gray-100 rounded py-1 mt-2 inline-block px-3 font-sans">
                  {voucherTypes[activeVoucherSlip.type].label}
                </div>
              </div>

              {/* Body */}
              <div className="py-4 space-y-3 text-xs font-sans border-b border-dashed border-gray-300">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-500">رقم السند:</span>
                  <span className="font-mono font-bold text-gray-900">{activeVoucherSlip.voucherNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-500">التاريخ:</span>
                  <span className="font-mono">{new Date(activeVoucherSlip.date).toLocaleString('ar-LY')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-500">المستلم/المستفيد:</span>
                  <span className="font-bold text-gray-900">{activeVoucherSlip.partyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-500">طريقة الدفع:</span>
                  <span>{activeVoucherSlip.paymentMethod}</span>
                </div>
                <div className="pt-2">
                  <span className="font-bold text-gray-500 block">البيان والشرح:</span>
                  <p className="p-2 bg-gray-50 rounded text-gray-700 font-mono mt-1 text-xs border border-gray-100 italic leading-relaxed">
                    "{activeVoucherSlip.note}"
                  </p>
                </div>
              </div>

              {/* Amount display */}
              <div className="py-4 text-center">
                <span className="text-xs text-gray-400 block font-sans mb-1">المبلغ المرقوم</span>
                <span className="text-2xl font-black text-gray-900 bg-gray-100/60 border border-gray-200 px-4 py-1.5 rounded-lg font-mono">
                  {activeVoucherSlip.amount.toLocaleString()} <span className="text-xs text-gray-500 font-sans font-semibold">محلي</span>
                </span>
              </div>

              {/* Signature lines */}
              <div className="pt-6 grid grid-cols-2 text-center text-[10px] text-gray-400 font-sans gap-4">
                <div className="border-t border-gray-200 pt-2">
                  <p>توقيع أمين الصندوق</p>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <p>توقيع المستلم/العميل</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-900"
              >
                <Printer size={14} />
                طباعة السند
              </button>
              <button
                onClick={() => setActiveVoucherSlip(null)}
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
