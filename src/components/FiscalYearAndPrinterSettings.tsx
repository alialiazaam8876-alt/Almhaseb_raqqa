/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, Download, Upload, Printer, Calendar, DollarSign, 
  HelpCircle, CheckCircle, ShieldAlert, FileText, Database, Heart 
} from 'lucide-react';
import { AppState } from '../types';

interface SettingsPanelProps {
  state: AppState;
  onUpdateFiscalYear: (year: string) => void;
  onUpdatePrinter: (printer: AppState['printerSettings']) => void;
  onUpdateCurrency: (currency: string) => void;
  onImportBackup: (imported: AppState) => void;
  onResetDatabase: () => void;
}

export default function FiscalYearAndPrinterSettings({ 
  state, 
  onUpdateFiscalYear, 
  onUpdatePrinter, 
  onUpdateCurrency, 
  onImportBackup,
  onResetDatabase
}: SettingsPanelProps) {
  // Local form states
  const [fiscalYear, setFiscalYear] = useState(state.fiscalYear);
  const [currency, setCurrency] = useState(state.currency);
  
  // Printer states
  const [paperSize, setPaperSize] = useState(state.printerSettings.paperSize);
  const [autoPrint, setAutoPrint] = useState(state.printerSettings.autoPrint);
  const [headerNote, setHeaderNote] = useState(state.printerSettings.headerNote);
  const [footerNote, setFooterNote] = useState(state.printerSettings.footerNote);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFiscalYear(fiscalYear);
    onUpdateCurrency(currency);
    onUpdatePrinter({
      paperSize,
      autoPrint,
      headerNote,
      footerNote
    });
    alert('تم حفظ إعدادات وتهيئة النظام بنجاح!');
  };

  // Export database backup as JSON
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `محاسب_محترف_نسخة_احتياطية_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.customers)) {
            onImportBackup(parsed);
            alert('تم استيراد قاعدة البيانات الاحتياطية وتحديث النظام بنجاح تام!');
          } else {
            alert('ملف النسخة الاحتياطية غير متوافق مع نظام المحاسب المحترف.');
          }
        } catch (err) {
          alert('خطأ أثناء قراءة الملف، يرجى التأكد من اختيار ملف JSON صحيح.');
        }
      };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-gray-700 text-sm" dir="rtl">
      
      {/* Intro Tutorial & Guide */}
      <div className="bg-[#236f60]/10 border border-[#236f60]/20 p-5 rounded-xl space-y-3">
        <h3 className="font-extrabold text-base text-[#236f60] flex items-center gap-2">
          <HelpCircle size={18} />
          دليل الاستخدام السريع - برنامج المحاسب المحترف
        </h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          مرحباً بك في <strong>نظام المحاسب المحترف</strong> لإدارة مخازنك، مبيعاتك، وسنداتك المالية. يطبق هذا البرنامج قواعد المحاسبة المالية والقيد المزدوج وجرد المستودعات بشكل متكامل:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="bg-white p-3 rounded-lg border border-[#236f60]/10 space-y-1">
            <span className="font-bold text-[#236f60] block">1. جرد أصناف المستودع</span>
            <p className="text-[11px] text-gray-500">قم بإدخال أصنافك وتعديل أسعار تكلفتها وبيعها من قسم "المخزون والجرد".</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-[#236f60]/10 space-y-1">
            <span className="font-bold text-[#236f60] block">2. إصدار الفواتير الفورية</span>
            <p className="text-[11px] text-gray-500">سجل فواتير مبيعاتك ومشترياتك الآجلة والنقدية، وسيتأثر رصيد الصندوق والمخزون والعميل تلقائياً.</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-[#236f60]/10 space-y-1">
            <span className="font-bold text-[#236f60] block">3. تسوية الذمم والديون</span>
            <p className="text-[11px] text-gray-500">استخدم سندات القبض لتحصيل الديون من عملائك وسندات الصرف لتسديد مستحقات مورديك.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Settings Form */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-800 text-white px-5 py-4 font-bold text-base flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Settings size={18} />
              تهيئة النظام والبيئة المالية
            </span>
          </div>

          <form onSubmit={handleSaveSettings} className="p-5 space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-600 block mb-1">السنة المالية الحالية</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-3 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    required
                    className="w-full pr-9 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">العملة والوحدة</label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-3 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    required
                    className="w-full pr-9 pl-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-3">
              <span className="text-xs font-bold text-gray-500 block flex items-center gap-1">
                <Printer size={14} />
                إعدادات طباعة الفواتير والوصولات
              </span>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-600 block mb-1 text-xs">حجم الورق الحراري</label>
                  <select
                    value={paperSize}
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  >
                    <option value="80mm">80mm (عرض قياسي للمحلات)</option>
                    <option value="58mm">58mm (صغير محمول)</option>
                    <option value="A4">A4 (مستند كامل)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="autoPrint"
                    checked={autoPrint}
                    onChange={(e) => setAutoPrint(e.target.checked)}
                    className="w-4 h-4 text-[#236f60] focus:ring-[#236f60] rounded border-gray-300"
                  />
                  <label htmlFor="autoPrint" className="text-xs font-bold text-gray-600 cursor-pointer">
                    طباعة تلقائية عند ترحيل الفاتورة
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1 text-xs">ترويسة الفاتورة العليا</label>
                <input
                  type="text"
                  value={headerNote}
                  onChange={(e) => setHeaderNote(e.target.value)}
                  placeholder="اسم المحل أو الشركة والعنوان..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1 text-xs">رسالة تذييل الفاتورة</label>
                <input
                  type="text"
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  placeholder="مثال: البضاعة المباعة لا ترد ولا تستبدل..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#236f60] hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                تحديث وحفظ الإعدادات
              </button>
            </div>
          </form>
        </div>

        {/* Backups & Maintenance */}
        <div className="space-y-6">
          
          {/* Data Backup Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-200 px-5 py-4 font-bold text-gray-700 text-sm flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Database size={16} />
                النسخ الاحتياطي وتأمين الدفاتر
              </span>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                نظراً لأهمية حساباتك المالية، ننصحك بأخذ نسخة احتياطية بشكل دوري لحماية بياناتك من الضياع في حال تبديل المتصفح أو مسح ذاكرة التخزين:
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="flex-1 py-2 px-3 bg-gradient-to-l from-emerald-600 to-teal-700 hover:bg-opacity-95 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  تصدير نسخة احتياطية (JSON)
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Upload size={14} />
                  استيراد نسخة احتياطية
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportBackup}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Reset database card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-5 py-4 font-bold text-red-700 text-sm flex justify-between items-center">
              <span className="flex items-center gap-2">
                <ShieldAlert size={16} />
                تهيئة افتراضية وصيانة المصنع
              </span>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                سيؤدي تصفير النظام إلى حذف جميع المنتجات والمبيعات والمشتريات وحسابات العملاء والموردين الحالية وتعيين الإعدادات الافتراضية الأولية مع الصندوق الافتتاحي.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل أنت متأكد تماماً من رغبتك في مسح كافة الحسابات والبدء من جديد؟ لا يمكن التراجع عن هذا الإجراء!')) {
                    onResetDatabase();
                    alert('تمت تهيئة قاعدة البيانات للمصنع بنجاح!');
                  }
                }}
                className="w-full py-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold rounded-lg text-xs transition-colors"
              >
                تصفير كافة الحسابات والمخزون بالكامل
              </button>
            </div>
          </div>

          {/* About Credit */}
          <div className="text-center text-xs text-gray-400 font-sans space-y-1">
            <p className="flex items-center justify-center gap-1">
              <span>تم التطوير بكل</span>
              <Heart size={12} className="text-red-500 fill-red-500" />
              <span>لحماية وتيسير أعمالكم</span>
            </p>
            <p>المحاسب المحترف - نسخة الحوسبة السحابية للمتصفح 2026</p>
          </div>

        </div>

      </div>

    </div>
  );
}
