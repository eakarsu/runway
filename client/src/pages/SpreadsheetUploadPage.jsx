import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileSpreadsheet, Check, Table, BarChart3, TrendingUp, Calculator, Sparkles } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api';

const templates = [
  { id: 'basic', name: 'Basic Analysis', desc: 'Sum, average, min, max for all numeric columns', icon: Table, color: 'from-gray-500 to-slate-600' },
  { id: 'financial', name: 'Financial', desc: 'Totals, percentages, running totals, margin analysis', icon: Calculator, color: 'from-emerald-500 to-teal-600' },
  { id: 'statistical', name: 'Statistical', desc: 'Mean, median, std deviation, variance, distribution', icon: BarChart3, color: 'from-blue-500 to-cyan-600' },
  { id: 'growth', name: 'Growth Analysis', desc: 'Growth rates, CAGR, trend analysis, projections', icon: TrendingUp, color: 'from-violet-500 to-purple-600' },
];

export default function SpreadsheetUploadPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] = useState('basic');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const parseFile = (f) => {
    setFile(f);
    setName(f.name.replace(/\.(xlsx?|csv)$/i, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        setPreview({ data: jsonData, columns, sheetName: wb.SheetNames[0], totalSheets: wb.SheetNames.length });
      } catch {
        setError('Could not parse file. Please upload a valid Excel or CSV file.');
      }
    };
    reader.readAsArrayBuffer(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preview) { setError('Please upload a file first'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/spreadsheets/upload', {
        name, description, template,
        data: preview.data,
        columns: preview.columns,
        fileName: file?.name,
        fileSize: file?.size,
      });
      const id = res.data?.data?.id || res.data?.id;
      if (template !== 'basic') {
        await api.post(`/spreadsheets/${id}/calculate`, { template });
      }
      navigate(`/spreadsheets/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <button onClick={() => navigate('/spreadsheets')} className="flex items-center gap-2 text-text-muted hover:text-accent-light text-sm transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Spreadsheets
      </button>

      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-accent/20 to-purple-600/10 rounded-xl">
            <Upload className="w-5 h-5 text-accent-light" />
          </div>
          Upload Excel File
        </h1>
        <p className="text-text-muted mt-1">Upload an Excel or CSV file and apply calculation templates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
            dragOver ? 'border-accent/60 bg-accent/5' : file ? 'border-emerald-500/40' : 'border-dark-border/50 hover:border-accent/30'
          }`}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => e.target.files[0] && parseFile(e.target.files[0])} className="hidden" />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-600/10 rounded-2xl flex items-center justify-center">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{file.name}</p>
                <p className="text-xs text-text-muted mt-1">
                  {preview ? `${preview.data.length} rows · ${preview.columns.length} columns · Sheet: ${preview.sheetName}` : 'Parsing...'}
                  {preview?.totalSheets > 1 && ` · ${preview.totalSheets} sheets total`}
                </p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }} className="text-xs text-accent-light hover:underline">Change file</button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-dark-surface/60 rounded-2xl flex items-center justify-center">
                <FileSpreadsheet className="w-7 h-7 text-text-muted/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Drop your Excel file here</p>
                <p className="text-xs text-text-muted mt-1">or click to browse · Supports .xlsx, .xls, .csv</p>
              </div>
            </div>
          )}
        </div>

        {/* Name & Description */}
        <div className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl p-6 space-y-4 backdrop-blur-sm">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">Spreadsheet Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this spreadsheet about?" className="w-full bg-dark-bg/60 border border-dark-border/60 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-all min-h-[80px] resize-y placeholder-text-muted" />
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-light" /> Calculation Template
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                  template === t.id
                    ? 'border-accent/50 bg-accent/10 ring-1 ring-accent/20'
                    : 'border-dark-border/50 bg-gradient-to-br from-dark-card/60 to-dark-surface/20 hover:border-dark-border'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 bg-gradient-to-br ${t.color} rounded-xl flex items-center justify-center shadow-md`}>
                    <t.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-text-primary">{t.name}</span>
                  {template === t.id && <Check className="w-4 h-4 text-accent-light ml-auto" />}
                </div>
                <p className="text-xs text-text-muted pl-12">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {preview && preview.data.length > 0 && (
          <div className="bg-gradient-to-br from-dark-card/80 to-dark-surface/30 border border-dark-border/50 rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="px-5 py-3 border-b border-dark-border/40 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Data Preview</h3>
              <span className="text-[10px] text-text-muted uppercase tracking-wider">First {Math.min(5, preview.data.length)} of {preview.data.length} rows</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-border/40 bg-dark-surface/40">
                    {preview.columns.map(col => (
                      <th key={col} className="px-4 py-2.5 text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/30">
                  {preview.data.slice(0, 5).map((row, i) => (
                    <tr key={i} className="hover:bg-black/[0.03]">
                      {preview.columns.map(col => (
                        <td key={col} className="px-4 py-2 text-xs text-text-primary/80 whitespace-nowrap">{row[col] ?? '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full shrink-0" /> {error}
          </div>
        )}

        <button type="submit" disabled={loading || !preview} className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-[1.01] active:scale-[0.99]">
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
          ) : (
            <><Upload className="w-4 h-4" /> Upload & Analyze</>
          )}
        </button>
      </form>
    </div>
  );
}
