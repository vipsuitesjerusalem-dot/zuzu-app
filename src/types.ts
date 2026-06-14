/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SavingsGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  monthlyDeposit: number;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  category: 'stocks' | 'bonds' | 'real-estate' | 'crypto' | 'cash' | 'provident-fund';
  investedAmount: number; // Purchase price / entry cost
  currentValue: number;    // Current value
  annualYieldPercentage: number; // estimated or current CAGR
  purchaseDate: string;
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'appreciation' | 'dividend';
  amount: number;
  targetId: string; // ID of SavingsGoal or InvestmentAsset
  targetName: string;
  category: 'savings' | 'investment';
  notes?: string;
}

export interface GenericSheetRow {
  _rowNum: number;
  [key: string]: any;
}

export interface SheetsData {
  "משפטים": any[];
  "מיטב": any[];
  "הפקדות למיטב": any[];
  "בלינק": any[];
  "הפקדות לבלינק": any[];
  "קרנות השתלמות": any[];
  "פנסיה": any[];
  "חיסכון לכל ילד": any[];
}

