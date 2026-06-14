/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PiggyBank, Plus, TrendingUp, HelpCircle, Edit3, Trash2, Calendar, DollarSign, Check } from 'lucide-react';
import { SavingsGoal } from '../types';

interface SavingsCardListProps {
  savingsGoals: SavingsGoal[];
  onAddSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateSavingsGoal: (id: string, updated: Partial<SavingsGoal>) => void;
  onDeleteSavingsGoal: (id: string) => void;
}

export function SavingsCardList({
  savingsGoals,
  onAddSavingsGoal,
  onUpdateSavingsGoal,
  onDeleteSavingsGoal
}: SavingsCardListProps) {
  // Toggle states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // New Goal Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('כללי');
  const [newTarget, setNewTarget] = useState(50000);
  const [newCurrent, setNewCurrent] = useState(10000);
  const [newMonthly, setNewMonthly] = useState(1500);
  const [newTargetDate, setNewTargetDate] = useState('2027-12-31');
  const [newNotes, setNewNotes] = useState('');

  // Editing state
  const [editedGoal, setEditedGoal] = useState<Partial<SavingsGoal>>({});

  // Quick Deposit State
  const [quickDepositValue, setQuickDepositValue] = useState<{ [id: string]: number }>({});

  const presetCategories = ['ביטחון', 'מגורים', 'רכב', 'לייף סטייל', 'לימודים', 'חתונה', 'משפחה', 'כללי'];

  const resetForm = () => {
    setNewName('');
    setNewCategory('כללי');
    setNewTarget(50000);
    setNewCurrent(10000);
    setNewMonthly(1500);
    setNewTargetDate('2027-12-31');
    setNewNotes('');
    setIsAdding(false);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    onAddSavingsGoal({
      name: newName,
      category: newCategory,
      targetAmount: Number(newTarget),
      currentAmount: Number(newCurrent),
      monthlyDeposit: Number(newMonthly),
      startDate: new Date().toISOString().split('T')[0],
      targetDate: newTargetDate,
      status: 'active',
      notes: newNotes
    });
    resetForm();
  };

  const handleEditInit = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setEditedGoal({ ...goal });
  };

  const handleSaveEdit = (id: string) => {
    if (editedGoal.name?.trim()) {
      onUpdateSavingsGoal(id, editedGoal);
      setEditingId(null);
      setEditedGoal({});
    }
  };

  const handleQuickDeposit = (id: string, currentAmount: number) => {
    const depositAmt = quickDepositValue[id] || 0;
    if (depositAmt > 0) {
      onUpdateSavingsGoal(id, { currentAmount: currentAmount + depositAmt });
      // clear simple deposit input
      setQuickDepositValue(prev => ({ ...prev, [id]: 0 }));
    }
  };

  const formatILS = (val: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="savings-view-container">
      {/* Action Title bar */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
            <PiggyBank className="text-amber-500" size={20} />
            <span>תוכניות חיסכון ומטרות אקטיביות</span>
          </h2>
          <p className="text-xs text-slate-500">עקוב אחר ההתקדמות שלך לקראת יעדים פיננסיים גדולים</p>
        </div>
        <button
          id="btn-add-saving-goal-trigger"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-xl transition-all cursor-pointer shadow-sm shadow-amber-500/10"
        >
          <Plus size={14} />
          <span>מטרה חדשה</span>
        </button>
      </div>

      {/* Add new Saving Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-4 animate-fade-in-up">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wide border-b border-amber-100 pb-2">הגדרת יעד חיסכון חדש</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">שם המטרה או החיסכון</label>
              <input
                type="text"
                placeholder="לדוגמה: מקדמה ללימודים"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-amber-500 outline-none text-right"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">קטגוריה</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-amber-500 outline-none"
              >
                {presetCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">יעד סיום משוער</label>
              <input
                type="date"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                className="w-full p-1.5 text-xs border border-slate-200 rounded-xl focus:border-amber-500 outline-none text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">סכום יעד סופי (₪)</label>
              <input
                type="number"
                value={newTarget}
                onChange={(e) => setNewTarget(Number(e.target.value))}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-amber-500 outline-none text-right"
                min={0}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">סכום שנצבר כבר (₪)</label>
              <input
                type="number"
                value={newCurrent}
                onChange={(e) => setNewCurrent(Number(e.target.value))}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-amber-500 outline-none text-right"
                min={0}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">הפקדה חודשית קבועה (₪)</label>
              <input
                type="number"
                value={newMonthly}
                onChange={(e) => setNewMonthly(Number(e.target.value))}
                className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-amber-500 outline-none text-right"
                min={0}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">הערות / פרטים נוספים</label>
            <input
              type="text"
              placeholder="איפה הכסף יושב? מה התנאים? מידע שימושי..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:border-amber-500 outline-none text-right"
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
              className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs"
            >
              הוסף יעד חסכון
            </button>
          </div>
        </form>
      )}

      {/* Grid of Savings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="savings-cards-grid">
        {savingsGoals.map(goal => {
          const isEditing = editingId === goal.id;
          const progressPercentage = goal.targetAmount > 0 
            ? (goal.currentAmount / goal.targetAmount) * 100 
            : 0;

          return (
            <div
              key={goal.id}
              id={`saving-card-${goal.id}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Colored side bar decor */}
              <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-400" />
              
              <div>
                {/* Card Title & Badges */}
                <div className="flex items-start justify-between mb-3 mr-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedGoal.category || ''}
                            onChange={(e) => setEditedGoal({ ...editedGoal, category: e.target.value })}
                            className="bg-white border border-slate-300 rounded px-1 max-w-[80px] font-bold text-right"
                          />
                        ) : (
                          goal.category
                        )}
                      </span>
                    </div>

                    {isEditing ? (
                      <input
                        type="text"
                        value={editedGoal.name || ''}
                        onChange={(e) => setEditedGoal({ ...editedGoal, name: e.target.value })}
                        className="bg-white text-sm font-bold border border-slate-300 rounded p-1 text-slate-800 text-right mt-1 w-full"
                      />
                    ) : (
                      <h4 className="text-base font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                        {goal.name}
                      </h4>
                    )}
                  </div>

                  {/* Desktop hover actions */}
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(goal.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="שמור שינויים"
                      >
                        <Check size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditInit(goal)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        title="ערוך פרטי חיסכון"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`האם למחוק את יעד החיסכון "${goal.name}"?`)) {
                          onDeleteSavingsGoal(goal.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="מחק מטרה"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Optional Notes */}
                {!isEditing && goal.notes && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 mr-2 bg-slate-50 p-2 rounded-lg">
                    {goal.notes}
                  </p>
                )}
                {isEditing && (
                  <textarea
                    value={editedGoal.notes || ''}
                    onChange={(e) => setEditedGoal({ ...editedGoal, notes: e.target.value })}
                    className="w-full text-xs text-slate-500 border border-slate-300 rounded p-1 mb-3 text-right"
                    rows={2}
                    placeholder="הערות..."
                  />
                )}

                {/* Financial Progress values */}
                <div className="space-y-1 mt-2 mr-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500 font-medium">התקדמות:</span>
                    <span className="font-extrabold text-slate-700">
                      {isEditing ? (
                        <div className="flex gap-1 items-center">
                          <input
                            type="number"
                            value={editedGoal.currentAmount || 0}
                            onChange={(e) => setEditedGoal({ ...editedGoal, currentAmount: Number(e.target.value) })}
                            className="bg-white border rounded p-0.5 w-16 text-center"
                          />
                          <span>מתוך</span>
                          <input
                            type="number"
                            value={editedGoal.targetAmount || 0}
                            onChange={(e) => setEditedGoal({ ...editedGoal, targetAmount: Number(e.target.value) })}
                            className="bg-white border rounded p-0.5 w-16 text-center"
                          />
                        </div>
                      ) : (
                        `${formatILS(goal.currentAmount)} מתוך ${formatILS(goal.targetAmount)}`
                      )}
                    </span>
                  </div>

                  {/* Progress Graphics */}
                  <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-550 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progressPercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>{progressPercentage.toFixed(0)}% נחסכו</span>
                    <span className="flex items-center gap-0.5">
                      <Calendar size={11} className="inline" />
                      יעד: {isEditing ? (
                        <input
                          type="date"
                          value={editedGoal.targetDate || ''}
                          onChange={(e) => setEditedGoal({ ...editedGoal, targetDate: e.target.value })}
                          className="bg-white border rounded p-0.5 max-w-[100px]"
                        />
                      ) : (
                        goal.targetDate
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer Action - Quick Deposits */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mr-2">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">הפקדה חודשית קבועה:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedGoal.monthlyDeposit || 0}
                      onChange={(e) => setEditedGoal({ ...editedGoal, monthlyDeposit: Number(e.target.value) })}
                      className="bg-white border border-slate-300 rounded p-0.5 w-20 text-center text-xs font-bold"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-700">
                      {formatILS(goal.monthlyDeposit)} לחודש
                    </span>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="+ ₪"
                      value={quickDepositValue[goal.id] || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setQuickDepositValue(prev => ({ ...prev, [goal.id]: val }));
                      }}
                      className="w-16 p-1 text-xs border border-slate-200 rounded-lg text-center"
                    />
                    <button
                      onClick={() => handleQuickDeposit(goal.id, goal.currentAmount)}
                      className="px-2 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                    >
                      הפקד
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
