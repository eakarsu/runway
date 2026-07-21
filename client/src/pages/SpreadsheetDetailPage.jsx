import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Save, X, Table, Download, FileSpreadsheet, Plus, Play, MoreHorizontal, ChevronDown } from 'lucide-react';
import { downloadSpreadsheet } from '../services/spreadsheetFile';
import Modal from '../components/ui/Modal';
import api from '../services/api';

const formulaReference = [
  // Aggregation
  { syntax: 'SUM(column)', desc: 'sum all values' },
  { syntax: 'AVG(column)', desc: 'average of values' },
  { syntax: 'COUNT(column)', desc: 'count non-empty' },
  { syntax: 'MIN(column) / MAX(column)', desc: 'min or max value' },
  { syntax: 'MEDIAN(column)', desc: 'median value' },
  { syntax: 'STDEV(column)', desc: 'standard deviation' },
  { syntax: 'PERCENTILE(column, 0.9)', desc: 'nth percentile' },
  // Conditional
  { syntax: 'SUMIF(col, condCol, val)', desc: 'sum where condition' },
  { syntax: 'COUNTIF(column, value)', desc: 'count matching' },
  { syntax: 'AVERAGEIF(col, condCol, val)', desc: 'avg where condition' },
  // Financial
  { syntax: 'PMT(rate, nper, pv)', desc: 'loan payment' },
  { syntax: 'FV(rate, nper, pmt)', desc: 'future value' },
  { syntax: 'PV(rate, nper, pmt)', desc: 'present value' },
  { syntax: 'NPV(rate, cf1, cf2, ...)', desc: 'net present value' },
  { syntax: 'IRR(cf0, cf1, cf2, ...)', desc: 'internal rate of return' },
  { syntax: 'SLN(cost, salvage, life)', desc: 'straight-line depreciation' },
  // Math
  { syntax: 'ABS(x) / ROUND(x, 2)', desc: 'absolute / round' },
  { syntax: 'POWER(x, n) / SQRT(x)', desc: 'power / square root' },
  { syntax: 'CEILING(x, 1000)', desc: 'round up to multiple' },
  { syntax: 'MOD(x, y)', desc: 'remainder' },
  // Logic
  { syntax: 'IF(cond, true, false)', desc: 'conditional' },
  { syntax: 'AND(a, b) / OR(a, b)', desc: 'logical operators' },
  { syntax: 'IFERROR(expr, fallback)', desc: 'catch errors' },
  // Text
  { syntax: 'CONCAT(a, b)', desc: 'join text' },
  { syntax: 'LEFT(text, n) / RIGHT(text, n)', desc: 'extract chars' },
  { syntax: 'UPPER(text) / LOWER(text)', desc: 'change case' },
  { syntax: 'LEN(text)', desc: 'text length' },
  // Date
  { syntax: 'TODAY() / NOW()', desc: 'current date/time' },
  { syntax: 'YEAR(d) / MONTH(d) / DAY(d)', desc: 'extract date parts' },
  { syntax: 'DAYS(end, start)', desc: 'days between dates' },
  { syntax: 'DATEDIF(start, end, "M")', desc: 'date difference (D/M/Y)' },
  // Column Text
  { syntax: 'UNIQUE_COUNT(column)', desc: 'count distinct values' },
  { syntax: 'UNIQUE_VALUES(column)', desc: 'list distinct values' },
  { syntax: 'FIRST(column) / LAST(column)', desc: 'first or last row value' },
  { syntax: 'NTH(column, 5)', desc: 'value from row N' },
  { syntax: 'CONCAT_ALL(column, ;)', desc: 'join all values' },
  { syntax: 'AVG_LEN(column)', desc: 'average text length' },
  // Contains-based
  { syntax: 'COUNTIF_CONTAINS(col, text)', desc: 'rows containing text' },
  { syntax: 'COUNTIF_STARTS(col, text)', desc: 'rows starting with text' },
  { syntax: 'COUNTIF_GT(col, 1000)', desc: 'rows greater than value' },
  { syntax: 'COUNTIF_BETWEEN(col, 100, 500)', desc: 'rows in range' },
  { syntax: 'SUMIF_CONTAINS(col, condCol, text)', desc: 'sum where contains' },
  { syntax: 'SUMIF_GT(col, condCol, 1000)', desc: 'sum where greater than' },
  { syntax: 'SUMIF_BETWEEN(col, condCol, 100:500)', desc: 'sum where in range' },
  { syntax: 'AVERAGEIF_CONTAINS(col, condCol, text)', desc: 'avg where contains' },
  // Variables
  { syntax: 'varA * varB + 100', desc: 'math on variables' },
];

export default function SpreadsheetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [variables, setVariables] = useState([]);
  const [tabs, setTabs] = useState(['Variables']);
  const [activeTab, setActiveTab] = useState('Variables');
  const [newTabName, setNewTabName] = useState('');
  const [showNewTab, setShowNewTab] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [showData, setShowData] = useState(false);
  const [showRef, setShowRef] = useState(true);

  useEffect(() => {
    api.get(`/spreadsheets/${id}`).then(r => {
      const d = r.data?.data || r.data;
      setItem(d);
      setNameVal(d.name || '');
      setVariables(d.variables || []);
      setTabs(d.tabs?.length ? d.tabs : ['Variables']);
    }).catch(() => { /* Best-effort prototype UI request. */ }).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try { await api.delete(`/spreadsheets/${id}`); navigate('/spreadsheets'); } catch { /* Best-effort prototype UI action. */ }
  };

  const handleSaveName = async () => {
    try { await api.put(`/spreadsheets/${id}`, { name: nameVal }); setItem({ ...item, name: nameVal }); setEditingName(false); } catch { /* Best-effort prototype UI action. */ }
  };

  const addVariable = () => {
    setVariables([...variables, { name: '', formula: '', value: '', tab: activeTab }]);
  };

  const updateVariable = (index, field, val) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: val };
    setVariables(updated);
  };

  const removeVariable = (index) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const addTab = () => {
    if (!newTabName.trim()) return;
    setTabs([...tabs, newTabName.trim()]);
    setActiveTab(newTabName.trim());
    setNewTabName('');
    setShowNewTab(false);
  };

  const saveVariables = async () => {
    try {
      await api.put(`/spreadsheets/${id}`, { variables, tabs });
      setItem({ ...item, variables, tabs });
    } catch { /* Best-effort prototype UI action. */ }
  };

  const evaluateAll = async () => {
    setEvaluating(true);
    try {
      const res = await api.post(`/spreadsheets/${id}/evaluate`, { variables });
      const d = res.data?.data || res.data;
      setVariables(d.variables || []);
      setItem(d);
    } catch { /* Best-effort prototype UI action. */ }
    setEvaluating(false);
  };

  const handleExport = async () => {
    if (!item?.data?.length) return;
    const sheets = [{ name: 'Data', rows: item.data }];
    if (variables.length) {
      const varData = variables.map(v => ({ Variable: v.name, Formula: v.formula || '', Value: v.value }));
      sheets.push({ name: 'Variables', rows: varData });
    }
    await downloadSpreadsheet(sheets, `${item.name || 'spreadsheet'}.xlsx`);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" /></div>;
  if (!item) return <div className="text-center py-12 text-text-muted">Spreadsheet not found</div>;

  const data = item.data || [];
  const columns = item.columns || [];
  const tabVariables = variables.filter(v => (v.tab || 'Variables') === activeTab);

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl">
      <button onClick={() => navigate('/spreadsheets')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Spreadsheets
      </button>

      {/* Header — like screenshot: title centered, ... menu */}
      <div className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl backdrop-blur-sm overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border/40">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input value={nameVal} onChange={e => setNameVal(e.target.value)} autoFocus className="text-lg font-bold bg-dark-bg/60 border border-dark-border/60 rounded-lg px-3 py-1 text-text-primary focus:outline-none focus:border-accent/50" onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
                <button onClick={handleSaveName} className="text-accent-light hover:text-white"><Save className="w-4 h-4" /></button>
                <button onClick={() => setEditingName(false)} className="text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div>
                <h1 className="text-lg font-bold text-text-primary cursor-pointer hover:text-accent-light transition-colors" onClick={() => setEditingName(true)}>{item.name}</h1>
                {item.description && <p className="text-xs text-text-muted">{item.description}</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
            <div className="flex gap-1.5">
              <button onClick={handleExport} className="p-2 rounded-lg hover:bg-black/[0.05] transition-colors" title="Export"><Download className="w-4 h-4 text-text-muted" /></button>
              <button onClick={() => setEditingName(true)} className="p-2 rounded-lg hover:bg-black/[0.05] transition-colors" title="Edit"><Edit2 className="w-4 h-4 text-text-muted" /></button>
              <button onClick={() => setDeleteModal(true)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-text-muted hover:text-red-400" /></button>
            </div>
          </div>
        </div>

        {/* Tabs row */}
        <div className="flex items-center gap-0 px-5 border-b border-dark-border/40">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab
                  ? 'text-accent-light border-accent'
                  : 'text-text-muted border-transparent hover:text-text-primary'
              }`}
            >
              {tab}
              {tab !== 'Variables' && (
                <span className="ml-1.5 text-[9px] bg-dark-bg/40 px-1.5 py-0.5 rounded">
                  {variables.filter(v => (v.tab || 'Variables') === tab).length}
                </span>
              )}
            </button>
          ))}
          {showNewTab ? (
            <div className="flex items-center gap-1.5 ml-2">
              <input
                value={newTabName}
                onChange={e => setNewTabName(e.target.value)}
                placeholder="Tab name"
                autoFocus
                className="bg-dark-bg/60 border border-dark-border/60 rounded-lg px-2 py-1 text-xs text-text-primary w-24 focus:outline-none focus:border-accent/50"
                onKeyDown={e => e.key === 'Enter' && addTab()}
              />
              <button onClick={addTab} className="text-accent-light text-xs">Add</button>
              <button onClick={() => setShowNewTab(false)} className="text-text-muted text-xs">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowNewTab(true)} className="px-3 py-3 text-xs text-text-muted hover:text-accent-light transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Variables table header */}
        <div className="grid grid-cols-[1fr_1fr_120px_40px] gap-0 px-5 py-2.5 border-b border-dark-border/30 bg-dark-surface/30">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Variable</span>
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Formula</span>
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider text-right">Value</span>
          <span />
        </div>

        {/* Variables list */}
        <div className="divide-y divide-dark-border/20">
          {tabVariables.length === 0 && (
            <div className="px-5 py-8 text-center text-text-muted text-sm">
              No variables yet. Click "+ Add Variable" to get started.
            </div>
          )}
          {tabVariables.map((v) => {
            const realIndex = variables.indexOf(v);
            return (
              <div key={realIndex} className="grid grid-cols-[1fr_1fr_120px_40px] gap-0 px-5 py-0 items-center group hover:bg-white/[0.015] transition-colors">
                <input
                  value={v.name}
                  onChange={e => updateVariable(realIndex, 'name', e.target.value)}
                  placeholder="variable_name"
                  className="bg-transparent text-sm text-text-primary py-3 focus:outline-none placeholder-text-muted/40 font-mono"
                />
                <input
                  value={v.formula || ''}
                  onChange={e => updateVariable(realIndex, 'formula', e.target.value)}
                  placeholder="formula (optional)"
                  className="bg-transparent text-sm text-text-muted py-3 focus:outline-none placeholder-text-muted/30 font-mono"
                />
                <input
                  value={v.value ?? ''}
                  onChange={e => updateVariable(realIndex, 'value', e.target.value)}
                  placeholder="—"
                  className="bg-transparent text-sm text-text-primary py-3 focus:outline-none text-right font-semibold tabular-nums placeholder-text-muted/30"
                />
                <button
                  onClick={() => removeVariable(realIndex)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all ml-auto"
                >
                  <X className="w-3.5 h-3.5 text-text-muted hover:text-red-400" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add Variable button */}
        <div className="px-5 py-3 border-t border-dark-border/30">
          <button onClick={addVariable} className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-accent-light transition-colors uppercase tracking-wider">
            <Plus className="w-3.5 h-3.5" /> Add Variable
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-t border-dark-border/40 bg-dark-surface/20">
          <button
            onClick={evaluateAll}
            disabled={evaluating}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all shadow-lg shadow-purple-900/25 disabled:opacity-50"
          >
            {evaluating ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Evaluate All
          </button>
          <button
            onClick={saveVariables}
            className="bg-dark-surface/60 hover:bg-black/[0.05] border border-dark-border/60 text-text-secondary px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-medium transition-all"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <span className="text-[10px] text-text-muted ml-auto">{variables.length} variables · {tabs.length} tabs</span>
        </div>
      </div>

      {/* Formula Reference */}
      <div className="bg-gradient-to-br from-dark-card/60 to-dark-surface/20 border border-dark-border/40 rounded-2xl overflow-hidden">
        <button onClick={() => setShowRef(!showRef)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-black/[0.03] transition-colors">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Formula Reference</span>
          <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform ${showRef ? '' : '-rotate-90'}`} />
        </button>
        {showRef && (
          <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {formulaReference.map((ref, i) => (
              <div key={i} className="flex items-start gap-3">
                <code className="text-xs font-mono text-accent-light whitespace-nowrap">{ref.syntax}</code>
                <span className="text-xs text-text-muted">{ref.desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Table toggle */}
      {data.length > 0 && (
        <div className="bg-dark-card/50 backdrop-blur-sm border border-dark-border/60 rounded-2xl overflow-hidden">
          <button onClick={() => setShowData(!showData)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-black/[0.03] transition-colors">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Table className="w-4 h-4 text-text-muted" /> Source Data
              <span className="text-[10px] text-text-muted font-normal ml-1">{data.length} rows · {columns.length} cols</span>
            </h3>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showData ? '' : '-rotate-90'}`} />
          </button>
          {showData && (
            <div className="overflow-x-auto border-t border-dark-border/30">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-border/40 bg-dark-surface/40">
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider w-10">#</th>
                    {columns.map(col => (
                      <th key={col} className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/30">
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-black/[0.03] transition-colors">
                      <td className="px-4 py-2 text-xs text-text-muted">{i + 1}</td>
                      {columns.map(col => (
                        <td key={col} className="px-4 py-2 text-sm text-text-primary/90 whitespace-nowrap">
                          {typeof row[col] === 'number' ? row[col].toLocaleString() : (row[col] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Spreadsheet">
        <p className="text-sm text-text-secondary mb-4">Are you sure you want to delete this spreadsheet? This action cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setDeleteModal(false)} className="px-4 py-2 text-sm text-text-secondary bg-dark-surface/60 border border-dark-border/60 rounded-xl hover:bg-black/[0.05]">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-xl">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
