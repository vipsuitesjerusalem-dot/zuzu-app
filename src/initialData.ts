/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavingsGoal, InvestmentAsset, FinancialTransaction } from './types';

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 's-1',
    name: 'קרן חירום משפחתית',
    category: 'ביטחון',
    targetAmount: 60000,
    currentAmount: 48000,
    monthlyDeposit: 1500,
    startDate: '2025-01-10',
    targetDate: '2026-12-01',
    status: 'active',
    notes: 'קרן נזילה לחצי שנה של הוצאות מחיה קריטיות בפיקדון בנקאי'
  },
  {
    id: 's-2',
    name: 'הון עצמי לדירה',
    category: 'מגורים',
    targetAmount: 350000,
    currentAmount: 182000,
    monthlyDeposit: 4500,
    startDate: '2024-05-01',
    targetDate: '2028-12-31',
    status: 'active',
    notes: 'חיסכון חודשי קבוע להון ראשוני לדירה ראשונה בסיוע ההורים'
  },
  {
    id: 's-3',
    name: 'שדרוג רכב משפחתי',
    category: 'רכב',
    targetAmount: 90000,
    currentAmount: 35000,
    monthlyDeposit: 1200,
    startDate: '2024-09-15',
    targetDate: '2027-06-01',
    status: 'active',
    notes: 'להחלפת הקיה פיקנטו הישנה במכונית פלאג-אין חסכונית'
  },
  {
    id: 's-4',
    name: 'חופשה קיצית ביפן',
    category: 'לייף סטייל',
    targetAmount: 30000,
    currentAmount: 24000,
    monthlyDeposit: 1000,
    startDate: '2025-03-01',
    targetDate: '2026-08-01',
    status: 'active',
    notes: 'טיול של שלושה שבועות כולל טיסות פנימיות ומלונות מסורתיים'
  }
];

export const INITIAL_INVESTMENT_ASSETS: InvestmentAsset[] = [
  {
    id: 'i-1',
    name: 'קרן השתלמות מחקה S&P 500',
    category: 'provident-fund',
    investedAmount: 95000,
    currentValue: 124300,
    annualYieldPercentage: 9.8,
    purchaseDate: '2021-03-12',
    notes: 'קרן פטורה ממס רווחי הון לאחר 6 שנים, מנוהלת בפסגות מחקה מדד'
  },
  {
    id: 'i-2',
    name: 'תיק מניות ישראלי וחו״ל',
    category: 'stocks',
    investedAmount: 70000,
    currentValue: 88400,
    annualYieldPercentage: 11.2,
    purchaseDate: '2022-06-01',
    notes: 'החזקה ישירה של מניות ערך בארץ ומניות טכנולוגיה גדולות בוול סטריט'
  },
  {
    id: 'i-3',
    name: 'קופת גמל להשקעה במסלול מנייתי',
    category: 'provident-fund',
    investedAmount: 45000,
    currentValue: 51200,
    annualYieldPercentage: 7.5,
    purchaseDate: '2023-01-15',
    notes: 'מיועד לחסכון ללימודים גבוהים לילדים, נזיל בכל עת'
  },
  {
    id: 'i-4',
    name: 'החזקה ישירה של ביטקוין ואיקומס',
    category: 'crypto',
    investedAmount: 18000,
    currentValue: 27500,
    annualYieldPercentage: 18.5,
    purchaseDate: '2023-11-05',
    notes: 'חשיפה קטנה ותנודתית לגידור אינפלציה בארנק חומרה'
  },
  {
    id: 'i-5',
    name: 'חלק יחסי בפרויקט נדל״ן בלידס',
    category: 'real-estate',
    investedAmount: 50000,
    currentValue: 53800,
    annualYieldPercentage: 6.2,
    purchaseDate: '2024-02-10',
    notes: 'אחוזים מרכישת דירת סטודנטים בבריטניה דרך ליווי חברת השקעות'
  }
];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 't-1',
    date: '2026-05-28',
    type: 'deposit',
    amount: 4500,
    targetId: 's-2',
    targetName: 'הון עצמי לדירה',
    category: 'savings',
    notes: 'הפקדה חודשית קבועה'
  },
  {
    id: 't-2',
    date: '2026-05-20',
    type: 'appreciation',
    amount: 2400,
    targetId: 'i-1',
    targetName: 'קרן השתלמות מחקה S&P 500',
    category: 'investment',
    notes: 'עדכון שווי חודשי - עליות חדות בוול סטריט'
  },
  {
    id: 't-3',
    date: '2026-05-15',
    type: 'deposit',
    amount: 1500,
    targetId: 's-1',
    targetName: 'קרן חירום משפחתית',
    category: 'savings',
    notes: 'הפקדה מהשלמת הכנסה של עותק בונוס'
  },
  {
    id: 't-4',
    date: '2026-05-02',
    type: 'dividend',
    amount: 620,
    targetId: 'i-2',
    targetName: 'תיק מניות ישראלי וחו״ל',
    category: 'investment',
    notes: 'דיבידנד שהתקבל מחצי שנתי מחברות מדד תל אביב 125'
  },
  {
    id: 't-5',
    date: '2026-04-30',
    type: 'withdrawal',
    amount: 3200,
    targetId: 's-3',
    targetName: 'שדרוג רכב משפחתי',
    category: 'savings',
    notes: 'מקדמת טיפול ותיקון בלמים דחוף שקוזז מהרכב הישן'
  }
];
