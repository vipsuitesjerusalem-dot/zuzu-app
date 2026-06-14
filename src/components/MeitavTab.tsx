/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pencil, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, Wallet, Plus } from 'lucide-react';
import { GenericSheetRow } from '../types';

interface MeitavTabProps {
  data: any[];
  deposits: any[];
  onEditRow: (sheetName: string, row: any) => void;
  onAddRow: (sheetName: string) => void;
}

export function MeitavTab({ data = [], deposits = [], onEditRow, onAddRow }: MeitavTabProps) {
  // Helper to match key names ignoring whitespaces, case, and special characters
  const getRowValueByCleanKey = (row: any, targetKey: string): any => {
    if (!row || typeof row !== 'object') return undefined;
    const cleanTarget = targetKey.replace(/\s+/g, '').toLowerCase();
    
    // Direct match (fast path)
    if (row[targetKey] !== undefined) return row[targetKey];
    
    // Loose trimmed/lowercase match
    const foundKey = Object.keys(row).find(k => {
      const cleanK = k.replace(/\s+/g, '').toLowerCase();
      return cleanK === cleanTarget;
    });
    
    return foundKey ? row[foundKey] : undefined;
  };

  // Parsing helpers
  const cleanNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (val === undefined || val === null) return 0;
    // Strip common currency and spacing symbols, replace commas with empty so parseFloat works
    const cleanStr = String(val).replace(/[₪$,\s()]/g, '').trim();
    if (cleanStr === '') return 0;
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getRowName = (row: any) => {
    return getRowValueByCleanKey(row, "שם הנכס") ?? 
           getRowValueByCleanKey(row, "נכס") ?? 
           getRowValueByCleanKey(row, "שם") ?? 
           getRowValueByCleanKey(row, "Asset Name") ?? 
           "נכס ללא שם";
  };

  const getRowInvested = (row: any) => {
    const val = getRowValueByCleanKey(row, "סכום השקעה") ?? 
                getRowValueByCleanKey(row, "שווי קנייה") ?? 
                getRowValueByCleanKey(row, "השקעה") ?? 
                getRowValueByCleanKey(row, "Invested Amount") ?? 
                getRowValueByCleanKey(row, "עלות");
    return cleanNumber(val);
  };

  const getRowCurrent = (row: any) => {
    const val = getRowValueByCleanKey(row, "שווי נוכחי") ?? 
                getRowValueByCleanKey(row, "שווי עדכני") ?? 
                getRowValueByCleanKey(row, "שווי") ?? 
                getRowValueByCleanKey(row, "Current Value");
    return cleanNumber(val);
  };

  const getRowProfit = (row: any) => {
    const val = getRowValueByCleanKey(row, "שינוי במספרים") ?? 
                getRowValueByCleanKey(row, "רווח") ?? 
                getRowValueByCleanKey(row, "רווח/הפסד") ?? 
                getRowValueByCleanKey(row, "רווח או הפסד");
    if (val !== undefined && val !== null) return cleanNumber(val);
    return getRowCurrent(row) - getRowInvested(row);
  };

  const getRowYield = (row: any) => {
    const y = getRowValueByCleanKey(row, "שינוי באחוזים") ?? 
              getRowValueByCleanKey(row, "שינוי %") ?? 
              getRowValueByCleanKey(row, "תשואה %") ?? 
              getRowValueByCleanKey(row, "תשואה") ?? 
              getRowValueByCleanKey(row, "תשואה באחוזים");
    if (y !== undefined && y !== null) return cleanNumber(y);
    const invested = getRowInvested(row);
    if (invested > 0) {
      return (getRowProfit(row) / invested) * 100;
    }
    return 0;
  };

  const getRowLength = (row: any) => {
    return getRowValueByCleanKey(row, "אורך הטרייד") ?? 
           getRowValueByCleanKey(row, "תקופה") ?? 
           getRowValueByCleanKey(row, "חודשים") ?? 
           getRowValueByCleanKey(row, "Trade Length") ?? 
           "";
  };

  const getRowPurchaseDate = (row: any) => {
    return getRowValueByCleanKey(row, "תאריך קנייה") ?? 
           getRowValueByCleanKey(row, "תאריך רכישה") ?? 
           getRowValueByCleanKey(row, "תאריך") ?? 
           getRowValueByCleanKey(row, "Purchase Date") ?? 
           "";
  };

  const getRowSellDate = (row: any) => {
    return getRowValueByCleanKey(row, "תאריך מכירה") ?? 
           getRowValueByCleanKey(row, "תאריך סיום") ?? 
           getRowValueByCleanKey(row, "Sell Date") ?? 
           "";
  };

  const calculateTradeLength = (purchaseDateStr: string, sellDateStr: string): string => {
    if (!purchaseDateStr || !sellDateStr) return "-";
    
    // Parse helper
    const parseDate = (dStr: string) => {
      if (!dStr) return null;
      const s = String(dStr).trim();
      if (!s) return null;
      
      const dmy = s.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
      if (dmy) {
        return new Date(parseInt(dmy[3]), parseInt(dmy[2]) - 1, parseInt(dmy[1]));
      }
      
      const parsed = Date.parse(s);
      if (!isNaN(parsed)) return new Date(parsed);
      return null;
    };
    
    const pDate = parseDate(purchaseDateStr);
    const sDate = parseDate(sellDateStr);
    
    if (!pDate || !sDate) return "-";
    
    const diffTime = sDate.getTime() - pDate.getTime();
    if (diffTime < 0) return "-";
    
    const diffDaysTotal = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const months = Math.floor(diffDaysTotal / 30.436);
    const days = Math.floor(diffDaysTotal % 30.436);
    
    if (months === 0) {
      return `${diffDaysTotal} ימים`;
    } else if (days === 0) {
      return `${months} חודשים`;
    } else {
      return `${months} חודשים ו-${days} ימים`;
    }
  };

  // Filter rows
  const activeInvestments = data.filter(row => {
    const name = getRowName(row);
    if (!name || name === 'נכס ללא שם' || name === 'מנייה ללא שם' || name === 'סה"כ' || name === 'סהכ') return false;
    const sellDate = getRowSellDate(row);
    if (sellDate === undefined || sellDate === null) return true;
    const sellDateStr = String(sellDate).trim();
    return sellDateStr === "" || sellDateStr.toLowerCase() === "null";
  });

  const inactiveInvestments = data.filter(row => {
    const name = getRowName(row);
    if (!name || name === 'נכס ללא שם' || name === 'מנייה ללא שם' || name === 'סה"כ' || name === 'סהכ') return false;
    const sellDate = getRowSellDate(row);
    if (sellDate === undefined || sellDate === null) return false;
    const sellDateStr = String(sellDate).trim();
    return sellDateStr !== "" && sellDateStr.toLowerCase() !== "null";
  });

  // Compute total deposits
  const computedTotalDeposits = deposits.reduce((sum, d) => {
    const act = d["סוג פעולה"] || d["סוג"] || "";
    const date = d["תאריך"] || "";
    if (String(date).includes("סה\"כ") || String(date).includes("סהכ") || String(act).includes("סה\"כ") || String(act).includes("סהכ")) {
      return sum;
    }
    const amt = cleanNumber(d["סכום"] || d["Amount"]);
    return sum + amt;
  }, 0);

  // Calculate stats for Active only
  const totalActiveCurrent = activeInvestments.reduce((sum, item) => sum + getRowCurrent(item), 0);
  const meitavPrincipal = computedTotalDeposits;
  const totalActiveProfit = totalActiveCurrent - meitavPrincipal;
  const standardROI = meitavPrincipal > 0 ? (totalActiveProfit / meitavPrincipal) * 100 : 0;
  const userRatio = meitavPrincipal > 0 ? (totalActiveCurrent + totalActiveProfit) / meitavPrincipal : 0;

  // Look for any cell/row that claims to be "סה"כ הפקדות" to display alongside
  const sheetTotalDepositsRow = deposits.find(d => {
    const txt = String(d["תאריך"] || d["סוג פעולה"] || "").trim();
    return txt.includes("סה\"כ") || txt.includes("סהכ");
  });
  const sheetTotalDeposits = sheetTotalDepositsRow ? cleanNumber(sheetTotalDepositsRow["סכום"]) : null;

  const formatILS = (val: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* 1. KPI SUMMARY CARD */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-2xl p-6 text-white border border-indigo-500/10 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="space-y-2 flex flex-col items-center md:items-start text-center md:text-right">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 mb-1">
              סיכום פעילות במיטב
            </span>
            <h3 className="text-2xl font-black">מיטב</h3>
          </div>
          <p className="text-xs text-indigo-200/80 leading-relaxed max-w-lg font-medium">
            פירוט העסקאות הפעילות וההחזקות הסגורות המנוהלות במיטב, לצד תזרים הפקדות ומשיכות.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 min-w-[200px] flex flex-col justify-center text-center">
            <span className="text-sm text-slate-250 block font-bold mb-2">שווי משוקלל:</span>
            <span className="text-3xl font-black font-mono text-emerald-400">
              {formatILS(totalActiveCurrent)}
            </span>
            <span className="text-xs text-indigo-200 mt-1.5 font-semibold">קרן: {formatILS(meitavPrincipal)}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 min-w-[200px] flex flex-col justify-center text-center">
            <span className="text-sm text-slate-250 block font-bold mb-2">רווח מצטבר ותשואה:</span>
            <span className={`text-3xl font-black font-mono ${totalActiveProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalActiveProfit >= 0 ? '+' : ''}{formatILS(totalActiveProfit)}
            </span>
            <div className="flex items-center justify-center mt-1.5 text-xs text-indigo-200 font-bold">
              <span>תשואה: {standardROI.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE INVESTMENTS BLOCK */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-start">
            <TrendingUp size={16} className="text-emerald-500 shrink-0" />
            <span>השקעות ועסקאות פעילות ({activeInvestments.length})</span>
          </h4>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            לא נמצאו השקעות פעילות בגיליון.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-3">שם הנכס</th>
                  <th className="py-2.5 px-3">סכום השקעה</th>
                  <th className="py-2.5 px-3">שווי נוכחי</th>
                  <th className="py-2.5 px-3">שינוי באחוזים</th>
                  <th className="py-2.5 px-3">רווח (שקלים)</th>
                  <th className="py-2.5 px-3">אורך טרייד</th>
                  <th className="py-2.5 px-3 text-center">ערוך</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeInvestments.map((row, idx) => {
                  const invested = getRowInvested(row);
                  const current = getRowCurrent(row);
                  const profit = getRowProfit(row);
                  const y = getRowYield(row);
                  return (
                    <tr key={row._rowNum || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800">{getRowName(row)}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{formatILS(invested)}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">{formatILS(current)}</td>
                      <td className={`py-3 px-3 font-mono font-bold ${y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {y >= 0 ? '+' : ''}{y.toFixed(1)}%
                      </td>
                      <td className={`py-3 px-3 font-mono font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {profit >= 0 ? '+' : ''}{formatILS(profit)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">{getRowLength(row) || '-'}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onEditRow("מיטב", row)}
                          className="p-1 px-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 rounded-lg transition-all cursor-pointer inline-flex items-center"
                          title="ערוך שורה"
                        >
                          <Pencil size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Item Action Button */}
        <div className="flex justify-start pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onAddRow("מיטב")}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>הוסף פריט לתיק</span>
          </button>
        </div>
      </div>

      {/* 3. INACTIVE INVESTMENTS BLOCK */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-start">
            <Calendar size={16} className="text-slate-500 shrink-0" />
            <span>השקעות ועסקאות לא פעילות (טריידים שנסגרו) ({inactiveInvestments.length})</span>
          </h4>
        </div>

        {inactiveInvestments.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-slate-150 rounded-xl text-slate-400 text-xs">
            אין עסקאות היסטוריות סגורות בתיק מיטב.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-3">שם הנכס</th>
                  <th className="py-2.5 px-3">סכום השקעה</th>
                  <th className="py-2.5 px-3">שווי נוכחי במכירה</th>
                  <th className="py-2.5 px-3">תשואה סופית</th>
                  <th className="py-2.5 px-3">רווח ממומש</th>
                  <th className="py-2.5 px-3">אורך טרייד</th>
                  <th className="py-2.5 px-3 text-center">ערוך</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inactiveInvestments.map((row, idx) => {
                  const invested = getRowInvested(row);
                  const current = getRowCurrent(row);
                  const profit = getRowProfit(row);
                  const y = getRowYield(row);
                  return (
                    <tr key={row._rowNum || idx} className="hover:bg-slate-50/80 transition-colors opacity-85">
                      <td className="py-3 px-3 font-bold text-slate-700">{getRowName(row)}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{formatILS(invested)}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{formatILS(current)}</td>
                      <td className={`py-3 px-3 font-mono font-bold ${y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {y >= 0 ? '+' : ''}{y.toFixed(1)}%
                      </td>
                      <td className={`py-3 px-3 font-mono font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {profit >= 0 ? '+' : ''}{formatILS(profit)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {calculateTradeLength(getRowPurchaseDate(row), getRowSellDate(row))}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onEditRow("מיטב", row)}
                          className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-all cursor-pointer inline-flex items-center"
                          title="ערוך שורה"
                        >
                          <Pencil size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Historical Item Button */}
        <div className="flex justify-start pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onAddRow("מיטב")}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>הוסף פריט סגור</span>
          </button>
        </div>
      </div>

      {/* 4. DEPOSITS & FLOW BLOCK */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-start">
              <Wallet className="text-indigo-600 shrink-0" size={16} />
              <span>דו"ח תנועות ({deposits.length})</span>
            </h4>
          </div>

          <div className="flex gap-2 text-xs">
            {sheetTotalDeposits !== null && (
              <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-500">סה"כ הפקדות: </span>
                <span className="font-extrabold text-slate-700">{formatILS(sheetTotalDeposits)}</span>
              </div>
            )}
            <div className="bg-indigo-50 text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-100">
              <span className="text-indigo-600">סה"כ הפקדות: </span>
              <span className="font-extrabold">{formatILS(computedTotalDeposits)}</span>
            </div>
          </div>
        </div>

        {deposits.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-slate-150 rounded-xl text-slate-450 text-xs">
            לא נמצאו נתוני הפקדות ומשיכות בגיליון זה.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deposits.map((d, index) => {
              const act = d["סוג פעולה"] || d["סוג"] || "הפקדה";
              const amt = cleanNumber(d["סכום"] || d["Amount"]);
              const date = d["תאריך"] || d["Date"] || "";
              
              // Skip summary/empty rows
              if (String(date).includes("סה\"כ") || String(date).includes("סהכ") || !amt) return null;

              const isNegativeFlow = amt < 0;

              return (
                <div key={d._rowNum || index} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-xl text-xs transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${isNegativeFlow ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <div>
                      <div className="font-bold text-slate-700">{act}</div>
                      <div className="text-[10px] text-slate-400">{date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-black ${isNegativeFlow ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isNegativeFlow ? '-' : '+'}{formatILS(Math.abs(amt))}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEditRow("הפקדות למיטב", d)}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors cursor-pointer"
                      title="ערוך תנועה"
                    >
                      <Pencil size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Transaction Button */}
        <div className="flex justify-start pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onAddRow("הפקדות למיטב")}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>הוסף תנועה / הפקדה</span>
          </button>
        </div>
      </div>

    </div>
  );
}
