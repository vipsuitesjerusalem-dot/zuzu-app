/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Pencil, Save, X, Info } from 'lucide-react';
import { GenericSheetRow } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetName: string;
  row: GenericSheetRow | null;
  onSave: (rowNum: number, updatedData: any) => Promise<void>;
  isNew?: boolean;
}

export function EditModal({ isOpen, onClose, sheetName, row, onSave, isNew = false }: EditModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (row) {
      // Deep clone raw row fields
      const initialFields: any = {};
      Object.keys(row).forEach(key => {
        // Skip private or system fields but load everything else
        if (!key.startsWith('_') && key !== 'rowNum') {
          initialFields[key] = row[key] !== null ? row[key] : '';
        }
      });
      setFormData(initialFields);
      setErrorMsg(null);
    }
  }, [row]);

  if (!isOpen || !row) return null;

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      // Process numeric fields: if a field was originally a number, make sure we submit a number
      const processedData: any = {};
      Object.keys(formData).forEach(key => {
        const val = formData[key];
        const originalType = typeof row[key];
        
        if (originalType === 'number') {
          const parsed = Number(val);
          processedData[key] = isNaN(parsed) ? val : parsed;
        } else {
          processedData[key] = val;
        }
      });

      await onSave(row._rowNum, processedData);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'כשיל בעדכון הנתונים. אנא ודא שהחיבור לרשת תקין ושגוגל מקבל את הבקשה.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all animate-fade-in-up" id="edit-row-modal">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 block">
          <div className="flex items-center gap-2">
            <Pencil className="text-indigo-600" size={18} />
            <h3 className="text-lg font-bold text-slate-800">
              {isNew ? `הוספת פריט חדש ל- ${sheetName}` : `עריכת שורה מגוגל שיטס (${sheetName})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold transition-colors cursor-pointer"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        {/* Form Fields - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1 py-1 custom-scrollbar">
          
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-slate-500 text-[11px] font-mono flex items-center gap-2 mb-2">
            <Info size={14} className="text-slate-450 shrink-0" />
            <span>שורה בגיליון: {row._rowNum} (שמור בזיכרון לשם כתיבה חוזרת מדויקת)</span>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg text-rose-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {Object.keys(formData).map((key) => {
            const val = formData[key];
            const originalVal = row[key];
            const isNumber = typeof originalVal === 'number';
            
            // Format nice labels dynamically from upper-case or Hebrew headers
            const label = key;

            // Guess type
            let inputType = "text";
            if (isNumber) {
              inputType = "number";
            } else if (String(originalVal).match(/^\d{4}-\d{2}-\d{2}$/)) {
              inputType = "date";
            }

            return (
              <div key={key} className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {label}
                </label>
                <input
                  type={inputType}
                  step={isNumber ? "any" : undefined}
                  value={val}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 rounded-xl outline-none transition-all text-xs text-right font-medium"
                />
              </div>
            );
          })}
          
          {/* Submit Action Controls */}
          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-6 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSubmitting ? 'שומר פריט...' : isNew ? 'הוסף פריט לגליון' : 'שמור שינויים בשיטס'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
