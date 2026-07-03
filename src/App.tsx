/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, Wallet, Users, FolderPlus, Plus, X, BarChart2, 
  ShoppingCart, ShoppingBag, ClipboardList, HelpCircle, Download, FileText, Settings 
} from 'lucide-react';

import { AppState, Product, Customer, Supplier, Transaction, Voucher, TransactionType } from './types';
import { initialAppState } from './initialData';

// Component Imports
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import TransactionPanel from './components/TransactionPanel';
import VouchersPanel from './components/VouchersPanel';
import DirectoryPanel from './components/DirectoryPanel';
import FiscalYearAndPrinterSettings from './components/FiscalYearAndPrinterSettings';

export default function App() {
  // Main database state
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('almohaseb_state_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to restore local accounting state', e);
      }
    }
    return initialAppState;
  });

  // Save changes to localStorage automatically
  useEffect(() => {
    localStorage.setItem('almohaseb_state_v3', JSON.stringify(state));
  }, [state]);

  // Sidebar Open State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Quick Modal controllers
  const [activeModal, setActiveModal] = useState<'add-product' | 'edit-product' | 'add-customer' | 'add-supplier' | 'quick-voucher' | null>(null);
  
  // Voucher selection modal parameter
  const [quickVoucherType, setQuickVoucherType] = useState<'receipt' | 'payment'>('receipt');
  
  // Transaction type parameter
  const [activeTxType, setActiveTxType] = useState<TransactionType>('sales');

  // Editing temporary state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for Modal
  const [prodForm, setProdForm] = useState({
    code: '',
    name: '',
    category: 'مواد طلاء',
    currentStock: 0,
    unitCost: 0,
    salePrice: 0,
    unitType: 'حبة',
    origin: 'محلي'
  });

  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', email: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', email: '' });

  // Add Product Action
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.code) {
      alert('الرجاء تعبئة الاسم الرمزي والاسم التجاري للصنف');
      return;
    }

    // Check code unique
    if (state.products.some(p => p.code === prodForm.code)) {
      alert('كود الصنف مكرر! يرجى اختيار كود فريد');
      return;
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      code: prodForm.code,
      name: prodForm.name,
      category: prodForm.category,
      currentStock: Number(prodForm.currentStock) || 0,
      unitCost: Number(prodForm.unitCost) || 0,
      salePrice: Number(prodForm.salePrice) || 0,
      lastPurchasePrice: Number(prodForm.unitCost) || 0,
      unitType: prodForm.unitType,
      currency: state.currency,
      origin: prodForm.origin
    };

    setState(prev => ({
      ...prev,
      products: [...prev.products, newProd]
    }));

    // Reset Form & close
    setProdForm({
      code: '',
      name: '',
      category: 'مواد طلاء',
      currentStock: 0,
      unitCost: 0,
      salePrice: 0,
      unitType: 'حبة',
      origin: 'محلي'
    });
    setActiveModal(null);
    alert('تم إضافة الصنف للمستودع بنجاح!');
  };

  // Update Product Action
  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === editingProduct.id ? {
        ...editingProduct,
        currentStock: Number(editingProduct.currentStock) || 0,
        unitCost: Number(editingProduct.unitCost) || 0,
        salePrice: Number(editingProduct.salePrice) || 0,
        lastPurchasePrice: Number(editingProduct.lastPurchasePrice) || 0,
      } : p)
    }));

    setEditingProduct(null);
    setActiveModal(null);
    alert('تم تعديل الصنف بنجاح!');
  };

  // Delete Product
  const handleDeleteProduct = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الصنف من الدليل؟')) {
      setState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      }));
    }
  };

  // Adjust Stock Quick
  const handleAdjustStock = (id: string, newStock: number) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, currentStock: newStock } : p)
    }));
    alert('تم تحديث الجرد المباشر للصنف!');
  };

  // Add Customer Action
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: customerForm.name,
      phone: customerForm.phone,
      email: customerForm.email,
      balance: 0
    };

    setState(prev => ({
      ...prev,
      customers: [...prev.customers, newCust]
    }));

    setCustomerForm({ name: '', phone: '', email: '' });
    setActiveModal(null);
    alert('تم إضافة العميل بنجاح!');
  };

  const handleDeleteCustomer = (id: string) => {
    setState(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id)
    }));
  };

  // Add Supplier Action
  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name) return;

    const newSupp: Supplier = {
      id: `supp-${Date.now()}`,
      name: supplierForm.name,
      phone: supplierForm.phone,
      email: supplierForm.email,
      balance: 0
    };

    setState(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, newSupp]
    }));

    setSupplierForm({ name: '', phone: '', email: '' });
    setActiveModal(null);
    alert('تم إضافة المورد بنجاح!');
  };

  const handleDeleteSupplier = (id: string) => {
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s.id !== id)
    }));
  };

  // Voucher operations
  const handleAddVoucher = (voucher: Omit<Voucher, 'id' | 'voucherNumber' | 'date'>) => {
    const voucherNo = `${voucher.type === 'receipt' ? 'REC' : voucher.type === 'payment' ? 'PAY' : 'EXP'}-${Date.now().toString().slice(-6)}`;
    const newVoucher: Voucher = {
      ...voucher,
      id: `vouch-${Date.now()}`,
      voucherNumber: voucherNo,
      date: new Date().toISOString()
    };

    setState(prev => {
      // Adjust safeBalance
      let newSafeBalance = prev.safeBalance;
      if (voucher.type === 'receipt' || voucher.type === 'revenue') {
        newSafeBalance += voucher.amount;
      } else {
        newSafeBalance -= voucher.amount;
      }

      // Adjust customer/supplier balances
      const updatedCustomers = prev.customers.map(c => {
        if (voucher.type === 'receipt' && c.id === voucher.partyId) {
          // Received payment from customer -> decreases debt to us
          return { ...c, balance: c.balance - voucher.amount };
        }
        return c;
      });

      const updatedSuppliers = prev.suppliers.map(s => {
        if (voucher.type === 'payment' && s.id === voucher.partyId) {
          // Paid supplier -> decreases our debt to them
          return { ...s, balance: s.balance - voucher.amount };
        }
        return s;
      });

      return {
        ...prev,
        vouchers: [...prev.vouchers, newVoucher],
        safeBalance: newSafeBalance,
        customers: updatedCustomers,
        suppliers: updatedSuppliers
      };
    });
  };

  // Delete Voucher
  const handleDeleteVoucher = (id: string) => {
    const targetVouch = state.vouchers.find(v => v.id === id);
    if (!targetVouch) return;

    setState(prev => {
      // Revert safe balance
      let revertedSafeBalance = prev.safeBalance;
      if (targetVouch.type === 'receipt' || targetVouch.type === 'revenue') {
        revertedSafeBalance -= targetVouch.amount;
      } else {
        revertedSafeBalance += targetVouch.amount;
      }

      // Revert customer/supplier ledger balances
      const updatedCustomers = prev.customers.map(c => {
        if (targetVouch.type === 'receipt' && c.id === targetVouch.partyId) {
          return { ...c, balance: c.balance + targetVouch.amount };
        }
        return c;
      });

      const updatedSuppliers = prev.suppliers.map(s => {
        if (targetVouch.type === 'payment' && s.id === targetVouch.partyId) {
          return { ...s, balance: s.balance + targetVouch.amount };
        }
        return s;
      });

      return {
        ...prev,
        vouchers: prev.vouchers.filter(v => v.id !== id),
        safeBalance: revertedSafeBalance,
        customers: updatedCustomers,
        suppliers: updatedSuppliers
      };
    });
    alert('تم مسح وإلغاء قيد السند بنجاح من الدفاتر!');
  };

  // Add Transaction (Sales, Purchases, Returns)
  const handleAddTransaction = (tx: Omit<Transaction, 'id' | 'invoiceNumber' | 'date'>) => {
    const isSales = tx.type === 'sales';
    const isPurchase = tx.type === 'purchases';
    const isSalesReturn = tx.type === 'sales_return';
    const isPurchaseReturn = tx.type === 'purchases_return';

    const invPrefix = isSales ? 'SINV' : isPurchase ? 'PINV' : isSalesReturn ? 'SRET' : 'PRET';
    const invoiceNo = `${invPrefix}-${Date.now().toString().slice(-6)}`;
    
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      invoiceNumber: invoiceNo,
      date: new Date().toISOString()
    };

    setState(prev => {
      // Adjust products stock
      const updatedProducts = prev.products.map(p => {
        const itemInInvoice = tx.items.find(item => item.productId === p.id);
        if (itemInInvoice) {
          let newStock = p.currentStock;
          if (isSales || isPurchaseReturn) {
            newStock -= itemInInvoice.quantity;
          } else if (isPurchase || isSalesReturn) {
            newStock += itemInInvoice.quantity;
          }
          
          // Also update last purchase price for future estimates
          return {
            ...p,
            currentStock: Math.max(0, newStock),
            lastPurchasePrice: isPurchase ? itemInInvoice.unitPrice : p.lastPurchasePrice
          };
        }
        return p;
      });

      // Adjust Safe balance
      let newSafe = prev.safeBalance;
      if (isSales) {
        newSafe += tx.paidAmount;
      } else if (isPurchase) {
        newSafe -= tx.paidAmount;
      } else if (isSalesReturn) {
        newSafe -= tx.paidAmount; // We returned cash to customer
      } else if (isPurchaseReturn) {
        newSafe += tx.paidAmount; // Supplier returned cash to us
      }

      // Adjust Customers ledger if credit
      const updatedCustomers = prev.customers.map(c => {
        if (c.id === tx.partyId) {
          if (isSales) {
            // Sales to customer -> increases their debt to us (receivable)
            return { ...c, balance: c.balance + tx.remainingAmount };
          } else if (isSalesReturn) {
            // Customer returned items -> decreases their debt to us (or adds negative debt)
            return { ...c, balance: c.balance - tx.remainingAmount };
          }
        }
        return c;
      });

      // Adjust Suppliers ledger if credit
      const updatedSuppliers = prev.suppliers.map(s => {
        if (s.id === tx.partyId) {
          if (isPurchase) {
            // Purchase from supplier -> increases our debt to them (payable)
            return { ...s, balance: s.balance + tx.remainingAmount };
          } else if (isPurchaseReturn) {
            // Purchase return to supplier -> decreases our debt to them
            return { ...s, balance: s.balance - tx.remainingAmount };
          }
        }
        return s;
      });

      return {
        ...prev,
        products: updatedProducts,
        transactions: [...prev.transactions, newTx],
        safeBalance: newSafe,
        customers: updatedCustomers,
        suppliers: updatedSuppliers
      };
    });
  };

  // Helper Modal Openers
  const openVoucherModal = (type: 'receipt' | 'payment') => {
    setQuickVoucherType(type);
    setActiveTab('vouchers');
  };

  const openQuickTx = (type: TransactionType) => {
    setActiveTxType(type);
    setActiveTab(type);
  };

  // Sidebar commands
  const handleQuickAction = (action: string) => {
    if (action === 'add-product') {
      setProdForm({
        code: `${1000 + state.products.length + 1}`,
        name: '',
        category: 'مواد طلاء',
        currentStock: 0,
        unitCost: 0,
        salePrice: 0,
        unitType: 'حبة',
        origin: 'محلي'
      });
      setActiveModal('add-product');
    } else if (action === 'add-customer') {
      setCustomerForm({ name: '', phone: '', email: '' });
      setActiveModal('add-customer');
    } else if (action === 'add-supplier') {
      setSupplierForm({ name: '', phone: '', email: '' });
      setActiveModal('add-supplier');
    } else if (action === 'backup') {
      setActiveTab('reports');
    }
  };

  // Reset database callback
  const handleResetDatabase = () => {
    setState({
      products: [],
      customers: [],
      suppliers: [],
      transactions: [],
      vouchers: [],
      safeBalance: 0,
      openingCapital: 0,
      currency: 'محلي',
      fiscalYear: '2026',
      printerSettings: {
        paperSize: '80mm',
        autoPrint: false,
        headerNote: 'المحاسب المحترف',
        footerNote: 'شكراً لتعاملكم معنا'
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-[#236f60]/20 selection:text-[#236f60]" dir="rtl">
      
      {/* Top Header matching Screenshot 2 */}
      <header className="sticky top-0 z-30 bg-gradient-to-l from-[#236f60] to-[#2e7d6c] text-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="القائمة الجانبية"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center font-black">
              مح
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight leading-none">المحاسب المحترف</h1>
              <span className="text-[10px] text-green-200 tracking-wider font-bold">إدارة المخازن والحسابات السحابية</span>
            </div>
          </div>
        </div>

        {/* Navigation Quick Tabs on Header */}
        <nav className="hidden md:flex items-center gap-1.5 bg-black/10 p-1 rounded-lg text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-white text-[#236f60] font-extrabold shadow-sm' : 'hover:bg-white/5'}`}
          >
            لوحة القيادة
          </button>
          <button 
            onClick={() => setActiveTab('inventory')} 
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'inventory' ? 'bg-white text-[#236f60] font-extrabold shadow-sm' : 'hover:bg-white/5'}`}
          >
            جرد المخزون
          </button>
          <button 
            onClick={() => setActiveTab('sales')} 
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'sales' ? 'bg-white text-[#236f60] font-extrabold shadow-sm' : 'hover:bg-white/5'}`}
          >
            مبيعات POS
          </button>
          <button 
            onClick={() => setActiveTab('purchases')} 
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'purchases' ? 'bg-white text-[#236f60] font-extrabold shadow-sm' : 'hover:bg-white/5'}`}
          >
            مشتريات
          </button>
          <button 
            onClick={() => setActiveTab('vouchers')} 
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'vouchers' ? 'bg-white text-[#236f60] font-extrabold shadow-sm' : 'hover:bg-white/5'}`}
          >
            السندات
          </button>
          <button 
            onClick={() => setActiveTab('customers')} 
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'customers' || activeTab === 'suppliers' ? 'bg-white text-[#236f60] font-extrabold shadow-sm' : 'hover:bg-white/5'}`}
          >
            العملاء والموردين
          </button>
          <button 
            onClick={() => setActiveTab('reports')} 
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'reports' ? 'bg-white text-[#236f60] font-extrabold shadow-sm' : 'hover:bg-white/5'}`}
          >
            الإعدادات والنسخ
          </button>
        </nav>

        {/* Cash register instant preview */}
        <div className="flex items-center gap-2">
          <div className="bg-black/15 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/10">
            <Wallet size={14} className="text-green-300" />
            <span className="text-xs text-white/80 font-bold hidden sm:inline">الصندوق:</span>
            <span className="font-mono font-black text-sm text-green-300">
              {state.safeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard 
                state={state} 
                setActiveTab={setActiveTab} 
                onOpenVoucherModal={openVoucherModal} 
                onOpenQuickTx={openQuickTx} 
              />
            )}

            {activeTab === 'inventory' && (
              <Inventory 
                products={state.products}
                onAddProduct={() => handleQuickAction('add-product')}
                onEditProduct={(prod) => { setEditingProduct(prod); setActiveModal('edit-product'); }}
                onDeleteProduct={handleDeleteProduct}
                onAdjustStock={handleAdjustStock}
              />
            )}

            {activeTab === 'sales' && (
              <TransactionPanel 
                type="sales"
                products={state.products}
                customers={state.customers}
                suppliers={state.suppliers}
                transactions={state.transactions}
                onAddTransaction={handleAddTransaction}
              />
            )}

            {activeTab === 'purchases' && (
              <TransactionPanel 
                type="purchases"
                products={state.products}
                customers={state.customers}
                suppliers={state.suppliers}
                transactions={state.transactions}
                onAddTransaction={handleAddTransaction}
              />
            )}

            {activeTab === 'sales_return' && (
              <TransactionPanel 
                type="sales_return"
                products={state.products}
                customers={state.customers}
                suppliers={state.suppliers}
                transactions={state.transactions}
                onAddTransaction={handleAddTransaction}
              />
            )}

            {activeTab === 'purchases_return' && (
              <TransactionPanel 
                type="purchases_return"
                products={state.products}
                customers={state.customers}
                suppliers={state.suppliers}
                transactions={state.transactions}
                onAddTransaction={handleAddTransaction}
              />
            )}

            {activeTab === 'vouchers' && (
              <VouchersPanel 
                vouchers={state.vouchers}
                customers={state.customers}
                suppliers={state.suppliers}
                onAddVoucher={handleAddVoucher}
                onDeleteVoucher={handleDeleteVoucher}
              />
            )}

            {(activeTab === 'customers' || activeTab === 'suppliers') && (
              <DirectoryPanel 
                initialSubTab={activeTab === 'customers' ? 'customers' : 'suppliers'}
                customers={state.customers}
                suppliers={state.suppliers}
                transactions={state.transactions}
                vouchers={state.vouchers}
                onAddCustomer={(c) => {
                  const newCust: Customer = { id: `cust-${Date.now()}`, name: c.name, phone: c.phone, email: c.email, balance: 0 };
                  setState(prev => ({ ...prev, customers: [...prev.customers, newCust] }));
                }}
                onAddSupplier={(s) => {
                  const newSupp: Supplier = { id: `supp-${Date.now()}`, name: s.name, phone: s.phone, email: s.email, balance: 0 };
                  setState(prev => ({ ...prev, suppliers: [...prev.suppliers, newSupp] }));
                }}
                onDeleteCustomer={handleDeleteCustomer}
                onDeleteSupplier={handleDeleteSupplier}
              />
            )}

            {activeTab === 'reports' && (
              <FiscalYearAndPrinterSettings 
                state={state}
                onUpdateFiscalYear={(year) => setState(prev => ({ ...prev, fiscalYear: year }))}
                onUpdateCurrency={(cur) => setState(prev => ({ ...prev, currency: cur }))}
                onUpdatePrinter={(print) => setState(prev => ({ ...prev, printerSettings: print }))}
                onImportBackup={(backup) => setState(backup)}
                onResetDatabase={handleResetDatabase}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation bar for mobile view matching Screenshot 3 style */}
      <footer className="md:hidden sticky bottom-0 z-30 bg-white border-t border-gray-200 px-4 py-2 flex justify-around text-gray-500 text-[10px] font-bold">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'dashboard' ? 'text-[#236f60]' : ''}`}
        >
          <BarChart2 size={18} />
          <span>الرئيسية</span>
        </button>
        <button 
          onClick={() => setActiveTab('inventory')} 
          className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'inventory' ? 'text-[#236f60]' : ''}`}
        >
          <ClipboardList size={18} />
          <span>المخزون</span>
        </button>
        <button 
          onClick={() => setActiveTab('sales')} 
          className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'sales' ? 'text-[#236f60]' : ''}`}
        >
          <ShoppingCart size={18} />
          <span>المبيعات</span>
        </button>
        <button 
          onClick={() => setActiveTab('vouchers')} 
          className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'vouchers' ? 'text-[#236f60]' : ''}`}
        >
          <Wallet size={18} />
          <span>السندات</span>
        </button>
        <button 
          onClick={() => setActiveTab('reports')} 
          className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === 'reports' ? 'text-[#236f60]' : ''}`}
        >
          <Settings size={18} />
          <span>تهيئة</span>
        </button>
      </footer>

      {/* Sidebar drawer element */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onQuickAction={handleQuickAction}
      />

      {/* Full Database modallers for quick addition */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-sm text-gray-800" dir="rtl"
            >
              <div className="bg-gradient-to-l from-[#236f60] to-[#2e7d6c] text-white px-4 py-3 flex justify-between items-center">
                <span className="font-bold">
                  {activeModal === 'add-product' ? 'إدخال صنف تجاري جديد' : 
                   activeModal === 'edit-product' ? 'تعديل بيانات الصنف' :
                   activeModal === 'add-customer' ? 'تسجيل عميل جديد' : 'تسجيل مورد جديد'}
                </span>
                <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-white/10 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5">
                {activeModal === 'add-product' && (
                  <form onSubmit={handleAddProductSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 font-semibold block mb-1">رقم/كود الصنف (فريد)</label>
                        <input
                          type="text"
                          required
                          value={prodForm.code}
                          onChange={(e) => setProdForm({ ...prodForm, code: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-semibold block mb-1">اسم الصنف</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: عازل زيتي"
                          value={prodForm.name}
                          onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 font-semibold block mb-1">المجموعة / الفئة</label>
                        <select
                          value={prodForm.category}
                          onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        >
                          <option value="مواد طلاء">مواد طلاء</option>
                          <option value="أدوات طلاء">أدوات طلاء</option>
                          <option value="مواد بناء">مواد بناء</option>
                          <option value="مواد نجارة">مواد نجارة</option>
                          <option value="أخرى">أخرى</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-semibold block mb-1">وحدة القياس</label>
                        <select
                          value={prodForm.unitType}
                          onChange={(e) => setProdForm({ ...prodForm, unitType: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        >
                          <option value="حبة">حبة</option>
                          <option value="كيس">كيس</option>
                          <option value="كيلو">كيلو</option>
                          <option value="كرتونة">كرتونة</option>
                          <option value="لتر">لتر</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-1">رصيد أول مدة</label>
                        <input
                          type="number"
                          value={prodForm.currentStock}
                          onChange={(e) => setProdForm({ ...prodForm, currentStock: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-1">تكلفة الوحدة</label>
                        <input
                          type="number"
                          step="0.01"
                          value={prodForm.unitCost}
                          onChange={(e) => setProdForm({ ...prodForm, unitCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-1">سعر البيع</label>
                        <input
                          type="number"
                          step="0.01"
                          value={prodForm.salePrice}
                          onChange={(e) => setProdForm({ ...prodForm, salePrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-full p-2 bg-gray-50 border border-[#236f60]/20 rounded-lg text-xs font-mono font-semibold"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex gap-2">
                      <button type="submit" className="flex-1 py-2 bg-[#236f60] text-white font-bold rounded-lg text-xs cursor-pointer">
                        حفظ الصنف للدفاتر
                      </button>
                      <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg text-xs text-gray-700">
                        إلغاء
                      </button>
                    </div>
                  </form>
                )}

                {activeModal === 'edit-product' && editingProduct && (
                  <form onSubmit={handleEditProductSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 font-semibold block mb-1">رقم/كود الصنف</label>
                        <input
                          type="text"
                          disabled
                          value={editingProduct.code}
                          className="w-full p-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-mono text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-semibold block mb-1">اسم الصنف</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 font-semibold block mb-1">المجموعة / الفئة</label>
                        <input
                          type="text"
                          value={editingProduct.category}
                          onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-semibold block mb-1">وحدة القياس</label>
                        <input
                          type="text"
                          value={editingProduct.unitType}
                          onChange={(e) => setEditingProduct({ ...editingProduct, unitType: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-1">الكمية الحالية</label>
                        <input
                          type="number"
                          value={editingProduct.currentStock}
                          onChange={(e) => setEditingProduct({ ...editingProduct, currentStock: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-1">سعر التكلفة</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct.unitCost}
                          onChange={(e) => setEditingProduct({ ...editingProduct, unitCost: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 font-semibold block mb-1">سعر البيع</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editingProduct.salePrice}
                          onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-full p-2 bg-gray-50 border border-emerald-100 rounded-lg text-xs font-mono text-emerald-700 font-bold"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex gap-2">
                      <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer">
                        تعديل وحفظ
                      </button>
                      <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg text-xs text-gray-700">
                        إلغاء
                      </button>
                    </div>
                  </form>
                )}

                {activeModal === 'add-customer' && (
                  <form onSubmit={handleAddCustomerSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 font-semibold block mb-1">اسم العميل بالكامل</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: شركة الوفاء للمقاولات"
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-semibold block mb-1">رقم الهاتف للاتصال</label>
                      <input
                        type="text"
                        placeholder="رقم الهاتف..."
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-semibold block mb-1">البريد الإلكتروني</label>
                      <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="pt-3 flex gap-2">
                      <button type="submit" className="flex-1 py-2 bg-[#236f60] text-white font-bold rounded-lg text-xs">
                        إضافة عميل جديد
                      </button>
                      <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg text-xs text-gray-700">
                        إلغاء
                      </button>
                    </div>
                  </form>
                )}

                {activeModal === 'add-supplier' && (
                  <form onSubmit={handleAddSupplierSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 font-semibold block mb-1">اسم المورد بالكامل</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: الشركة المتحدة للأصباغ"
                        value={supplierForm.name}
                        onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-semibold block mb-1">رقم الهاتف للاتصال</label>
                      <input
                        type="text"
                        placeholder="رقم الهاتف..."
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-semibold block mb-1">البريد الإلكتروني</label>
                      <input
                        type="email"
                        placeholder="supplier@gmail.com"
                        value={supplierForm.email}
                        onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="pt-3 flex gap-2">
                      <button type="submit" className="flex-1 py-2 bg-[#236f60] text-white font-bold rounded-lg text-xs">
                        إضافة مورد جديد
                      </button>
                      <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-gray-200 rounded-lg text-xs text-gray-700">
                        إلغاء
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
