/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TrendingUp, Landmark, ShieldCheck, PieChart, PiggyBank, Award } from 'lucide-react';
import { SavingsGoal, InvestmentAsset } from '../types';

interface DashboardStatsProps {
  savingsGoals: SavingsGoal[];
  investmentAssets: InvestmentAsset[];
}

export function DashboardStats({ savingsGoals, investmentAssets }: DashboardStatsProps) {
  // Calculations
  const totalSaved = savingsGoals.reduce((sum, item) => sum + item.currentAmount, 0);
  const totalInvestedPrincipal = investmentAssets.reduce((sum, item) => sum + item.investedAmount, 0);
  const totalInvestedCurrent = investmentAssets.reduce((sum, item) => sum + item.currentValue, 0);
  
  const totalNetWorth = totalSaved + totalInvestedCurrent;
  
  // Overall investment gain / loss
  const totalGain = totalInvestedCurrent - totalInvestedPrincipal;
  const overallROI = totalInvestedPrincipal > 0 ? (totalGain / totalInvestedPrincipal) * 100 : 0;
  
  // Combined monthly deposit velocity
  const totalSavingsMonthly = savingsGoals.reduce((sum, item) => sum + item.monthlyDeposit, 0);
  
  // Total Savings target and combined progress bar
  const totalSavingsTarget = savingsGoals.reduce((sum, item) => sum + item.targetAmount, 0);
  const overallSavingsProgress = totalSavingsTarget > 0 ? (totalSaved / totalSavingsTarget) * 100 : 0;

  // Helper format currency
  const formatILS = (val: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" id="dashboard-stats-grid">
      
      {/* 1. Net Worth Card */}
      <div 
        id="kpi-net-worth"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">הון עצמי ושווי נקי</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Landmark size={18} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none mb-1">
            {formatILS(totalNetWorth)}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            חיסכון: {formatILS(totalSaved)} | השקעות: {formatILS(totalInvestedCurrent)}
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">חוסן פיננסי מעורב</span>
          <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
            יציב מאוד
          </span>
        </div>
      </div>

      {/* 2. Portfolio Yield & Profitability Card */}
      <div 
        id="kpi-investments"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">תיק השקעות פעיל</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none mb-1">
            {formatILS(totalInvestedCurrent)}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">קרן: {formatILS(totalInvestedPrincipal)}</span>
            <span className={`font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ({totalGain >= 0 ? '+' : ''}{overallROI.toFixed(1)}% ROI)
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">רווח נצבר משוער</span>
          <span className={`font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatILS(totalGain)}
          </span>
        </div>
      </div>

      {/* 3. Savings Goals Card */}
      <div 
        id="kpi-savings"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">סך חסכונות ומטרות</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <PiggyBank size={18} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none mb-1">
            {formatILS(totalSaved)}
          </h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden relative">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallSavingsProgress)}%` }}
            />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">עמידה ביעדים כלליים</span>
          <span className="font-bold text-slate-700">
            {overallSavingsProgress.toFixed(0)}% ({formatILS(totalSavingsTarget)})
          </span>
        </div>
      </div>

      {/* 4. Monthly Velocity Card */}
      <div 
        id="kpi-velocity"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">קצב הפקדה חודשי</span>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <ShieldCheck size={18} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none mb-1">
            {formatILS(totalSavingsMonthly)}
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">
            סכום קבוע המופרש בכל ראש חודש
          </p>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">קצב צמיחה שנתי גולמי</span>
          <span className="font-bold text-teal-600">
            {formatILS(totalSavingsMonthly * 12)}
          </span>
        </div>
      </div>

    </div>
  );
}
