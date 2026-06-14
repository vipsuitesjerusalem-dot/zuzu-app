/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Landmark, TrendingUp, PiggyBank, Award, Calendar, Sparkles, Building, ArrowUpRight, Percent } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { FutureSimulator } from './FutureSimulator';

interface OverviewTabProps {
  sheets: any;
  welcomeQuote: string;
  onTabChange: (tab: string) => void;
  onEditRow: (sheetName: string, row: any) => void;
}

export function OverviewTab({ sheets, welcomeQuote, onTabChange, onEditRow }: OverviewTabProps) {
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

  // Parsing Helpers
  const cleanNumber = (val: any): number => {
    if (typeof val === 'number') return val;
    if (val === undefined || val === null) return 0;
    const cleanStr = String(val).replace(/[₪$,\s()]/g, '').trim();
    if (cleanStr === '') return 0;
    const parsed = parseFloat(cleanStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  const sumCurrentValues = (list: any[], checkActive: boolean = false) => {
    if (!list || !Array.isArray(list)) return 0;
    return list.reduce((sum, item) => {
      // Check if item has a valid name to skip headers
      const name = getRowValueByCleanKey(item, "שם הנכס") ?? 
                   getRowValueByCleanKey(item, "שם הקופה") ?? 
                   getRowValueByCleanKey(item, "הגוף המנהל") ?? 
                   getRowValueByCleanKey(item, "גוף מנהל") ?? 
                   getRowValueByCleanKey(item, "נכס") ?? 
                   getRowValueByCleanKey(item, "שם");
      if (!name || name === 'נכס ללא שם' || name === 'מנייה ללא שם' || name === 'סה"כ' || name === 'סהכ') return sum;

      if (checkActive) {
        const sellDate = getRowValueByCleanKey(item, "תאריך מכירה") ?? 
                         getRowValueByCleanKey(item, "תאריך סיום") ?? 
                         getRowValueByCleanKey(item, "Sell Date");
        if (sellDate !== undefined && sellDate !== null && String(sellDate).trim() !== '' && String(sellDate).toLowerCase() !== 'null') {
          return sum; // Skip closed investments
        }
      }
      
      const val = cleanNumber(
        getRowValueByCleanKey(item, "שווי נוכחי") ?? 
        getRowValueByCleanKey(item, "שווי עדכני") ?? 
        getRowValueByCleanKey(item, "סכום השקעה") ?? 
        getRowValueByCleanKey(item, "סכום") ?? 
        getRowValueByCleanKey(item, "Current Value") ?? 
        getRowValueByCleanKey(item, "שווי")
      );
      return sum + val;
    }, 0);
  };

  // Derived dollar rate from blink sheet (column L / "שער דולר עדכני")
  const getDollarRate = () => {
    const list = sheets["בלינק"];
    if (!list || list.length === 0) return 3.7;
    
    // Iterate over rows to find first valid "שער דולר עדכני"
    for (const row of list) {
      if (!row || typeof row !== 'object') continue;
      
      const exactRate = getRowValueByCleanKey(row, "שער דולר עדכני");
      if (exactRate !== undefined) {
        const num = cleanNumber(exactRate);
        if (num > 1 && num < 50) return num;
      }
    }

    // Secondary fallback
    const first = list[0];
    if (first && typeof first === 'object') {
      const keys = Object.keys(first);
      for (const k of keys) {
        const cleanK = k.replace(/\s+/g, '').toLowerCase();
        if (cleanK.includes("שער") || cleanK.includes("דולר") || cleanK === "l" || cleanK.includes("exchange")) {
          const num = cleanNumber(first[k]);
          if (num > 1 && num < 50) return num;
        }
      }
    }
    return 3.7;
  };

  const dollarRate = getDollarRate();

  // Individual Channel sums
  const meitavSum = sumCurrentValues(sheets["מיטב"], true); // Active only
  const blinkSumUSD = sumCurrentValues(sheets["בלינק"], true); // Active US dollars
  const blinkSumILS = blinkSumUSD * dollarRate;
  const studyFundsSum = sumCurrentValues(sheets["קרנות השתלמות"]);
  const pensionSum = sumCurrentValues(sheets["פנסיה"]);
  const childSavingsSum = sumCurrentValues(sheets["חיסכון לכל ילד"]);

  // Total Portfolio Capital Combined
  const totalCombinedPortfolio = meitavSum + blinkSumILS + studyFundsSum + pensionSum + childSavingsSum;

  const formatILS = (val: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Recharts Data preparation for allocation
  const allocationData = [
    { name: 'מיטב', value: meitavSum, color: '#4f46e5' },
    { name: 'בלינק', value: blinkSumILS, color: '#10b981' },
    { name: 'קרנות השתלמות', value: studyFundsSum, color: '#3b82f6' },
    { name: 'פנסיה', value: pensionSum, color: '#8b5cf6' },
    { name: 'חיסכון לכל ילד', value: childSavingsSum, color: '#f59e0b' }
  ].map(item => {
    const pct = totalCombinedPortfolio > 0 ? (item.value / totalCombinedPortfolio) * 100 : 0;
    return {
      ...item,
      percentage: parseFloat(pct.toFixed(1))
    };
  }).filter(item => item.value > 0);

  // Generate complete list of assets for the returns simulator
  const compileSimulatorAssets = (): any[] => {
    const list: any[] = [];
    
    // Meitav Active
    if (sheets["מיטב"]) {
      sheets["מיטב"].forEach((row: any) => {
        const name = getRowValueByCleanKey(row, "שם הנכס") ?? 
                     getRowValueByCleanKey(row, "נכס") ?? 
                     getRowValueByCleanKey(row, "שם");
        const sellDate = getRowValueByCleanKey(row, "תאריך מכירה") ?? 
                         getRowValueByCleanKey(row, "תאריך סיום") ?? 
                         "";
        const isClosed = sellDate && String(sellDate).trim() !== '' && String(sellDate).toLowerCase() !== 'null';
        if (name && !isClosed && name !== 'סה"כ' && name !== 'סהכ') {
          list.push({
            id: `meitav-${row._rowNum}`,
            name,
            source: "מיטב",
            currentValue: cleanNumber(
              getRowValueByCleanKey(row, "שווי נוכחי") ?? 
              getRowValueByCleanKey(row, "שווי עדכני") ?? 
              getRowValueByCleanKey(row, "שווי")
            )
          });
        }
      });
    }

    // Blink Active (Convert to ILS)
    if (sheets["בלינק"]) {
      sheets["בלינק"].forEach((row: any) => {
        const name = getRowValueByCleanKey(row, "שם הנכס") ?? 
                     getRowValueByCleanKey(row, "נכס") ?? 
                     getRowValueByCleanKey(row, "שם");
        const sellDate = getRowValueByCleanKey(row, "תאריך מכירה") ?? 
                         getRowValueByCleanKey(row, "תאריך סיום") ?? 
                         "";
        const isClosed = sellDate && String(sellDate).trim() !== '' && String(sellDate).toLowerCase() !== 'null';
        if (name && !isClosed && name !== 'סה"כ' && name !== 'סהכ') {
          list.push({
            id: `blink-${row._rowNum}`,
            name,
            source: "בלינק",
            currentValue: cleanNumber(
              getRowValueByCleanKey(row, "שווי נוכחי") ?? 
              getRowValueByCleanKey(row, "שווי עדכני") ?? 
              getRowValueByCleanKey(row, "שווי")
            ) * dollarRate
          });
        }
      });
    }

    // Study Funds
    if (sheets["קרנות השתלמות"]) {
      sheets["קרנות השתלמות"].forEach((row: any) => {
        const name = getRowValueByCleanKey(row, "שם הקופה") ?? 
                     getRowValueByCleanKey(row, "הגוף המנהל") ?? 
                     getRowValueByCleanKey(row, "גוף מנהל") ?? 
                     getRowValueByCleanKey(row, "שם");
        if (name && name !== 'סה"כ' && name !== 'סהכ') {
          list.push({
            id: `sh-${row._rowNum}`,
            name,
            source: "השתלמות",
            currentValue: cleanNumber(
              getRowValueByCleanKey(row, "שווי עדכני") ?? 
              getRowValueByCleanKey(row, "שווי נוכחי") ?? 
              getRowValueByCleanKey(row, "סכום")
            )
          });
        }
      });
    }

    // Pension
    if (sheets["פנסיה"]) {
      sheets["פנסיה"].forEach((row: any) => {
        const name = getRowValueByCleanKey(row, "שם הקופה") ?? 
                     getRowValueByCleanKey(row, "הגוף המנהל") ?? 
                     getRowValueByCleanKey(row, "גוף מנהל") ?? 
                     getRowValueByCleanKey(row, "שם");
        if (name && name !== 'סה"כ' && name !== 'סהכ') {
          list.push({
            id: `pension-${row._rowNum}`,
            name,
            source: "פנסיה",
            currentValue: cleanNumber(
              getRowValueByCleanKey(row, "שווי עדכני") ?? 
              getRowValueByCleanKey(row, "שווי נוכחי") ?? 
              getRowValueByCleanKey(row, "סכום")
            )
          });
        }
      });
    }

    // Children Savings
    if (sheets["חיסכון לכל ילד"]) {
      sheets["חיסכון לכל ילד"].forEach((row: any) => {
        const name = getRowValueByCleanKey(row, "שם הקופה") ?? 
                     getRowValueByCleanKey(row, "הגוף המנהל") ?? 
                     getRowValueByCleanKey(row, "גוף מנהל") ?? 
                     getRowValueByCleanKey(row, "שם");
        if (name && name !== 'סה"כ' && name !== 'סהכ') {
          list.push({
            id: `child-${row._rowNum}`,
            name,
            source: "ילד",
            currentValue: cleanNumber(
              getRowValueByCleanKey(row, "שווי עדכני") ?? 
              getRowValueByCleanKey(row, "שווי נוכחי") ?? 
              getRowValueByCleanKey(row, "סכום")
            )
          });
        }
      });
    }

    return list;
  };

  const simulatorAssets = compileSimulatorAssets();

  return (
    <div className="space-y-6" id="overview-tab-view">
      
      {/* Dynamic Greetings Card with Random quotes */}
      <section className="bg-gradient-to-l from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden" id="financial-welcome-pennant">
        <div className="absolute top-0 left-0 p-6 opacity-5">
          <Sparkles size={160} className="text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              ברוכים הבאים, אוסטרובסקים.
            </span>
            <h2 className="text-2xl font-black text-white pt-1">
              ה' זן ומפרנס לכל, ושולחנו ערוך לכל!
            </h2>
            <div className="flex items-start gap-2 pt-2 max-w-xl">
              <p className="text-xs text-emerald-400 font-bold leading-relaxed">
                {welcomeQuote || "טוען פילוסופיה עסקית עבורך..."}
              </p>
            </div>
          </div>

          {/* Combined Portfolio KPI Metric Panel */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 self-stretch md:self-auto flex flex-col justify-center min-w-[260px]">
            <span className="text-base text-slate-200 block font-black mb-1.5">סך שווי התיק המאוחד:</span>
            <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {formatILS(totalCombinedPortfolio)}
            </span>
          </div>
        </div>
      </section>

      {/* Aggregate channels summary - Grid of 5 Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Meitav channel */}
        <div 
          onClick={() => onTabChange('meitav')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-500 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-indigo-500 block">השקעות בישראל</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-700 group-hover:text-white transition-colors">
              <TrendingUp size={14} />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-700">מיטב</h4>
            <span className="text-base font-black font-mono text-indigo-600">{formatILS(meitavSum)}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block border-t border-slate-50 pt-1.5">עבור לניהול מיטב &rarr;</span>
        </div>

        {/* Blink channel */}
        <div 
          onClick={() => onTabChange('blink')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-500 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-emerald-500 font-sans">השקעות בארה"ב</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Landmark size={14} />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-700">בלינק</h4>
            <span className="text-base font-black font-mono text-emerald-600">{formatUSD(blinkSumUSD)}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block border-t border-slate-50 pt-1.5">עבור לניהול בלינק &rarr;</span>
        </div>

        {/* Study funds */}
        <div 
          onClick={() => onTabChange('studyFunds')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-500 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-blue-600 font-sans">חסכונות לנו ולילדים</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-650 group-hover:text-white transition-colors">
              <Award size={14} />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-700">קרנות השתלמות</h4>
            <span className="text-base font-black font-mono text-blue-600">{formatILS(studyFundsSum)}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block border-t border-slate-50 pt-1.5">עבור לקרנות &rarr;</span>
        </div>

        {/* Pension */}
        <div 
          onClick={() => onTabChange('pension')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-purple-500 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-purple-600">גיל פרישה</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-650 group-hover:text-white transition-colors">
              <Building size={14} />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-700">פנסיה</h4>
            <span className="text-base font-black font-mono text-purple-600">{formatILS(pensionSum)}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block border-t border-slate-50 pt-1.5">עבור לפנסיה &rarr;</span>
        </div>

        {/* Child savings */}
        <div 
          onClick={() => onTabChange('childSavings')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-amber-500 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-amber-600 font-sans">חסכון ממשלתי</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-650 group-hover:text-white transition-colors">
              <PiggyBank size={14} />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-700">חיסכון לכל ילד</h4>
            <span className="text-base font-black font-mono text-amber-600">{formatILS(childSavingsSum)}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-2 block border-t border-slate-50 pt-1.5">עבור לחיסכון &rarr;</span>
        </div>

      </div>

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Allocation chart card */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/85 p-6 flex flex-col justify-between" id="allocation-card-box">
          <div className="mb-6">
            <h4 className="text-base font-black text-slate-800">פילוח התיק לפי אחוזים</h4>
            <p className="text-xs text-slate-400">תמונת מצב של פיזור הנכסים לפי אחוזים</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Recharts Column Chart - Span 2 */}
            <div className="lg:col-span-2 h-80 w-full pointer-events-none" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={allocationData}
                  margin={{ top: 25, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }} 
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(v) => formatILS(v)}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={55}
                    label={{
                      position: 'top',
                      formatter: (v: number) => {
                        const item = allocationData.find(x => x.value === v);
                        return item ? `${item.percentage}%` : '';
                      },
                      fill: '#0f172a',
                      fontSize: 11,
                      fontWeight: 'extrabold',
                      offset: 8
                    }}
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List and Explanatory descriptions - Span 1 */}
            <div className="space-y-4">
              <div className="space-y-2">
                {allocationData.map((item, index) => {
                  return (
                    <div key={index} className="flex justify-between items-center text-xs p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-100 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-slate-700">{item.name}</span>
                      </div>
                      <div className="text-left font-mono">
                        <span className="font-bold block text-slate-800">{formatILS(item.value)}</span>
                        <span className="text-[10px] font-extrabold" style={{ color: item.color }}>{item.percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Embedded 3. FUTURE COMPLEX COMPOUND SIMULATOR (NESTED COMPONENT) */}
      <section className="pt-4" id="overview-simulator-anchor">
        <FutureSimulator assets={simulatorAssets} />
      </section>

    </div>
  );
}
