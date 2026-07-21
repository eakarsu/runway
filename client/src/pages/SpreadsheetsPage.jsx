import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, Upload, FileSpreadsheet, Plus, X, Save, Download, Trash2, Play, ChevronDown, ChevronUp, Search, BarChart3, ArrowUpDown, EyeOff, Check, PieChart, TrendingUp, Hash, Type, Calendar, MessageSquare, Palette, GitBranch, Clock, FileText, Printer, Zap, ArrowLeft } from 'lucide-react';
import { downloadSpreadsheet, readSpreadsheet } from '../services/spreadsheetFile';
import api from '../services/api';
import { FORMULAS, STANDALONE, evalFormula, round2, _nums, _sum } from '../utils/formulaEngine';


function highlightMatch(text, query) {
  if (!query) return text;
  const str = String(text);
  const idx = str.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (<>{str.slice(0, idx)}<mark className="bg-yellow-200 text-violet-700 rounded px-0.5 font-semibold">{str.slice(idx, idx + query.length)}</mark>{str.slice(idx + query.length)}</>);
}

function detectColumnType(data, col) {
  const vals = data.map(r => r[col]).filter(v => v != null && v !== '');
  if (!vals.length) return 'text';
  if (vals.every(v => !isNaN(Number(v)))) return 'number';
  return 'text';
}

function MiniBar({ value, max }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (<div className="w-full bg-gray-100 rounded-full h-1.5 mt-1"><div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>);
}

// ═══════════════════════════════════════════
// TEMPLATES
// ═══════════════════════════════════════════
const TEMPLATES = [
  {
    id: 'saas-revenue', name: 'SaaS Revenue Model', icon: TrendingUp, color: 'from-violet-500 to-purple-500',
    columns: ['Month', 'New_MRR', 'Churned_MRR', 'Expansion_MRR', 'Total_MRR', 'ARR', 'Customers', 'ARPU', 'Churn_Rate'],
    data: Array.from({ length: 12 }, (_, i) => {
      const m = i + 1; const base = 50000 + i * 8000; const churn = round2(base * 0.03); const exp = round2(base * 0.05); const newMrr = round2(8000 + i * 500);
      const total = round2(base + newMrr - churn + exp); const customers = 200 + i * 25;
      return { Month: `2026-${String(m).padStart(2, '0')}`, New_MRR: newMrr, Churned_MRR: churn, Expansion_MRR: exp, Total_MRR: total, ARR: round2(total * 12), Customers: customers, ARPU: round2(total / customers), Churn_Rate: round2((churn / base) * 100) };
    }),
  },
  {
    id: 'burn-rate', name: 'Burn Rate Calculator', icon: Clock, color: 'from-red-500 to-orange-500',
    columns: ['Month', 'Revenue', 'Payroll', 'Rent', 'Software', 'Marketing', 'Other', 'Total_Expenses', 'Net_Burn', 'Cash_Balance'],
    data: Array.from({ length: 12 }, (_, i) => {
      const rev = 30000 + i * 5000; const payroll = 80000; const rent = 8000; const sw = 5000; const mkt = 10000 + i * 1000; const other = 3000;
      const total = payroll + rent + sw + mkt + other; const burn = rev - total; const cash = 1200000 + Array.from({ length: i + 1 }, (_, j) => (30000 + j * 5000) - (payroll + rent + sw + (10000 + j * 1000) + other)).reduce((a, b) => a + b, 0);
      return { Month: `2026-${String(i + 1).padStart(2, '0')}`, Revenue: rev, Payroll: payroll, Rent: rent, Software: sw, Marketing: mkt, Other: other, Total_Expenses: total, Net_Burn: burn, Cash_Balance: round2(cash) };
    }),
  },
  {
    id: 'pnl', name: 'P&L Statement', icon: BarChart3, color: 'from-emerald-500 to-teal-500',
    columns: ['Category', 'Q1_2025', 'Q2_2025', 'Q3_2025', 'Q4_2025', 'Q1_2026', 'Q2_2026'],
    data: [
      { Category: 'Revenue', Q1_2025: 250000, Q2_2025: 280000, Q3_2025: 310000, Q4_2025: 350000, Q1_2026: 390000, Q2_2026: 420000 },
      { Category: 'COGS', Q1_2025: 75000, Q2_2025: 84000, Q3_2025: 93000, Q4_2025: 105000, Q1_2026: 117000, Q2_2026: 126000 },
      { Category: 'Gross Profit', Q1_2025: 175000, Q2_2025: 196000, Q3_2025: 217000, Q4_2025: 245000, Q1_2026: 273000, Q2_2026: 294000 },
      { Category: 'Sales & Marketing', Q1_2025: 50000, Q2_2025: 56000, Q3_2025: 62000, Q4_2025: 70000, Q1_2026: 78000, Q2_2026: 84000 },
      { Category: 'R&D', Q1_2025: 80000, Q2_2025: 82000, Q3_2025: 85000, Q4_2025: 90000, Q1_2026: 95000, Q2_2026: 98000 },
      { Category: 'G&A', Q1_2025: 30000, Q2_2025: 31000, Q3_2025: 32000, Q4_2025: 33000, Q1_2026: 34000, Q2_2026: 35000 },
      { Category: 'Total OpEx', Q1_2025: 160000, Q2_2025: 169000, Q3_2025: 179000, Q4_2025: 193000, Q1_2026: 207000, Q2_2026: 217000 },
      { Category: 'EBITDA', Q1_2025: 15000, Q2_2025: 27000, Q3_2025: 38000, Q4_2025: 52000, Q1_2026: 66000, Q2_2026: 77000 },
      { Category: 'Net Income', Q1_2025: 10000, Q2_2025: 22000, Q3_2025: 33000, Q4_2025: 47000, Q1_2026: 61000, Q2_2026: 72000 },
    ],
  },
  {
    id: 'headcount', name: 'Headcount Planning', icon: Table, color: 'from-blue-500 to-cyan-500',
    columns: ['Department', 'Current', 'Q1_Hires', 'Q2_Hires', 'Q3_Hires', 'Q4_Hires', 'EOY_Total', 'Avg_Salary', 'Total_Cost'],
    data: [
      { Department: 'Engineering', Current: 25, Q1_Hires: 3, Q2_Hires: 4, Q3_Hires: 3, Q4_Hires: 2, EOY_Total: 37, Avg_Salary: 160000, Total_Cost: 5920000 },
      { Department: 'Product', Current: 8, Q1_Hires: 1, Q2_Hires: 1, Q3_Hires: 1, Q4_Hires: 0, EOY_Total: 11, Avg_Salary: 150000, Total_Cost: 1650000 },
      { Department: 'Design', Current: 5, Q1_Hires: 1, Q2_Hires: 0, Q3_Hires: 1, Q4_Hires: 0, EOY_Total: 7, Avg_Salary: 130000, Total_Cost: 910000 },
      { Department: 'Sales', Current: 12, Q1_Hires: 2, Q2_Hires: 3, Q3_Hires: 2, Q4_Hires: 2, EOY_Total: 21, Avg_Salary: 120000, Total_Cost: 2520000 },
      { Department: 'Marketing', Current: 6, Q1_Hires: 1, Q2_Hires: 1, Q3_Hires: 0, Q4_Hires: 1, EOY_Total: 9, Avg_Salary: 110000, Total_Cost: 990000 },
      { Department: 'Customer Success', Current: 8, Q1_Hires: 1, Q2_Hires: 2, Q3_Hires: 1, Q4_Hires: 1, EOY_Total: 13, Avg_Salary: 90000, Total_Cost: 1170000 },
      { Department: 'G&A', Current: 4, Q1_Hires: 0, Q2_Hires: 1, Q3_Hires: 0, Q4_Hires: 0, EOY_Total: 5, Avg_Salary: 100000, Total_Cost: 500000 },
    ],
  },
  {
    id: 'budget', name: 'Annual Budget', icon: PieChart, color: 'from-amber-500 to-yellow-500',
    columns: ['Line_Item', 'Budget_Q1', 'Actual_Q1', 'Variance_Q1', 'Budget_Q2', 'Actual_Q2', 'Variance_Q2'],
    data: [
      { Line_Item: 'Cloud Infrastructure', Budget_Q1: 45000, Actual_Q1: 48200, Variance_Q1: -3200, Budget_Q2: 50000, Actual_Q2: 47800, Variance_Q2: 2200 },
      { Line_Item: 'Software Licenses', Budget_Q1: 25000, Actual_Q1: 24500, Variance_Q1: 500, Budget_Q2: 26000, Actual_Q2: 27100, Variance_Q2: -1100 },
      { Line_Item: 'Office & Facilities', Budget_Q1: 35000, Actual_Q1: 34000, Variance_Q1: 1000, Budget_Q2: 35000, Actual_Q2: 36500, Variance_Q2: -1500 },
      { Line_Item: 'Travel & Events', Budget_Q1: 15000, Actual_Q1: 12000, Variance_Q1: 3000, Budget_Q2: 20000, Actual_Q2: 22000, Variance_Q2: -2000 },
      { Line_Item: 'Professional Services', Budget_Q1: 20000, Actual_Q1: 18000, Variance_Q1: 2000, Budget_Q2: 20000, Actual_Q2: 19500, Variance_Q2: 500 },
      { Line_Item: 'Recruiting', Budget_Q1: 30000, Actual_Q1: 35000, Variance_Q1: -5000, Budget_Q2: 40000, Actual_Q2: 38000, Variance_Q2: 2000 },
      { Line_Item: 'Marketing Programs', Budget_Q1: 60000, Actual_Q1: 58000, Variance_Q1: 2000, Budget_Q2: 65000, Actual_Q2: 70000, Variance_Q2: -5000 },
    ],
  },
];

// ═══════════════════════════════════════════
// CONDITIONAL FORMATTING RULES
// ═══════════════════════════════════════════
function getCellStyle(val, col, rules) {
  if (!rules.length) return '';
  const num = Number(val);
  for (const rule of rules) {
    if (rule.column !== col && rule.column !== '__all__') continue;
    if (rule.type === 'negative' && !isNaN(num) && num < 0) return 'bg-red-50 text-red-700 font-semibold';
    if (rule.type === 'positive' && !isNaN(num) && num > 0) return 'bg-green-50 text-green-700 font-semibold';
    if (rule.type === 'zero' && num === 0) return 'bg-gray-100 text-gray-400';
    if (rule.type === 'above' && !isNaN(num) && num > rule.value) return 'bg-green-50 text-green-700 font-semibold';
    if (rule.type === 'below' && !isNaN(num) && num < rule.value) return 'bg-red-50 text-red-700 font-semibold';
    if (rule.type === 'contains' && String(val ?? '').toLowerCase().includes(rule.value.toLowerCase())) return 'bg-blue-50 text-blue-700 font-semibold';
  }
  return '';
}

// ═══════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════
const INTEGRATIONS = [
  { id: 'quickbooks', name: 'QuickBooks', desc: 'Sync accounting data', color: 'bg-green-500', connected: false,
    fields: [
      { key: 'client_id', label: 'Client ID', placeholder: 'Enter QuickBooks Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', placeholder: 'Enter Client Secret', type: 'password' },
      { key: 'company_id', label: 'Company ID', placeholder: 'Enter Company ID (Realm ID)', type: 'text' },
      { key: 'environment', label: 'Environment', placeholder: '', type: 'select', options: ['Sandbox', 'Production'] },
    ]},
  { id: 'stripe', name: 'Stripe', desc: 'Import revenue & billing', color: 'bg-violet-500', connected: false,
    fields: [
      { key: 'api_key', label: 'API Key', placeholder: 'sk_live_... or sk_test_...', type: 'password' },
      { key: 'webhook_secret', label: 'Webhook Secret (optional)', placeholder: 'whsec_...', type: 'password' },
      { key: 'sync_mode', label: 'Sync Mode', placeholder: '', type: 'select', options: ['All transactions', 'Invoices only', 'Subscriptions only'] },
    ]},
  { id: 'xero', name: 'Xero', desc: 'Accounting & invoicing', color: 'bg-blue-500', connected: false,
    fields: [
      { key: 'client_id', label: 'Client ID', placeholder: 'Enter Xero Client ID', type: 'text' },
      { key: 'client_secret', label: 'Client Secret', placeholder: 'Enter Client Secret', type: 'password' },
      { key: 'tenant_id', label: 'Tenant ID', placeholder: 'Enter Xero Tenant ID', type: 'text' },
      { key: 'scope', label: 'Data Scope', placeholder: '', type: 'select', options: ['Full access', 'Read only', 'Accounting only'] },
    ]},
  { id: 'gusto', name: 'Gusto', desc: 'Payroll & HR data', color: 'bg-red-400', connected: false,
    fields: [
      { key: 'api_token', label: 'API Token', placeholder: 'Enter Gusto API token', type: 'password' },
      { key: 'company_uuid', label: 'Company UUID', placeholder: 'Enter Company UUID', type: 'text' },
      { key: 'data_type', label: 'Data to Sync', placeholder: '', type: 'select', options: ['Payroll & Employees', 'Payroll only', 'Employees only'] },
    ]},
  { id: 'hubspot', name: 'HubSpot', desc: 'CRM & pipeline data', color: 'bg-orange-500', connected: false,
    fields: [
      { key: 'access_token', label: 'Access Token', placeholder: 'pat-... or your private app token', type: 'password' },
      { key: 'portal_id', label: 'Portal ID (optional)', placeholder: 'Enter HubSpot Portal ID', type: 'text' },
      { key: 'objects', label: 'Objects to Sync', placeholder: '', type: 'select', options: ['Deals & Contacts', 'Deals only', 'Contacts only', 'Companies only', 'All objects'] },
    ]},
  { id: 'gsheets', name: 'Google Sheets', desc: 'Import spreadsheets', color: 'bg-emerald-500', connected: false,
    fields: [
      { key: 'service_account', label: 'Service Account JSON Key', placeholder: 'Paste JSON key or upload file', type: 'textarea' },
      { key: 'spreadsheet_id', label: 'Spreadsheet ID', placeholder: 'From the URL: /spreadsheets/d/{ID}/edit', type: 'text' },
      { key: 'sheet_name', label: 'Sheet Name (optional)', placeholder: 'Leave blank for first sheet', type: 'text' },
    ]},
];

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
const TABS = ['Data', 'Charts', 'Pivot', 'Scenarios', 'Forecast'];

export default function SpreadsheetsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileRef = useRef(null);
  const [saved, setSaved] = useState([]);

  // Workbook
  const [fileName, setFileName] = useState('');
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [variables, setVariables] = useState([]);
  const [autoCalcs, setAutoCalcs] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sheetNames, setSheetNames] = useState([]);
  const [activeSheet, setActiveSheet] = useState('');
  const [workbook, setWorkbook] = useState(null);

  // Search, sort, filter
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [columnFilters, setColumnFilters] = useState({});
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [activeTab, setActiveTab] = useState('Data');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  // Chart
  const [chartCol, setChartCol] = useState('');
  const [chartGroupCol, setChartGroupCol] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [chartAgg, setChartAgg] = useState('sum');

  // Pivot
  const [pivotRow, setPivotRow] = useState('');
  const [pivotValue, setPivotValue] = useState('');

  // Cell editing
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Comments
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [activeComment, setActiveComment] = useState(null);

  // Conditional formatting
  const [formatRules, setFormatRules] = useState([]);
  const [showFormatPanel, setShowFormatPanel] = useState(false);
  const [newRule, setNewRule] = useState({ column: '__all__', type: 'negative', value: '' });

  // Scenarios
  const [scenarios, setScenarios] = useState([
    { id: 1, name: 'Base Case', multiplier: 1.0, color: 'bg-gray-500' },
    { id: 2, name: 'Best Case', multiplier: 1.3, color: 'bg-green-500' },
    { id: 3, name: 'Worst Case', multiplier: 0.7, color: 'bg-red-500' },
  ]);
  const [scenarioCol, setScenarioCol] = useState('');

  // Forecast
  const [forecastCol, setForecastCol] = useState('');
  const [forecastPeriods, setForecastPeriods] = useState(6);
  const [forecastGrowth, setForecastGrowth] = useState(5);

  // Integrations
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [setupIntegration, setSetupIntegration] = useState(null);
  const [setupValues, setSetupValues] = useState({});
  const [setupError, setSetupError] = useState('');

  useEffect(() => {
    api.get('/spreadsheets').then(r => setSaved(r.data?.data || r.data || [])).catch(() => []);
  }, []);

  // Load spreadsheet from dashboard navigation
  useEffect(() => {
    const incoming = location.state?.loadSpreadsheet;
    if (incoming) {
      setData(incoming.data);
      setColumns(incoming.columns);
      setFileName(incoming.name);
      setVariables([]);
      setSheetNames([]);
      setWorkbook(null);
      setPage(0);
      setSearch('');
      setColumnFilters({});
      setSortCol(null);
      setHiddenCols(new Set());
      setComments({});
      setFormatRules([]);
      // Calculate stats for the loaded data
      const numCols = incoming.columns.filter(col => { const vals = incoming.data.map(r => r[col]).filter(v => v != null && v !== ''); return vals.length > 0 && vals.every(v => !isNaN(Number(v))); });
      setAutoCalcs(numCols.map(col => {
        const vals = incoming.data.map(r => Number(r[col]) || 0);
        const sum = vals.reduce((a, b) => a + b, 0);
        const sorted = [...vals].sort((a, b) => a - b);
        const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
        return { column: col, sum: Math.round(sum * 100) / 100, avg: Math.round(sum / vals.length * 100) / 100, min: Math.min(...vals), max: Math.max(...vals), count: vals.length, median: Math.round(median * 100) / 100 };
      }));
      // Clear the state so it doesn't reload on re-render
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const calcStats = (d, cols) => {
    const numCols = cols.filter(col => { const vals = d.map(r => r[col]).filter(v => v != null && v !== ''); return vals.length > 0 && vals.every(v => !isNaN(Number(v))); });
    setAutoCalcs(numCols.map(col => {
      const vals = d.map(r => Number(r[col]) || 0);
      const sum = vals.reduce((a, b) => a + b, 0);
      const sorted = [...vals].sort((a, b) => a - b);
      const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
      return { column: col, sum: round2(sum), avg: round2(sum / vals.length), min: Math.min(...vals), max: Math.max(...vals), count: vals.length, median: round2(median) };
    }));
  };

  const loadData = (d, cols, name) => {
    setData(d); setColumns(cols); setFileName(name);
    setPage(0); setSearch(''); setColumnFilters({}); setSortCol(null); setHiddenCols(new Set());
    setComments({}); setFormatRules([]);
    calcStats(d, cols);
  };

  const processSheet = (wb, sheetName) => {
    const jsonData = wb.sheets[sheetName];
    const cols = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
    setActiveSheet(sheetName);
    loadData(jsonData, cols, fileName);
  };

  const handleFile = (f) => {
    setFileName(f.name); setVariables([]);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const wb = await readSpreadsheet(e.target.result, f.name);
        setWorkbook(wb); setSheetNames(wb.sheetNames);
        const jsonData = wb.sheets[wb.sheetNames[0]];
        const cols = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        setActiveSheet(wb.sheetNames[0]);
        loadData(jsonData, cols, f.name);
      } catch { /* Best-effort prototype UI action. */ }
    };
    reader.readAsArrayBuffer(f);
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); };

  const loadTemplate = (t) => {
    loadData(t.data, t.columns, t.name);
    setVariables([]); setSheetNames([]); setWorkbook(null);
  };

  const loadSaved = (item) => {
    loadData(item.data || [], item.columns || [], item.name);
    setVariables(item.variables || []); setSheetNames([]); setWorkbook(null); setShowSaved(false);
  };

  const addVariable = () => setVariables([...variables, { name: '', formula: '', value: '' }]);
  const updateVar = (i, field, val) => { const v = [...variables]; v[i] = { ...v[i], [field]: val }; setVariables(v); };
  const removeVar = (i) => setVariables(variables.filter((_, idx) => idx !== i));

  const runFormulas = () => {
    const ctx = {};
    variables.forEach(v => { if (v.value !== '' && v.value !== undefined) ctx[v.name] = typeof v.value === 'string' && isNaN(Number(v.value)) ? v.value : (Number(v.value) || 0); });
    setVariables(variables.map(v => {
      if (!v.formula) return v;
      const result = evalFormula(v.formula, data, columns, ctx);
      if (result !== null) { ctx[v.name] = result; return { ...v, value: result }; }
      return v;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/spreadsheets/upload', { name: fileName || 'Untitled', data, columns, variables, fileName, fileSize: 0, template: 'custom' });
      const r = await api.get('/spreadsheets'); setSaved(r.data?.data || r.data || []);
    } catch { /* Best-effort prototype UI action. */ } setSaving(false);
  };

  const handleExport = async () => {
    if (!data.length) return;
    const sheets = [{ name: 'Data', rows: data }];
    if (variables.length) sheets.push({ name: 'Variables', rows: variables.map(v => ({ Name: v.name, Formula: v.formula, Value: v.value })) });
    await downloadSpreadsheet(sheets, `${fileName || 'export'}.xlsx`);
  };

  const handlePrintReport = () => {
    const printWin = window.open('', '_blank');
    const statsHtml = autoCalcs.map(c => `<div style="border:1px solid #e5e7eb;padding:12px;border-radius:8px"><div style="font-size:10px;color:#7c3aed;font-weight:700;text-transform:uppercase">${c.column}</div><div style="font-size:20px;font-weight:700">${c.sum.toLocaleString()}</div><div style="font-size:11px;color:#666">avg ${c.avg.toLocaleString()} · med ${c.median.toLocaleString()}</div></div>`).join('');
    const tableHtml = `<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr>${columns.map(c => `<th style="border:1px solid #e5e7eb;padding:6px 8px;background:#f9fafb;text-align:left;font-size:10px;text-transform:uppercase">${c}</th>`).join('')}</tr></thead><tbody>${data.slice(0, 100).map(row => `<tr>${columns.map(c => `<td style="border:1px solid #e5e7eb;padding:4px 8px">${row[c] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    printWin.document.write(`<html><head><title>${fileName} — Report</title><style>body{font-family:system-ui;padding:40px;color:#1a1a2e}h1{font-size:24px;margin-bottom:4px}p{color:#666;margin-bottom:20px}.stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-bottom:24px}</style></head><body><h1>${fileName}</h1><p>Generated ${new Date().toLocaleDateString()} · ${data.length} rows · ${columns.length} columns</p><div class="stats">${statsHtml}</div>${tableHtml}</body></html>`);
    printWin.document.close();
    setTimeout(() => printWin.print(), 500);
  };

  const deleteSaved = async (id, e) => { e.stopPropagation(); try { await api.delete(`/spreadsheets/${id}`); setSaved(saved.filter(s => s.id !== id)); } catch { /* Best-effort prototype UI action. */ } };

  const clearAll = () => { setFileName(''); setData([]); setColumns([]); setVariables([]); setAutoCalcs([]); setSheetNames([]); setWorkbook(null); setSearch(''); setColumnFilters({}); setSortCol(null); setHiddenCols(new Set()); setPage(0); setComments({}); setFormatRules([]); };

  const toggleSort = (col) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } setPage(0); };
  const toggleHideCol = (col) => { const next = new Set(hiddenCols); next.has(col) ? next.delete(col) : next.add(col); setHiddenCols(next); };
  const visibleColumns = columns.filter(c => !hiddenCols.has(c));

  const filteredData = useMemo(() => {
    let result = data;
    if (search) { const q = search.toLowerCase(); result = result.filter(row => columns.some(c => String(row[c] ?? '').toLowerCase().includes(q))); }
    for (const [col, val] of Object.entries(columnFilters)) { if (val) { const q = val.toLowerCase(); result = result.filter(row => String(row[col] ?? '').toLowerCase().includes(q)); } }
    if (sortCol) {
      result = [...result].sort((a, b) => {
        const va = a[sortCol], vb = b[sortCol]; const na = Number(va), nb = Number(vb);
        if (!isNaN(na) && !isNaN(nb)) return sortDir === 'asc' ? na - nb : nb - na;
        return sortDir === 'asc' ? String(va ?? '').localeCompare(String(vb ?? '')) : String(vb ?? '').localeCompare(String(va ?? ''));
      });
    }
    return result;
  }, [data, columns, search, columnFilters, sortCol, sortDir]);

  const pagedData = filteredData.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const activeFilterCount = Object.values(columnFilters).filter(Boolean).length;
  const hasData = data.length > 0;
  const numericCols = useMemo(() => columns.filter(c => detectColumnType(data, c) === 'number'), [columns, data]);

  // Cell edit
  const startEdit = (rowIdx, col) => { setEditingCell({ rowIdx, col }); setEditValue(String(data[rowIdx]?.[col] ?? '')); };
  const saveEdit = () => { if (!editingCell) return; const nd = [...data]; nd[editingCell.rowIdx] = { ...nd[editingCell.rowIdx], [editingCell.col]: isNaN(Number(editValue)) ? editValue : Number(editValue) }; setData(nd); calcStats(nd, columns); setEditingCell(null); };

  // Add comment
  const addComment = (rowIdx, col) => {
    if (!commentInput.trim()) return;
    const key = `${rowIdx}-${col}`;
    setComments({ ...comments, [key]: [...(comments[key] || []), { text: commentInput, time: new Date().toLocaleString() }] });
    setCommentInput(''); setActiveComment(null);
  };

  // Add formatting rule
  const addFormatRule = () => { setFormatRules([...formatRules, { ...newRule }]); setNewRule({ column: '__all__', type: 'negative', value: '' }); };

  // Chart data
  const chartData = useMemo(() => {
    if (!chartGroupCol || !chartCol) return [];
    const grouped = {};
    data.forEach(r => { const key = String(r[chartGroupCol] ?? 'Other'); if (!grouped[key]) grouped[key] = []; grouped[key].push(Number(r[chartCol]) || 0); });
    const entries = Object.entries(grouped).map(([label, vals]) => {
      const sum = vals.reduce((a, b) => a + b, 0);
      const sorted = [...vals].sort((a, b) => a - b);
      const median = sorted.length % 2 ? sorted[Math.floor(sorted.length / 2)] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
      const aggVal = chartAgg === 'sum' ? sum
        : chartAgg === 'avg' ? (vals.length ? sum / vals.length : 0)
        : chartAgg === 'count' ? vals.length
        : chartAgg === 'min' ? Math.min(...vals)
        : chartAgg === 'max' ? Math.max(...vals)
        : chartAgg === 'median' ? median : sum;
      return { label, value: round2(aggVal) };
    }).sort((a, b) => b.value - a.value);
    const maxVal = Math.max(...entries.map(e => Math.abs(e.value)), 1);
    return entries.map(e => ({ ...e, pct: Math.round((Math.abs(e.value) / maxVal) * 100) }));
  }, [data, chartCol, chartGroupCol, chartAgg]);

  // Pivot
  const pivotData = useMemo(() => {
    if (!pivotRow || !pivotValue) return [];
    const groups = {};
    data.forEach(r => { const key = String(r[pivotRow] ?? 'Other'); if (!groups[key]) groups[key] = []; groups[key].push(Number(r[pivotValue]) || 0); });
    return Object.entries(groups).map(([label, vals]) => {
      const sum = vals.reduce((a, b) => a + b, 0);
      return { label, count: vals.length, sum: round2(sum), avg: round2(sum / vals.length), min: Math.min(...vals), max: Math.max(...vals) };
    }).sort((a, b) => b.sum - a.sum);
  }, [data, pivotRow, pivotValue]);

  // Scenario data
  const scenarioData = useMemo(() => {
    if (!scenarioCol || !numericCols.includes(scenarioCol)) return [];
    const baseVals = data.map(r => Number(r[scenarioCol]) || 0);
    const baseTotal = baseVals.reduce((a, b) => a + b, 0);
    return scenarios.map(s => ({ ...s, total: round2(baseTotal * s.multiplier), values: baseVals.map(v => round2(v * s.multiplier)) }));
  }, [data, numericCols, scenarioCol, scenarios]);

  // Forecast data
  const forecastData = useMemo(() => {
    if (!forecastCol) return [];
    const vals = data.map(r => Number(r[forecastCol]) || 0).filter(v => v !== 0);
    if (vals.length < 2) return [];
    const last = vals[vals.length - 1];
    const growth = forecastGrowth / 100;
    const periods = [];
    for (let i = 1; i <= forecastPeriods; i++) {
      periods.push({ period: `Period +${i}`, value: round2(last * Math.pow(1 + growth, i)), low: round2(last * Math.pow(1 + growth * 0.5, i)), high: round2(last * Math.pow(1 + growth * 1.5, i)) });
    }
    return periods;
  }, [data, forecastCol, forecastPeriods, forecastGrowth]);

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back to Dashboard */}
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
      </button>

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500/20 to-purple-600/10 rounded-xl"><Table className="w-6 h-6 text-accent-light" /></div>
            Spreadsheets
          </h1>
          <p className="text-text-muted mt-1 text-sm">Financial planning & analysis — drop files, use templates, build models</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowIntegrations(!showIntegrations)} className="bg-white hover:bg-gray-50 border border-gray-200 text-text-secondary px-3 py-2 rounded-xl flex items-center gap-2 text-sm shadow-sm"><Zap className="w-4 h-4" /> Integrations</button>
          <button onClick={() => setShowSaved(!showSaved)} className="bg-white hover:bg-gray-50 border border-gray-200 text-text-secondary px-3 py-2 rounded-xl flex items-center gap-2 text-sm shadow-sm"><FileSpreadsheet className="w-4 h-4" /> Saved ({saved.length})</button>
          {hasData && (
            <>
              <button onClick={handlePrintReport} className="bg-white hover:bg-gray-50 border border-gray-200 text-text-secondary px-3 py-2 rounded-xl flex items-center gap-2 text-sm shadow-sm"><Printer className="w-4 h-4" /> Report</button>
              <button onClick={handleExport} className="bg-white hover:bg-gray-50 border border-gray-200 text-text-secondary px-3 py-2 rounded-xl flex items-center gap-2 text-sm shadow-sm"><Download className="w-4 h-4" /> Export</button>
              <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg shadow-violet-500/20 disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</button>
            </>
          )}
        </div>
      </div>

      {/* Integrations panel */}
      {showIntegrations && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-primary flex items-center gap-2"><Zap className="w-4 h-4 text-violet-500" /> Integrations</span>
            <button onClick={() => setShowIntegrations(false)}><X className="w-4 h-4 text-text-muted" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {integrations.map(ig => (
              <div key={ig.id} className="p-3 rounded-xl border border-gray-100 hover:border-violet-200 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 ${ig.color} rounded-md`} />
                  <span className="text-xs font-semibold text-text-primary">{ig.name}</span>
                </div>
                <p className="text-[10px] text-text-muted mb-2">{ig.desc}</p>
                {ig.connected ? (
                  <div className="flex gap-1">
                    <span className="text-[10px] font-medium px-2 py-1 rounded-md flex-1 text-center bg-green-50 text-green-700">Connected</span>
                    <button
                      onClick={() => setIntegrations(integrations.map(i => i.id === ig.id ? { ...i, connected: false } : i))}
                      className="text-[10px] font-medium px-1.5 py-1 rounded-md bg-red-50 text-red-500 hover:bg-red-100"
                    >Disconnect</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setSetupIntegration(ig); setSetupValues({}); setSetupError(''); }}
                    className="text-[10px] font-medium px-2 py-1 rounded-md w-full bg-gray-50 text-gray-500 hover:bg-violet-50 hover:text-violet-600"
                  >Connect</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration setup modal */}
      {setupIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setSetupIntegration(null)} />
          <div className="relative bg-white rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-gray-100 w-full max-w-lg animate-fade-in overflow-hidden">
            {/* Header with gradient accent */}
            <div className={`bg-gradient-to-r ${setupIntegration.color.replace('bg-', 'from-')} to-transparent h-1`} />
            <div className="px-8 pt-6 pb-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${setupIntegration.color} rounded-2xl flex items-center justify-center shadow-lg shrink-0`}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-text-primary">Connect {setupIntegration.name}</h3>
                  <p className="text-sm text-text-muted mt-0.5">{setupIntegration.desc}</p>
                </div>
                <button onClick={() => setSetupIntegration(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors shrink-0 -mt-1 -mr-2">
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>
            </div>

            {/* Steps indicator */}
            <div className="px-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">1</div>
                  <span className="text-xs font-semibold text-text-primary">Enter credentials</span>
                </div>
                <div className="flex-1 h-px bg-gray-200" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-[10px] font-bold flex items-center justify-center">2</div>
                  <span className="text-xs font-medium text-text-muted">Verify & connect</span>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="px-8 pb-2 space-y-4 max-h-[50vh] overflow-y-auto">
              {setupIntegration.fields.map(field => (
                <div key={field.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">{field.label}</label>
                    {!field.label.toLowerCase().includes('optional') && (
                      <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Required</span>
                    )}
                  </div>
                  {field.type === 'select' ? (
                    <select
                      value={setupValues[field.key] || ''}
                      onChange={e => setSetupValues({ ...setupValues, [field.key]: e.target.value })}
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 focus:bg-white transition-all"
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={setupValues[field.key] || ''}
                      onChange={e => setSetupValues({ ...setupValues, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 focus:bg-white transition-all resize-none font-mono text-xs"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={setupValues[field.key] || ''}
                      onChange={e => setSetupValues({ ...setupValues, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className={`w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50/50 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/10 focus:bg-white transition-all ${field.type === 'password' ? 'font-mono tracking-wider' : ''}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Security note */}
            <div className="mx-8 mt-3 mb-4 flex items-start gap-2.5 bg-blue-50/80 border border-blue-100 rounded-xl px-4 py-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">Your credentials are encrypted and stored securely. We never share your data with third parties.</p>
            </div>

            {/* Error */}
            {setupError && (
              <div className="mx-8 mb-4 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {setupError}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50/30">
              <button onClick={() => setSetupIntegration(null)} className="px-5 py-2.5 text-sm font-medium text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-xl transition-all">
                Cancel
              </button>
              <button
                onClick={() => {
                  const required = setupIntegration.fields.filter(f => !f.label.toLowerCase().includes('optional'));
                  const missing = required.filter(f => !setupValues[f.key]?.trim());
                  if (missing.length) {
                    setSetupError(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
                    return;
                  }
                  setIntegrations(integrations.map(i => i.id === setupIntegration.id ? { ...i, connected: true } : i));
                  setSetupIntegration(null);
                }}
                className={`${setupIntegration.color} hover:opacity-90 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all flex items-center gap-2`}
              >
                <Zap className="w-4 h-4" />
                Connect {setupIntegration.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved panel */}
      {showSaved && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-primary">Saved Spreadsheets</span>
            <button onClick={() => setShowSaved(false)}><X className="w-4 h-4 text-text-muted" /></button>
          </div>
          {saved.length === 0 ? <p className="text-sm text-text-muted py-4 text-center">No saved spreadsheets yet</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {saved.map(s => (
                <button key={s.id} onClick={() => loadSaved(s)} className="text-left p-3 rounded-xl border border-gray-100 hover:border-violet-300 hover:shadow-md transition-all bg-gray-50/50 group relative">
                  <div className="text-sm font-medium text-text-primary truncate">{s.name}</div>
                  <div className="text-xs text-text-muted mt-0.5">{s.data?.length || 0} rows · {s.columns?.length || 0} cols</div>
                  <button onClick={(e) => deleteSaved(s.id, e)} className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400" /></button>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drop zone + Templates */}
      {!hasData && (
        <>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${dragOver ? 'border-violet-400 bg-violet-50' : 'border-gray-300 hover:border-violet-300 bg-white/50'}`}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.csv" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} className="hidden" />
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-200/50">
              <Upload className="w-10 h-10 text-violet-500" />
            </div>
            <p className="text-xl font-bold text-text-primary">Drop your Excel or CSV file here</p>
            <p className="text-sm text-text-muted mt-2">or click to browse · .xlsx .csv</p>
          </div>

          {/* Templates */}
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-violet-500" /> Start from a Template</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => loadTemplate(t)} className="text-left p-4 rounded-xl border border-gray-200 hover:border-violet-300 hover:shadow-lg transition-all bg-white group">
                  <div className={`w-10 h-10 bg-gradient-to-br ${t.color} rounded-xl flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                    <t.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-text-primary">{t.name}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">{t.data.length} rows · {t.columns.length} cols</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ═══ Active Workbook ═══ */}
      {hasData && (
        <>
          {/* File bar */}
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
            <FileSpreadsheet className="w-5 h-5 text-violet-500 shrink-0" />
            <span className="text-sm font-semibold text-text-primary truncate">{fileName}</span>
            <span className="text-xs text-text-muted bg-gray-100 px-2 py-0.5 rounded-md">{data.length} rows · {columns.length} cols</span>
            {sheetNames.length > 1 && sheetNames.map(s => (
              <button key={s} onClick={() => processSheet(workbook, s)} className={`text-[11px] px-2.5 py-1 rounded-lg font-medium ${activeSheet === s ? 'bg-violet-100 text-violet-700' : 'text-text-muted hover:bg-gray-100'}`}>{s}</button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => fileRef.current?.click()} className="text-xs text-violet-600 hover:underline font-medium">Change</button>
              <input ref={fileRef} type="file" accept=".xlsx,.csv" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} className="hidden" />
              <button onClick={clearAll} className="text-xs text-text-muted hover:text-red-500">Clear</button>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0"><Search className="w-4 h-4 text-white" /></div>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search every column..." className="flex-1 bg-transparent text-sm text-text-primary placeholder-gray-400 focus:outline-none" />
            {(search || activeFilterCount > 0) && <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-violet-100 text-violet-700 tabular-nums shrink-0">{filteredData.length} / {data.length}</span>}
            {search && <button onClick={() => setSearch('')} className="p-1 rounded-lg hover:bg-gray-100 shrink-0"><X className="w-4 h-4 text-gray-400" /></button>}
          </div>

          {/* Stats */}
          {autoCalcs.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {autoCalcs.map(c => (
                <div key={c.column} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                  <div className="text-[10px] font-bold text-violet-600 uppercase tracking-wider truncate">{c.column}</div>
                  <div className="text-xl font-bold text-text-primary tabular-nums mt-1">{c.sum.toLocaleString()}</div>
                  <MiniBar value={c.avg} max={c.max} />
                  <div className="flex justify-between mt-1.5 text-[10px] text-text-muted"><span>avg {c.avg.toLocaleString()}</span><span>med {c.median.toLocaleString()}</span></div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${activeTab === tab ? 'border-violet-500 text-violet-700' : 'border-transparent text-text-muted hover:text-text-primary'}`}>{tab}</button>
            ))}
            <div className="ml-auto flex gap-2 pb-1">
              <button onClick={() => setShowFormatPanel(!showFormatPanel)} className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 ${showFormatPanel ? 'bg-violet-100 text-violet-700' : 'bg-gray-50 text-text-muted hover:bg-gray-100'}`}><Palette className="w-3 h-3" /> Format</button>
              {hiddenCols.size > 0 && <button onClick={() => setHiddenCols(new Set())} className="text-[10px] text-violet-600 hover:underline">Show all cols</button>}
            </div>
          </div>

          {/* Conditional formatting panel */}
          {showFormatPanel && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-primary flex items-center gap-2"><Palette className="w-4 h-4 text-violet-500" /> Conditional Formatting</span>
                <button onClick={() => setShowFormatPanel(false)}><X className="w-4 h-4 text-text-muted" /></button>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Column</label>
                  <select value={newRule.column} onChange={e => setNewRule({ ...newRule, column: e.target.value })} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white min-w-[120px]">
                    <option value="__all__">All columns</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Rule</label>
                  <select value={newRule.type} onChange={e => setNewRule({ ...newRule, type: e.target.value })} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                    <option value="negative">Negative = Red</option>
                    <option value="positive">Positive = Green</option>
                    <option value="zero">Zero = Gray</option>
                    <option value="above">Above value = Green</option>
                    <option value="below">Below value = Red</option>
                    <option value="contains">Contains text = Blue</option>
                  </select>
                </div>
                {['above', 'below', 'contains'].includes(newRule.type) && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Value</label>
                    <input value={newRule.value} onChange={e => setNewRule({ ...newRule, value: e.target.value })} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 w-20" />
                  </div>
                )}
                <button onClick={addFormatRule} className="bg-violet-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-violet-500">Add Rule</button>
              </div>
              {formatRules.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formatRules.map((r, i) => (
                    <span key={i} className="text-[10px] bg-gray-100 text-text-secondary px-2 py-1 rounded-md flex items-center gap-1">
                      {r.column === '__all__' ? 'All' : r.column}: {r.type} {r.value}
                      <button onClick={() => setFormatRules(formatRules.filter((_, j) => j !== i))}><X className="w-2.5 h-2.5 text-gray-400" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── DATA TAB ─── */}
          {activeTab === 'Data' && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {visibleColumns.map(col => (
                  <div key={col} className="relative">
                    <input value={columnFilters[col] || ''} onChange={e => { setColumnFilters({ ...columnFilters, [col]: e.target.value }); setPage(0); }} placeholder={col}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg border w-28 focus:outline-none focus:w-36 transition-all ${columnFilters[col] ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 bg-white text-text-muted placeholder-gray-400'}`} />
                    {columnFilters[col] && <button onClick={() => setColumnFilters({ ...columnFilters, [col]: '' })} className="absolute right-1 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-violet-400" /></button>}
                  </div>
                ))}
                {activeFilterCount > 0 && <button onClick={() => setColumnFilters({})} className="text-[11px] text-violet-600 hover:underline px-2 py-1.5">Clear</button>}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase w-10">#</th>
                        {visibleColumns.map(col => (
                          <th key={col} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap group">
                            <span className="flex items-center gap-1 cursor-pointer select-none" onClick={() => toggleSort(col)}>
                              {detectColumnType(data, col) === 'number' ? <Hash className="w-3 h-3 text-violet-400" /> : <Type className="w-3 h-3 text-gray-400" />}
                              {col}
                              {sortCol === col ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-violet-500" /> : <ChevronDown className="w-3 h-3 text-violet-500" />) : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40" />}
                            </span>
                            <button onClick={() => toggleHideCol(col)} className="ml-1 opacity-0 group-hover:opacity-60 hover:opacity-100"><EyeOff className="w-3 h-3" /></button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pagedData.length === 0 ? (
                        <tr><td colSpan={visibleColumns.length + 1} className="px-4 py-12 text-center"><Search className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-text-muted">No rows match</p></td></tr>
                      ) : pagedData.map((row, i) => {
                        const realIdx = page * pageSize + i;
                        return (
                          <tr key={realIdx} className="hover:bg-violet-50/30 transition-colors">
                            <td className="px-3 py-2 text-xs text-gray-400 tabular-nums">{realIdx + 1}</td>
                            {visibleColumns.map(col => {
                              const val = row[col];
                              const display = typeof val === 'number' ? val.toLocaleString() : (val ?? '—');
                              const str = String(val ?? '');
                              const isMatch = (search && str.toLowerCase().includes(search.toLowerCase())) || (columnFilters[col] && str.toLowerCase().includes(columnFilters[col].toLowerCase()));
                              const isEditing = editingCell?.rowIdx === realIdx && editingCell?.col === col;
                              const commentKey = `${realIdx}-${col}`;
                              const cellComments = comments[commentKey];
                              const fmtClass = getCellStyle(val, col, formatRules);
                              return (
                                <td key={col} className={`px-3 py-2 text-sm whitespace-nowrap relative group/cell ${isMatch ? 'bg-yellow-50' : ''} ${fmtClass}`} onDoubleClick={() => startEdit(realIdx, col)}>
                                  {isEditing ? (
                                    <div className="flex items-center gap-1">
                                      <input value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingCell(null); }} className="w-full bg-white border border-violet-400 rounded px-1.5 py-0.5 text-sm focus:outline-none" autoFocus />
                                      <button onClick={saveEdit}><Check className="w-3.5 h-3.5 text-green-500" /></button>
                                    </div>
                                  ) : (
                                    <>
                                      <span>{isMatch ? highlightMatch(display, search || columnFilters[col]) : display}</span>
                                      {/* Comment indicator */}
                                      {cellComments && <span className="absolute top-0 right-0 w-0 h-0 border-t-[6px] border-t-orange-400 border-l-[6px] border-l-transparent" title={cellComments.map(c => c.text).join('\n')} />}
                                      {/* Comment button */}
                                      <button onClick={(e) => { e.stopPropagation(); setActiveComment(activeComment === commentKey ? null : commentKey); }} className="absolute top-1 right-1 opacity-0 group-hover/cell:opacity-100 p-0.5 rounded hover:bg-gray-100">
                                        <MessageSquare className="w-3 h-3 text-gray-400" />
                                      </button>
                                      {/* Comment popover */}
                                      {activeComment === commentKey && (
                                        <div className="absolute top-full right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-48 mt-1" onClick={e => e.stopPropagation()}>
                                          {cellComments?.map((c, ci) => <div key={ci} className="text-[10px] text-text-secondary mb-1 pb-1 border-b border-gray-100"><span className="text-text-muted">{c.time}:</span> {c.text}</div>)}
                                          <div className="flex gap-1">
                                            <input value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment(realIdx, col)} placeholder="Add note..." className="flex-1 text-[10px] border border-gray-200 rounded px-1.5 py-1 focus:outline-none" />
                                            <button onClick={() => addComment(realIdx, col)} className="text-[10px] bg-violet-600 text-white px-2 py-1 rounded font-medium">Add</button>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                    <span className="text-xs text-text-muted">Page {page + 1} of {totalPages}</span>
                    <div className="flex gap-1">
                      {['First', 'Prev', 'Next', 'Last'].map(btn => (
                        <button key={btn} onClick={() => setPage(btn === 'First' ? 0 : btn === 'Prev' ? Math.max(0, page - 1) : btn === 'Next' ? Math.min(totalPages - 1, page + 1) : totalPages - 1)}
                          disabled={(btn === 'First' || btn === 'Prev') ? page === 0 : page >= totalPages - 1}
                          className="px-2 py-1 text-xs rounded-md bg-white border border-gray-200 disabled:opacity-30 hover:bg-gray-50">{btn}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─── CHARTS TAB ─── */}
          {activeTab === 'Charts' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Chart Type</label>
                  <select value={chartType} onChange={e => setChartType(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-violet-400">
                    <option value="bar">Horizontal Bar</option>
                    <option value="column">Vertical Column</option>
                    <option value="pie">Pie Chart</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Group By</label>
                  <select value={chartGroupCol} onChange={e => setChartGroupCol(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-violet-400 min-w-[140px]">
                    <option value="">Select...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Aggregation</label>
                  <select value={chartAgg} onChange={e => setChartAgg(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-violet-400">
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="count">Count</option>
                    <option value="min">Min</option>
                    <option value="max">Max</option>
                    <option value="median">Median</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Column</label>
                  <select value={chartCol} onChange={e => setChartCol(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-violet-400 min-w-[140px]">
                    <option value="">Select...</option>
                    {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {chartData.length > 0 ? (
                <>
                  {chartType === 'bar' && (
                    <div className="space-y-2">{chartData.map((d, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-text-secondary w-32 truncate text-right font-medium">{d.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                          <div className={`h-7 rounded-full flex items-center px-3 transition-all duration-500 ${d.value >= 0 ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`} style={{ width: `${Math.max(d.pct, 8)}%` }}>
                            <span className="text-[11px] font-bold text-white whitespace-nowrap">{d.value.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}</div>
                  )}
                  {chartType === 'column' && (
                    <div className="flex items-end gap-2 h-64 px-4 pt-4">
                      {chartData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                          <span className="text-[10px] font-bold text-text-primary mb-1 tabular-nums">{d.value >= 1000 ? `${(d.value / 1000).toFixed(0)}k` : d.value}</span>
                          <div className={`w-full rounded-t-lg transition-all duration-500 ${d.value >= 0 ? 'bg-gradient-to-t from-violet-600 to-violet-400' : 'bg-gradient-to-t from-red-500 to-red-300'}`} style={{ height: `${Math.max(d.pct, 3)}%` }} />
                          <span className="text-[9px] text-text-muted mt-1 truncate w-full text-center">{d.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {chartType === 'pie' && (() => {
                    const total = chartData.reduce((a, d) => a + Math.abs(d.value), 0);
                    let cumPct = 0;
                    const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9', '#5b21b6', '#ddd6fe', '#ede9fe'];
                    return (
                      <div className="flex items-center gap-8">
                        <div className="relative w-48 h-48">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            {chartData.map((d, i) => {
                              const pct = total ? (Math.abs(d.value) / total) * 100 : 0;
                              const offset = cumPct; cumPct += pct;
                              return <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={colors[i % colors.length]} strokeWidth="20" strokeDasharray={`${pct * 2.51327} ${251.327 - pct * 2.51327}`} strokeDashoffset={`${-offset * 2.51327}`} />;
                            })}
                          </svg>
                        </div>
                        <div className="space-y-1.5">
                          {chartData.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i % colors.length] }} />
                              <span className="text-xs text-text-secondary">{d.label}</span>
                              <span className="text-xs font-bold text-text-primary ml-auto tabular-nums">{d.value.toLocaleString()}</span>
                              <span className="text-[10px] text-text-muted">({total ? round2((Math.abs(d.value) / total) * 100) : 0}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              ) : (
                <div className="text-center py-12 text-text-muted"><PieChart className="w-10 h-10 mx-auto mb-2 text-gray-300" /><p className="text-sm">Select columns to generate chart</p></div>
              )}
            </div>
          )}

          {/* ─── PIVOT TAB ─── */}
          {activeTab === 'Pivot' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Row Labels</label><select value={pivotRow} onChange={e => setPivotRow(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[140px]"><option value="">Select...</option>{columns.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Values</label><select value={pivotValue} onChange={e => setPivotValue(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[140px]"><option value="">Select...</option>{numericCols.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              {pivotData.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full">
                    <thead><tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase">{pivotRow}</th>
                      {['Count', 'Sum', 'Avg', 'Min', 'Max'].map(h => <th key={h} className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-500 uppercase">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {pivotData.map((r, i) => (
                        <tr key={i} className="hover:bg-violet-50/30">
                          <td className="px-4 py-2 text-sm font-medium text-text-primary">{r.label}</td>
                          <td className="px-4 py-2 text-sm text-right tabular-nums text-text-muted">{r.count}</td>
                          <td className="px-4 py-2 text-sm text-right tabular-nums font-semibold text-text-primary">{r.sum.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-right tabular-nums text-text-muted">{r.avg.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-right tabular-nums text-text-muted">{r.min.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-right tabular-nums text-text-muted">{r.max.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div className="text-center py-12 text-text-muted"><Table className="w-10 h-10 mx-auto mb-2 text-gray-300" /><p className="text-sm">Select columns to build pivot table</p></div>}
            </div>
          )}

          {/* ─── SCENARIOS TAB ─── */}
          {activeTab === 'Scenarios' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary flex items-center gap-2"><GitBranch className="w-4 h-4 text-violet-500" /> What-If Scenario Analysis</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Analyze Column</label>
                  <select value={scenarioCol} onChange={e => setScenarioCol(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[160px]">
                    <option value="">Select numeric column...</option>
                    {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={() => setScenarios([...scenarios, { id: Date.now(), name: `Scenario ${scenarios.length + 1}`, multiplier: 1.0, color: 'bg-violet-500' }])} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-text-secondary px-2.5 py-2 rounded-lg text-xs flex items-center gap-1 mt-4"><Plus className="w-3 h-3" /> Add Scenario</button>
              </div>

              {/* Scenario editors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {scenarios.map((s, i) => (
                  <div key={s.id} className="border border-gray-200 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 ${s.color} rounded-full`} />
                      <input value={s.name} onChange={e => { const ns = [...scenarios]; ns[i] = { ...ns[i], name: e.target.value }; setScenarios(ns); }} className="text-sm font-semibold text-text-primary bg-transparent focus:outline-none flex-1" />
                      {scenarios.length > 1 && <button onClick={() => setScenarios(scenarios.filter(sc => sc.id !== s.id))}><X className="w-3 h-3 text-gray-400" /></button>}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-text-muted">Multiplier:</label>
                      <input type="number" step="0.1" value={s.multiplier} onChange={e => { const ns = [...scenarios]; ns[i] = { ...ns[i], multiplier: Number(e.target.value) || 1 }; setScenarios(ns); }} className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1 text-center tabular-nums" />
                      <span className="text-[10px] text-text-muted">=  {round2(s.multiplier * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison */}
              {scenarioData.length > 0 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {scenarioData.map(s => (
                      <div key={s.id} className="border border-gray-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1"><div className={`w-2.5 h-2.5 ${s.color} rounded-full`} /><span className="text-xs font-semibold text-text-primary">{s.name}</span></div>
                        <div className="text-2xl font-bold text-text-primary tabular-nums">{s.total.toLocaleString()}</div>
                        <div className="text-xs text-text-muted mt-1">{round2(s.multiplier * 100)}% of base</div>
                      </div>
                    ))}
                  </div>
                  {/* Visual comparison bars */}
                  <div className="space-y-1.5">
                    {scenarioData.map(s => {
                      const maxTotal = Math.max(...scenarioData.map(sd => sd.total));
                      return (
                        <div key={s.id} className="flex items-center gap-3">
                          <span className="text-xs text-text-secondary w-24 truncate text-right">{s.name}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                            <div className={`${s.color} h-5 rounded-full flex items-center px-2`} style={{ width: `${maxTotal ? round2((s.total / maxTotal) * 100) : 0}%` }}>
                              <span className="text-[10px] font-bold text-white">{s.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {!scenarioCol && <div className="text-center py-8 text-text-muted"><GitBranch className="w-10 h-10 mx-auto mb-2 text-gray-300" /><p className="text-sm">Select a numeric column to compare scenarios</p></div>}
            </div>
          )}

          {/* ─── FORECAST TAB ─── */}
          {activeTab === 'Forecast' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <span className="text-sm font-semibold text-text-primary flex items-center gap-2"><TrendingUp className="w-4 h-4 text-violet-500" /> Time-Series Forecast</span>
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Column to Forecast</label>
                  <select value={forecastCol} onChange={e => setForecastCol(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[160px]">
                    <option value="">Select...</option>
                    {numericCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Periods</label>
                  <input type="number" min={1} max={24} value={forecastPeriods} onChange={e => setForecastPeriods(Number(e.target.value) || 6)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-20 text-center" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Growth Rate %</label>
                  <input type="number" step="0.5" value={forecastGrowth} onChange={e => setForecastGrowth(Number(e.target.value) || 0)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-20 text-center" />
                </div>
              </div>

              {forecastData.length > 0 ? (
                <>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full">
                      <thead><tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase">Period</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-500 uppercase">Low ({round2(forecastGrowth * 0.5)}%)</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold text-violet-600 uppercase">Forecast ({forecastGrowth}%)</th>
                        <th className="px-4 py-2.5 text-right text-[10px] font-bold text-gray-500 uppercase">High ({round2(forecastGrowth * 1.5)}%)</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-100">
                        {forecastData.map((f, i) => (
                          <tr key={i} className="hover:bg-violet-50/30">
                            <td className="px-4 py-2 text-sm font-medium text-text-primary">{f.period}</td>
                            <td className="px-4 py-2 text-sm text-right tabular-nums text-red-600">{f.low.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm text-right tabular-nums font-bold text-violet-700">{f.value.toLocaleString()}</td>
                            <td className="px-4 py-2 text-sm text-right tabular-nums text-green-600">{f.high.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Visual forecast */}
                  <div className="flex items-end gap-1 h-40 px-4">
                    {forecastData.map((f, i) => {
                      const maxV = Math.max(...forecastData.map(d => d.high));
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5">
                          <div className="w-full bg-green-100 rounded-t" style={{ height: `${(f.high / maxV) * 100}%` }}>
                            <div className="w-full bg-violet-200 rounded-t" style={{ height: `${(f.value / f.high) * 100}%` }}>
                              <div className="w-full bg-red-200 rounded-t" style={{ height: `${(f.low / f.value) * 100}%` }} />
                            </div>
                          </div>
                          <span className="text-[8px] text-text-muted">+{i + 1}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 justify-center text-[10px] text-text-muted">
                    <span className="flex items-center gap-1"><div className="w-3 h-2 bg-red-200 rounded" /> Low</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-2 bg-violet-200 rounded" /> Forecast</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-2 bg-green-100 rounded" /> High</span>
                  </div>
                </>
              ) : <div className="text-center py-12 text-text-muted"><TrendingUp className="w-10 h-10 mx-auto mb-2 text-gray-300" /><p className="text-sm">Select a column to generate forecast</p></div>}
            </div>
          )}

          {/* Formula builder */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-text-primary flex items-center gap-2"><BarChart3 className="w-4 h-4 text-violet-500" /> Variables & Formulas</span>
              <div className="flex gap-2">
                <button onClick={addVariable} className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-text-secondary px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs"><Plus className="w-3 h-3" /> Add</button>
                {variables.length > 0 && <button onClick={runFormulas} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium hover:from-violet-500 hover:to-purple-500"><Play className="w-3 h-3" /> Run All</button>}
              </div>
            </div>
            <div className="grid grid-cols-[1fr_1fr_120px_32px] gap-0 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
              <span className="text-[10px] font-bold text-gray-500 uppercase">Name</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase">Formula</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase text-right">Result</span><span />
            </div>
            <div className="divide-y divide-gray-50">
              {variables.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_120px_32px] gap-0 px-4 items-center group hover:bg-violet-50/20">
                  <input value={v.name} onChange={e => updateVar(i, 'name', e.target.value)} placeholder="my_var" className="bg-transparent text-sm text-text-primary py-2.5 focus:outline-none placeholder-gray-300 font-mono" />
                  <input value={v.formula || ''} onChange={e => updateVar(i, 'formula', e.target.value)} placeholder="SUM(Revenue)" className="bg-transparent text-sm text-gray-500 py-2.5 focus:outline-none placeholder-gray-300 font-mono" />
                  <div className="text-sm text-right font-bold tabular-nums text-violet-700">{v.value !== '' && v.value !== undefined ? (typeof v.value === 'string' && isNaN(Number(v.value)) ? v.value : Number(v.value).toLocaleString()) : '—'}</div>
                  <button onClick={() => removeVar(i)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50"><X className="w-3 h-3 text-red-400" /></button>
                </div>
              ))}
              {variables.length === 0 && <div className="px-4 py-5 text-center text-sm text-text-muted">Click <span className="font-semibold">+ Add</span> to create formulas like <code className="bg-gray-100 px-1.5 py-0.5 rounded text-violet-600 text-xs">SUM(Revenue)</code></div>}
            </div>
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-400">
                {['SUM(col)', 'AVG(col)', 'COUNT(col)', 'MIN/MAX(col)', 'MEDIAN(col)', 'COUNTIF(col,val)', 'SUMIF(col,condCol,val)', 'IF(a>b,x,y)', 'var1+var2'].map(f => <span key={f}><code className="text-violet-500 font-mono">{f}</code></span>)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
