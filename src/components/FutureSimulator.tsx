/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Layers, Sparkles, AlertCircle } from 'lucide-react';

interface SimulatorAsset {
  id: string;
  name: string;
  source: string;
  currentValue: number;
}

interface FutureSimulatorProps {
  assets: SimulatorAsset[];
}

export function FutureSimulator({ assets = [] }: FutureSimulatorProps) {
  // Select fund state
  const [selectedAssetId, setSelectedAssetId] = useState<string>('custom');
  
  // Simulator parameters state
  const [initialSum, setInitialSum] = useState<number>(30000);
  const [interestRate, setInterestRate] = useState<number>(10.0);
  const [years, setYears] = useState<number>(15);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(1000);

  // Local string states for smooth text input typing (prevents locking/resetting)
  const [initialSumInput, setInitialSumInput] = useState<string>('30000');
  const [monthlyDepositInput, setMonthlyDepositInput] = useState<string>('1000');

  // 1. Sort and clean assets internal list (Only inside the simulator!)
  // Priority based on text inclusion to catch variations like 'ילד', 'בלינק', 'מיטב' etc.
  const orderedSourcePriority = ['ילד', 'פנסיה', 'השתלמות', 'מיטב', 'בלינק'];
  
  const sortedAssets = [...assets]
    .map(asset => {
      // Clean and normalize the source name if it says "ילד"
      const normalizedSource = asset.source === 'ילד' ? 'חיסכון לכל ילד' : asset.source;
      return { ...asset, source: normalizedSource };
    })
    .sort((a, b) => {
      // Find priority index by checking if the source contains any of our keywords
      const indexA = orderedSourcePriority.findIndex(keyword => 
        a.name.includes(keyword) || (a.source && a.source.includes(keyword))
      );
      const indexB = orderedSourcePriority.findIndex(keyword => 
        b.name.includes(keyword) || (b.source && b.source.includes(keyword))
      );
      
      // If both are in our priority list, sort by list order
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // Push unknown sources to the end
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      // Fallback to alphabetical sorting inside the same category or unknowns
      return a.name.localeCompare(b.name, 'he');
    });

  // Sync inputs when initialSum or monthlyDeposit changes via sliders or resets
  // ONLY run this sync if we are in custom mode to avoid blocking input typing
  useEffect(() => {
    if (selectedAssetId === 'custom') {
      // Only update if the parsed numeric value differs to avoid cursor jumps
      if (Number(initialSumInput) !== initialSum) {
        setInitialSumInput(initialSum.toString());
      }
    }
  }, [initialSum]);

  useEffect(() => {
    if (Number(monthlyDepositInput) !== monthlyDeposit) {
      setMonthlyDepositInput(monthlyDeposit.toString());
    }
  }, [monthlyDeposit]);

  // Automatically update the simulator's initial sum when the selected asset changes
  useEffect(() => {
    if (selectedAssetId === 'custom') {
      return;
    }
    const matched = sortedAssets.find(a => a.id === selectedAssetId);
    if (matched) {
      const roundedValue = Math.round(matched.currentValue);
      setInitialSum(roundedValue);
      setInitialSumInput(roundedValue.toString());
    }
  }, [selectedAssetId]); // Removed stable 'assets' to prevent accidental resets during re-renders

  // Growth preset profiles
  const applyPreset = (rate: number) => {
    setInterestRate(rate);
  };

  // Compute compound interest growth series year-by-year
  const generateChartData = () => {
    const data = [];
    let cumulativeInvested = initialSum;
    let totalValue = initialSum;
    const monthlyRate = (interestRate / 100) / 12;

    // Year zero
    data.push({
      yearLabel: 'שנה 0',
      'סך הפקדות': Math.round(cumulativeInvested),
      'שווי צבור': Math.round(totalValue),
      'רווח שהצטבר': 0
    });

    for (let yr = 1; yr <= years; yr++) {
      // 12 months compounded
      for (let m = 0; m < 12; m++) {
        cumulativeInvested += monthlyDeposit;
        totalValue = (totalValue + monthlyDeposit) * (1 + monthlyRate);
      }

      data.push({
        yearLabel: `שנה ${yr}`,
        'סך הפקדות': Math.round(cumulativeInvested),
        'שווי צבור': Math.round(totalValue),
        'רווח שהצטבר': Math.max(0, Math.round(totalValue - cumulativeInvested))
      });
    }
    return data;
  };

  const chartData = generateChartData();
  const finalValue = chartData[chartData.length - 1]['שווי צבור'];
  const finalInvested = chartData[chartData.length - 1]['סך הפקדות'];
  const finalGains = finalValue - finalInvested;

  const formatILS = (val: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6 animate-fade-in-up" id="compound-interest-simulator">
      
      {/* Title & Slogan */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5 justify-start">
            <Sparkles className="text-emerald-500 shrink-0" size={20} />
            <span>סימולטור חישוב תשואות חכם בריבית דריבית</span>
          </h2>
          <p className="text-xs text-slate-500">בחן כמה שווה תיק ההשקעות או הקופות שלך עם ריבית דריבית מצרפית ואפקט הזמן</p>
        </div>

        {/* Dynamic risk profiles shortcuts */}
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset(10.0)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${interestRate === 10.0 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            חישוב שמרני (10%)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(12.0)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${interestRate === 12.0 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            חישוב אופטימי (12%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls inputs Form */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            
            {/* 1. Pick Specific Fund Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">בחר קופה:</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-right font-medium"
              >
                <option value="custom">בחר קופה</option>
                {sortedAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    [{asset.source}] {asset.name} ({formatILS(asset.currentValue)})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Initial Deposit slider */}
            {selectedAssetId === 'custom' ? (
              <div>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-semibold text-slate-600">שווי נוכחי התחלתי (הזן סכום ידני):</span>
                  <span className="font-bold text-slate-900">{formatILS(initialSum)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000000}
                  step={10000}
                  value={initialSum}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setInitialSum(val);
                    setInitialSumInput(val.toString());
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={initialSumInput}
                  onChange={(e) => {
                    const rawVal = e.target.value.replace(/[^0-9]/g, ''); // Allow digits only
                    setInitialSumInput(rawVal);
                    if (rawVal !== '') {
                      setInitialSum(Number(rawVal));
                    } else {
                      setInitialSum(0);
                    }
                  }}
                  className="w-full mt-1.5 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-right outline-none focus:border-indigo-500 font-mono"
                  placeholder="הקלד סכום התחלתי בשקלים"
                />
              </div>
            ) : (
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs">
                <span className="text-slate-500 block">שווי נוכחי (מסונכרן מהקופה שבחרת):</span>
                <span className="font-extrabold text-indigo-700 font-mono text-sm block mt-1">{formatILS(initialSum)}</span>
                <span className="text-[10px] text-slate-400 block mt-1">הקלט הידני מוסתר, כי השווי מחושב אוטומטית מהקופה הנבחרת.</span>
              </div>
            )}

            {/* 3. Monthly deposits slider */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-600">הפקדה חודשית מתווספת קבועה:</span>
                <span className="font-bold text-indigo-600">{formatILS(monthlyDeposit)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={25000}
                step={500}
                value={monthlyDeposit}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMonthlyDeposit(val);
                  setMonthlyDepositInput(val.toString());
                }}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={monthlyDepositInput}
                onChange={(e) => {
                  const rawVal = e.target.value.replace(/[^0-9]/g, ''); // Allow digits only
                  setMonthlyDepositInput(rawVal);
                  if (rawVal !== '') {
                    setMonthlyDeposit(Number(rawVal));
                  } else {
                    setMonthlyDeposit(0);
                  }
                }}
                className="w-full mt-1 p-1.5 text-xs text-right border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* 4. Interest rate expected */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-600">שיעור תשואה שנתית (%):</span>
                <span className="font-bold text-slate-900">{interestRate.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={0.5}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* 5. Years slider */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-600">טווח שנים לחישוב:</span>
                <span className="font-bold text-slate-900">{years} שנים</span>
              </div>
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
            </div>

          </div>

          {/* Quick Stats Results Box */}
          <div className="bg-emerald-50/60 p-4 rounded-xl border border-dashed border-emerald-300 space-y-3">
            <h4 className="text-xs font-bold text-emerald-800 leading-none">שווי סופי משוער בטווח המוזכר:</h4>
            <div className="text-2xl font-black text-emerald-800 leading-none">
              {formatILS(finalValue)}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-150">
              <div>
                <span className="text-slate-500 block">סך ההפקדות שלך:</span>
                <span className="font-bold text-slate-700">{formatILS(finalInvested)}</span>
              </div>
              <div>
                <span className="text-emerald-800 font-semibold block">רווח מריבית דריבית:</span>
                <span className="font-extrabold text-emerald-600">+{formatILS(finalGains)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Area Chart Component */}
        <div className="lg:col-span-2 bg-slate-50/20 p-4 rounded-xl border border-slate-100 flex flex-col justify-between h-[340px] lg:h-auto">
          <div className="flex justify-between items-center text-xs mb-3">
            <span className="font-semibold text-slate-600">גרף צבר הון מצטבר מול הפקדות מקוריות</span>
            <div className="flex gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
                סך הפקדות
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                שווי כולל מורכב
              </span>
            </div>
          </div>

          <div className="h-[250px] lg:h-[280px] w-full" id="area-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="yearLabel" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  tickFormatter={(v) => `₪${(v/1000)}K`}
                  orientation="right"
                />
                <Tooltip 
                  formatter={(value: any) => [formatILS(value)]}
                  contentStyle={{ direction: 'rtl', borderRadius: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="שווי צבור" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="סך הפקדות" 
                  stroke="#6366f1" 
                  strokeWidth={1.5} 
                  fillOpacity={1} 
                  fill="url(#colorInvested)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal text-center mt-2 font-medium">
            * החישוב מציג סימולציה בריבית דריבית חודשית, ואינו מהווה ערובה או הצהרה לרווחים עתידיים מקבילים בשווקים.
          </p>
        </div>

      </div>

    </div>
  );
}
