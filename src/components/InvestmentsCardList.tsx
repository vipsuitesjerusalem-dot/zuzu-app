/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { TrendingUp, Plus, Edit2, Trash2, Shield, BarChart3, Info, Percent, AlertCircle } from 'lucide-react';
import { InvestmentAsset } from '../types';

interface InvestmentsCardListProps {
  investmentAssets: InvestmentAsset[];
  onAddAsset: (asset: Omit<InvestmentAsset, 'id'>) => void;
  onUpdateAsset: (id: string, updated: Partial<InvestmentAsset>) => void;
  onDeleteAsset: (id: string) => void;
}

export function InvestmentsCardList({
  investmentAssets,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset
}: InvestmentsCardListProps) {
  // Toggle forms
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Asset State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'stocks' | 'bonds' | 'real-estate' | 'crypto' | 'cash' | 'provident-fund'>('stocks');
  const [newInvested, setNewInvested] = useState(50000);
  const [newCurrent, setNewCurrent] = useState(55000);
  const [newYield, setNewYield] = useState(8.5);
  const [newNotes, setNewNotes] = useState('');

  // Editing Asset State
  const [editedAsset, setEditedAsset] = useState<Partial<InvestmentAsset>>({});

  // Market change simulations
  const [simulatedFluctuation, setSimulatedFluctuation] = useState<{ [id: string]: number }>({});

  const resetForm = () => {
    setNewName('');
    setNewCategory('stocks');
    setNewInvested(50000);
    setNewCurrent(55000);
    setNewYield(8.5);
    setNewNotes('');
    setIsAdding(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    onAddAsset({
      name: newName,
      category: newCategory,
      investedAmount: Number(newInvested),
      currentValue: Number(newCurrent),
      annualYieldPercentage: Number(newYield),
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: newNotes
    });
    resetForm();
  };

  const handleEditInit = (asset: InvestmentAsset) => {
    setEditingId(asset.id);
    setEditedAsset({ ...asset });
  };

  const handleSaveEdit = (id: string) => {
    if (editedAsset.name?.trim()) {
      onUpdateAsset(id, editedAsset);
      setEditingId(null);
      setEditedAsset({});
    }
  };

  const applyFluctuation = (id: string, currentValue: number) => {
    const percent = simulatedFluctuation[id] || 0;
    if (percent !== 0) {
      const modifier = 1 + percent / 100;
      const newValue = Math.round(currentValue * modifier);
      onUpdateAsset(id, { currentValue: newValue });
      setSimulatedFluctuation(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const formatILS = (val: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Translations for Hebrew UI
  const CATEGORY_NAMES: { [key in InvestmentAsset['category']]: string } = {
    'stocks': 'מניות וניירות ערך',
    'bonds': 'אג״ח ממשלתי/קונצרני',
    'real-estate': 'נדל״ן והשקעות אלטרנטיביות',
    'crypto': 'קריפטו ונכסים דיגיטליים',
    'cash': 'מזומן ופיקדונות נזילים',
    'provident-fund': 'קופות גמל וקרנות השתלמות'
  };

  const CATEGORY_COLORS: { [key in InvestmentAsset['category']]: string } = {
    'stocks': '#3b82f6', // blue
    'bonds': '#64748b',  // slate
    'real-estate': '#f59e0b', // amber
    'crypto': '#ec4899', // pink
    'cash': '#10b981',   // emerald
    'provident-fund': '#8b5cf6'  // violet
  };

  const CATEGORY_BG: { [key in InvestmentAsset['category']]: string } = {
    'stocks': 'bg-blue-50 text-blue-700',
    'bonds': 'bg-slate-50 text-slate-700',
    'real-estate': 'bg-amber-50 text-amber-700',
    'crypto': 'bg-pink-50 text-pink-700',
    'cash': 'bg-emerald-50 text-emerald-700',
    'provident-fund': 'bg-violet-50 text-violet-700'
  };

  // Asset allocation aggregation for the Chart
  const allocationMap: Partial<{ [key in InvestmentAsset['category']]: number }> = {};
  investmentAssets.forEach(asset => {
    allocationMap[asset.category] = (allocationMap[asset.category] || 0) + asset.currentValue;
  });

  const chartData = Object.entries(allocationMap).map(([key, value]) => ({
    name: CATEGORY_NAMES[key as InvestmentAsset['category']],
    value: value,
    color: CATEGORY_COLORS[key as InvestmentAsset['category']]
  }));

  const totalPortfolioValue = investmentAssets.reduce((sum, a) => sum + a.currentValue, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" id="investments-grid-section">
      
      {/* Cards List - takes 2/3 space */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="text-indigo-500" size={20} />
              <span>תיק השקעות ונכסים מניבים</span>
            </h2>
            <p className="text-xs text-slate-500">עקוב אחר שינויי שערים, שווי שוק ותשואות שנתית משוערות</p>
          </div>
          <button
            id="btn-add-asset-trigger"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-500/10"
          >
            <Plus size={14} />
            <span>נכס חדש לתיק</span>
          </button>
        </div>

        {/* Create Asset Form */}
        {isAdding && (
          <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl border border-indigo-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wide border-b border-indigo-100 pb-2">רישום נכס השקעה חדש</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">שם נייר הערך / הנכס</label>
                <input
                  type="text"
                  placeholder="לדוגמה: מניות S&P 500"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-right"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">סוג ההשקעה</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                >
                  {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">תשואה שנתית ריאלית משוערת (%)</label>
                <input
                  type="number"
                  placeholder="לדוגמה: 8"
                  value={newYield}
                  onChange={(e) => setNewYield(Number(e.target.value))}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-right"
                  min={-50}
                  max={500}
                  step={0.1}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">סכום השקעה מקורי / מחיר קנייה (₪)</label>
                <input
                  type="number"
                  value={newInvested}
                  onChange={(e) => setNewInvested(Number(e.target.value))}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-right"
                  min={0}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">שווי שוק נוכחי מועדכן (₪)</label>
                <input
                  type="number"
                  value={newCurrent}
                  onChange={(e) => setNewCurrent(Number(e.target.value))}
                  className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-right"
                  min={0}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">פרטי חשבון השקעות / הערות</label>
              <input
                type="text"
                placeholder="סמל נייר, מספר תיק, תאריכי חסכון משוערים..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-right"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg shadow-xs"
              >
                רשום בתיק ההשקעות
              </button>
            </div>
          </form>
        )}

        {/* Investment Asset Cards */}
        <div className="space-y-4" id="investments-asset-cards-container">
          {investmentAssets.map(asset => {
            const isEditing = editingId === asset.id;
            const absoluteGain = asset.currentValue - asset.investedAmount;
            const roiPercentage = asset.investedAmount > 0 
              ? (absoluteGain / asset.investedAmount) * 100 
              : 0;

            return (
              <div
                key={asset.id}
                id={`investment-asset-card-${asset.id}`}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-indigo-200 transition-all relative overflow-hidden flex flex-col md:flex-row justify-between gap-4 group"
              >
                {/* Thin side bar depicting category color */}
                <div 
                  className="absolute top-0 right-0 w-1.5 h-full rounded-l-xs" 
                  style={{ backgroundColor: CATEGORY_COLORS[asset.category] }}
                />

                {/* Left Card content (Hebrew right orientation) */}
                <div className="flex-1 mr-2 text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${CATEGORY_BG[asset.category]}`}>
                      {CATEGORY_NAMES[asset.category]}
                    </span>
                    
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5" title="תשואה שנתית ריאלית ממוצעת">
                      <Percent size={10} />
                      {asset.annualYieldPercentage}% כשל שנתי משוער
                    </span>
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editedAsset.name || ''}
                      onChange={(e) => setEditedAsset({ ...editedAsset, name: e.target.value })}
                      className="bg-white font-bold text-sm text-slate-800 border border-slate-300 rounded p-1 mb-2 text-right w-full"
                    />
                  ) : (
                    <h4 className="font-bold text-base text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {asset.name}
                    </h4>
                  )}

                  {!isEditing && asset.notes && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                      {asset.notes}
                    </p>
                  )}
                  {isEditing && (
                    <textarea
                      value={editedAsset.notes || ''}
                      onChange={(e) => setEditedAsset({ ...editedAsset, notes: e.target.value })}
                      className="w-full text-xs text-slate-500 border border-slate-300 rounded p-1 mt-1 text-right"
                      rows={1}
                      placeholder="הערות..."
                    />
                  )}

                  {/* Financial breakdown values */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 bg-slate-50/50 p-2.5 rounded-xl border border-dotted border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">סכום השקעה מקורי:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedAsset.investedAmount || 0}
                          onChange={(e) => setEditedAsset({ ...editedAsset, investedAmount: Number(e.target.value) })}
                          className="w-full text-xs font-bold text-slate-800 border border-slate-300 rounded px-1"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-700">
                          {formatILS(asset.investedAmount)}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">שווי שוק נוכחי:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedAsset.currentValue || 0}
                          onChange={(e) => setEditedAsset({ ...editedAsset, currentValue: Number(e.target.value) })}
                          className="w-full text-xs font-bold text-slate-800 border border-slate-300 rounded px-1"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-850">
                          {formatILS(asset.currentValue)}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">תשואה אבסולוטית:</span>
                      <span className={`text-xs font-bold ${absoluteGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {absoluteGain >= 0 ? '+' : ''}{formatILS(absoluteGain)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">מדד ROI באחוזים:</span>
                      <span className={`text-xs font-extrabold ${absoluteGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {absoluteGain >= 0 ? '+' : ''}{roiPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right / Fluctuation action triggers */}
                <div className="flex flex-row md:flex-col justify-between items-end gap-3 min-w-[120px] pt-2 md:pt-0">
                  <div className="flex gap-1">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(asset.id)}
                        className="p-1 px-2.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer font-bold"
                      >
                        שמור
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditInit(asset)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        title="ערוך השקעה"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`האם להסיר את השקעת "${asset.name}" מתיק הנכסים?`)) {
                          onDeleteAsset(asset.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="מחק נכס"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Market Fluctuation Quick Simulator */}
                  {!isEditing && (
                    <div className="w-full bg-slate-50/80 p-1.5 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-400 block font-bold leading-none mb-1">שנה שווי שוק:</span>
                      <div className="flex gap-1 w-full justify-between">
                        <button
                          onClick={() => {
                            setSimulatedFluctuation(prev => ({ ...prev, [asset.id]: -5 }));
                            // Apply fluctuation immediately
                            const simulatedModifier = 0.95;
                            onUpdateAsset(asset.id, { currentValue: Math.round(asset.currentValue * simulatedModifier) });
                          }}
                          className="px-1 py-0.5 text-[10px] text-rose-600 bg-rose-50 hover:bg-rose-100 rounded font-bold"
                          title="-5% ירידת שער קלה"
                        >
                          -5%
                        </button>
                        <button
                          onClick={() => {
                            setSimulatedFluctuation(prev => ({ ...prev, [asset.id]: 5 }));
                            // Apply fluctuation immediately
                            const simulatedModifier = 1.05;
                            onUpdateAsset(asset.id, { currentValue: Math.round(asset.currentValue * simulatedModifier) });
                          }}
                          className="px-1 py-0.5 text-[10px] text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded font-bold"
                          title="+5% עליית מחיר עולה"
                        >
                          +5%
                        </button>
                        <button
                          onClick={() => {
                            setSimulatedFluctuation(prev => ({ ...prev, [asset.id]: 20 }));
                            // Apply fluctuation immediately
                            const simulatedModifier = 1.20;
                            onUpdateAsset(asset.id, { currentValue: Math.round(asset.currentValue * simulatedModifier) });
                          }}
                          className="px-1.5 py-0.5 text-[10px] text-teal-700 bg-teal-50 hover:bg-teal-100 rounded font-bold"
                          title="+20% זינוק שדרגתי"
                        >
                          +20%
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Asset Allocation Pie Visualizer Card - takes 1/3 space */}
      <div id="allocation-visualizer-card" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between h-fit self-start">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
            <BarChart3 className="text-emerald-500" size={16} />
            <span>התפלגות והקצאת נכסים</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">תמונת תיק מאוזנת לפי סרטונים סוגי סיכון</p>
        </div>

        {totalPortfolioValue === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <AlertCircle size={24} className="text-slate-300 animate-bounce" />
            <span>אין נכסים זמינים להצגת הפילוח. הוסף נכס ראשון בתיק!</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pie Chart Component */}
            <div className="h-[210px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatILS(value), 'שווי מועדכן']}
                    contentStyle={{ direction: 'rtl', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Total overlay label */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400">סך השקעות</span>
                <span className="text-sm font-black text-slate-800">{formatILS(totalPortfolioValue)}</span>
              </div>
            </div>

            {/* Custom Legend list breakdown with values */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              {chartData.map((dataItem, index) => {
                const perc = (dataItem.value / totalPortfolioValue) * 100;
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: dataItem.color }}
                      />
                      <span className="text-slate-600 font-medium">{dataItem.name}</span>
                    </div>
                    <div className="text-slate-500 font-bold">
                      {perc.toFixed(0)}% ({formatILS(dataItem.value)})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-2xl flex items-start gap-2 text-[11px] text-slate-500 leading-normal">
          <Info size={14} className="text-emerald-600 shrink-0 mt-0.5" />
          <span>
            פיזור הרכיבים מקטין תנודתיות. יועצים פיננסיים ממליצים לשמור לפחות 15% מההון בנכסים נזילים או בפיקדונות קצרות טווח למקרה של תקלות.
          </span>
        </div>

      </div>

    </div>
  );
}
