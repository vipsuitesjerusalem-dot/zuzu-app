/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Pencil, TrendingUp, Calendar, ArrowUpRight, Wallet, Plus } from 'lucide-react';

interface BlinkTabProps {
  data: any[];
  deposits: any[];
  onEditRow: (sheetName: string, row: any) => void;
  onAddRow: (sheetName: string) => void;
}

export function BlinkTab({ data = [], deposits = [], onEditRow, onAddRow }: BlinkTabProps) {
  
  // המרה נקייה של מספרים מהגיליון
  const cleanNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleanStr = String(val).replace(/[₪$,\s()]/g, '').trim();
    if (cleanStr === '' || cleanStr === '#DIV/0!') return 0;
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  // שליפת שער הדולר העדכני מעמודה K (שורה 2 בגיליון "בלינק")
  const getDollarRate = (): number => {
    if (!data || data.length === 0) return 3.7;
    const firstRow = data[0];
    const rate = firstRow["שער דולר עדכני"] ?? firstRow["K"];
    const num = cleanNumber(rate);
    return num > 0 ? num : 3.7;
  };

  const dollarRate = getDollarRate();

  // סינון שורות ריקות או שורות סיכום בגיליון בלינק
  const validInvestments = data.filter(row => {
    const name = row["שם הנכס"];
    return name && name !== 'סה"כ' && name !== 'סהכ' && row["סכום השקעה"] !== undefined;
  });

  // פיצול נכסים פעילים (ללא תאריך מכירה) וכאלו שנסגרו
  const activeInvestments = validInvestments.filter(row => !row["תאריך מכירה"]);
  const inactiveInvestments = validInvestments.filter(row => row["תאריך מכירה"]);

  // שליפת סך ההפקדות המחושב ישירות משורה 2 בגיליון "הפקדות לבלינק"
  const getDepositsTotals = () => {
    if (!deposits || deposits.length === 0) return { totalUSD: 0, totalILS: 0 };
    
    // שורה 2 מכילה את נתוני ה-SUM בעמודות H ו-I
    const summaryRow = deposits[0]; 
    const totalUSD = cleanNumber(summaryRow["סך הפקדות בדולרים"]);
    const totalILS = cleanNumber(summaryRow["סך הפקדות בשקלים"]);
    
    return { totalUSD, totalILS };
  };

  const { totalUSD: depositUSD, totalILS: depositILS } = getDepositsTotals();

  // חישובי סיכום לתיק הפעיל בדולרים ($)
  const totalActiveUSDCurrent = activeInvestments.reduce((sum, item) => sum + cleanNumber(item["שווי נוכחי"]), 0);
  const totalActiveUSDInvested = activeInvestments.reduce((sum, item) => sum + cleanNumber(item["סכום השקעה"]), 0);
  const activeProfitUSD = totalActiveUSDCurrent - totalActiveUSDInvested;
  
  // שימוש בסך ההפקדות בדולרים כבסיס לתשואה, או בסך ההשקעה הפעילה אם ההפקדות ריקות
  const baseDepositUSD = depositUSD > 0 ? depositUSD : totalActiveUSDInvested;
  const activeYieldUSDPercent = baseDepositUSD > 0 ? (activeProfitUSD / baseDepositUSD) * 100 : 0;

  // חישובי סיכום לתיק הפעיל בשקלים (ILS)
  const currentValueILS = totalActiveUSDCurrent * dollarRate;
  const baseDepositILS = depositILS > 0 ? depositILS : (baseDepositUSD * dollarRate);
  const profitILS = currentValueILS - baseDepositILS;
  const yieldILSPercent = baseDepositILS > 0 ? (profitILS / baseDepositILS) * 100 : 0;

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatILS = (val: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in-up text-right" dir="rtl">
      
      {/* 1. KPI SUMMARY CARD */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-950 rounded-2xl p-6 text-white border border-indigo-500/10 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="space-y-3 flex flex-col items-center md:items-start text-center md:text-right">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 mb-1">
              סיכום פעילות בבלינק
            </span>
            <h3 className="text-2xl font-black">בלינק</h3>
          </div>
          <p className="text-xs text-indigo-200/80 leading-relaxed max-w-lg font-medium">
            פירוט העסקאות הפעילות וההחזקות הסגורות המנוהלות בבלינק, לצד תזרים הפקדות ומשיכות.
          </p>
          <div className="bg-emerald-500/10 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/20 text-[11px] font-semibold self-center md:self-start font-mono">
            שער דולר עדכני: <span className="font-extrabold text-white">₪{dollarRate.toFixed(4)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 min-w-[200px] flex flex-col justify-center text-center">
            <span className="text-sm text-slate-250 block font-bold mb-2">שווי משוקלל:</span>
            <span className="text-2xl font-black font-mono text-emerald-400">
              {formatUSD(totalActiveUSDCurrent)}
            </span>
            <span className="text-xs text-indigo-200 mt-2 font-semibold block leading-relaxed">
              שווי נוכחי בשקלים: <span className="font-mono text-white font-bold">{formatILS(currentValueILS)}</span>
            </span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 min-w-[220px] flex flex-col justify-center text-center">
            <span className="text-sm text-slate-250 block font-bold mb-2">רווח מצטבר ותשואה:</span>
            <span className={`text-2xl font-black font-mono ${activeProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {activeProfitUSD >= 0 ? '+' : ''}{formatUSD(activeProfitUSD)}
              <span className="text-xs font-semibold mr-1.5">({activeYieldUSDPercent.toFixed(1)}%)</span>
            </span>
            <span className="text-xs text-indigo-200 mt-2 font-semibold block leading-relaxed">
              רווח ותשואה בשקלים: <span className={`font-mono font-bold ${profitILS >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {profitILS >= 0 ? '+' : ''}{formatILS(profitILS)} ({yieldILSPercent.toFixed(1)}%)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* טבלת עסקאות פעילות */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-start">
            <TrendingUp size={16} className="text-emerald-500 shrink-0" />
            <span>מניות ועסקאות פעילות ({activeInvestments.length})</span>
          </h4>
        </div>

        {activeInvestments.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            לא נמצאו השקעות פעילות.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-3">שם הנכס</th>
                  <th className="py-2.5 px-3">סכום השקעה</th>
                  <th className="py-2.5 px-3">שווי נוכחי</th>
                  <th className="py-2.5 px-3">תשואה</th>
                  <th className="py-2.5 px-3">רווח</th>
                  <th className="py-2.5 px-3">אורך הטרייד</th>
                  <th className="py-2.5 px-3 text-center">ערוך</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeInvestments.map((row, idx) => {
                  const name = row["שם הנכס"] || "ללא שם";
                  const invested = cleanNumber(row["סכום השקעה"]);
                  const current = cleanNumber(row["שווי נוכחי"]);
                  const profit = cleanNumber(row["רווח"]);
                  const pct = cleanNumber(row["אחוז תשואה"]) * 100; // במידה והערך מגיע כשבר עשרוני מהגיליון
                  const length = row["אורך הטרייד"] || "-";

                  return (
                    <tr key={row._rowNum || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-800">{name}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{formatUSD(invested)}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-800">{formatUSD(current)}</td>
                      <td className={`py-3 px-3 font-mono font-bold ${pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-3 font-mono font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {profit >= 0 ? '+' : ''}{formatUSD(profit)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">{length}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onEditRow("בלינק", row)}
                          className="p-1 px-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-500 rounded-lg transition-all cursor-pointer inline-flex items-center"
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

        {/* Add Active Trade Item Button */}
        <div className="flex justify-start pt-2 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={() => onAddRow("בלינק")}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>הוסף פריט לתיק</span>
          </button>
        </div>
      </div>

      {/* טבלת עסקאות סגורות */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-start">
            <Calendar size={16} className="text-slate-500 shrink-0" />
            <span>השקעות ועסקאות לא פעילות (טריידים סגורים) ({inactiveInvestments.length})</span>
          </h4>
        </div>

        {inactiveInvestments.length === 0 ? (
          <div className="text-center p-6 border border-dashed border-slate-150 rounded-xl text-slate-400 text-xs">
            אין עסקאות סגורות בתיק.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                  <th className="py-2.5 px-3">שם הנכס</th>
                  <th className="py-2.5 px-3">סכום השקעה</th>
                  <th className="py-2.5 px-3">שווי פדיון</th>
                  <th className="py-2.5 px-3">תשואה ממומשת</th>
                  <th className="py-2.5 px-3">רווח ממומש</th>
                  <th className="py-2.5 px-3">אורך הטרייד</th>
                  <th className="py-2.5 px-3 text-center">ערוך</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {inactiveInvestments.map((row, idx) => {
                  const invested = cleanNumber(row["סכום השקעה"]);
                  const current = cleanNumber(row["שווי נוכחי"]);
                  const profit = cleanNumber(row["רווח"]);
                  const pct = cleanNumber(row["אחוז תשואה"]) * 100;
                  const length = row["אורך הטרייד"] || "-";

                  return (
                    <tr key={row._rowNum || idx} className="hover:bg-slate-50/80 transition-colors opacity-85">
                      <td className="py-3 px-3 font-bold text-slate-700">{row["שם הנכס"]}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{formatUSD(invested)}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{formatUSD(current)}</td>
                      <td className={`py-3 px-3 font-mono font-bold ${pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-3 font-mono font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {profit >= 0 ? '+' : ''}{formatUSD(profit)}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">{length}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onEditRow("בלינק", row)}
                          className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-all cursor-pointer inline-flex items-center"
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

        {/* Add Closed Trade Item Button */}
        <div className="flex justify-start pt-2 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={() => onAddRow("בלינק")}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>הוסף פריט סגור</span>
          </button>
        </div>
      </div>

      {/* בלוק תזרים והפקדות */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-start">
              <Wallet className="text-slate-600 shrink-0" size={16} />
              <span>פירוט תזרים והפקדות אחרונות</span>
            </h4>
          </div>
          <div className="bg-slate-50 text-slate-750 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold font-mono">
            סך הפקדות נטו: <span className="text-emerald-600">{formatUSD(baseDepositUSD)}</span> / <span className="text-indigo-600">{formatILS(baseDepositILS)}</span>
          </div>
        </div>

        {deposits.length <= 1 ? (
          <div className="text-center p-6 border border-dashed border-slate-150 rounded-xl text-slate-400 text-xs">
            לא נמצאו שורות תנועה בגיליון ההפקדות.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deposits.slice(1).map((d, index) => { // דילוג על שורה 2 שמכילה את ה-SUM
              const dateVal = d["תאריך"] || "";
              const action = d["פעולה"] || "הפקדה";
              const usdAmount = cleanNumber(d["סכום בדולרים"]);
              const ilsAmount = cleanNumber(d["סכום בשקלים"]);
              
              if (!usdAmount && !ilsAmount) return null;
              const isNegative = usdAmount < 0 || (usdAmount === 0 && ilsAmount < 0);

              return (
                <div key={d._rowNum || index} className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs transition-colors">
                  <div className="flex items-center gap-2.5 font-sans">
                    <div className={`w-2.5 h-2.5 rounded-full ${isNegative ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <div>
                      <div className="font-bold text-slate-700">{action}</div>
                      <div className="text-[10px] text-slate-400">{String(dateVal)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left font-mono">
                      <div className={`font-black ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {usdAmount >= 0 ? '+' : ''}{formatUSD(usdAmount)}
                      </div>
                      {ilsAmount !== 0 && (
                        <div className="text-[10px] text-slate-400">
                          {ilsAmount >= 0 ? '+' : ''}{formatILS(ilsAmount)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onEditRow("הפקדות לבלינק", d)}
                      className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-white rounded transition-colors cursor-pointer"
                    >
                      <Pencil size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Deposit/Transaction Button */}
        <div className="flex justify-start pt-2 border-t border-slate-100 mt-4">
          <button
            type="button"
            onClick={() => onAddRow("הפקדות לבלינק")}
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
