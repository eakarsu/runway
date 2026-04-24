const express = require('express');
const router = express.Router();
const Spreadsheet = require('../models/Spreadsheet');
const authenticate = require('../middleware/auth');

router.use(authenticate);

// List all
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const items = await Spreadsheet.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ data: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  try {
    const item = await Spreadsheet.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    const item = await Spreadsheet.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload Excel and parse
router.post('/upload', async (req, res) => {
  try {
    const { name, data, columns, fileName, fileSize, template } = req.body;

    // Apply template calculations
    let calculations = [];
    let summary = {};

    if (data && data.length > 0 && columns && columns.length > 0) {
      // Auto-detect numeric columns
      const numericCols = columns.filter(col => {
        const vals = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
        return vals.length > 0 && vals.every(v => !isNaN(Number(v)));
      });

      numericCols.forEach(col => {
        const values = data.map(row => Number(row[col]) || 0);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        calculations.push({ column: col, sum, average: Math.round(avg * 100) / 100, min, max, count: values.length });
        summary[col] = { sum, average: Math.round(avg * 100) / 100, min, max };
      });
    }

    const item = await Spreadsheet.create({
      userId: req.user.id,
      name: name || fileName || 'Uploaded Spreadsheet',
      data: data || [],
      columns: columns || [],
      calculations,
      summary,
      fileName,
      fileSize,
      template: template || 'custom',
      status: 'active',
    });

    res.status(201).json({ data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Apply calculation template
router.post('/:id/calculate', async (req, res) => {
  try {
    const item = await Spreadsheet.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    const { template } = req.body;
    const data = item.data || [];
    const columns = item.columns || [];

    if (!data.length || !columns.length) {
      return res.status(400).json({ error: 'No data to calculate' });
    }

    const numericCols = columns.filter(col => {
      const vals = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
      return vals.length > 0 && vals.every(v => !isNaN(Number(v)));
    });

    let calculations = [];
    let summary = {};

    numericCols.forEach(col => {
      const values = data.map(row => Number(row[col]) || 0);
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const median = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
      const variance = values.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      const calc = { column: col, sum, average: Math.round(avg * 100) / 100, min, max, count: values.length };

      if (template === 'statistical' || template === 'advanced') {
        calc.median = median;
        calc.stdDev = Math.round(stdDev * 100) / 100;
        calc.variance = Math.round(variance * 100) / 100;
      }

      if (template === 'financial') {
        calc.percentOfTotal = values.map(v => Math.round((v / sum) * 10000) / 100);
        calc.runningTotal = values.reduce((acc, v, i) => { acc.push((acc[i - 1] || 0) + v); return acc; }, []);
      }

      if (template === 'growth') {
        calc.growthRates = values.map((v, i) => i === 0 ? 0 : Math.round(((v - values[i-1]) / (values[i-1] || 1)) * 10000) / 100);
        calc.cagr = values.length > 1 ? Math.round((Math.pow(values[values.length-1] / (values[0] || 1), 1 / (values.length - 1)) - 1) * 10000) / 100 : 0;
      }

      calculations.push(calc);
      summary[col] = { sum, average: calc.average, min, max };
    });

    await item.update({ calculations, summary, template: template || item.template });
    const updated = await Spreadsheet.findByPk(item.id);
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Evaluate variables/formulas
router.post('/:id/evaluate', async (req, res) => {
  try {
    const item = await Spreadsheet.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });

    let { variables } = req.body;
    if (!variables) variables = item.variables || [];
    const data = item.data || [];
    const columns = item.columns || [];

    // Build context from existing variable values
    const ctx = {};
    variables.forEach(v => { if (v.value !== undefined && v.value !== '') ctx[v.name] = Number(v.value) || 0; });

    // Evaluate formulas
    const evaluated = variables.map(v => {
      if (!v.formula || v.formula.trim() === '') return v;
      try {
        let formula = v.formula;

        // COUNT(table WHERE col = val)
        const countMatch = formula.match(/COUNT\((\w+)\s+WHERE\s+(\w+)\s*=\s*(.+?)\)/i);
        if (countMatch) {
          const [, , col, val] = countMatch;
          const target = val.trim().replace(/['"]/g, '');
          const count = data.filter(row => String(row[col]).trim() === target).length;
          return { ...v, value: count };
        }

        // SUM(table.field WHERE col = val)
        const sumMatch = formula.match(/SUM\((\w+)\.(\w+)\s+WHERE\s+(\w+)\s*=\s*(.+?)\)/i);
        if (sumMatch) {
          const [, , field, col, val] = sumMatch;
          const target = val.trim().replace(/['"]/g, '');
          const sum = data.filter(row => String(row[col]).trim() === target).reduce((a, row) => a + (Number(row[field]) || 0), 0);
          return { ...v, value: sum };
        }

        // SUM(table.field) - sum all
        const sumAllMatch = formula.match(/SUM\((\w+)\.(\w+)\)/i);
        if (sumAllMatch) {
          const [, , field] = sumAllMatch;
          const sum = data.reduce((a, row) => a + (Number(row[field]) || 0), 0);
          return { ...v, value: sum };
        }

        // AVG(table.field WHERE col = val)
        const avgMatch = formula.match(/AVG\((\w+)\.(\w+)\s+WHERE\s+(\w+)\s*=\s*(.+?)\)/i);
        if (avgMatch) {
          const [, , field, col, val] = avgMatch;
          const target = val.trim().replace(/['"]/g, '');
          const rows = data.filter(row => String(row[col]).trim() === target);
          const avg = rows.length ? rows.reduce((a, row) => a + (Number(row[field]) || 0), 0) / rows.length : 0;
          return { ...v, value: Math.round(avg * 100) / 100 };
        }

        // AVG(table.field) - avg all
        const avgAllMatch = formula.match(/AVG\((\w+)\.(\w+)\)/i);
        if (avgAllMatch) {
          const [, , field] = avgAllMatch;
          const avg = data.length ? data.reduce((a, row) => a + (Number(row[field]) || 0), 0) / data.length : 0;
          return { ...v, value: Math.round(avg * 100) / 100 };
        }

        // COUNT(table WHERE col = val AND col2 = val2)
        const countAndMatch = formula.match(/COUNT\((\w+)\s+WHERE\s+(\w+)\s*=\s*(.+?)\s+AND\s+(\w+)\s*=\s*(.+?)\)/i);
        if (countAndMatch) {
          const [, , col1, val1, col2, val2] = countAndMatch;
          const t1 = val1.trim().replace(/['"]/g, '');
          const t2 = val2.trim().replace(/['"]/g, '');
          const count = data.filter(row => String(row[col1]).trim() === t1 && String(row[col2]).trim() === t2).length;
          return { ...v, value: count };
        }

        // Simple arithmetic with variable references: varA * varB + 100
        let expr = formula;
        for (const [key, val] of Object.entries(ctx)) {
          expr = expr.replace(new RegExp('\\b' + key + '\\b', 'g'), val);
        }
        // IF(condition, trueVal, falseVal)
        const ifMatch = expr.match(/IF\((.+?)\s*>\s*(\d+),\s*(.+?),\s*(.+?)\)/i);
        if (ifMatch) {
          const [, left, right, trueVal, falseVal] = ifMatch;
          const leftNum = Number(left) || 0;
          const rightNum = Number(right) || 0;
          const result = leftNum > rightNum ? (Number(trueVal) || 0) : (Number(falseVal) || 0);
          return { ...v, value: result };
        }
        // Try safe eval of simple arithmetic
        if (/^[\d\s+\-*/().]+$/.test(expr)) {
          const result = Function('"use strict"; return (' + expr + ')')();
          return { ...v, value: Math.round(result * 100) / 100 };
        }

        return v;
      } catch {
        return { ...v, error: 'Invalid formula' };
      }
    });

    await item.update({ variables: evaluated });
    const updated = await Spreadsheet.findByPk(item.id);
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const item = await Spreadsheet.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const item = await Spreadsheet.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
