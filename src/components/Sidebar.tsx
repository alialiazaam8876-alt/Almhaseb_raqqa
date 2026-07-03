/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Phone, Mail, ShoppingCart, ShoppingBag, Users, Truck, 
  Wallet, TrendingUp, Settings, HelpCircle, PlusCircle, 
  BarChart2, FileText, Download 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickAction: (action: string) => void;
}

export default function Sidebar({ isOpen, onClose, activeTab, setActiveTab, onQuickAction }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم الرئيسية', icon: BarChart2 },
    { id: 'sales', label: 'فواتير المبيعات (POS)', icon: ShoppingCart },
    { id: 'purchases', label: 'فواتير المشتريات', icon: ShoppingBag },
    { id: 'inventory', label: 'المخزون والجرد', icon: FileText },
    { id: 'customers', label: 'حسابات العملاء', icon: Users },
    { id: 'suppliers', label: 'حسابات الموردين', icon: Truck },
    { id: 'vouchers', label: 'السندات والقيود اليومية', icon: Wallet },
    { id: 'reports', label: 'الإيرادات والمصروفات والصافي', icon: TrendingUp },
  ];

  const quickActions = [
    { id: 'add-product', label: 'إضافة صنف جديد', icon: PlusCircle },
    { id: 'add-customer', label: 'إضافة عميل جديد', icon: Users },
    { id: 'add-supplier', label: 'إضافة مورد جديد', icon: Truck },
    { id: 'backup', label: 'النسخ الاحتياطي والبيانات', icon: Download },
  ];

  const handleNav = (tabId: string) => {
    setActiveTab(tabId);
    onClose();
  };

  const handleAction = (actionId: string) => {
    onQuickAction(actionId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer container (Slide-in from right for RTL layout) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-80 max-w-full bg-white shadow-2xl z-50 flex flex-col font-sans"
            dir="rtl"
          >
            {/* Header Banner matching Screenshot 1 */}
            <div className="bg-[#236f60] text-white p-6 relative overflow-hidden flex flex-col items-center">
              <button 
                onClick={onClose}
                className="absolute top-4 left-4 text-white/80 hover:text-white hover:bg-black/10 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              {/* Logo / App Name Display */}
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 mb-3 shadow-inner">
                <div className="text-center">
                  <div className="font-extrabold text-xl tracking-tight leading-none">المحاسب</div>
                  <div className="text-[10px] text-green-300 font-bold tracking-widest uppercase">المحترف</div>
                </div>
              </div>

              <h2 className="text-xl font-bold tracking-tight mb-2">المحاسب المحترف</h2>
              
              {/* Contact info from Screenshot 1 */}
              <div className="flex flex-col items-center text-xs text-white/80 space-y-1 mt-1">
                <div className="flex items-center gap-1 font-mono text-green-200">
                  <Phone size={12} />
                  <span>+967 752 151 58</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-green-200">
                  <Mail size={12} />
                  <span>almohaseb.jw@gmail.com</span>
                </div>
              </div>

              {/* Decorative accent lines */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-400/10 rounded-full blur-xl" />
            </div>

            {/* Sidebar Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
              <div>
                <span className="text-xs font-semibold text-gray-400 px-3 uppercase tracking-wider block mb-2">
                  الصفحات والوظائف
                </span>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                          isActive 
                            ? 'bg-[#e9f5f2] text-[#236f60] font-bold border-r-4 border-[#236f60]' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-[#236f60]' : 'text-gray-400'} />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 px-3 uppercase tracking-wider block mb-2">
                  إجراءات سريعة تهيئة
                </span>
                <div className="space-y-1">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleAction(action.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <Icon size={16} className="text-gray-400" />
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* App version footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-1 items-center justify-center text-xs text-gray-400">
              <div className="font-semibold text-gray-500">تهيئة النظام وتحت إشراف مالي</div>
              <div>نسخة الويب السحابية v1.4.0</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
