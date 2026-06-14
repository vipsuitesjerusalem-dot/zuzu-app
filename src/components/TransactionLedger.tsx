/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinancialTransaction, SavingsGoal, InvestmentAsset } from '../types';
import { History, Plus, Trash2, ArrowUpRight, ArrowDownLeft, TrendingUp, Info } from 'lucide-react';

interface TransactionLedgerProps {
  transactions: FinancialTransaction[];
  savingsGoals: SavingsGoal[];
  investmentAssets: InvestmentAsset[];
  onAddTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export function TransactionLedger({
  transactions,
  savingsGoals,
  investmentAssets,
  onAddTransaction,
  onDeleteTransaction
}: TransactionLedgerProps) {
  const [filter, setFilter] = useState<'all' | 'savings' | 'investment'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [amount, setAmount] = useState<number>(1000);
  const [type, setType] = useState<FinancialTransaction['type']>('deposit');
  const [targetCategory, setTargetCategory] = useState<'savings' | 'investment'>('savings');
  const [targetId, setTargetId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Handle target list dynamically
  const availableTargets = targetCategory === 'savings' 
    ? savingsGoals.map(g => ({ id: g.id, name: g.name }))
    : investmentAssets.map(i => ({ id: i.id, name: i.name }));

  // Auto set targetId on change of category
  React.useEffect(() => {
    if (availableTargets.length > 0) {
      setTargetId(availableTargets[0].id);
    } else {
      setTargetId('');
    }
  }, [targetCategory, savingsGoals, investmentAssets]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    const chosenTargetName = availableTargets.find(t => t.id === targetId)?.name || 'כללי';

    onAddTransaction({
      date,
      type,
      amount: Number(amount),
      targetId,
      targetName: chosenTargetName,
      category: targetCategory,
      notes
    });

    // Reset simple form
    setAmount(1000);
    setNotes('');
    setIsAdding(false);
  };

  const formatILS = (val: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(val);
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.category === filter;
  });

  // Action type badges
  const getActionBadge = (t: FinancialTransaction['type']) => {
    switch(t) {
      case 'deposit':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <ArrowDownLeft size={12} />
            הפקדה קבועה
          </span>
        );
      case 'withdrawal':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
            <ArrowUpRight size={12} />
            משיכת כספים
          </span>
        );
      case 'appreciation':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
            <TrendingUp size={12} />
            עדכון שער שוק
          </span>
        );
      case 'dividend':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
            <ArrowDownLeft size={12} />
            דיבידנד/ריבית
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6 animate-fade-in-up" id="transaction-ledger-section">
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <History className="text-slate-600" size={20} />
            <span>יומן תנועות פיננסיות ועדכונים</span>
          </h2>
          <p className="text-xs text-slate-500">יומן רישום היסטורי לכל הפקדות, משוך ותשואות משותפות בנכסים שלך</p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Category filter */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              הכל
            </button>
            <button
              onClick={() => setFilter('savings')}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === 'savings' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              חסכונות (מטרות)
            </button>
            <button
              onClick={() => setFilter('investment')}
              className={`px-3 py-1.5 rounded-md transition-all ${filter === 'investment' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
            >
              השקעות (נכסים)
            </button>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-900 rounded-lg shadow-sm"
          >
            <Plus size={14} />
            <span>רשום פעולה</span>
          </button>
        </div>
      </div>

      {/* Add action Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 max-w-2xl mx-auto animate-fade-in-up">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">רישום פעולה חדשה ביומן</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">תאריך ביצוע</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white text-right"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">סוג הקבוצה</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value as any)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white"
              >
                <option value="savings">חיסכון (מטרות)</option>
                <option value="investment">השקעות (נכסים)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">בחר נכס או מטרה יעד</label>
              {availableTargets.length === 0 ? (
                <div className="text-xs text-rose-600 py-2">לא קיימים משאבים בקטגוריה זו.</div>
              ) : (
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white"
                  required
                >
                  {availableTargets.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">סוג הפעולה הפיננסית</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white"
              >
                <option value="deposit">הפקדת כספים (מזומן נוסף)</option>
                <option value="withdrawal">משיכת כספים (שינוי שלילי)</option>
                {targetCategory === 'investment' && (
                  <>
                    <option value="appreciation">עדכון שער שוק / רווחי הון</option>
                    <option value="dividend">דיבידנד או ריבית מצטברת</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">סכום הפעולה במטבע שקלים (₪)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white text-right"
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">הערות ותיאור (לא חובה)</label>
            <input
              type="text"
              placeholder="למשל: סוערה חודש רווחי הון מוגדלים, העברה קבועה מבנק לאומי..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-white text-right"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={!targetId}
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-55 rounded-lg shadow-xs"
            >
              אישור והוספה
            </button>
          </div>
        </form>
      )}

      {/* Table grid layout representing sheet columns */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 custom-scrollbar">
        <table className="w-full text-right text-xs" id="ledger-table">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3 font-semibold text-right">תאריך</th>
              <th className="p-3 font-semibold text-right">יעד ומשאב</th>
              <th className="p-3 font-semibold text-right">סיווג</th>
              <th className="p-3 font-semibold text-right">סוג פעולה</th>
              <th className="p-3 font-semibold text-right">סכום</th>
              <th className="p-3 font-semibold text-right">הערה</th>
              <th className="p-3 font-semibold text-center w-12">מחיקה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  לא נמצאו רישומים התואמים לסינון הנוכחי. השתמש בכפתור הוספת פעולה למעלה.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 text-slate-500 font-mono whitespace-nowrap">{tx.date}</td>
                  <td className="p-3 font-bold text-slate-800">{tx.targetName}</td>
                  <td className="p-3">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${tx.category === 'savings' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}`}>
                      {tx.category === 'savings' ? 'חיסכון' : 'השקעה'}
                    </span>
                  </td>
                  <td className="p-3">{getActionBadge(tx.type)}</td>
                  <td className={`p-3 font-bold ${tx.type === 'withdrawal' ? 'text-rose-600' : 'text-slate-800'}`}>
                    {tx.type === 'withdrawal' ? '-' : ''}{formatILS(tx.amount)}
                  </td>
                  <td className="p-3 text-slate-500 italic max-w-xs truncate" title={tx.notes}>
                    {tx.notes || '—'}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="רענן מיומן"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 bg-slate-55 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100 text-slate-500 leading-normal text-[11px]">
        <Info size={14} className="text-indigo-600 shrink-0" />
        <span>
          פעולות הרשומות ביומן זה נשמרות בדפדפן המקומי שלכם. במידה ותרצו, תמיד תוכלו לייצא אותן כקובץ CSV בעזרת כפתור הייצוא שבראש דף האפליקציה.
        </span>
      </div>

    </div>
  );
}
