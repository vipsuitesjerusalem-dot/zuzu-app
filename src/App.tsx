/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  getMockPhrases, 
  getMockMeitav, 
  getMockMeitavDeposits, 
  getMockBlink, 
  getMockBlinkDeposits, 
  getMockStudyFunds, 
  getMockPension, 
  getMockChildSavings 
} from './utils/mockGenerator';

import { OverviewTab } from './components/OverviewTab';
import { MeitavTab } from './components/MeitavTab';
import { BlinkTab } from './components/BlinkTab';
import { FundsTab } from './components/FundsTab';
import { EditModal } from './components/EditModal';
import { Header } from './components/Header';

import { 
  TrendingUp, 
  Landmark, 
  Award, 
  Building, 
  PiggyBank, 
  LayoutDashboard, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  CloudLightning,
  Sparkles
} from 'lucide-react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwkGXlrtHB_FmAOE2UpXR59Vi6fkJUczy9b6gbvkfh_TM2yQqY5t3xJPHhb8w3o7FnG0g/exec";

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'overview' | 'meitav' | 'blink' | 'studyFunds' | 'pension' | 'childSavings'>('overview');

  // Unified Google sheet data structures state
  const [sheets, setSheets] = useState<any>({
    "משפטים": [],
    "מיטב": [],
    "הפקדות למיטב": [],
    "בלינק": [],
    "הפקדות לבלינק": [],
    "קרנות השתלמות": [],
    "פנסיה": [],
    "חיסכון לכל ילד": []
  });

  // Welcome banner properties
  const [welcomeQuote, setWelcomeQuote] = useState<string>('');
  
  // App status indicators
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Writeback dialog parameters
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedSheetForEdit, setSelectedSheetForEdit] = useState<string>('');
  const [selectedRowForEdit, setSelectedRowForEdit] = useState<any | null>(null);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);

  // Load the cached or spreadsheet data on startup
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    setApiError(null);

    // 1. Try to load directly from remote App Script WebApp API
    try {
      const response = await fetch(SCRIPT_URL);
      if (!response.ok) {
        throw new Error(`שגיאה בגישה ל-API של גוגל שיטס: קוד ${response.status}`);
      }
      const json = await response.json();
      console.log("נתוני גוגל שיטס מקוריים התקבלו:", json);

      // Extract sheet mappings supporting nesting if available
      let dataContainer = json;
      if (json && json.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
        dataContainer = json.data;
      }

      const parsedSheets: any = {};
      const requiredSheets = [
        "משפטים", "מיטב", "הפקדות למיטב", "בלינק", 
        "הפקדות לבלינק", "קרנות השתלמות", "פנסיה", "חיסכון לכל ילד"
      ];

      requiredSheets.forEach(sheetName => {
        // Find matching key with all whitespaces and casing removed for maximum resilience
        const cleanSheetName = sheetName.replace(/\s+/g, '').toLowerCase();
        const matchKey = Object.keys(dataContainer).find(k => {
          const cleanK = k.replace(/\s+/g, '').toLowerCase();
          return cleanK === cleanSheetName;
        });

        if (matchKey && Array.isArray(dataContainer[matchKey])) {
          // Set sheet contents attaching _rowNum explicitly based on spreadsheet indices if absent
          parsedSheets[sheetName] = dataContainer[matchKey].map((row: any, idx: number) => {
            if (row && typeof row === 'object') {
              return {
                ...row,
                _rowNum: row._rowNum || row.rowNum || (idx + 2) // typical rowNum offset in spreadsheets
              };
            }
            return row;
          });
        } else {
          parsedSheets[sheetName] = null;
        }
      });

      // Merge results with standard default mock values for missing tabs (safety fallback!)
      const merged = mergeWithMocks(parsedSheets);
      setSheets(merged);
      localStorage.setItem('zazu_sheets_cache', JSON.stringify(merged));
      setIsOfflineMode(false);
      extractAndSetWelcomePhrase(merged);

    } catch (err: any) {
      console.warn("נכשלה קריאת הנתונים מהענן, טוען מטמון מקומי או נתוני דמו:", err);
      // Try to load cached fields locally
      const cached = localStorage.getItem('zazu_sheets_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setSheets(parsed);
          setIsOfflineMode(true);
          extractAndSetWelcomePhrase(parsed);
          setApiError("עובד במצב לא מקוון. הנתונים נטענו בהצלחה מהמטמון המקומי.");
        } catch (e) {
          loadStaticDefaults();
        }
      } else {
        loadStaticDefaults();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const mergeWithMocks = (raw: any): any => {
    return {
      "משפטים": raw["משפטים"] || getMockPhrases(),
      "מיטב": raw["מיטב"] || getMockMeitav(),
      "הפקדות למיטב": raw["הפקדות למיטב"] || getMockMeitavDeposits(),
      "בלינק": raw["בלינק"] || getMockBlink(),
      "הפקדות לבלינק": raw["הפקדות לבלינק"] || getMockBlinkDeposits(),
      "קרנות השתלמות": raw["קרנות השתלמות"] || getMockStudyFunds(),
      "פנסיה": raw["פנסיה"] || getMockPension(),
      "חיסכון לכל ילד": raw["חיסכון לכל ילד"] || getMockChildSavings()
    };
  };

  const loadStaticDefaults = () => {
    const mocks = {
      "משפטים": getMockPhrases(),
      "מיטב": getMockMeitav(),
      "הפקדות למיטב": getMockMeitavDeposits(),
      "בלינק": getMockBlink(),
      "הפקדות לבלינק": getMockBlinkDeposits(),
      "קרנות השתלמות": getMockStudyFunds(),
      "פנסיה": getMockPension(),
      "חיסכון לכל ילד": getMockChildSavings()
    };
    setSheets(mocks);
    setIsOfflineMode(true);
    setApiError("החיבור עם שיטס נכשל. האפליקציה פועלת במצב סימולציה מקומית.");
    extractAndSetWelcomePhrase(mocks);
  };

  const extractAndSetWelcomePhrase = (data: any) => {
    const list = data["משפטים"];
    if (list && list.length > 0) {
      // Look for text column
      const phrases = list.map((item: any) => {
        if (typeof item === 'string') return item;
        const keys = Object.keys(item);
        for (const k of keys) {
          if (k !== '_rowNum' && typeof item[k] === 'string' && item[k].trim().length > 4) {
            return item[k].trim();
          }
        }
        return '';
      }).filter((p: string) => p.length > 0);

      if (phrases.length > 0) {
        const randomItem = phrases[Math.floor(Math.random() * phrases.length)];
        setWelcomeQuote(randomItem);
        return;
      }
    }
    setWelcomeQuote("תכנון פיננסי עצמאי מבטיח חירות לקבל החלטות משמעותיות לאורך זמן.");
  };

  // Force refreshing data from the cloud Sheets
  const handleManualSync = async () => {
    setIsSyncing(true);
    await loadInitialData();
    setIsSyncing(false);
  };

  // RESET handler to wipe cache and force demo fallbacks
  const handleResetToMocks = () => {
    localStorage.removeItem('zazu_sheets_cache');
    loadStaticDefaults();
  };

  // --- WRITEBACK DISPATCH HANDLER (pencil items edit saving) ---
  const handleSaveWriteback = async (rowNum: number, updatedData: any) => {
    // 1. Optimistically update local UI state immediately to make things ultra responsive
    const originalSheets = { ...sheets };
    const sheetRows = sheets[selectedSheetForEdit] || [];
    
    let updatedSheetRows;
    const exists = sheetRows.some((r: any) => r._rowNum === rowNum);
    
    if (exists) {
      updatedSheetRows = sheetRows.map((r: any) => {
        if (r._rowNum === rowNum) {
          return { ...r, ...updatedData };
        }
        return r;
      });
    } else {
      updatedSheetRows = [...sheetRows, { _rowNum: rowNum, ...updatedData }];
    }

    const nextSheets = {
      ...sheets,
      [selectedSheetForEdit]: updatedSheetRows
    };
    setSheets(nextSheets);

    // 2. Perform writeback POST to Apps Script Web App
    try {
      const payload = {
        sheetName: selectedSheetForEdit,
        rowNum: rowNum,
        updatedData: updatedData
      };

      console.log("שולח עדכון POST לגוגל Apps Script:", payload);

      // Using text/plain content-type allows bypassing CORS preflight entirely in standard browsers!
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`שגיאה בגישה ל-Apps Script: ${response.status}`);
      }

      const result = await response.json();
      console.log("תשובת גוגל Apps Script לעדכון:", result);

      // Soft refresh from cloud in background to confirm sheet matches exactly
      setTimeout(() => {
        loadInitialData();
      }, 1000);

    } catch (err: any) {
      console.error("שגיאה בעדכון השורה בשיטס בענן, משחזר מצב מקומי:", err);
      setSheets(originalSheets); // rollback on failure
      throw new Error(`נכשל העדכון בשיטס המקוון. אנא ודא שהרשת פועלת והקישור מוגדר לעריכה לכולם: ${err.message}`);
    }
  };

  // Trigger modal open for edit
  const handleTriggerEditRow = (sheetName: string, row: any) => {
    setSelectedSheetForEdit(sheetName);
    setSelectedRowForEdit(row);
    setIsAddMode(false);
    setIsEditModalOpen(true);
  };

  // Trigger modal open for new row
  const handleTriggerAddRow = (sheetName: string) => {
    const sheetRows = sheets[sheetName] || [];
    const templateRow: any = { _rowNum: 2 };
    
    // Determine the next row number
    const maxRowNum = sheetRows.reduce((max: number, r: any) => Math.max(max, r._rowNum || 0), 1);
    const nextRowNum = maxRowNum + 1;
    templateRow._rowNum = nextRowNum;

    if (sheetRows.length > 0) {
      const firstRow = sheetRows[0];
      Object.keys(firstRow).forEach(key => {
        if (!key.startsWith('_') && key !== 'rowNum') {
          const val = firstRow[key];
          if (typeof val === 'number') {
            templateRow[key] = 0;
          } else if (String(val).match(/^\d{4}-\d{2}-\d{2}$/)) {
            templateRow[key] = new Date().toISOString().split('T')[0];
          } else {
            templateRow[key] = '';
          }
        }
      });
    } else {
      // Fallback schemas
      if (sheetName === "מיטב" || sheetName === "בלינק") {
        templateRow["שם הנכס"] = "";
        templateRow["סכום השקעה"] = 0;
        templateRow["שווי נוכחי"] = 0;
        templateRow["תאריך קנייה"] = new Date().toISOString().split('T')[0];
        templateRow["תאריך מכירה"] = "";
        templateRow["אורך הטרייד"] = "";
      } else if (sheetName === "הפקדות למיטב") {
        templateRow["תאריך"] = new Date().toISOString().split('T')[0];
        templateRow["סוג פעולה"] = "הפקדה";
        templateRow["סכום"] = 0;
      } else if (sheetName === "הפקדות לבלינק") {
        templateRow["תאריך"] = new Date().toISOString().split('T')[0];
        templateRow["פעולה"] = "הפקדה";
        templateRow["סכום בדולרים"] = 0;
        templateRow["סכום בשקלים"] = 0;
      } else {
        templateRow["שם הקופה"] = "";
        templateRow["נכון לתאריך"] = new Date().toISOString().split('T')[0];
        templateRow["שווי עדכני"] = 0;
      }
    }

    setSelectedSheetForEdit(sheetName);
    setSelectedRowForEdit(templateRow);
    setIsAddMode(true);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans" id="app-root-container">
      
      {/* Dynamic Header */}
      <Header 
        onResetData={handleResetToMocks} 
        onImportData={loadInitialData}
        onExportData={() => {
          // Export Meitav or Blink as CSV representation
          let rows = ["CATEGORY,NAME,VALUE_1,VALUE_2"];
          sheets["מיטב"].forEach((r: any) => {
            rows.push(`meitav,${r["שם הנכס"] || ""},${r["סכום השקעה"] || 0},${r["שווי נוכחי"] || 0}`);
          });
          const content = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
          const a = document.createElement('a');
          a.setAttribute('href', content);
          a.setAttribute('download', 'Zuzu_Portoflio_Backup.csv');
          a.click();
        }}
      />

      {isLoading ? (
        /* Full Loading screen */
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/10 animate-pulse">
            <TrendingUp size={36} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-800">מתחבר לגיליון גוגל...</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-normal">
              אפליקציית ZUZU מגבשת את הנתונים הפיננסיים, הצבירות ומשפטי השראה ישירות מדף ה-Apps Script שלך.
            </p>
          </div>
          <div className="w-48 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full animate-[shimmer_1.5s_infinite]" style={{ width: '40%' }}></div>
          </div>
        </div>
      ) : (
        /* Main Inner Workspace Layout */
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-6">

          {/* 6 TABS NAV - Grid-style on touch, beautiful tabs on desktop */}
          <div className="bg-white p-2 border border-slate-200/85 rounded-2xl flex flex-wrap gap-1.5 justify-start mb-6 shadow-xs" id="workspace-tabs-desktop">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={14} />
              <span>סקירת תיק מאוחדת</span>
            </button>

            <button
              onClick={() => setActiveTab('meitav')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'meitav' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              <TrendingUp size={14} />
              <span>מיטב</span>
            </button>

            <button
              onClick={() => setActiveTab('blink')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'blink' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              <Landmark size={14} />
              <span>בלינק</span>
            </button>

            <button
              onClick={() => setActiveTab('studyFunds')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'studyFunds' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              <Award size={14} />
              <span>קרנות השתלמות</span>
            </button>

            <button
              onClick={() => setActiveTab('pension')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'pension' ? 'bg-purple-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              <Building size={14} />
              <span>פנסיה</span>
            </button>

            <button
              onClick={() => setActiveTab('childSavings')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'childSavings' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              <PiggyBank size={14} />
              <span>חיסכון לכל ילד</span>
            </button>
          </div>

          {/* Render Active view based on Tabs state selection */}
          <section className="min-h-[400px]">
            {activeTab === 'overview' && (
              <OverviewTab 
                sheets={sheets} 
                welcomeQuote={welcomeQuote}
                onTabChange={(tab: any) => setActiveTab(tab)}
                onEditRow={handleTriggerEditRow}
              />
            )}

            {activeTab === 'meitav' && (
              <MeitavTab 
                data={sheets["מיטב"] || []}
                deposits={sheets["הפקדות למיטב"] || []}
                onEditRow={handleTriggerEditRow}
                onAddRow={handleTriggerAddRow}
              />
            )}

            {activeTab === 'blink' && (
              <BlinkTab 
                data={sheets["בלינק"] || []}
                deposits={sheets["הפקדות לבלינק"] || []}
                onEditRow={handleTriggerEditRow}
                onAddRow={handleTriggerAddRow}
              />
            )}

            {activeTab === 'studyFunds' && (
              <FundsTab 
                sheetName="קרנות השתלמות"
                data={sheets["קרנות השתלמות"] || []}
                onEditRow={handleTriggerEditRow}
                onAddRow={handleTriggerAddRow}
              />
            )}

            {activeTab === 'pension' && (
              <FundsTab 
                sheetName="פנסיה"
                data={sheets["פנסיה"] || []}
                onEditRow={handleTriggerEditRow}
                onAddRow={handleTriggerAddRow}
              />
            )}

            {activeTab === 'childSavings' && (
              <FundsTab 
                sheetName="חיסכון לכל ילד"
                data={sheets["חיסכון לכל ילד"] || []}
                onEditRow={handleTriggerEditRow}
                onAddRow={handleTriggerAddRow}
              />
            )}
          </section>

        </main>
      )}

      {/* Dynamic Edit Dialog Modal Overlay */}
      <EditModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRowForEdit(null);
        }}
        sheetName={selectedSheetForEdit}
        row={selectedRowForEdit}
        onSave={handleSaveWriteback}
        isNew={isAddMode}
      />

      {/* Footer credits and information */}
      <footer className="w-full border-t border-slate-200 py-6 px-4 bg-slate-100/60 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-emerald-600 font-bold">© {new Date().getFullYear()} חברת ZUZU פיננסים. כל הזכויות שמורות.</p>
          <div className="text-amber-700 font-semibold text-xs py-1 px-3 bg-amber-50 rounded-lg border border-amber-200">
            לתשומת לב! תנאי שימוש ללא התחברות, אין להעביר לאף אחד.
          </div>
        </div>
      </footer>

    </div>
  );
}
