/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  currentStock: number;
  unitCost: number;       // تكلفة الوحدة
  salePrice: number;      // سعر البيع
  lastPurchasePrice: number; // آخر شراء
  unitType: string;       // حبة، كرتون، إلخ
  currency: string;       // العملة
  origin: string;         // محلي / مستورد
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  balance: number; // الرصيد: موجب يعني "له" (لك)، سالب "عليه" (له)
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  balance: number; // الرصيد: موجب "له" (عليك)، سالب "عليه" (لك)
}

export type TransactionType = 'sales' | 'purchases' | 'sales_return' | 'purchases_return';

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number; // سعر البيع أو الشراء للوحدة
  total: number;     // الإجمالي قبل الخصم
}

export interface Transaction {
  id: string;
  type: TransactionType;
  invoiceNumber: string;
  date: string;
  partyId: string;       // معرف العميل أو المورد
  partyName: string;     // اسم العميل أو المورد
  items: TransactionItem[];
  discount: number;      // خصم
  tax: number;           // ضريبة
  totalAmount: number;   // المبلغ الإجمالي الصافي
  paidAmount: number;    // المدفوع
  remainingAmount: number; // المتبقي (آجل)
  paymentType: 'cash' | 'credit'; // نقدي / آجل
  note: string;          // ملاحظات
}

export type VoucherType = 'receipt' | 'payment' | 'expense' | 'revenue';

export interface Voucher {
  id: string;
  type: VoucherType; // receipt = سند قبض (تحصيل من عميل)، payment = سند صرف (دفع لمورد)، expense = مصروف، revenue = إيراد آخر
  voucherNumber: string;
  date: string;
  partyId?: string;    // العميل أو المورد (اختياري)
  partyName: string;   // اسم الجهة أو المستلم
  amount: number;      // المبلغ
  paymentMethod: string; // نقدي، شيك، تحويل
  note: string;        // البيان / الملاحظات
}

export interface AppState {
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  transactions: Transaction[];
  vouchers: Voucher[];
  safeBalance: number;       // رصيد الصندوق
  openingCapital: number;    // رأس المال / الإيراد الإفتتاحي
  currency: string;          // العملة الرئيسية (مثلا: ل.ي، ر.س، USD، د.إ)
  fiscalYear: string;        // السنة المالية
  printerSettings: {
    paperSize: string;
    autoPrint: boolean;
    headerNote: string;
    footerNote: string;
  };
}
