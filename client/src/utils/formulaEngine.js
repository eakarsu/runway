// ═══════════════════════════════════════════
// FORMULA ENGINE — Full Excel-compatible set
// ═══════════════════════════════════════════
export const _nums = (data, col) => data.map(r => Number(r[col])).filter(n => !isNaN(n));
export const _sum = arr => arr.reduce((a, b) => a + b, 0);

export const FORMULAS = {
  // ── Aggregation ──
  SUM: (data, col) => _sum(_nums(data, col)),
  AVG: (data, col) => { const v = _nums(data, col); return v.length ? _sum(v) / v.length : 0; },
  AVERAGE: (data, col) => { const v = _nums(data, col); return v.length ? _sum(v) / v.length : 0; },
  COUNT: (data, col) => data.filter(r => r[col] != null && r[col] !== '').length,
  COUNTA: (data, col) => data.filter(r => r[col] != null && r[col] !== '').length,
  COUNTBLANK: (data, col) => data.filter(r => r[col] == null || r[col] === '').length,
  MIN: (data, col) => { const v = _nums(data, col); return v.length ? Math.min(...v) : 0; },
  MAX: (data, col) => { const v = _nums(data, col); return v.length ? Math.max(...v) : 0; },
  MEDIAN: (data, col) => { const v = _nums(data, col).sort((a, b) => a - b); if (!v.length) return 0; const m = Math.floor(v.length / 2); return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; },
  MODE: (data, col) => { const v = _nums(data, col); const freq = {}; v.forEach(n => { freq[n] = (freq[n] || 0) + 1; }); let best = v[0], max = 0; for (const [k, c] of Object.entries(freq)) if (c > max) { max = c; best = Number(k); } return best ?? 0; },
  LARGE: (data, col, k) => { const v = _nums(data, col).sort((a, b) => b - a); return v[Number(k) - 1] ?? 0; },
  SMALL: (data, col, k) => { const v = _nums(data, col).sort((a, b) => a - b); return v[Number(k) - 1] ?? 0; },

  // ── Conditional ──
  COUNTIF: (data, col, cond) => data.filter(r => String(r[col] ?? '').toLowerCase() === String(cond).toLowerCase()).length,
  SUMIF: (data, col, condCol, cond) => data.filter(r => String(r[condCol] ?? '').toLowerCase() === String(cond).toLowerCase()).reduce((a, r) => a + (Number(r[col]) || 0), 0),
  AVERAGEIF: (data, col, condCol, cond) => { const vals = data.filter(r => String(r[condCol] ?? '').toLowerCase() === String(cond).toLowerCase()).map(r => Number(r[col]) || 0); return vals.length ? _sum(vals) / vals.length : 0; },
  MAXIF: (data, col, condCol, cond) => { const vals = data.filter(r => String(r[condCol] ?? '').toLowerCase() === String(cond).toLowerCase()).map(r => Number(r[col]) || 0); return vals.length ? Math.max(...vals) : 0; },
  MINIF: (data, col, condCol, cond) => { const vals = data.filter(r => String(r[condCol] ?? '').toLowerCase() === String(cond).toLowerCase()).map(r => Number(r[col]) || 0); return vals.length ? Math.min(...vals) : 0; },

  // ── Statistics ──
  STDEV: (data, col) => { const v = _nums(data, col); if (v.length < 2) return 0; const avg = _sum(v) / v.length; return Math.sqrt(v.reduce((a, x) => a + (x - avg) ** 2, 0) / (v.length - 1)); },
  STDEVP: (data, col) => { const v = _nums(data, col); if (!v.length) return 0; const avg = _sum(v) / v.length; return Math.sqrt(v.reduce((a, x) => a + (x - avg) ** 2, 0) / v.length); },
  VAR: (data, col) => { const v = _nums(data, col); if (v.length < 2) return 0; const avg = _sum(v) / v.length; return v.reduce((a, x) => a + (x - avg) ** 2, 0) / (v.length - 1); },
  VARP: (data, col) => { const v = _nums(data, col); if (!v.length) return 0; const avg = _sum(v) / v.length; return v.reduce((a, x) => a + (x - avg) ** 2, 0) / v.length; },
  PERCENTILE: (data, col, k) => { const v = _nums(data, col).sort((a, b) => a - b); if (!v.length) return 0; const p = Number(k); const idx = p * (v.length - 1); const lo = Math.floor(idx); const hi = Math.ceil(idx); return lo === hi ? v[lo] : v[lo] + (v[hi] - v[lo]) * (idx - lo); },
  RANK: (data, col, val) => { const v = _nums(data, col).sort((a, b) => b - a); const target = Number(val); return v.indexOf(target) + 1 || 0; },
  CORREL: (data, col, col2) => { const x = _nums(data, col); const y = _nums(data, col2); const n = Math.min(x.length, y.length); if (n < 2) return 0; const mx = _sum(x) / n; const my = _sum(y) / n; let num = 0, dx = 0, dy = 0; for (let i = 0; i < n; i++) { num += (x[i] - mx) * (y[i] - my); dx += (x[i] - mx) ** 2; dy += (y[i] - my) ** 2; } return dx && dy ? num / Math.sqrt(dx * dy) : 0; },

  // ── Column-aware Text / String ──
  UNIQUE_COUNT: (data, col) => new Set(data.map(r => String(r[col] ?? '').toLowerCase())).size,
  UNIQUE_VALUES: (data, col) => [...new Set(data.map(r => String(r[col] ?? '')))].join(', '),
  FIRST: (data, col) => data.length ? (data[0][col] ?? '') : '',
  LAST: (data, col) => data.length ? (data[data.length - 1][col] ?? '') : '',
  NTH: (data, col, n) => { const i = Number(n) - 1; return data[i] ? (data[i][col] ?? '') : ''; },
  CONCAT_ALL: (data, col, sep) => data.map(r => String(r[col] ?? '')).join(sep || ', '),
  AVG_LEN: (data, col) => { const vals = data.map(r => String(r[col] ?? '')); return vals.length ? Math.round(vals.reduce((a, v) => a + v.length, 0) / vals.length * 100) / 100 : 0; },
  MAX_LEN: (data, col) => Math.max(...data.map(r => String(r[col] ?? '').length), 0),
  MIN_LEN: (data, col) => { const lens = data.map(r => String(r[col] ?? '').length); return lens.length ? Math.min(...lens) : 0; },

  // ── Contains-based conditionals ──
  COUNTIF_CONTAINS: (data, col, text) => data.filter(r => String(r[col] ?? '').toLowerCase().includes(String(text).toLowerCase())).length,
  COUNTIF_STARTS: (data, col, text) => data.filter(r => String(r[col] ?? '').toLowerCase().startsWith(String(text).toLowerCase())).length,
  COUNTIF_ENDS: (data, col, text) => data.filter(r => String(r[col] ?? '').toLowerCase().endsWith(String(text).toLowerCase())).length,
  COUNTIF_GT: (data, col, val) => data.filter(r => Number(r[col]) > Number(val)).length,
  COUNTIF_GTE: (data, col, val) => data.filter(r => Number(r[col]) >= Number(val)).length,
  COUNTIF_LT: (data, col, val) => data.filter(r => Number(r[col]) < Number(val)).length,
  COUNTIF_LTE: (data, col, val) => data.filter(r => Number(r[col]) <= Number(val)).length,
  COUNTIF_BETWEEN: (data, col, lo, hi) => data.filter(r => { const n = Number(r[col]); return n >= Number(lo) && n <= Number(hi); }).length,
  SUMIF_CONTAINS: (data, col, condCol, text) => data.filter(r => String(r[condCol] ?? '').toLowerCase().includes(String(text).toLowerCase())).reduce((a, r) => a + (Number(r[col]) || 0), 0),
  SUMIF_GT: (data, col, condCol, val) => data.filter(r => Number(r[condCol]) > Number(val)).reduce((a, r) => a + (Number(r[col]) || 0), 0),
  SUMIF_LT: (data, col, condCol, val) => data.filter(r => Number(r[condCol]) < Number(val)).reduce((a, r) => a + (Number(r[col]) || 0), 0),
  SUMIF_BETWEEN: (data, col, condCol, range) => { const [lo, hi] = String(range).split(':').map(Number); return data.filter(r => { const n = Number(r[condCol]); return n >= lo && n <= hi; }).reduce((a, r) => a + (Number(r[col]) || 0), 0); },
  AVERAGEIF_CONTAINS: (data, col, condCol, text) => { const vals = data.filter(r => String(r[condCol] ?? '').toLowerCase().includes(String(text).toLowerCase())).map(r => Number(r[col]) || 0); return vals.length ? _sum(vals) / vals.length : 0; },
  AVERAGEIF_GT: (data, col, condCol, val) => { const vals = data.filter(r => Number(r[condCol]) > Number(val)).map(r => Number(r[col]) || 0); return vals.length ? _sum(vals) / vals.length : 0; },
};

// ── Standalone functions (no data column args) ──
export const STANDALONE = {
  // Math
  ABS: (a) => Math.abs(Number(a)),
  ROUND: (a, d) => { const f = 10 ** (Number(d) || 0); return Math.round(Number(a) * f) / f; },
  ROUNDUP: (a, d) => { const f = 10 ** (Number(d) || 0); return Math.ceil(Number(a) * f) / f; },
  ROUNDDOWN: (a, d) => { const f = 10 ** (Number(d) || 0); return Math.floor(Number(a) * f) / f; },
  CEILING: (a, s) => { const sig = Number(s) || 1; return Math.ceil(Number(a) / sig) * sig; },
  FLOOR: (a, s) => { const sig = Number(s) || 1; return Math.floor(Number(a) / sig) * sig; },
  POWER: (a, b) => Math.pow(Number(a), Number(b)),
  SQRT: (a) => Math.sqrt(Number(a)),
  LOG: (a, b) => b ? Math.log(Number(a)) / Math.log(Number(b)) : Math.log10(Number(a)),
  LOG10: (a) => Math.log10(Number(a)),
  LN: (a) => Math.log(Number(a)),
  EXP: (a) => Math.exp(Number(a)),
  MOD: (a, b) => Number(a) % Number(b),
  SIGN: (a) => Math.sign(Number(a)),
  TRUNC: (a) => Math.trunc(Number(a)),
  PI: () => Math.PI,
  RAND: () => Math.random(),
  RANDBETWEEN: (lo, hi) => Math.floor(Math.random() * (Number(hi) - Number(lo) + 1)) + Number(lo),

  // Financial
  PMT: (rate, nper, pv, fv, type) => {
    const r = Number(rate), n = Number(nper), p = Number(pv), f = Number(fv) || 0, t = Number(type) || 0;
    if (r === 0) return -(p + f) / n;
    const pvif = Math.pow(1 + r, n);
    return -(r * (p * pvif + f)) / (pvif - 1) / (1 + r * t);
  },
  FV: (rate, nper, pmt, pv, type) => {
    const r = Number(rate), n = Number(nper), pm = Number(pmt), p = Number(pv) || 0, t = Number(type) || 0;
    if (r === 0) return -(p + pm * n);
    const pvif = Math.pow(1 + r, n);
    return -(p * pvif + (pm * (1 + r * t) * (pvif - 1)) / r);
  },
  PV: (rate, nper, pmt, fv, type) => {
    const r = Number(rate), n = Number(nper), pm = Number(pmt), f = Number(fv) || 0, t = Number(type) || 0;
    if (r === 0) return -(f + pm * n);
    const pvif = Math.pow(1 + r, n);
    return -(f / pvif + (pm * (1 + r * t) * (pvif - 1)) / (r * pvif));
  },
  NPV: (rate, ...cfs) => {
    const r = Number(rate);
    return cfs.reduce((acc, cf, i) => acc + Number(cf) / Math.pow(1 + r, i + 1), 0);
  },
  IRR: (...cfs) => {
    const flows = cfs.map(Number);
    let guess = 0.1;
    for (let iter = 0; iter < 100; iter++) {
      let npv = 0, dnpv = 0;
      for (let i = 0; i < flows.length; i++) { npv += flows[i] / Math.pow(1 + guess, i); dnpv -= i * flows[i] / Math.pow(1 + guess, i + 1); }
      if (Math.abs(npv) < 1e-7) return guess;
      if (dnpv === 0) break;
      guess -= npv / dnpv;
    }
    return guess;
  },
  RATE: (nper, pmt, pv, fv) => {
    const n = Number(nper), pm = Number(pmt), p = Number(pv), f = Number(fv) || 0;
    let guess = 0.1;
    for (let iter = 0; iter < 100; iter++) {
      const pvif = Math.pow(1 + guess, n);
      const y = p * pvif + pm * (pvif - 1) / guess + f;
      const dy = p * n * Math.pow(1 + guess, n - 1) + pm * ((n * Math.pow(1 + guess, n - 1) * guess - (pvif - 1)) / (guess * guess));
      if (Math.abs(y) < 1e-7) return guess;
      if (dy === 0) break;
      guess -= y / dy;
    }
    return guess;
  },
  NPER: (rate, pmt, pv, fv) => {
    const r = Number(rate), pm = Number(pmt), p = Number(pv), f = Number(fv) || 0;
    if (r === 0) return -(p + f) / pm;
    return Math.log((pm - f * r) / (pm + p * r)) / Math.log(1 + r);
  },
  SLN: (cost, salvage, life) => (Number(cost) - Number(salvage)) / Number(life),
  DB: (cost, salvage, life, period) => {
    const c = Number(cost), s = Number(salvage), l = Number(life), p = Number(period);
    const rate = 1 - Math.pow(s / c, 1 / l);
    let total = 0;
    for (let i = 1; i <= p; i++) { const dep = (c - total) * rate; total += dep; if (i === p) return dep; }
    return 0;
  },

  // Logic
  AND: (...args) => args.every(a => Boolean(Number(a))) ? 1 : 0,
  OR: (...args) => args.some(a => Boolean(Number(a))) ? 1 : 0,
  NOT: (a) => Number(a) ? 0 : 1,
  IFERROR: (val, fallback) => (val == null || val === '' || isNaN(Number(val))) ? Number(fallback) || 0 : Number(val),
  CHOOSE: (idx, ...vals) => { const i = Number(idx); return i >= 1 && i <= vals.length ? (isNaN(Number(vals[i - 1])) ? vals[i - 1] : Number(vals[i - 1])) : 0; },

  // Text (return strings)
  CONCAT: (...args) => args.join(''),
  LEFT: (text, n) => String(text).slice(0, Number(n) || 1),
  RIGHT: (text, n) => String(text).slice(-(Number(n) || 1)),
  MID: (text, start, len) => String(text).slice(Number(start) - 1, Number(start) - 1 + Number(len)),
  LEN: (text) => String(text).length,
  UPPER: (text) => String(text).toUpperCase(),
  LOWER: (text) => String(text).toLowerCase(),
  PROPER: (text) => String(text).replace(/\b\w/g, c => c.toUpperCase()),
  TRIM: (text) => String(text).trim(),
  SUBSTITUTE: (text, old, rep) => String(text).split(String(old)).join(String(rep)),
  REPT: (text, n) => String(text).repeat(Number(n) || 0),
  FIND: (find, text) => { const i = String(text).indexOf(String(find)); return i >= 0 ? i + 1 : 0; },
  EXACT: (a, b) => String(a) === String(b) ? 1 : 0,
  VALUE: (text) => Number(text) || 0,
  TEXT: (val) => String(val),

  // Date
  TODAY: () => new Date().toISOString().slice(0, 10),
  NOW: () => new Date().toISOString().slice(0, 19).replace('T', ' '),
  YEAR: (d) => new Date(d).getFullYear(),
  MONTH: (d) => new Date(d).getMonth() + 1,
  DAY: (d) => new Date(d).getDate(),
  DAYS: (end, start) => Math.round((new Date(end) - new Date(start)) / 86400000),
  EDATE: (d, months) => { const dt = new Date(d); dt.setMonth(dt.getMonth() + Number(months)); return dt.toISOString().slice(0, 10); },
  EOMONTH: (d, months) => { const dt = new Date(d); dt.setMonth(dt.getMonth() + Number(months) + 1, 0); return dt.toISOString().slice(0, 10); },
  WEEKDAY: (d) => new Date(d).getDay() + 1,
  WEEKNUM: (d) => { const dt = new Date(d); const start = new Date(dt.getFullYear(), 0, 1); return Math.ceil(((dt - start) / 86400000 + start.getDay() + 1) / 7); },
  DATEDIF: (start, end, unit) => { const s = new Date(start), e = new Date(end); const u = String(unit).toUpperCase(); if (u === 'D') return Math.round((e - s) / 86400000); if (u === 'M') return (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth(); if (u === 'Y') return e.getFullYear() - s.getFullYear(); return 0; },
};

export function evalFormula(formula, data, columns, ctx) {
  if (!formula?.trim()) return null;
  try {
    // Data-aware formulas: FN(column) or FN(column, arg1, arg2)
    for (const [fn, handler] of Object.entries(FORMULAS)) {
      const re = new RegExp(`^${fn}\\(([^,)]+)(?:,\\s*([^,)]+))?(?:,\\s*([^)]+))?\\)$`, 'i');
      const m = formula.match(re);
      if (m) {
        const args = [data, m[1].trim(), m[2]?.trim(), m[3]?.trim()].filter(Boolean);
        for (let i = 2; i < args.length; i++) {
          if (ctx[args[i]] !== undefined) args[i] = ctx[args[i]];
        }
        const result = handler(...args);
        return typeof result === 'string' ? result : Math.round(result * 100) / 100;
      }
    }

    // Standalone formulas: FN(arg1, arg2, ...)
    for (const [fn, handler] of Object.entries(STANDALONE)) {
      const re = new RegExp(`^${fn}\\((.*)\\)$`, 'i');
      const m = formula.match(re);
      if (m) {
        const rawArgs = m[1].split(',').map(a => a.trim());
        const args = rawArgs.map(a => {
          if (ctx[a] !== undefined) return ctx[a];
          return a;
        });
        const result = handler(...args);
        return typeof result === 'string' ? result : Math.round(Number(result) * 100) / 100;
      }
    }

    // No-arg standalone: FN()
    for (const [fn, handler] of Object.entries(STANDALONE)) {
      if (formula.trim().toUpperCase() === fn + '()') {
        const result = handler();
        return typeof result === 'string' ? result : Math.round(Number(result) * 100) / 100;
      }
    }

    // Variable substitution + math expressions
    let expr = formula;
    for (const [key, val] of Object.entries(ctx)) expr = expr.replace(new RegExp('\\b' + key + '\\b', 'g'), val);
    if (/^[\d\s+\-*/().%]+$/.test(expr)) return Math.round(Function('"use strict"; return (' + expr + ')')() * 100) / 100;

    // IF(condition, true_val, false_val)
    const ifm = formula.match(/^IF\((.+?),\s*(.+?),\s*(.+?)\)$/i);
    if (ifm) {
      let condExpr = ifm[1].trim();
      for (const [key, val] of Object.entries(ctx)) condExpr = condExpr.replace(new RegExp('\\b' + key + '\\b', 'g'), val);
      const pick = Function('"use strict"; return (' + condExpr + ')')() ? ifm[2].trim() : ifm[3].trim();
      if (ctx[pick] !== undefined) return ctx[pick];
      return isNaN(Number(pick)) ? pick : Number(pick);
    }

    // IFERROR wrapper for expressions
    const iferrm = formula.match(/^IFERROR\((.+?),\s*(.+?)\)$/i);
    if (iferrm) {
      const inner = evalFormula(iferrm[1].trim(), data, columns, ctx);
      return inner != null ? inner : (isNaN(Number(iferrm[2])) ? iferrm[2].trim() : Number(iferrm[2]));
    }

    return null;
  } catch { return null; }
}

export const round2 = n => Math.round(n * 100) / 100;
