/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, Product, Customer, Supplier, Transaction, Voucher } from './types';

const initialProducts: Product[] = [];

const initialCustomers: Customer[] = [];

const initialSuppliers: Supplier[] = [];

const initialTransactions: Transaction[] = [];

const initialVouchers: Voucher[] = [];

export const initialAppState: AppState = {
  products: initialProducts,
  customers: initialCustomers,
  suppliers: initialSuppliers,
  transactions: initialTransactions,
  vouchers: initialVouchers,
  safeBalance: 0,
  openingCapital: 0,
  currency: 'محلي',
  fiscalYear: '2026',
  printerSettings: {
    paperSize: '80mm',
    autoPrint: false,
    headerNote: 'المحاسب المحترف للمقاولات والمواد العازلة',
    footerNote: 'شكراً لتعاملكم معنا'
  }
};
