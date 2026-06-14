/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Landmark, RefreshCw, Upload, Download, Sparkles, TrendingUp } from 'lucide-react';

interface HeaderProps {
  onResetData: () => void;
  onImportData: () => void;
  onExportData: () => void;
}

export function Header({ onResetData, onImportData, onExportData }: HeaderProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onImportData();
    setShowImportModal(false);
  };

  const sampleTemplate = `CATEGORY,NAME,TARGET,CURRENT,MONTHLY\nsavings,קרн חירום משפחתית,60000,48000,1500\nsavings,רכב חדש,90000,35000,1200\ninvestment,קופת גמל להשקעה,45000,51200,1500`;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 py-4 px-6 shadow-xs" id="app-header">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/10">
            <TrendingUp size={28} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-800">אפליקציית ZUZU</h1>
              <span className="text-[10px] font-bold tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">ZUZU APP</span>
            </div>
            <p className="text-xs text-emerald-600 font-bold tracking-wide">
              לראות איך הזוזים זזים...
            </p>
          </div>
        </div>


      </div>

      {/* CSV Import Modal Simulator */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in-up" id="import-modal">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-emerald-500" size={18} />
                <h3 className="text-lg font-bold text-slate-800">סנכרון מול ענן Google Sheets</h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              אפליקציית ZUZU מחוברת ישירות למקרו ה-Google Apps Script שלך ומסנכרנת את כל הגיליונות והתזרים בזמן אמת.
            </p>

            <div className="text-xs text-zinc-650 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mb-4 space-y-2">
              <p className="font-bold text-indigo-900 flex items-center gap-1">
                <span>🔗 נתיב ענן מקושר:</span>
              </p>
              <p className="text-[10px] font-mono select-all bg-white p-2 border border-slate-150 rounded-lg text-slate-500 overflow-x-auto text-left whitespace-pre-wrap leading-tight font-semibold text-indigo-600">
                https://script.google.com/macros/s/AKfycbwkGXlrtHB_FmAOE2Up...
              </p>
              <ul className="list-disc pr-4 space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>שאילתות קריאה (GET) לקבלת נתוני השמונה גיליונות שלך.</li>
                <li>כתיבה חוזרת (POST) ועדכון ישיר של שורות ועמודות ישירות מהאפליקציה!</li>
              </ul>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                <p className="text-[11px] text-emerald-800 leading-normal font-semibold">
                  לחץ על הכפתור מטה כדי לבצע משיכת נתונים מלאה ועדכון מול השרת המקוון של גוגל עכשיו.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm cursor-pointer"
                >
                  סנכרן נתונים מהענן
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
