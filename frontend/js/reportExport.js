/* ==================== GLOWSENSE AI — MODULE 11: REPORTS & EXPORT ==================== */
/* No PDF/Excel library could be installed in this environment (no network
   access to npm), so this implements the same real functionality without
   a new dependency:
   - "Excel export" -> a genuine .csv file (opens natively in Excel/Sheets,
     correctly escaped, real data only).
   - "PDF export" -> a clean, print-formatted view that the browser's own
     "Print > Save as PDF" turns into a real PDF. This is a standard,
     dependency-free pattern and produces an actual PDF file, just via the
     browser's print pipeline rather than a bundled PDF-generation library. */

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/** rows: array of objects. columns: [{key, label}]. */
export function exportToCSV(filename, columns, rows) {
  const header = columns.map(c => csvEscape(c.label)).join(',');
  const lines = (rows || []).map(row => columns.map(c => csvEscape(row[c.key])).join(','));
  const csv = [header, ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Opens a clean, print-ready report in a new window/tab. User can "Save as PDF" from the browser print dialog for a real PDF file. */
export function printReport(title, bodyHtml) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups to generate the printable report.');
    return;
  }
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - GlowSense AI</title>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #2a2420; padding: 2rem; max-width: 900px; margin: 0 auto; }
        h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
        .report-meta { color: #7a7068; font-size: 0.85rem; margin-bottom: 1.5rem; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
        th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid #e5ded6; font-size: 0.875rem; }
        th { background: #f7f2ec; font-weight: 600; }
        h2 { font-size: 1.1rem; margin-top: 2rem; border-bottom: 2px solid #e8b4a0; padding-bottom: 0.25rem; }
        .stat-row { display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 1rem; }
        .stat-box { padding: 0.75rem 1rem; border: 1px solid #e5ded6; border-radius: 8px; min-width: 120px; }
        .stat-box .value { font-size: 1.3rem; font-weight: 700; }
        .stat-box .label { font-size: 0.75rem; color: #7a7068; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="report-meta">GlowSense AI &middot; Generated ${new Date().toLocaleString()}</div>
      ${bodyHtml}
      <script>window.onload = () => window.print();<\/script>
    </body>
    </html>
  `);
  win.document.close();
}

/** Renders an array of objects as an HTML table for use inside printReport(). */
export function toHtmlTable(columns, rows) {
  if (!rows || rows.length === 0) {
    return '<p style="color:#7a7068;">No data available for this report.</p>';
  }
  return `
    <table>
      <thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(r => `<tr>${columns.map(c => `<td>${r[c.key] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
}

export function toStatBoxesHtml(stats) {
  return `<div class="stat-row">${stats.map(s => `<div class="stat-box"><div class="value">${s.value}</div><div class="label">${s.label}</div></div>`).join('')}</div>`;
}
