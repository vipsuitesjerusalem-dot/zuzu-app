/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import { Pencil, Landmark, Calendar, ShieldCheck, Plus } from 'lucide-react';
import { GenericSheetRow } from '../types';

interface FundsTabProps {
  sheetName: "קרנות השתלמות" | "פנסיה" | "חיסכון לכל ילד";
  data: any[];
  onEditRow: (sheetName: string, row: any) => void;
  onAddRow: (sheetName: string) => void;
}

export function FundsTab({ sheetName, data = [], onEditRow, onAddRow }: FundsTabProps) {
  // Parsing helpers
  const cleanNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleanStr = String(val).replace(/[₪$,\s()]/g, '');
    return Number(cleanStr) || 0;
  };

  const getCompanyName = (row: any) => {
    return row["שם הקופה"] || row["הגוף המנהל"] || row["גוף מנהל"] || row["שם"] || row["Company Name"] || "קופה ללא שם";
  };

  const getCurrentValue = (row: any) => {
    return cleanNumber(row["שווי עדכני"] || row["שווי נוכחי"] || row["סכום"] || row["Current Value"] || row["שווי"]);
  };

  const getAsOfDate = (row: any) => {
    return row["נכון לתאריך"] || row["תאריך עדכון אחרון"] || row["תאריך עדכון"] || row["תאריך"] || row["Date"] || "-";
  };

  // Filter raw rows to avoid headers or empty entities
  const validRows = data.filter(row => {
    const name = getCompanyName(row);
    return name && name !== 'קופה ללא שם';
  });

  // Calculate sum of active portfolio
  const totalPortfolioValue = validRows.reduce((sum, item) => sum + getCurrentValue(item), 0);

  const formatILS = (val: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Tailored badges and details based on sheetType
  const getBannerDetails = () => {
    switch (sheetName) {
      case 'קרנות השתלמות':
        return {
          title: "קרנות השתלמות",
          subtitle: "מכשיר חיסכון פטור ממס ורווחי הון לאחר תקופת הבשלה של 6 שנים",
          bgGradient: "from-blue-900 to-indigo-950",
          accentColor: "text-blue-300 bg-blue-500/10 border-blue-500/20"
        };
      case 'פנסיה':
        return {
          title: "קרנות פנסיה וחיסכון פנסיוני",
          subtitle: "צבירת קצבת הזקנה שלכם בראייה ארוכת טווח לקראת פרישה",
          bgGradient: "from-purple-900 to-slate-950",
          accentColor: "text-purple-300 bg-purple-500/10 border-purple-500/20"
        };
      case 'חיסכון לכל ילד':
        return {
          title: "תוכניות חיסכון לכל ילד",
          subtitle: "צבירת החסכונות הממלכתיים של המוסד לביטוח לאומי עבור ילדי המשפחה",
          bgGradient: "from-amber-900 to-slate-950",
          accentColor: "text-amber-300 bg-amber-500/10 border-amber-500/20"
        };
    }
  };

  const banner = getBannerDetails();

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* 1. PORTFOLIO ASSET KPI CARD */}
      <div className={`bg-gradient-to-br ${banner.bgGradient} rounded-2xl p-6 text-white border border-white/5 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6`}>
        <div className="space-y-2">
          <span className={`text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border ${banner.accentColor}`}>
            אפיק חיסכון: {sheetName}
          </span>
          <h3 className="text-2xl font-black">{banner.title}</h3>
          <p className="text-xs text-slate-350 leading-relaxed max-w-lg font-medium">
            {banner.subtitle}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8 min-w-[220px] flex flex-col justify-center items-center text-center">
          <span className="text-base text-slate-200 block font-black mb-2">שווי משוקלל:</span>
          <span className="text-3xl font-black font-mono text-emerald-400">
            {formatILS(totalPortfolioValue)}
          </span>
        </div>
      </div>

      {/* 2. PORTFOLIO DETAILS LISTING */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div>
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-start">
            <Landmark size={16} className="text-slate-500 shrink-0" />
            <span>רשימת הקופות והנכסים ({validRows.length})</span>
          </h4>
        </div>

        {validRows.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            אין נתונים בגיליון {sheetName}.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
                  <th className="py-3 px-4">שם הקופה</th>
                  <th className="py-3 px-4">נכון לתאריך עדכון</th>
                  <th className="py-3 px-4">שווי צבור עדכני</th>
                  <th className="py-3 px-4 text-center">עריכה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {validRows.map((row, idx) => {
                  const companyName = getCompanyName(row);
                  const val = getCurrentValue(row);
                  const lastUpdate = getAsOfDate(row);

                  return (
                    <tr key={row._rowNum || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{companyName}</td>
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">{lastUpdate}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                        {formatILS(val)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onEditRow(sheetName, row)}
                          className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 hover:text-indigo-600"
                        >
                          <Pencil size={12} />
                          <span className="text-[10px] font-bold">ערוך</span>
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
            onClick={() => onAddRow(sheetName)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>הוסף פריט לתיק</span>
          </button>
        </div>
      </div>

    </div>
  );
}
